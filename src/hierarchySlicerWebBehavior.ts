/*
 *
 * Copyright (c) 2018 Jan Pieter Posthuma / DataScenarios
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
import * as interactivityutils from "powerbi-visuals-utils-interactivityutils";
import * as typeutils from "powerbi-visuals-utils-typeutils";
import * as models from "powerbi-models";
import * as d3 from "d3";
import * as $ from "jquery";
import * as _ from "lodash";

import * as interfaces from "./interfaces";
import * as settings from "./settings";

import IViewport = powerbi.IViewport;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IFilter = powerbi.IFilter;
import FilterAction = powerbi.FilterAction;
import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
import DataViewPropertyValue = powerbi.DataViewPropertyValue;
import VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import ISelectionHandler = interactivityutils.interactivityBaseService.ISelectionHandler;
import IInteractivityService = interactivityutils.interactivityBaseService.IInteractivityService;
import IInteractiveBehavior = interactivityutils.interactivityBaseService.IInteractiveBehavior;
import Selection = d3.Selection;
import PixelConverter = typeutils.pixelConverter;
import IFilterColumnTarget = models.IFilterColumnTarget;

import IHierarchySlicerBehaviorOptions = interfaces.IHierarchySlicerBehaviorOptions;
import IHierarchySlicerDataPoint = interfaces.IHierarchySlicerDataPoint;
import HierarchySlicerSettings = settings.HierarchySlicerSettings;

let hierarchySlicerProperties = {
    expandedValuePropertyIdentifier: <DataViewObjectPropertyIdentifier>{ objectName: "general", propertyName: "expanded" },
    selectionPropertyIdentifier: <DataViewObjectPropertyIdentifier>{ objectName: "general", propertyName: "selection" },
    filterPropertyIdentifier: <DataViewObjectPropertyIdentifier>{ objectName: "general", propertyName: "filter" },
    filterValuePropertyIdentifier: <DataViewObjectPropertyIdentifier>{ objectName: "general", propertyName: "filterValues" },
    defaultValue: <DataViewObjectPropertyIdentifier>{ objectName: "general", propertyName: "defaultValue" },
    selfFilterEnabled: <DataViewObjectPropertyIdentifier>{ objectName: "general", propertyName: "selfFilterEnabled" },
    mobileViewEnabled: <DataViewObjectPropertyIdentifier>{ objectName: "mobile", propertyName: "enable" },
};

export class HierarchySlicerWebBehavior implements IInteractiveBehavior {
    private hostServices: IVisualHost;
    private expanders: Selection<any>;
    private options: IHierarchySlicerBehaviorOptions;
    private slicers: Selection<any>;
    private slicerBodySpinner: Selection<any>;
    private slicerItemLabels: Selection<any>;
    private slicerItemInputs: Selection<any>;
    private dataPoints: IHierarchySlicerDataPoint[];
    private fullTree: IHierarchySlicerDataPoint[];
    private dataView: powerbi.DataView;
    private interactivityService: IInteractivityService<IHierarchySlicerDataPoint>;
    private selectionHandler: ISelectionHandler;
    private settings: HierarchySlicerSettings;
    private levels: number;
    private initFilter: boolean = true;
    private spinnerTimeoutId: number;

    public HierarchySlicerWebBehavior(): void {
        this.initFilter = true;
    }

    public bindEvents(options: IHierarchySlicerBehaviorOptions, selectionHandler: ISelectionHandler): void {
        let expanders = this.expanders = options.expanders;
        let slicers: Selection<any> = this.slicers = options.slicerItemContainers;
        this.slicerBodySpinner = options.slicerBodySpinner;
        this.slicerItemLabels = options.slicerItemLabels;
        this.slicerItemInputs = options.slicerItemInputs;
        this.dataPoints = options.dataPoints;
        this.fullTree = options.fullTree;
        this.dataView = options.dataView;
        this.interactivityService = options.interactivityService;
        this.selectionHandler = selectionHandler;
        this.settings = options.slicerSettings;
        this.hostServices = options.hostServices;
        this.levels = options.levels;
        this.options = options;

        let slicerClear = options.slicerClear;
        let slicerExpand = options.slicerExpand;
        let slicerCollapse = options.slicerCollapse;
        let slicerHeaderText = options.slicerHeaderText;
        let doubleTap = false;

        this.renderSelection(true);

        expanders.on("click", (d: IHierarchySlicerDataPoint, index: number) => {
            d.isExpand = !d.isExpand;
            if (this.spinnerTimeoutId) window.clearTimeout(this.spinnerTimeoutId);
            this.spinnerTimeoutId = window.setTimeout(() => this.addSpinner(expanders, index), this.settings.general.spinnerDelay);
            this.persistExpand(false);
        });

        expanders.on("mouseover", (d: IHierarchySlicerDataPoint, i: number) => {
            if (d.selectable) {
                d.mouseOver = true;
                d.mouseOut = false;
                this.renderMouseover();
            }
        });

        expanders.on("mouseout", (d: IHierarchySlicerDataPoint) => {
            if (d.selectable) {
                d.mouseOver = false;
                d.mouseOut = true;
                this.renderMouseover();
            }
        });

        options.slicerContainer.classed("hasSelection", true);

        slicers.on("mouseover", (d: IHierarchySlicerDataPoint) => {
            if (d.selectable) {
                d.mouseOver = true;
                d.mouseOut = false;
                this.renderMouseover();
            }
        });

        slicers.on("mouseout", (d: IHierarchySlicerDataPoint) => {
            if (d.selectable) {
                d.mouseOver = false;
                d.mouseOut = true;
                this.renderMouseover();
            }
        });

        slicers.on("click", (d: IHierarchySlicerDataPoint, index: number) => {
            (d3.event as MouseEvent).preventDefault();
            if (!d.selectable) {
                return;
            }
            let filterLevel = this.levels;
            if (this.spinnerTimeoutId) window.clearTimeout(this.spinnerTimeoutId);
            this.spinnerTimeoutId = window.setTimeout(() => this.addSpinner(expanders, index), this.settings.general.spinnerDelay);
            let selected = d.partialSelected ? !d.selected : d.selected;
            let selectionDataPoints = [];
            if ((!(this.settings.selection.singleSelect) && this.settings.search.addSelection) || (!this.settings.selection.emptyLeafs)) {
                selectionDataPoints = this.fullTree;
            } else {
                selectionDataPoints = this.dataPoints;
            }
            selectionDataPoints = selectionDataPoints.filter((d) => d.ownId !== "selectAll");
            if (d.ownId === "selectAll") {
                selectionDataPoints.forEach(function(dp) { dp.selected = !selected; });
                d.selected =  !selected;
                this.renderSelection(true);
                this.persistSelectAll(!selected);
                // this.persistFilter([], FilterAction.remove);
                this.persistFilter(null, 1);
                return;
            }
            if (!this.settings.selection.singleSelect) { // multi select value
                d.selected = !selected; // Toggle selection
                d.partialSelected = false; // Current member: never partialSelected
                if (!selected) { // Select member logic
                    selectionDataPoints
                        .filter((dp) => dp.parentId.indexOf(d.ownId) > -1) // All children
                        .forEach((dp) => dp.selected = true );
                    HierarchySlicerWebBehavior.getParentDataPoints(selectionDataPoints, d.parentId)
                        .forEach((dp) => {
                            if (!dp.selected) {
                                dp.selected = true;
                            }
                            const children = selectionDataPoints.filter((c) => c.parentId.indexOf(dp.ownId) > -1);
                            if (children.length === children.filter((c) => c.selected).length) { // All children selected?
                                dp.partialSelected = false;
                            } else {
                                dp.partialSelected = true;
                            }
                        });
                } else if (!d.isLeaf) {
                    selectionDataPoints
                        .filter((dp) => dp.parentId.indexOf(d.ownId) >= 0)
                        .forEach((dp) => dp.selected = (selected === dp.selected) ? !selected : dp.selected);
                }
                if (selected) { // Deselect member logic
                    selectionDataPoints
                        .filter((dp) => dp.parentId.indexOf(d.ownId) > -1)
                        .forEach((dp) => dp.selected = false);
                    HierarchySlicerWebBehavior.getParentDataPoints(selectionDataPoints, d.parentId)
                        .forEach((dp) => {
                            const children = selectionDataPoints.filter((c) => c.parentId.indexOf(dp.ownId) > -1);
                            if (children.filter((c) => c.selected).length === 0) { // All children deselected?
                                dp.selected = false;
                                dp.partialSelected = false;
                            } else {
                                dp.selected = true;
                                dp.partialSelected = true;
                            }
                    });
                }
                filterLevel = selectionDataPoints.filter((d) => d.partialSelected)
                        .reduce((s, d) => Math.max(d.level, s), -1) + 1;
            }
            else { // single select value
                selectionDataPoints.forEach((dp) => dp.selected = false);
                const parents = HierarchySlicerWebBehavior.getParentDataPoints(selectionDataPoints, d.parentId);
                let selectDataPoints = [d]; // Self
                filterLevel = d.level; // Set filter level to selected item
                selectDataPoints
                    .concat(selectionDataPoints.filter((dp) => dp.parentId.indexOf(d.ownId) >= 0)) // Children
                    .map((dp) => dp.selected = !selected);
                parents // Parents
                    .map((dp) => {
                        dp.selected = !selected;
                        dp.partialSelected = !selected;
                    });
            }

            this.renderSelection(true);
            this.persistSelectAll(selectionDataPoints.filter((d) => d.selected).length === selectionDataPoints.length);
            this.applyFilter(filterLevel);
        });

        // HEADER EVENTS
        slicerCollapse.on("click", (d: IHierarchySlicerDataPoint) => {
            if (this.dataPoints.filter((d) => d.isExpand).length > 0) {
                $(".scrollbar-inner").scrollTop(0);
                this.dataPoints.filter((d) => !d.isLeaf).forEach((d) => d.isExpand = false);
                this.persistExpand(true);
            }
        });

        slicerExpand.on("click", (d: IHierarchySlicerDataPoint) => {
            if (this.dataPoints.filter((d) => !d.isExpand && !d.isLeaf).length > 0) {
                this.dataPoints.filter((d) => !d.isLeaf).forEach((d) => d.isExpand = true);
                this.persistExpand(true);
            }
        });

        slicerClear.on("click", (d: IHierarchySlicerDataPoint) => {
            if (this.dataPoints.filter((d) => d.selected).length === 0) return;
            if (this.spinnerTimeoutId) window.clearTimeout(this.spinnerTimeoutId);
            this.spinnerTimeoutId = window.setTimeout(() => this.addSpinner(expanders, 0), this.settings.general.spinnerDelay);
            this.selectionHandler.handleClearSelection();
            this.persistSelectAll(false);
            this.persistFilter(null);
        });

        slicerHeaderText.on("click", (d) => {
            if (!doubleTap) {
                doubleTap = true;
                setTimeout(() => doubleTap = false, 300 );
                return false;
            }
            event.preventDefault();
            if (this.settings.mobile.title) {
                this.toggleMobileView(this.settings.mobile.zoomed);
            }
        });
    }

    private addSpinner(expanders: d3.Selection<any>, index: number) {
        const currentExpander = expanders.filter((expander, i) => index === i);
        const currentExpanderHtml = (<HTMLElement>currentExpander[0][0]);
        const size = Math.min(currentExpanderHtml.clientHeight, currentExpanderHtml.clientWidth);
        const scale = size / 25.0;
        currentExpander.select(".icon").remove();
        const container = currentExpander.select(".spinner-icon").style("display", "inline");
        const spinner = container.append("div").classed("xsmall", true).classed("powerbi-spinner", true).style({
            "top": "25%",
            "right": "50%",
            "transform": `scale(${scale})`,
            "margin": "0px;",
            "padding-left": "5px;",
            "display": "block;",
            "margin-right": "-3px",
            "margin-left": (d) => PixelConverter.toString(this.settings.items.textSize / (2.5)),
            "margin-bottom": "0px",
            "float": "right"
        }).attr("ng-if", "viewModel.showProgressBar")
            .attr("delay", "100")
            .append("div").classed("spinner", true);
        for (let i = 0; i < 5; i++) {
            spinner.append("div").classed("circle", true);
        }
    }

    private renderMouseover(): void {
        this.slicerItemLabels.style({
            "color": (d: IHierarchySlicerDataPoint) => {
                if (d.mouseOver)
                    return this.settings.items.hoverColor;
                else if (d.mouseOut) {
                    if (d.selected)
                        return this.settings.items.fontColor;
                    else
                        return this.settings.items.fontColor;
                }
                else
                    return this.settings.items.fontColor; // fallback
            }
        });
        this.expanders.style({
            "color": (d: IHierarchySlicerDataPoint) => {
                if (d.mouseOver)
                    return this.settings.items.hoverColor;
                else if (d.mouseOut) {
                    if (d.selected)
                        return this.settings.items.fontColor;
                    else
                        return this.settings.items.fontColor;
                }
                else
                    return this.settings.items.fontColor; // fallback
            }
        });
    }

    public renderSelection(hasSelection: boolean): void {
        if (!hasSelection && !this.interactivityService.isSelectionModeInverted()) {
            this.slicerItemInputs.filter(".selected").classed("selected", false);
            this.slicerItemInputs.filter(".partiallySelected").classed("partiallySelected", false);
            let input = this.slicerItemInputs.selectAll("input");
            if (input) {
                input.property("checked", false);
            }
        }
        else {
            this.styleSlicerInputs(this.slicers, hasSelection);
        }
    }

    public styleSlicerInputs(slicers: Selection<any>, hasSelection: boolean) {
        let settings = this.settings;
        slicers.each(function (d: IHierarchySlicerDataPoint) {
            let slicerItem: HTMLElement = this.getElementsByTagName("div")[0];
            let shouldCheck: boolean = d.selected;
            let partialCheck: boolean = d.partialSelected;
            let input = slicerItem.getElementsByTagName("input")[0];
            if (input)
                input.checked = shouldCheck;

            if (shouldCheck && partialCheck) {
                slicerItem.classList.remove("selected");
                slicerItem.classList.add("partiallySelected");
            } else if (shouldCheck && (!partialCheck)) {
                slicerItem.classList.remove("partiallySelected");
                slicerItem.classList.add("selected");
            } else
                slicerItem.classList.remove("selected");

            let slicerSpan: HTMLElement = slicerItem.getElementsByTagName("span")[0];
            slicerSpan.style.borderColor = d.selected ? settings.items.selectedColor : settings.items.fontColor;
            slicerSpan.style.backgroundColor = d.selected ? settings.items.selectedColor : "transparent";
        });
    }

    public applyFilter(levels: number): void {
        if (this.dataPoints.length === 0) { // Called without data
            return;
        }

        const tablesAndColumns: {} = {};
        const dataPoints = this.dataPoints.filter((d) => d.ownId !== "selectAll");

        dataPoints.forEach((dataPoint: IHierarchySlicerDataPoint) => {
            if ((dataPoint.selected) && dataPoint.level <= levels) {
                if (!tablesAndColumns[dataPoint.filterTarget.table]) {
                    tablesAndColumns[dataPoint.filterTarget.table] = {};
                }

                if (!tablesAndColumns[dataPoint.filterTarget.table][(<IFilterColumnTarget>dataPoint.filterTarget).column]) {
                    tablesAndColumns[dataPoint.filterTarget.table][(<IFilterColumnTarget>dataPoint.filterTarget).column] = [];
                }

                tablesAndColumns[dataPoint.filterTarget.table][(<IFilterColumnTarget>dataPoint.filterTarget).column].push(dataPoint);
            }
        });

        const targets: any = [];
        Object.keys(tablesAndColumns).forEach(table =>
            Object.keys(tablesAndColumns[table]).forEach(column => {
                targets.push({
                    column: column,
                    table: table
                });
            }
            )
        );

        let filterDataPoints: IHierarchySlicerDataPoint[] = dataPoints.filter(d => d.selected && d.level === levels);

        let getParent = (value: IHierarchySlicerDataPoint): IHierarchySlicerDataPoint[] => {
            if (value.parentId) {
                let parent: IHierarchySlicerDataPoint = dataPoints.filter(d => d.ownId === value.parentId)[0];
                if (parent.parentId) {
                    let grandParents = getParent(parent);
                    grandParents.push(parent);
                    return grandParents;
                }
                else {
                    return [parent];
                }
            }
            return [];
        };

        // create table from tree
        let filterValues: any[] = filterDataPoints.map((dataPoint: IHierarchySlicerDataPoint) => { // TupleValueType
            let parents: IHierarchySlicerDataPoint[] = getParent(dataPoint);
            parents.push(dataPoint);
            return parents.map( dataPoint => {
                return <any>{ // ITupleElementValue
                    // need to pass correct value type
                    value: isNaN(Number(dataPoint.value)) ? dataPoint.value : Number(dataPoint.value)
                };
            });
        });

        let filterInstance: any = {
            target: targets,
            operator: "In",
            values: filterValues,
            $schema: "http://powerbi.com/product/schema#tuple",
            filterType: 6
        };

        if (!filterValues.length || !filterValues.length) {
            this.persistFilter(null, 1);
            return;
        }

        this.persistFilter(filterInstance);
    }

    public static getParentDataPoints(dataPoints: IHierarchySlicerDataPoint[], parentId: string): IHierarchySlicerDataPoint[] {
        let parent = dataPoints.filter((d) => d.ownId === parentId);
        if (!parent || (parent.length === 0)) {
            return [];
        } else if (parent[0].level === 0) {
            return parent;
        } else {
            let returnParents = [];

            returnParents = returnParents.concat(parent, this.getParentDataPoints(dataPoints, parent[0].parentId));

            return returnParents;
        }
    }

    private persistFilter(filter: IFilter | IFilter[], action: FilterAction = FilterAction.merge) {
        this.hostServices.applyJsonFilter(filter,
            hierarchySlicerProperties.filterPropertyIdentifier.objectName,
            hierarchySlicerProperties.filterPropertyIdentifier.propertyName,
            action
        );
    }

    private persistExpand(updateScrollbar: boolean) {
        let properties: { [propertyName: string]: DataViewPropertyValue } = {};
        properties[hierarchySlicerProperties.expandedValuePropertyIdentifier.propertyName] = this.dataPoints.filter((d) => d.isExpand).map((d) => d.ownId).join(",");

        let objects: VisualObjectInstancesToPersist = {
            merge: [
                <VisualObjectInstance>{
                    objectName: hierarchySlicerProperties.expandedValuePropertyIdentifier.objectName,
                    selector: undefined,
                    properties: properties,
                }]
        };

        this.hostServices.persistProperties(objects);
    }

    private persistSelectAll(selectAll: boolean) {
        const instance = {
            objectName: "general",
            selector: undefined,
            properties: {
                selectAll: true
            },
        };
        this.hostServices.persistProperties(selectAll ? { merge: [ instance ] } : { remove: [ instance ] });
    }

    private toggleMobileView(currentStatus: boolean) {
        let properties: { [propertyName: string]: DataViewPropertyValue } = {};
        properties[hierarchySlicerProperties.mobileViewEnabled.propertyName] = !currentStatus;
        let objects = {
            merge: [
                {
                    objectName: hierarchySlicerProperties.mobileViewEnabled.objectName,
                    selector: undefined,
                    properties: properties,
                }
            ]
        };
        this.hostServices.persistProperties(objects);
    }
}