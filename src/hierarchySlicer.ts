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
import { IMargin, CssConstants } from "powerbi-visuals-utils-svgutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";
import { ITooltipServiceWrapper, createTooltipServiceWrapper, TooltipEventArgs, } from "powerbi-visuals-utils-tooltiputils"; // tslint:disable-line: prettier
import { Selector } from "powerbi-models";
import { select, Selection } from "d3-selection";

import { isEqual } from "lodash-es";

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
import { BorderStyle, FontStyle, HideMembers, TraceEvents } from "./enums";
import { checkMobile } from "./utils";
import { PerfTimer } from "./perfTimer";
import { converter } from "./converter";
import { Graphics } from "./graphics";

import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import IFilter = powerbi.IFilter;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IInteractivityService = interactivityBaseService.IInteractivityService;
import createInteractivitySelectionService = interactivitySelectionService.createInteractivitySelectionService;
import PixelConverter = pixelConverter;
import ClassAndSelector = CssConstants.ClassAndSelector;
import createClassAndSelector = CssConstants.createClassAndSelector;
import TextProperties = textMeasurementService.TextProperties;
import TextMeasurementService = textMeasurementService.textMeasurementService;

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
    private margin: IMargin;
    private maxLevels: number;
    private rowHeight: number;
    private waitingForData: boolean;
    private isInFocus: boolean;
    private slicerContainer: Selection<any, any, any, any>;
    private slicerHeaderContainer: Selection<any, any, any, any>;
    private slicerHeader: Selection<any, any, any, any>;
    private slicerBody: Selection<any, any, any, any>;
    private slicerBodySpinner: Selection<any, any, any, any>;
    private isLandingPageOn: boolean;
    private landingPageRemoved: boolean;
    private landingPage: Selection<any, any, any, any>;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private selectionBuilder: ISelectionIdBuilder;

    public static DefaultFontFamily: string = "Segoe UI, Tahoma, Verdana, Geneva, sans-serif";
    public static DefaultFontSizeInPt: number = 11;

    public static Container: ClassAndSelector = createClassAndSelector("slicerContainer");
    public static Body: ClassAndSelector = createClassAndSelector("slicerBody");
    public static BodySpinner: ClassAndSelector = createClassAndSelector("slicerBodySpinner");
    public static ItemContainer: ClassAndSelector = createClassAndSelector("slicerItemContainer");
    public static ItemContainerExpander: ClassAndSelector = createClassAndSelector("slicerItemContainerExpander");
    public static ItemContainerChild: ClassAndSelector = createClassAndSelector("slicerItemContainerChild");
    public static LabelText: ClassAndSelector = createClassAndSelector("slicerText");
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
        this.selectionBuilder = this.hostServices.createSelectionIdBuilder();

        this.colorPalette = options.host.colorPalette;
        this.isHighContrast = this.colorPalette.isHighContrast;
    }

    private init(options: VisualUpdateOptions): void {
        this.viewport = options.viewport;

        this.slicerContainer = select(this.root)
            .append("div")
            .classed(HierarchySlicer.Container.className, true);

        this.renderHeader(this.slicerContainer);

        const bodyViewPort = this.getBodyViewport(this.viewport);
        this.slicerBody = this.slicerContainer
            .append("div")
            .classed(HierarchySlicer.Body.className, true)
            .style("height", PixelConverter.toString(bodyViewPort.height))
            .style("width", PixelConverter.toString(bodyViewPort.width));

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

        let treeViewOptions: IHierarchySlicerTreeViewOptions = {
            rowHeight: this.getRowHeight(),
            enter: rowEnter,
            exit: rowExit,
            update: rowUpdate,
            loadMoreData: onLoadMoreData,
            moreData: moreData,
            scrollEnabled: true,
            viewport: this.getBodyViewport(this.viewport),
            baseContainer: this.slicerBody,
            // isReadMode: () => {
            //     return (this.hostServices.getViewMode() !== ViewMode.Edit);
            // }
        };

        this.treeView = HierarchySlicerTreeViewFactory.createListView(treeViewOptions);
    }

    private renderHeader(rootContainer: Selection<any, any, any, any>): void {
        const headerButtonData = [
            { title: "Clear", class: HierarchySlicer.Clear.className, icon: Icons.clearAll, level: 0 },
            { title: "Expand all", class: HierarchySlicer.Expand.className, icon: Icons.expandAll, level: 1 },
            {
                title: "Collapse all",
                class: HierarchySlicer.Collapse.className,
                icon: Icons.collapseAll,
                level: 1,
            },
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

    public update(options: VisualUpdateOptions) {
        console.log(options);
        let timer = PerfTimer.start(TraceEvents.update);
        this.handleLandingPage(options);
        if (!options || !options.dataViews || !options.dataViews[0] || !options.viewport) {
            return;
        }

        this.isInFocus = false;
        this.dataView = options.dataViews[0];
        if (!this.dataView) {
            return;
        }
        this.jsonFilters = options.jsonFilters;
        this.settings = HierarchySlicer.parseSettings(this.dataView);

        if (!this.viewport) {
            this.viewport = options.viewport;
            this.init(options);
        }

        if (options.viewport.height === this.viewport.height && options.viewport.width === this.viewport.width) {
            this.waitingForData = false;
        } else {
            this.viewport = options.viewport;
        }

        let resetScrollbarPosition: boolean = true;
        const existingDataView = this.dataView;

        if (existingDataView) {
            resetScrollbarPosition = !HierarchySlicer.hasSameTableIdentity(existingDataView, this.dataView);
        }
        this.updateInternal(resetScrollbarPosition);
        timer();
    }

    private static hasSameTableIdentity(dataView1: DataView, dataView2: DataView): boolean {
        if (
            dataView1 &&
            dataView2 &&
            dataView1.table && // in table view mapping is null
            dataView2.table
        ) {
            // in table view mapping is null
            let dv1TableIdentity = dataView1.table.identity;
            let dv2TableIdentity = dataView2.table.identity;
            if (dv1TableIdentity && dv2TableIdentity && dv1TableIdentity.length === dv2TableIdentity.length) {
                for (let i = 0, len = dv1TableIdentity.length; i < len; i++) {
                    let dv1Identity: any = dv1TableIdentity[i];
                    let dv2Identity: any = dv2TableIdentity[i];

                    if (!isEqual((<any>dv1Identity).scopeId, (<any>dv2Identity).scopeId)) return false;
                }

                return true;
            }
        }

        return false;
    }

    private updateInternal(resetScrollbar: boolean) {
        this.updateSettings();
        this.updateSlicerBodyDimensions();

        const data = (this.data = converter(
            this.dataView,
            this.jsonFilters,
            (this.searchInput.node() as HTMLInputElement).value,
            this.settings,
            this.selectionBuilder
        ));
        this.maxLevels = this.data.levels + 1;
        this.settings = data.settings;
        if (data.dataPoints.length === 0) {
            this.treeView.empty();
            return;
        }

        this.rowHeight = this.treeView.getRealRowHeight();
        this.treeView
            .viewport(this.getBodyViewport(this.viewport))
            .rowHeight(this.getRowHeight())
            .data(
                data.dataPoints.filter((d: IHierarchySlicerDataPoint) => !d.isHidden), // Expand/Collapse
                (d: IHierarchySlicerDataPoint) => data.dataPoints.indexOf(d),
                resetScrollbar
            )
            .render();

        this.updateSearchHeader();
    }

    private updateSettings(): void {
        this.isHighContrast = this.colorPalette.isHighContrast; // additional assignment for testing purpose
        this.updateMobileSettings();
        this.updateSelectionStyle();
        this.updateFontStyle();
        this.updateHeaderStyle();
        this.updateSearchStyle();
    }

    private updateSelectionStyle(): void {
        this.slicerContainer.classed("isMultiSelectEnabled", !this.settings.selection.singleSelect);
    }

    private updateFontStyle(): void {
        // Used setting values -> High Contrast
        this.settings.items.fontColor = this.isHighContrast
            ? this.colorPalette.foreground.value
            : this.settings.items.fontColor;
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
        const _this = this;
        const maxLevel = this.maxLevels;
        const treeItemElementParent: Selection<any, any, any, any> = rowSelection
            .selectAll(HierarchySlicer.ItemContainer.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .append("li")
            .classed(HierarchySlicer.ItemContainer.className, true);

        treeItemElementParent.style("background-color", this.settings.items.background);

        treeItemElementParent.exit().remove();

        // Expand/collapse
        const expandCollapse: Selection<any, any, any, any> = treeItemElementParent
            .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .insert("div", ":first-child")
            .classed(HierarchySlicer.ItemContainerExpander.className, true);

        expandCollapse
            .selectAll(".icon")
            .data((d: IHierarchySlicerDataPoint) => (maxLevel === 1 ? [] : [d]))
            .enter()
            .insert("div")
            .classed("icon", true)
            .classed("icon-left", true)
            .style("visibility", d => (d.isLeaf ? "hidden" : "visible"))
            .style("font-size", `${this.settings.items.textSizeZoomed}pt`)
            .style("margin-left", d => PixelConverter.toString(-this.settings.items.textSizeZoomed / 2.5))
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
            .style("fill", this.settings.items.fontColor)
            .html(d => (d.isExpand ? Icons.expand : Icons.collapse));

        expandCollapse
            .selectAll(".spinner-icon")
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .insert("div") // Spinner location
            .classed("spinner-icon", true)
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
            );

        expandCollapse.exit().remove();

        const treeItemElement = treeItemElementParent
            .append("div")
            .classed(HierarchySlicer.ItemContainerChild.className, true);

        const checkBoxParent = treeItemElement
            .selectAll(HierarchySlicer.Input.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .append("div")
            .classed(HierarchySlicer.Input.className, true);

        const checkBoxInput: Selection<any, any, any, any> = checkBoxParent
            .selectAll("input")
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .append("input")
            .attr("type", "checkbox");

        const checkBoxSpan = checkBoxParent
            .selectAll(HierarchySlicer.Checkbox.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .append("span")
            .classed(HierarchySlicer.Checkbox.className, true);

        checkBoxSpan
            .style("width", 0.75 * this.settings.items.textSizeZoomed + "px")
            .style("height", 0.75 * this.settings.items.textSizeZoomed + "px")
            .style("margin-right", PixelConverter.fromPointToPixel(0.25 * this.settings.items.textSizeZoomed) + "px")
            .style("margin-bottom", PixelConverter.fromPointToPixel(0.25 * this.settings.items.textSizeZoomed) + "px");

        const labelElement = treeItemElement
            .selectAll(HierarchySlicer.LabelText.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .append("span")
            .classed(HierarchySlicer.LabelText.className, true);

        labelElement
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

        const mobileScale = this.settings.mobile.zoomed ? 1 + this.settings.mobile.enLarge / 100 : 1;

        treeItemElementParent.each(function(d, i) {
            const item = select(this);
            item.style(
                "padding-left",
                (maxLevel === 1 ? 0 : d.level * mobileScale * _this.settings.items.textSizeZoomed) + "px"
            );
            if (maxLevel === 1) item.style("margin-left", "-2px");
        });

        this.tooltipServiceWrapper.addTooltip(
            this.slicerBody.selectAll(".row"),
            (tooltipEvent: TooltipEventArgs<any>) =>
                !checkMobile(window.clientInformation.userAgent)
                    ? tooltipEvent.data && tooltipEvent.data.tooltip
                    : undefined,
            (tooltipEvent: TooltipEventArgs<any>) =>
                !checkMobile(window.clientInformation.userAgent)
                    ? tooltipEvent.data && tooltipEvent.data.selectionId
                    : undefined
        );
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
                statement += selected[0].value;
            } else if (!this.settings.selection.singleSelect && selected[0].level !== selected[1].level) {
                statement += selected[0].value;
            } else if (this.settings.selection.singleSelect) {
                statement += selected[0].value;
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
        const _this = this;
        let data = this.data;
        if (data) {
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

            let slicerText = rowSelection.selectAll(HierarchySlicer.LabelText.selectorName);

            slicerText.text((d: IHierarchySlicerDataPoint) => (d.label === "" ? String.fromCharCode(160) : d.label));

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
                    dataView: this.dataView,
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
                    slicerSettings: data.settings,
                    levels: data.levels,
                    behavior: this.behavior,
                };

                interactivityService.bind(behaviorOptions);

                this.behavior.styleSlicerInputs(
                    rowSelection.select(HierarchySlicer.ItemContainerChild.selectorName),
                    this.interactivityService.hasSelection()
                );
            } else {
                this.behavior.styleSlicerInputs(
                    rowSelection.select(HierarchySlicer.ItemContainerChild.selectorName),
                    false
                );
            }
        }
    }

    public static getTextProperties(fontFamily: string, textSize: number): TextProperties {
        return <TextProperties>{
            fontFamily: fontFamily,
            fontSize: `${textSize}pt`,
        };
    }

    private getHeaderHeight(): number {
        const searchHeight: number = this.settings.general.selfFilterEnabled
            ? TextMeasurementService.estimateSvgTextHeight(
                  HierarchySlicer.getTextProperties(
                      this.settings.search.fontFamily,
                      this.settings.search.textSizeZoomed
                  )
              ) + 2
            : 0;
        return (
            TextMeasurementService.estimateSvgTextHeight(
                HierarchySlicer.getTextProperties(this.settings.header.fontFamily, this.settings.header.textSizeZoomed)
            ) + searchHeight
        );
    }

    private getRowHeight(): number {
        return (
            this.rowHeight ||
            TextMeasurementService.estimateSvgTextHeight(
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

        this.searchHeader
            .append("div")
            .classed(HierarchySlicer.Icon.className, true)
            .classed("delete", true)
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
            .html(Icons.delete)
            .on("click", () => {
                (this.searchInput.node() as HTMLInputElement).value = "";
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
    }

    private updateSearchHeader(): void {
        this.searchHeader.classed("show", this.settings.general.selfFilterEnabled);
        this.searchHeader.classed("collapsed", !this.settings.general.selfFilterEnabled);
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
                this.root.appendChild(landingPage);
                this.landingPage = select(landingPage);
            }
        } else if (this.isLandingPageOn && !this.landingPageRemoved) {
            this.landingPageRemoved = true;
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
                // ignore rendering general settings ( it include only hidden properties )
                return [];
            case "selection":
                if (!this.settings.selection.selectAll) {
                    this.removeEnumerateObject(instanceEnumeration, "selectAllLabel");
                }
                if (this.settings.selection.hideMembers !== HideMembers.Never) {
                    this.removeEnumerateObject(instanceEnumeration, "emptyLeafLabel");
                }
                break;
            case "search":
                if (!this.settings.general.selfFilterEnabled) return [];

                if (this.settings.selection.singleSelect) {
                    this.removeEnumerateObject(instanceEnumeration, "addSelection");
                }
                break;
            case "mobile":
                this.removeEnumerateObject(instanceEnumeration, "focus"); // new API => no detection of focus mode
                break;
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

    private static parseSettings(dataView: DataView): HierarchySlicerSettings {
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

        return settings;
    }
}
