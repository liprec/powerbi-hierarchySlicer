/*
 *
 * Copyright (c) 2019 Jan Pieter Posthuma / DataScenarios
 *
 * All rights reserved.
 *
 * MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";
import powerbi from "powerbi-visuals-api";
import { interactivitySelectionService, interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import { IMargin, CssConstants } from "powerbi-visuals-utils-svgutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";
import {
    ITooltipServiceWrapper,
    createTooltipServiceWrapper,
    TooltipEventArgs,
} from "powerbi-visuals-utils-tooltiputils"; // tslint:disable-line: prettier
import { Selector } from "powerbi-models";
import { select, Selection } from "d3-selection";

import { isEqual, update } from "lodash-es";

import "core-js/stable";
import "./matchesPolyfill";

import {
    IHierarchySlicerData,
    IHierarchySlicerDataPoint,
    IHierarchySlicerTreeView,
    IHierarchySlicerTreeViewOptions,
    IHierarchySlicerBehaviorOptions,
} from "./interfaces";
import { HierarchySlicerSettings } from "./settings";
import { HierarchySlicerWebBehavior } from "./hierarchySlicerWebBehavior";
import { HierarchySlicerTreeViewFactory } from "./hierarchySlicerTreeView";
import {
    BorderStyle,
    FontStyle,
    HideMembers,
    TraceEvents,
    SearchFilter,
    UpdateType,
    TooltipIcon,
    SelectionType,
} from "./enums";
import { checkMobile } from "./utils";
import { PerfTimer } from "./perfTimer";
import {
    converter,
    processExpanded,
    processSearch,
    processSelectAll,
    processJsonFilters,
    processPartialSelected,
    processSingleSelect,
} from "./converter";
import { Graphics } from "./graphics";

import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import IFilter = powerbi.IFilter;
import DataViewMatrix = powerbi.DataViewMatrix;
import VisualUpdateType = powerbi.VisualUpdateType;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import CustomVisualOpaqueIdentity = powerbi.visuals.CustomVisualOpaqueIdentity;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IInteractivityService = interactivityBaseService.IInteractivityService;
import createInteractivitySelectionService = interactivitySelectionService.createInteractivitySelectionService;
import PixelConverter = pixelConverter;
import ClassAndSelector = CssConstants.ClassAndSelector;
import createClassAndSelector = CssConstants.createClassAndSelector;
// import TextProperties = textMeasurementService.TextProperties;
// import TextMeasurementService = textMeasurementService.textMeasurementService;

const Icons = Graphics.Icons;

import "../style/hierarchySlicer.less";

export class HierarchySlicer implements IVisual {
    private root: HTMLElement;
    private searchHeader: Selection<any, any, any, any>;
    private searchInput: Selection<HTMLInputElement, any, any, any>;
    private behavior: HierarchySlicerWebBehavior;
    private viewport: IViewport;
    private hostServices: IVisualHost;
    private colorPalette: ISandboxExtendedColorPalette;
    private isHighContrast: boolean;
    private interactivityService: IInteractivityService<IHierarchySlicerDataPoint>;
    private settings: HierarchySlicerSettings;
    private dataView: DataView;
    private jsonFilters: IFilter[] | undefined;
    private data: IHierarchySlicerData;
    private treeView: IHierarchySlicerTreeView;
    private rowHeight: number;
    private isInFocus: boolean;
    private slicerContainer: Selection<any, any, any, any>;
    private slicerHeaderContainer: Selection<any, any, any, any>;
    private slicerHeader: Selection<any, any, any, any>;
    private slicerBody: Selection<any, any, any, any>;
    private slicerBodySpinner: Selection<any, any, any, any>;
    private isLandingPageOn: boolean;
    private landingPage: Selection<any, any, any, any>;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private searchFilter: SearchFilter = SearchFilter.Wildcard;
    private tooltipTimeoutId: number | undefined;

    public static DefaultFontFamily: string = "Segoe UI, Tahoma, Verdana, Geneva, sans-serif";
    public static DefaultFontSizeInPt: number = 11;

    public static Container: ClassAndSelector = createClassAndSelector("slicerContainer");
    public static Body: ClassAndSelector = createClassAndSelector("slicerBody");
    public static BodySpinner: ClassAndSelector = createClassAndSelector("slicerBodySpinner");
    public static ItemContainer: ClassAndSelector = createClassAndSelector("slicerItemContainer");
    public static ItemContainerExpander: ClassAndSelector = createClassAndSelector("slicerItemContainerExpander");
    public static ItemContainerChild: ClassAndSelector = createClassAndSelector("slicerItemContainerChild");
    public static LabelText: ClassAndSelector = createClassAndSelector("slicerText");
    public static Tooltip: ClassAndSelector = createClassAndSelector("slicerTooltip");
    public static CountText: ClassAndSelector = createClassAndSelector("slicerCountText");
    public static Checkbox: ClassAndSelector = createClassAndSelector("checkbox");
    public static HeaderContainer: ClassAndSelector = createClassAndSelector("slicerHeaderContainer");
    public static Header: ClassAndSelector = createClassAndSelector("slicerHeader");
    public static HeaderText: ClassAndSelector = createClassAndSelector("headerText");
    public static SearchHeader: ClassAndSelector = createClassAndSelector("searchHeader");
    public static Icon: ClassAndSelector = createClassAndSelector("icon");
    public static Collapse: ClassAndSelector = createClassAndSelector("collapse");
    public static Expand: ClassAndSelector = createClassAndSelector("expand");
    public static Clear: ClassAndSelector = createClassAndSelector("clear");
    public static HeaderSpinner: ClassAndSelector = createClassAndSelector("headerSpinner");
    public static Input: ClassAndSelector = createClassAndSelector("slicerCheckbox");

    constructor(options: VisualConstructorOptions) {
        this.root = options.element;
        this.hostServices = options.host;

        this.behavior = new HierarchySlicerWebBehavior();
        this.interactivityService = createInteractivitySelectionService(options.host);
        this.tooltipServiceWrapper = createTooltipServiceWrapper(this.hostServices.tooltipService, this.root);

        this.colorPalette = options.host.colorPalette;
        this.isHighContrast = this.colorPalette.isHighContrast;
    }

    private init(options: VisualUpdateOptions): void {
        this.viewport = options.viewport;

        this.slicerContainer = select(this.root)
            .append("div")
            .classed(HierarchySlicer.Container.className, true);

        // a11y support: WIP
        // this.slicerContainer.on("keypress", (e) => {
        // });
        this.renderHeader(this.slicerContainer);

        const bodyViewPort = this.getBodyViewport(this.viewport);
        this.slicerBody = this.slicerContainer
            .append("div")
            .classed(HierarchySlicer.Body.className, true)
            .style("height", PixelConverter.toString(bodyViewPort.height))
            .style("width", PixelConverter.toString(bodyViewPort.width));

        this.treeView = this.createTreeView();
    }

    private createTreeView(): IHierarchySlicerTreeView {
        let rowEnter = (rowSelection: Selection<any, any, any, any>) => {
            this.onEnterSelection(rowSelection);
        };

        let rowUpdate = (rowSelection: Selection<any, any, any, any>) => {
            this.onUpdateSelection(rowSelection, this.interactivityService);
        };

        let rowExit = (rowSelection: Selection<any, any, any, any>) => {
            rowSelection.remove();
        };

        let onLoadMoreData = () => {
            this.hostServices.fetchMoreData();
        };

        const moreData = false; // (this.dataView.metadata.segment) ? true : false;

        const treeViewOptions: IHierarchySlicerTreeViewOptions = {
            rowHeight: this.getRowHeight(),
            enter: rowEnter,
            exit: rowExit,
            update: rowUpdate,
            loadMoreData: onLoadMoreData,
            moreData: moreData,
            scrollEnabled: true,
            viewport: this.getBodyViewport(this.viewport),
            baseContainer: this.slicerBody,
        };

        return HierarchySlicerTreeViewFactory.createListView(treeViewOptions);
    }

    private renderHeader(rootContainer: Selection<any, any, any, any>): void {
        const headerButtonData = [
            { title: "Clear", class: HierarchySlicer.Clear.className, icon: Icons.clearAll, level: 0 },
            { title: "Expand all", class: HierarchySlicer.Expand.className, icon: Icons.expandAll, level: 1 },
            { title: "Collapse all", class: HierarchySlicer.Collapse.className, icon: Icons.collapseAll, level: 1 },
        ];
        this.slicerHeaderContainer = rootContainer
            .append("div")
            .classed(HierarchySlicer.HeaderContainer.className, true);
        this.slicerHeader = this.slicerHeaderContainer.append("div").classed(HierarchySlicer.Header.className, true);

        this.slicerHeader
            .selectAll(HierarchySlicer.Icon.className)
            .data(headerButtonData)
            .enter()
            .append("div")
            .classed(HierarchySlicer.Icon.className, true)
            .classed("hiddenicon", !this.settings.mobile.zoomed)
            .attr("title", d => d.title)
            .each(function(d) {
                this.classList.add(d.class);
            }) // funcion due to this.classList
            .html(d => d.icon);

        this.slicerHeader.append("div").classed(HierarchySlicer.HeaderText.className, true);

        this.createSearchHeader(this.slicerHeaderContainer);
    }

    private updateHeader(): void {
        this.slicerHeader
            .select(HierarchySlicer.Clear.selectorName)
            .style("display", () => (this.settings.selection.singleSelect ? "none" : null));
    }

    public update(options: VisualUpdateOptions) {
        let timer = PerfTimer.start(TraceEvents.update, this.settings && this.settings.general.telemetry);
        this.handleLandingPage(options);
        if (!options || !options.dataViews || !options.dataViews[0] || !options.viewport) {
            timer();
            return;
        }
        let resetScrollbarPosition: boolean = false;
        let updateType: UpdateType = UpdateType.Refresh;
        const settings = HierarchySlicer.parseSettings(options.dataViews[0], this.colorPalette);
        this.isInFocus = false;
        let searchText: string | undefined;
        if (this.searchInput && settings.general.selfFilterEnabled) {
            searchText = (this.searchInput.node() as HTMLInputElement).value;
            if (!searchText || searchText.length < 3) searchText = undefined;
        } else {
            searchText = undefined;
        }
        settings.general.searching = searchText !== undefined;
        if (
            this.data === undefined ||
            (this.dataView && !isEqual(this.dataView.matrix, options.dataViews[0].matrix)) ||
            this.settings === undefined ||
            !isEqual(settings.selection, this.settings.selection)
        ) {
            updateType = UpdateType.Reload;
            resetScrollbarPosition = true;
        } else if (
            this.behavior.FilterInstance.length === 0 &&
            settings.general.expanded === this.settings.general.expanded &&
            settings.general.selectAll === this.settings.general.selectAll &&
            !(this.settings.general.searching || settings.general.searching)
        ) {
            updateType = UpdateType.Bookmark;
            resetScrollbarPosition = false;
        }
        this.behavior.FilterInstance = [];
        this.dataView = options.dataViews[0];
        this.jsonFilters = options.jsonFilters;
        this.settings = settings;
        if (!this.viewport) {
            this.viewport = options.viewport;
            this.init(options);
        }
        this.viewport = options.viewport;

        this.updateInternal(resetScrollbarPosition, updateType, searchText);
        timer();
    }

    private updateInternal(resetScrollbar: boolean, updateType: UpdateType, searchText: string | undefined) {
        this.updateSettings();
        this.updateSlicerBodyDimensions();
        switch (updateType) {
            case UpdateType.Bookmark:
                PerfTimer.logMsg("HierarchySlicer: Bookmark update", this.settings && this.settings.general.telemetry);
                processJsonFilters(
                    this.jsonFilters,
                    this.data.dataPoints,
                    this.data.columnFilters,
                    this.dataView.metadata,
                    this.settings
                );
                // if (this.settings.selection.singleSelect) {
                //     processSingleSelect(this.data.dataPoints);
                // }
                processPartialSelected(this.data.dataPoints, this.data.levels);
                if (this.settings.selection.selectAll) {
                    processSelectAll(this.data.dataPoints, this.settings.general.selectAll, searchText === undefined);
                }
                break;
            case UpdateType.Refresh:
                PerfTimer.logMsg("HierarchySlicer: Refresh update", this.settings && this.settings.general.telemetry);
                if (searchText) {
                    processSearch(
                        this.data.dataPoints,
                        searchText,
                        this.searchFilter,
                        this.settings.search.addSelection,
                        this.settings.general.expanded
                    );
                } else {
                    // if (this.settings.selection.singleSelect) {
                    //     processSingleSelect(this.data.dataPoints);
                    // }
                    processExpanded(this.data.dataPoints, this.data.levels, this.settings.general.expanded);
                }
                if (this.settings.selection.selectAll) {
                    processSelectAll(this.data.dataPoints, this.settings.general.selectAll, searchText === undefined);
                }
                break;
            case UpdateType.Reload:
            default:
                PerfTimer.logMsg("HierarchySlicer: Reload update", this.settings && this.settings.general.telemetry);
                this.treeView.empty();
                const data: IHierarchySlicerData | undefined = converter(
                    this.dataView,
                    this.jsonFilters,
                    searchText,
                    SearchFilter.Wildcard,
                    this.settings
                );
                if (data) {
                    this.data = <IHierarchySlicerData>data;
                } else {
                    this.treeView.empty();
                    return;
                }
                if (this.settings.selection.singleSelect) {
                    processSingleSelect(
                        this.hostServices,
                        this.data.dataPoints,
                        this.data.columnFilters,
                        this.data.levels
                    );
                }
                break;
        }
        if (this.data.dataPoints.length === 0) {
            this.treeView.empty();
            return;
        }

        this.rowHeight = this.treeView.getRealRowHeight();
        this.treeView
            .rowHeight(this.getRowHeight())
            .data(
                this.data.dataPoints.filter((d: IHierarchySlicerDataPoint) => !d.isHidden), // Expand/Collapse
                (d: IHierarchySlicerDataPoint) => d.ownId,
                resetScrollbar
            )
            .render();

        this.updateSearchHeader();
        this.updateHeader();
    }

    private updateSettings(): void {
        this.isHighContrast = this.colorPalette.isHighContrast; // additional assignment for testing purpose
        this.settings.header.defaultTitle = this.dataView && this.dataView.metadata.columns[0].displayName;
        this.updateMobileSettings();
        this.updateSelectionStyle();
        this.updateFontStyle();
        this.updateHeaderStyle();
        this.updateSearchStyle();
    }

    private updateSelectionStyle(): void {
        this.slicerContainer
            .classed(
                "isMultiSelectEnabled",
                !this.settings.selection.singleSelect && !this.settings.selection.ctrlSelect
            )
            .style("color", this.settings.items.scrollbarColor);
    }

    private updateFontStyle(): void {
        // Used setting values -> High Contrast
        this.settings.items.fontColor = this.isHighContrast
            ? this.colorPalette.foreground.value
            : this.settings.items.fontColor;
        this.settings.items.checkBoxColor = this.isHighContrast
            ? this.colorPalette.foreground.value
            : this.settings.items.checkBoxColor;
        this.settings.items.selectedColor = this.isHighContrast
            ? this.colorPalette.foregroundSelected.value
            : this.settings.items.selectedColor;
        this.settings.items.background = this.isHighContrast
            ? this.colorPalette.background.value
            : this.settings.items.background;
        this.settings.items.hoverColor = this.isHighContrast
            ? this.colorPalette.foreground.value
            : this.settings.items.hoverColor;
        this.settings.items.textSizeZoomed =
            this.settings.items.textSize * (this.settings.mobile.zoomed ? 1 + this.settings.mobile.enLarge / 100 : 1);
    }

    private updateHeaderStyle(): void {
        // Used setting values -> High Contrast
        this.settings.header.fontColor = this.isHighContrast
            ? this.colorPalette.foreground.value
            : this.settings.header.fontColor;
        this.settings.header.background = this.isHighContrast
            ? this.colorPalette.background.value
            : this.settings.header.background;
        this.settings.header.textSizeZoomed =
            this.settings.header.textSize * (this.settings.mobile.zoomed ? 1 + this.settings.mobile.enLarge / 100 : 1);
    }

    private updateSearchStyle(): void {
        // Used setting values -> High Contrast
        this.settings.search.fontColor = this.isHighContrast
            ? this.colorPalette.foreground.value
            : this.settings.search.fontColor;
        this.settings.search.iconColor = this.isHighContrast
            ? this.colorPalette.foreground.value
            : this.settings.search.iconColor;
        this.settings.search.background = this.isHighContrast
            ? this.colorPalette.background.value
            : this.settings.search.background;
        this.settings.search.textSizeZoomed =
            this.settings.search.textSize * (this.settings.mobile.zoomed ? 1 + this.settings.mobile.enLarge / 100 : 1);
    }

    private updateMobileSettings(): void {
        this.settings.mobile.zoomed =
            this.settings.mobile.enable || (this.isInFocus && this.settings.mobile.focus) || false;
    }

    private updateSlicerBodyDimensions(): void {
        let slicerViewport: IViewport = this.getBodyViewport(this.viewport);
        this.slicerBody.style("height", `${slicerViewport.height}px`).style("width", "100%");
    }

    private onEnterSelection(rowSelection: Selection<any, any, any, any>): void {
        if (!this.settings) return;
        let timer = PerfTimer.start(TraceEvents.enterSelection, this.settings && this.settings.general.telemetry);
        // Item Container
        const treeItemElementParent: Selection<any, any, any, any> = rowSelection
            .selectAll(HierarchySlicer.ItemContainer.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .join(enter =>
                enter
                    .append("li")
                    .attr("role", "treeitem")
                    .attr("tabindex", "-1")
                    .classed(HierarchySlicer.ItemContainer.className, true)
            );

        // Item Expander and Spinner
        treeItemElementParent
            .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .join(enter =>
                enter
                    .insert("div", ":first-child")
                    .classed(HierarchySlicer.ItemContainerExpander.className, true)
                    .each(function(d) {
                        select(this)
                            .append("div")
                            .classed("icon", true)
                            .classed("icon-left", true)
                            .style("display", "visible");
                    })
                    .each(function(d) {
                        select(this)
                            .insert("div") // Spinner location
                            .classed("spinner-icon", true)
                            .style("display", "none");
                    })
            );

        // Item Checkbox & Label
        treeItemElementParent
            .selectAll(HierarchySlicer.ItemContainerChild.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .join(enter =>
                enter
                    .append("div")
                    .classed(HierarchySlicer.ItemContainerChild.className, true)
                    .each(function(d) {
                        select(this)
                            .append("div")
                            .classed(HierarchySlicer.Input.className, true)
                            .each(function(d) {
                                select(this)
                                    .append("input")
                                    .attr("type", "checkbox");
                            })
                            .each(function(d) {
                                select(this)
                                    .append("span")
                                    .classed(HierarchySlicer.Checkbox.className, true);
                            });
                    })
                    .each(function(d) {
                        select(this)
                            .append("span")
                            .classed(HierarchySlicer.LabelText.className, true);
                    })
                    .each(function(d) {
                        select(this)
                            .append("div")
                            .classed(HierarchySlicer.Tooltip.className, true)
                            .classed("icon", true)
                            .classed("icon-right", true);
                    })
            );

        if (!checkMobile(window.clientInformation.userAgent)) {
            this.tooltipServiceWrapper.addTooltip(
                this.slicerBody.selectAll(HierarchySlicer.Tooltip.selectorName),
                (tooltipEvent: TooltipEventArgs<IHierarchySlicerDataPoint>) => {
                    const d3ParentElement = (tooltipEvent.context && tooltipEvent.context.parentNode) as any;
                    return <VisualTooltipDataItem[]>(
                        (d3ParentElement && d3ParentElement.__data__ && d3ParentElement.__data__.tooltip)
                    );
                },
                (tooltipEvent: TooltipEventArgs<IHierarchySlicerDataPoint>) => {
                    const builder = this.hostServices.createSelectionIdBuilder();
                    const d3ParentElement = (tooltipEvent.context && tooltipEvent.context.parentNode) as any;
                    ((d3ParentElement &&
                        d3ParentElement.__data__ &&
                        d3ParentElement.__data__
                            .nodeIdentity) as CustomVisualOpaqueIdentity[])?.forEach((identity, level) =>
                        builder.withMatrixNode({ level, identity }, (<DataViewMatrix>this.dataView.matrix).rows.levels)
                    );
                    return builder.createSelectionId();
                }
            );
        }
        timer();
    }

    private getheaderTitle(title: string) {
        let fullTitle = title.trim();
        if (this.settings.header.restatement) {
            let statement = ": ";
            let len = this.data.dataPoints.length;
            let selected = this.data.dataPoints
                .filter(d => d.selected && !d.partialSelected)
                .sort((d1, d2) => d1.level - d2.level);
            if (selected.length === 0 || selected.length === len) {
                statement += "All";
            } else if (!this.settings.selection.singleSelect && selected.length === 1) {
                statement += selected[0].label;
            } else if (!this.settings.selection.singleSelect && selected[0].level !== selected[1].level) {
                statement += selected[0].label;
            } else if (this.settings.selection.singleSelect) {
                statement += selected[0].label;
            } else {
                statement += "(Multiple)";
            }
            fullTitle += statement;
        }
        return fullTitle;
    }

    private onUpdateSelection(
        rowSelection: Selection<any, any, any, any>,
        interactivityService: IInteractivityService<IHierarchySlicerDataPoint>
    ): void {
        let timer = PerfTimer.start(TraceEvents.updateSelection, this.settings && this.settings.general.telemetry);
        const data = this.data;
        const mobileScale = this.settings.mobile.zoomed ? 1 + this.settings.mobile.enLarge / 100 : 1;
        if (data) {
            this.behavior.removeSpinners();
            if (this.settings.header.show) {
                this.slicerHeader.style("display", "block");
            } else {
                this.slicerHeader.style("display", "none");
            }
            this.slicerHeader
                .select(HierarchySlicer.HeaderText.selectorName)
                .text(this.getheaderTitle(this.settings.header.title || this.settings.header.defaultTitle))
                .style("color", this.settings.header.fontColor)
                .style("background-color", this.settings.header.background)
                .style("border-style", this.settings.header.outline === BorderStyle.None ? "none" : "solid")
                .style("border-color", this.settings.header.outlineColor)
                .style(
                    "border-width",
                    this.getBorderWidth(this.settings.header.outline, this.settings.header.outlineWeight)
                )
                .style("font-size", `${this.settings.header.textSizeZoomed}pt`)
                .style("font-family", this.settings.header.fontFamily)
                .style("font-weight", this.settings.header.fontWeight)
                .style("font-style", () => {
                    switch (this.settings.header.fontStyle) {
                        case FontStyle.Normal:
                            return "normal";
                        case FontStyle.Italic:
                            return "italic";
                    }
                    return "normal";
                });

            const icons = this.slicerHeader.selectAll(HierarchySlicer.Icon.selectorName);
            icons
                .classed("hiddenicon", !this.settings.mobile.zoomed)
                .style(
                    "height",
                    PixelConverter.toString(PixelConverter.fromPointToPixel(this.settings.header.textSizeZoomed))
                )
                .style(
                    "width",
                    PixelConverter.toString(PixelConverter.fromPointToPixel(this.settings.header.textSizeZoomed))
                )
                .style("fill", this.settings.header.fontColor)
                .style("background-color", this.settings.header.background)
                .style("opacity", (d: any) => (data.levels >= d.level ? "1" : "0"));

            this.slicerBody.classed("slicerBody", true);

            // Item Container
            rowSelection
                .selectAll(HierarchySlicer.ItemContainer.selectorName)
                .style("background-color", this.settings.items.background)
                .style(
                    "padding-left",
                    (d: IHierarchySlicerDataPoint) => `${d.level * mobileScale * this.settings.items.textSizeZoomed}px`
                )
                .style("margin-left", () => (data.levels === 0 ? "-4px" : null))
                .attr("aria-expanded", (d: IHierarchySlicerDataPoint) => d.isExpand);

            // Item Expander
            rowSelection
                .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
                .selectAll(".icon")
                .style("font-size", `${this.settings.items.textSizeZoomed}pt`)
                .style("visibility", (d: IHierarchySlicerDataPoint) =>
                    d.isLeaf || data.levels === 0 ? "hidden" : "visible"
                )
                .style("font-size", `${this.settings.items.textSizeZoomed}pt`)
                .style("margin-left", PixelConverter.toString(-this.settings.items.textSizeZoomed / 2.5))
                .style(
                    "width",
                    PixelConverter.toString(
                        Math.ceil(0.95 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))
                    )
                )
                .style(
                    "height",
                    PixelConverter.toString(
                        Math.ceil(1.35 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))
                    )
                )
                .style("fill", this.settings.items.checkBoxColor)
                .html((d: IHierarchySlicerDataPoint) => (d.isExpand ? Icons.expand : Icons.collapse));

            // Item Spinner
            rowSelection
                .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
                .selectAll(".spinner-icon")
                .style("display", "none")
                .style("font-size", `${this.settings.items.textSizeZoomed}pt`)
                .style("margin-left", PixelConverter.toString(-this.settings.items.textSizeZoomed / 2.5))
                .style(
                    "width",
                    PixelConverter.toString(
                        Math.ceil(0.95 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))
                    )
                )
                .style(
                    "height",
                    PixelConverter.toString(
                        Math.ceil(1.35 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))
                    )
                )
                .html("");

            // Item Checkbox
            rowSelection
                .selectAll(HierarchySlicer.Checkbox.selectorName)
                .classed("radiobutton", this.settings.selection.singleSelect)
                .style("display", (d: IHierarchySlicerDataPoint) =>
                    this.settings.selection.selectionType === SelectionType.Leaf && !d.isLeaf ? "none" : "show"
                )
                .style("width", 0.75 * this.settings.items.textSizeZoomed + "px")
                .style("height", 0.75 * this.settings.items.textSizeZoomed + "px")
                .style(
                    "margin-right",
                    PixelConverter.fromPointToPixel(0.25 * this.settings.items.textSizeZoomed) + "px"
                )
                .style(
                    "margin-bottom",
                    PixelConverter.fromPointToPixel(0.25 * this.settings.items.textSizeZoomed) + "px"
                );

            // Item Label
            rowSelection
                .selectAll(HierarchySlicer.LabelText.selectorName)
                .text((d: IHierarchySlicerDataPoint) => (d.label === "" ? String.fromCharCode(160) : d.label))
                .style("color", this.settings.items.fontColor)
                .style("font-size", `${this.settings.items.textSizeZoomed}pt`)
                .style("font-family", this.settings.items.fontFamily)
                .style("font-weight", this.settings.items.fontWeight)
                .style("font-style", () => {
                    switch (this.settings.items.fontStyle) {
                        case FontStyle.Normal:
                            return "normal";
                        case FontStyle.Italic:
                            return "italic";
                    }
                    return "normal";
                });

            // Item Tooltip Icon
            rowSelection
                .selectAll(HierarchySlicer.Tooltip.selectorName)
                .style("font-size", `${this.settings.items.textSizeZoomed}pt`)
                .style("fill", this.settings.tooltipSettings.color)
                .style("stroke", this.settings.tooltipSettings.color)
                .style("visibility", "hidden")
                .html(() => {
                    switch (this.settings.tooltipSettings.icon) {
                        case TooltipIcon.Triangle:
                            return Icons.triangle;
                        case TooltipIcon.HorizontalDots:
                            return Icons.horizontaldots;
                        case TooltipIcon.VerticalDots:
                            return Icons.verticaldots;
                        case TooltipIcon.Info:
                        default:
                            return Icons.info;
                    }
                });

            // setTimeout as render is part of a setTimeout function
            if (this.tooltipTimeoutId) window.clearTimeout(this.tooltipTimeoutId);
            this.tooltipTimeoutId = window.setTimeout(() => {
                rowSelection
                    .selectAll(HierarchySlicer.Tooltip.selectorName)
                    .style(
                        "visibility",
                        this.settings.tooltipSettings.icon === TooltipIcon.None ||
                            checkMobile(window.clientInformation.userAgent)
                            ? "hidden"
                            : "visible"
                    )
                    .style("margin-right", this.treeView.isScrollbarVisible() ? "100vw" : "0px");
                this.tooltipTimeoutId = undefined;
            }, 100);

            if (interactivityService && this.slicerBody) {
                const body = this.slicerBody.attr("width", this.viewport.width);
                const expanders = body.selectAll(HierarchySlicer.ItemContainerExpander.selectorName);
                const slicerItemContainers = body.selectAll(HierarchySlicer.ItemContainerChild.selectorName);
                const slicerItemLabels = body.selectAll(HierarchySlicer.LabelText.selectorName);
                const slicerItemInputs = body.selectAll(HierarchySlicer.Input.selectorName);
                const slicerClear = this.slicerHeader.select(HierarchySlicer.Clear.selectorName);
                const slicerExpand = this.slicerHeader.select(HierarchySlicer.Expand.selectorName);
                const slicerCollapse = this.slicerHeader.select(HierarchySlicer.Collapse.selectorName);
                const slicerHeaderText = this.slicerHeader.select(HierarchySlicer.HeaderText.selectorName);
                const interactivityServiceOptions = {
                    overrideSelectionFromData: true,
                };

                const behaviorOptions: IHierarchySlicerBehaviorOptions = {
                    hostServices: this.hostServices,
                    dataPoints: data.dataPoints,
                    fullTree: data.fullTree,
                    columnFilters: data.columnFilters,
                    expanders: expanders,
                    slicerBodySpinner: this.slicerBodySpinner,
                    slicerContainer: this.slicerContainer,
                    slicerItemContainers: slicerItemContainers,
                    slicerItemLabels: slicerItemLabels,
                    slicerItemInputs: slicerItemInputs,
                    slicerHeaderText: slicerHeaderText,
                    slicerClear: slicerClear,
                    slicerExpand: slicerExpand,
                    slicerCollapse: slicerCollapse,
                    interactivityService: interactivityService,
                    interactivityServiceOptions: interactivityServiceOptions,
                    slicerSettings: this.settings,
                    levels: data.levels,
                    behavior: this.behavior,
                };

                interactivityService.bind(behaviorOptions);

                this.behavior.styleSlicerInputs(
                    rowSelection.select(HierarchySlicer.ItemContainerChild.selectorName),
                    false // this.interactivityService.hasSelection()
                );
            } else {
                this.behavior.styleSlicerInputs(
                    rowSelection.select(HierarchySlicer.ItemContainerChild.selectorName),
                    false
                );
            }
        }
        timer();
    }

    public static getTextProperties(fontFamily: string, textSize: number): TextProperties {
        return <TextProperties>{
            fontFamily: fontFamily,
            fontSize: `${textSize}pt`,
        };
    }

    private getHeaderHeight(): number {
        const searchHeight: number = this.settings.general.selfFilterEnabled
            ? textMeasurementService.estimateSvgTextHeight(
                  HierarchySlicer.getTextProperties(
                      this.settings.search.fontFamily,
                      this.settings.search.textSizeZoomed
                  )
              ) + 2
            : 0;
        return (
            textMeasurementService.estimateSvgTextHeight(
                HierarchySlicer.getTextProperties(this.settings.header.fontFamily, this.settings.header.textSizeZoomed)
            ) + searchHeight
        );
    }

    private getRowHeight(): number {
        return (
            this.rowHeight ||
            textMeasurementService.estimateSvgTextHeight(
                HierarchySlicer.getTextProperties(this.settings.items.fontFamily, this.settings.items.textSizeZoomed)
            )
        );
    }

    private getBodyViewport(currentViewport: IViewport): IViewport {
        let settings = this.settings;
        let headerHeight;
        let slicerBodyHeight;
        if (settings) {
            headerHeight = settings.header.show ? this.getHeaderHeight() : 0;
            slicerBodyHeight = currentViewport.height - (headerHeight + settings.header.borderBottomWidth);
        } else {
            headerHeight = 0;
            slicerBodyHeight = currentViewport.height - (headerHeight + 1);
        }
        return {
            height: slicerBodyHeight,
            width: currentViewport.width,
        };
    }

    private getBorderWidth(outlineElement: BorderStyle, outlineWeight: number) {
        switch (outlineElement) {
            case BorderStyle.None:
            default:
                return "0px";
            case BorderStyle.BottomOnly:
                return `0px 0px ${outlineWeight}px 0px`;
            case BorderStyle.TopOnly:
                return `${outlineWeight}px 0px 0px 0px`;
            case BorderStyle.LeftOnly:
                return `0px 0px 0px ${outlineWeight}px`;
            case BorderStyle.RightOnly:
                return `0px ${outlineWeight}px 0px 0px`;
            case BorderStyle.TopBottom:
                return `${outlineWeight}px 0px ${outlineWeight}px 0px`;
            case BorderStyle.LeftRight:
                return `0px ${outlineWeight}px 0px ${outlineWeight}px`;
            case BorderStyle.Frame:
                return `${outlineWeight}px`;
        }
    }

    private createSearchHeader(container: Selection<any, any, any, any>): void {
        this.searchHeader = container
            .append("div")
            .classed(HierarchySlicer.SearchHeader.className, true)
            .classed("collapsed", true);

        let counter = 0;
        this.searchHeader
            .append("div")
            .attr("title", "Search")
            .classed(HierarchySlicer.Icon.className, true)
            .classed("search", true)
            .style("fill", this.settings.search.iconColor)
            .style(
                "width",
                PixelConverter.toString(
                    Math.ceil(0.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
                )
            )
            .style(
                "height",
                PixelConverter.toString(
                    Math.ceil(0.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
                )
            )
            .html(Icons.search)
            .on("click", () => {
                this.hostServices.persistProperties({
                    merge: [
                        {
                            objectName: "general",
                            selector: Selector,
                            properties: {
                                counter: counter++,
                            },
                        },
                    ],
                });
            });

        this.searchInput = this.searchHeader
            .append("input")
            .attr("type", "text")
            .attr("drag-resize-disabled", "true")
            .classed("searchInput", true)
            .style("font-size", `${this.settings.search.textSizeZoomed}pt`)
            .style("font-family", this.settings.search.fontFamily)
            .style("color", this.settings.search.fontColor)
            .style("background-color", this.settings.search.background)
            .on("input", () => {
                this.hostServices.persistProperties({
                    merge: [
                        {
                            objectName: "general",
                            selector: Selector,
                            properties: {
                                counter: counter++,
                            },
                        },
                    ],
                });
            });

        // Serach type: WIP
        // this.searchHeader
        //     .append("div")
        //     .classed(HierarchySlicer.Icon.className, true)
        //     .classed("searchType", true)
        //     .style("fill", this.settings.search.iconColor)
        //     .style(
        //         "width",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .style(
        //         "height",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .html(Icons.wildcard)
        //     .on("click", () => {
        //         this.searchFilter = SearchFilter.Wildcard;
        //     });
        // this.searchHeader
        //     .append("div")
        //     .classed(HierarchySlicer.Icon.className, true)
        //     .classed("searchType", true)
        //     .style("fill", this.settings.search.iconColor)
        //     .style(
        //         "width",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .style(
        //         "height",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .html(Icons.exact)
        //     .on("click", () => {
        //         this.searchFilter = SearchFilter.Exact;
        //     });
        // this.searchHeader
        //     .append("div")
        //     .classed(HierarchySlicer.Icon.className, true)
        //     .classed("searchType", true)
        //     .style("fill", this.settings.search.iconColor)
        //     .style(
        //         "width",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .style(
        //         "height",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .html(Icons.start)
        //     .on("click", () => {
        //         this.searchFilter = SearchFilter.Start;
        //     });
        // this.searchHeader
        //     .append("div")
        //     .classed(HierarchySlicer.Icon.className, true)
        //     .classed("searchType", true)
        //     .style("fill", this.settings.search.iconColor)
        //     .style(
        //         "width",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .style(
        //         "height",
        //         PixelConverter.toString(
        //             Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
        //         )
        //     )
        //     .html(Icons.end)
        //     .on("click", () => {
        //         this.searchFilter = SearchFilter.End;
        //     });
    }

    private updateSearchHeader(): void {
        this.searchHeader.classed("show", this.settings.general.selfFilterEnabled);
        this.searchHeader.classed("collapsed", !this.settings.general.selfFilterEnabled);
        this.searchHeader.style("border-color", this.settings.search.lineColor);
        if (this.settings.general.selfFilterEnabled) {
            let icons = this.searchHeader.selectAll(HierarchySlicer.Icon.selectorName);
            icons
                .style("fill", this.settings.search.iconColor)
                .style(
                    "width",
                    PixelConverter.toString(
                        Math.ceil(0.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
                    )
                )
                .style(
                    "height",
                    PixelConverter.toString(
                        Math.ceil(0.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
                    )
                );
            icons = this.searchHeader.selectAll(".searchType");
            icons
                .style("fill", this.settings.search.iconColor)
                .style(
                    "width",
                    PixelConverter.toString(
                        Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
                    )
                )
                .style(
                    "height",
                    PixelConverter.toString(
                        Math.ceil(0.5 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))
                    )
                );
            let searchInput = this.searchHeader.selectAll(".searchInput");
            searchInput
                .style("color", this.settings.search.fontColor)
                .style("font-size", `${this.settings.search.textSizeZoomed}pt`)
                .style("background-color", this.settings.search.background)
                .style("font-family", this.settings.search.fontFamily);
        }
    }

    private handleLandingPage(options: VisualUpdateOptions) {
        if (!options.dataViews || !options.dataViews.length) {
            if (!this.isLandingPageOn) {
                this.isLandingPageOn = true;
                const landingPage: Element = this.createLandingPage();
                this.root.insertBefore(landingPage, this.root.childNodes[0]);
                this.landingPage = select(landingPage);
            }
        } else if (this.isLandingPageOn) {
            this.isLandingPageOn = false;
            this.landingPage.remove();
        }
    }

    private createLandingPage(): Element {
        const div = document.createElement("div");
        div.classList.add("watermark");
        div.innerHTML = Icons.watermark; // tslint:disable-line: no-inner-html
        return div;
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const instanceEnumeration: VisualObjectInstanceEnumeration = HierarchySlicerSettings.enumerateObjectInstances(
            this.settings || HierarchySlicerSettings.getDefault(),
            options
        );
        let instances: VisualObjectInstance[] = [];

        switch (options.objectName) {
            case "general":
                // ignore most rendering general settings ( it include only hidden properties )
                this.removeEnumerateObject(instanceEnumeration, "filter");
                this.removeEnumerateObject(instanceEnumeration, "filterValues");
                this.removeEnumerateObject(instanceEnumeration, "expanded");
                this.removeEnumerateObject(instanceEnumeration, "selectAll");
                this.removeEnumerateObject(instanceEnumeration, "selfFilter");
                this.removeEnumerateObject(instanceEnumeration, "selfFilterEnabled");
                break;
            case "selection":
                if (this.settings.selection.singleSelect) {
                    this.removeEnumerateObject(instanceEnumeration, "ctrlSelect");
                    this.removeEnumerateObject(instanceEnumeration, "selectAll");
                    this.removeEnumerateObject(instanceEnumeration, "selectAllLabel");
                }
                if (!this.settings.selection.selectAll) {
                    this.removeEnumerateObject(instanceEnumeration, "selectAllLabel");
                }
                if (this.settings.selection.hideMembers !== HideMembers.Never) {
                    this.removeEnumerateObject(instanceEnumeration, "emptyLeafLabel");
                }
                break;
            case "search":
                if (!this.settings.general.selfFilterEnabled) return [];
                break;
            case "mobile":
                this.removeEnumerateObject(instanceEnumeration, "focus"); // new API => no detection of focus mode
                break;
        }

        instances.forEach((instance: VisualObjectInstance) => {
            this.addAnInstanceToEnumeration(instanceEnumeration, instance);
        });
        return instanceEnumeration;
    }

    public addAnInstanceToEnumeration(
        instanceEnumeration: VisualObjectInstanceEnumeration,
        instance: VisualObjectInstance
    ): void {
        if ((instanceEnumeration as VisualObjectInstanceEnumerationObject).instances) {
            (instanceEnumeration as VisualObjectInstanceEnumerationObject).instances.push(instance);
        } else {
            (instanceEnumeration as VisualObjectInstance[]).push(instance);
        }
    }

    public removeEnumerateObject(instanceEnumeration: VisualObjectInstanceEnumeration, objectName: string): void {
        if ((instanceEnumeration as VisualObjectInstanceEnumerationObject).instances) {
            delete (instanceEnumeration as VisualObjectInstanceEnumerationObject).instances[0].properties[objectName];
        } else {
            delete (instanceEnumeration as VisualObjectInstance[])[0].properties[objectName];
        }
    }

    private static parseSettings(
        dataView: DataView,
        colorPalette: ISandboxExtendedColorPalette
    ): HierarchySlicerSettings {
        const settings: HierarchySlicerSettings = HierarchySlicerSettings.parse<HierarchySlicerSettings>(dataView);

        // Backwards compability => convert to new values
        if (settings.selection.emptyLeafs !== undefined) {
            if (settings.selection.emptyLeafs) {
                settings.selection.hideMembers = HideMembers.Never;
            } else {
                settings.selection.hideMembers = HideMembers.Empty;
            }
            settings.selection.emptyLeafs = undefined;
        }

        // check for testing purpose
        if (colorPalette.foregroundNeutralSecondary) {
            // Use theme colors
            settings.items.fontColor =
                settings.items.fontColor === ""
                    ? colorPalette.foregroundNeutralSecondary.value
                    : settings.items.fontColor; // tslint:disable-line: prettier
            settings.items.checkBoxColor =
                settings.items.checkBoxColor === ""
                    ? colorPalette.backgroundNeutral.value
                    : settings.items.checkBoxColor; // tslint:disable-line: prettier
            settings.items.hoverColor =
                settings.items.hoverColor === "" ? colorPalette.foreground.value : settings.items.hoverColor; // tslint:disable-line: prettier
            settings.items.selectedColor =
                settings.items.selectedColor === ""
                    ? colorPalette.foregroundNeutralDark.value
                    : settings.items.selectedColor; // tslint:disable-line: prettier
            settings.items.scrollbarColor =
                settings.items.scrollbarColor === ""
                    ? colorPalette.foregroundNeutralTertiary.value
                    : settings.items.scrollbarColor; // tslint:disable-line: prettier

            settings.search.fontColor =
                settings.search.fontColor === "" ? colorPalette.foreground.value : settings.search.fontColor; // tslint:disable-line: prettier
            settings.search.iconColor =
                settings.search.iconColor === "" ? colorPalette.foreground.value : settings.search.iconColor; // tslint:disable-line: prettier
            settings.search.lineColor =
                settings.search.lineColor === "" ? colorPalette.backgroundNeutral.value : settings.search.lineColor; // tslint:disable-line: prettier

            settings.header.fontColor =
                settings.header.fontColor === "" ? colorPalette.foreground.value : settings.header.fontColor; // tslint:disable-line: prettier
            settings.header.outlineColor =
                settings.header.outlineColor === "" ? colorPalette.backgroundLight.value : settings.header.outlineColor; // tslint:disable-line: prettier

            settings.tooltipSettings.color =
                settings.tooltipSettings.color === ""
                    ? colorPalette.backgroundNeutral.value
                    : settings.tooltipSettings.color; // tslint:disable-line: prettier
        }

        return settings;
    }
}
