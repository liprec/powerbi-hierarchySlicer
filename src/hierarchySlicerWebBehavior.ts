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
import { interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import { IFilterColumnTarget, IFilterTarget, Selector } from "powerbi-models";
import { select, event, Selection } from "d3-selection";
import { isEqual } from "lodash-es";

import * as interfaces from "./interfaces";
import * as settings from "./hierarchySlicerSettings";

import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IFilter = powerbi.IFilter;
import FilterAction = powerbi.FilterAction;
import DataViewPropertyValue = powerbi.DataViewPropertyValue;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import ISelectionHandler = interactivityBaseService.ISelectionHandler;
import IInteractivityService = interactivityBaseService.IInteractivityService;
import IInteractiveBehavior = interactivityBaseService.IInteractiveBehavior;

import IHierarchySlicerBehaviorOptions = interfaces.IHierarchySlicerBehaviorOptions;
import IHierarchySlicerDataPoint = interfaces.IHierarchySlicerDataPoint;
import HierarchySlicerProperties = interfaces.HierarchySlicerProperties;
import HierarchySlicerSettings = settings.HierarchySlicerSettings;
import { SelectionType } from "./enums";
import { persistFilter, applyFilter, getCommonLevel } from "./utils";

export class HierarchySlicerWebBehavior implements IInteractiveBehavior {
    private hostServices: IVisualHost;
    private expanders: Selection<any, any, any, any>;
    private slicers: Selection<any, any, any, any>;
    private slicerItemLabels: Selection<any, any, any, any>;
    private slicerItemInputs: Selection<any, any, any, any>;
    private dataPoints: IHierarchySlicerDataPoint[];
    private fullTree: IHierarchySlicerDataPoint[];
    private columnFilters: IFilterTarget[];
    private interactivityService: IInteractivityService<IHierarchySlicerDataPoint>;
    private selectionHandler: ISelectionHandler;
    private settings: HierarchySlicerSettings;
    private levels: number;
    private spinnerTimeoutId?: number;
    private filterInstance: any[] = [];
    private ctrlPressed: boolean = false;

    public get FilterInstance() {
        return this.filterInstance;
    }
    public set FilterInstance(filterInstance: any[]) {
        this.filterInstance = filterInstance;
    }

    // tslint:disable-next-line: max-func-body-length
    public bindEvents(options: IHierarchySlicerBehaviorOptions, selectionHandler: ISelectionHandler): void {
        let expanders = (this.expanders = options.expanders);
        let slicers: Selection<any, any, any, any> = (this.slicers = options.slicerItemContainers);
        this.slicerItemLabels = options.slicerItemLabels;
        this.slicerItemInputs = options.slicerItemInputs;
        this.dataPoints = options.dataPoints;
        this.fullTree = options.fullTree;
        this.columnFilters = options.columnFilters;
        this.interactivityService = options.interactivityService;
        this.selectionHandler = selectionHandler;
        this.settings = options.slicerSettings;
        this.hostServices = options.hostServices;
        this.levels = options.levels;

        let slicerClear = options.slicerClear;
        let slicerExpand = options.slicerExpand;
        let slicerCollapse = options.slicerCollapse;
        let slicerHeaderText = options.slicerHeaderText;
        let doubleTap: boolean = false;

        this.renderSelection(true);

        expanders.on("click", (d: IHierarchySlicerDataPoint, index: number) => {
            d.isExpand = !d.isExpand;
            if (this.spinnerTimeoutId) {
                window.clearTimeout(this.spinnerTimeoutId);
            }
            this.spinnerTimeoutId = window.setTimeout(
                () => this.addSpinner(expanders, index),
                this.settings.general.spinnerDelay
            );
            this.persistExpand();
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

        // tslint:disable-next-line: max-func-body-length
        slicers.on("click", (d: IHierarchySlicerDataPoint, index: number) => {
            (<MouseEvent>event).preventDefault();
            if (!d.selectable) {
                return;
            }
            if (this.settings.selection.selectionType === SelectionType.Leaf && !d.isLeaf) return;
            if (this.settings.selection.singleSelect) {
                const isInCurrentSelection =
                    this.fullTree.filter(dp => dp.selected && isEqual(dp.ownId, d.ownId)).length > 0;
                const level = getCommonLevel(this.fullTree);
                const filterNode = this.fullTree.filter(
                    (dp: IHierarchySlicerDataPoint) => dp.selected && dp.level === level
                );
                const siblings = this.fullTree.filter(
                    (dp: IHierarchySlicerDataPoint) =>
                        dp.selected && !dp.partialSelected && isEqual(dp.parentId, d.parentId) && dp.level === d.level
                );
                if (
                    isInCurrentSelection &&
                    filterNode.length <= 1 &&
                    (isEqual(filterNode[0].ownId, d.ownId) || siblings.length === 1)
                )
                    return;
            }
            let filterLevel = this.levels;
            let selected = d.partialSelected ? d.selected : !d.selected;
            let selectionDataPoints = this.fullTree;
            if (isEqual(d.ownId, ["selectAll"])) {
                if (!this.settings.general.searching) {
                    selectionDataPoints.forEach(dataPoint => {
                        dataPoint.selected = selected;
                        dataPoint.partialSelected = false;
                    });
                    this.settings.general.selectAll = selected;
                    this.renderSelection(true);
                    this.persistSelectAll(selected);
                    persistFilter(this.hostServices, [], 1);
                } else {
                    selectionDataPoints.forEach(dataPoint => {
                        if (!dataPoint.isHidden) {
                            dataPoint.selected = selected;
                            dataPoint.partialSelected = false;
                        }
                    });
                    this.filterInstance.push(applyFilter(this.hostServices, this.fullTree, this.columnFilters, 0));
                }
                return;
            }
            if (this.spinnerTimeoutId) window.clearTimeout(this.spinnerTimeoutId);
            this.spinnerTimeoutId = window.setTimeout(
                () => this.addSpinner(expanders, index),
                this.settings.general.spinnerDelay
            );
            this.ctrlPressed = (<MouseEvent>event).ctrlKey || (<MouseEvent>event).metaKey;
            const siblings = selectionDataPoints.filter(dataPoint => isEqual(dataPoint.parentId, d.parentId));
            const samelevelSelect = selectionDataPoints.filter(dataPoint => dataPoint.level === d.level && dataPoint.selected === true);
            if ((
                siblings.length > 1 &&
                siblings.length === siblings.filter(sibling => sibling.selected && !sibling.partialSelected).length &&
                (this.settings.selection.singleSelect || !this.ctrlPressed) &&
                !(!this.settings.selection.singleSelect && !this.settings.selection.ctrlSelect)
            ) || (!this.settings.selection.singleSelect && this.settings.selection.ctrlSelect && !this.ctrlPressed && samelevelSelect.length > 1)) {
                selected = true;
            }
            selectionDataPoints = selectionDataPoints.filter(d => d.ownId !== ["selectAll"]);
            const singleSelect =
                this.settings.selection.singleSelect ||
                (this.settings.selection.ctrlSelect && !this.ctrlPressed);
            if (singleSelect) {
                // single select value -> start with empty selection tree
                selectionDataPoints.forEach(dp => {
                    dp.selected = false;
                    dp.partialSelected = false;
                });
            }
            d.selected = selected;
            d.partialSelected = false; // Current member: never partialSelected
            // Determine parents
            const parents: string[][] = [];
            d.parentId.forEach((p, i) => {
                const parentId = d.parentId.slice(0, i + 1);
                parents.push(parentId);
            });
            parents.reverse().forEach(parent => {
                selectionDataPoints
                    .filter(dataPoint => isEqual(dataPoint.ownId, parent))
                    .forEach(dataPoint => {
                        const children = selectionDataPoints.filter(dataPoint => isEqual(dataPoint.parentId, parent));
                        const allSelect: boolean =
                            children.length ===
                            children.filter(child => child.selected && !child.partialSelected).length;
                        const partialSelect: boolean =
                            children.filter(child => child.selected || child.partialSelected).length > 0;
                        if (allSelect) {
                            // All select
                            dataPoint.selected = true;
                            dataPoint.partialSelected = false;
                        } else if (partialSelect) {
                            // Partial select
                            dataPoint.selected = true;
                            dataPoint.partialSelected = true;
                        } else {
                            // None select
                            dataPoint.selected = false;
                            dataPoint.partialSelected = false;
                        }
                    });
            });
            // Select all children
            selectionDataPoints.forEach((dataPoint: IHierarchySlicerDataPoint) => {
                if (dataPoint.ownId.length > d.level + 1) {
                    const id = dataPoint.ownId.slice(0, d.level + 1);
                    if (isEqual(id, d.ownId)) {
                        dataPoint.selected = selected;
                    }
                }
            });
            // Get highest selected level in common for all datapoints
            filterLevel = getCommonLevel(selectionDataPoints);

            
            this.renderSelection(true);
            this.persistSelectAll(selectionDataPoints.filter(d => d.selected).length === selectionDataPoints.length);
            this.filterInstance.push(applyFilter(this.hostServices, this.fullTree, this.columnFilters, filterLevel));
            if (this.spinnerTimeoutId) window.clearTimeout(this.spinnerTimeoutId);
        });

        // HEADER EVENTS
        slicerCollapse.on("click", (d: IHierarchySlicerDataPoint) => {
            if (this.dataPoints.filter(d => d.isExpand).length > 0) {
                (<HTMLElement>select(".simplebar-content").node()).scrollTop = 0;

                this.dataPoints.forEach(d => (d.isExpand = false));
                this.persistExpand();
            }
        });

        slicerExpand.on("click", (d: IHierarchySlicerDataPoint) => {
            if (this.dataPoints.filter(d => !d.isExpand && !d.isLeaf).length > 0) {
                this.dataPoints.filter(d => !d.isLeaf).forEach(d => (d.isExpand = true));
                this.persistExpand();
            }
        });

        slicerClear.on("click", (d: IHierarchySlicerDataPoint) => {
            if (this.dataPoints.filter(d => d.selected).length === 0) return;
            if (this.spinnerTimeoutId) window.clearTimeout(this.spinnerTimeoutId);
            this.spinnerTimeoutId = window.setTimeout(
                () => this.addSpinner(expanders, 0),
                this.settings.general.spinnerDelay
            );
            this.fullTree.forEach((dataPoint: IHierarchySlicerDataPoint) => {
                dataPoint.selected = false;
                dataPoint.partialSelected = false;
            });
            this.persistSelectAll(false);
            persistFilter(this.hostServices, []);
            if (this.spinnerTimeoutId) window.clearTimeout(this.spinnerTimeoutId);
        });

        slicerHeaderText.on("click", d => {
            if (!doubleTap) {
                doubleTap = true;
                setTimeout(() => () => (doubleTap = false), 300);
                return false;
            }
            event.preventDefault();
            if (this.settings.mobile.title) {
                this.toggleMobileView(this.settings.mobile.zoomed);
            }
        });
    }

    private addSpinner(expanders: Selection<any, any, any, any>, index: number) {
        const currentExpander = expanders.filter((expander, i) => index === i);
        const currentExpanderHtml = <HTMLElement>currentExpander.node();
        const size = Math.min(currentExpanderHtml.clientHeight, currentExpanderHtml.clientWidth);
        const scale = size / 25.0;
        currentExpander.select(".icon").style("display", "none");
        const container = currentExpander.select(".spinner-icon").style("display", "inline");
        const spinner = container
            .append("div")
            .classed("powerbi-spinner", true)
            .style("transform", `scale(${scale})`)
            .style("margin-left", "0")
            .style("vertical-align", "middle")
            .style("line-height", `${currentExpanderHtml.clientHeight}px`)
            .attr("ng-if", "viewModel.showProgressBar")
            .attr("delay", "100")
            .append("div")
            .classed("spinner", true);
        for (let i = 0; i < 5; i++) {
            spinner.append("div").classed("circle", true);
        }
    }

    public removeSpinners() {
        if (this.spinnerTimeoutId) {
            window.clearTimeout(this.spinnerTimeoutId);
            this.spinnerTimeoutId = undefined;
            this.expanders.selectAll(".icon").style("display", "inline");
            this.expanders.select(".spinner-icon").style("display", "none");
        }
    }

    private renderMouseover(): void {
        this.slicerItemLabels.style("color", (d: IHierarchySlicerDataPoint) => {
            if (d.selected && !d.partialSelected) return this.settings.items.fontColor;
            if (d.mouseOver) return this.settings.items.hoverColor;
            else if (d.mouseOut) {
                return this.settings.items.fontColor;
            } else return this.settings.items.fontColor; // fallback
        });
        this.slicerItemInputs.selectAll("span").style("border-color", (d: IHierarchySlicerDataPoint) => {
            if (d.selected && !d.partialSelected) return this.settings.items.selectedColor;
            if (d.mouseOver) return this.settings.items.hoverColor;
            else if (d.mouseOut) {
                return this.settings.items.checkBoxColor;
            } else return this.settings.items.checkBoxColor; // fallback
        });
        this.slicerItemInputs.selectAll("span").style("color", (d: IHierarchySlicerDataPoint) => {
            if (d.selected && !d.partialSelected) return this.settings.items.selectedColor;
            if (d.mouseOver) return this.settings.items.hoverColor;
            else if (d.mouseOut) {
                return this.settings.items.checkBoxColor;
            } else return this.settings.items.checkBoxColor; // fallback
        });
        this.expanders.selectAll(".icon").style("fill", (d: IHierarchySlicerDataPoint) => {
            if (d.selected && !d.partialSelected) return this.settings.items.selectedColor;
            if (d.mouseOver) return this.settings.items.hoverColor;
            else if (d.mouseOut) {
                return this.settings.items.checkBoxColor;
            } else return this.settings.items.checkBoxColor; // fallback
        });
    }

    public renderSelection(hasSelection: boolean): void {
        if (!hasSelection) {
            // && !this.interactivityService.isSelectionModeInverted()) {
            this.slicerItemInputs.filter(".selected").classed("selected", false);
            this.slicerItemInputs.filter(".partiallySelected").classed("partiallySelected", false);
            let input = this.slicerItemInputs.selectAll("input");
            if (input) {
                input.property("checked", false);
            }
        } else {
            this.styleSlicerInputs(this.slicers, hasSelection);
        }
    }

    public styleSlicerInputs(slicers: Selection<any, any, any, any>, hasSelection: boolean) {
        let settings = this.settings;
        slicers.each(function(d: IHierarchySlicerDataPoint) {
            let slicerItem: HTMLElement = this.getElementsByTagName("div")[0];
            let shouldCheck: boolean = d.selected;
            let partialCheck: boolean = d.partialSelected;
            let input = slicerItem.getElementsByTagName("input")[0];
            if (input) input.checked = shouldCheck;

            if (shouldCheck && partialCheck) {
                slicerItem.classList.remove("selected");
                slicerItem.classList.add("partiallySelected");
            } else if (shouldCheck && !partialCheck) {
                slicerItem.classList.remove("partiallySelected");
                slicerItem.classList.add("selected");
            } else {
                slicerItem.classList.remove("selected");
                slicerItem.classList.remove("partiallySelected");
            }

            let slicerCheckBox: HTMLElement = slicerItem.getElementsByTagName("span")[0];
            slicerCheckBox.style.borderColor =
                d.selected && !d.partialSelected ? settings.items.selectedColor : settings.items.checkBoxColor;
            slicerCheckBox.style.color =
                d.selected && !d.partialSelected ? settings.items.selectedColor : settings.items.checkBoxColor;
            slicerCheckBox.style.backgroundColor =
                !settings.selection.singleSelect && d.selected && !d.partialSelected
                    ? settings.items.selectedColor
                    : "transparent";
        });
    }

    // public applyFilter(levels: number): void {
    //     // Called without data
    //     if (this.fullTree.length === 0) {
    //         return;
    //     }

    //     const targets: IFilterTarget[] = this.columnFilters.slice(0, levels + 1);
    //     const dataPoints = this.fullTree.filter(d => d.ownId !== ["selectAll"]);
    //     const filterDataPoints: IHierarchySlicerDataPoint[] = dataPoints.filter(d => d.selected && d.level === levels);

    //     // create table from tree
    //     let filterValues: any[] = filterDataPoints.map((dataPoint: IHierarchySlicerDataPoint) => {
    //         // TupleValueType
    //         return dataPoint.value.map(value => {
    //             return <any>{
    //                 // ITupleElementValue
    //                 value,
    //             };
    //         });
    //     });

    //     let filterInstance: any = {
    //         $schema: "http://powerbi.com/product/schema#tuple", // tslint:disable-line: no-http-string
    //         target: targets,
    //         filterType: 6,
    //         operator: "In",
    //         values: filterValues,
    //     };
    //     this.filterInstance.push(filterInstance);

    //     if (!filterValues.length || !filterValues.length) {
    //         this.persistFilter([], 1);
    //         return;
    //     }

    //     this.persistFilter(filterInstance);
    // }

    public static GETPARENTDATAPOINTS(
        dataPoints: IHierarchySlicerDataPoint[],
        parentId: string[]
    ): IHierarchySlicerDataPoint[] {
        let parent: IHierarchySlicerDataPoint[] = dataPoints.filter(d => isEqual(parentId, d.ownId));
        if (!parent || parent.length === 0) {
            return [];
        } else if (parent[0].level === 0) {
            return parent;
        } else {
            let returnParents: IHierarchySlicerDataPoint[] = [];

            returnParents = returnParents.concat(parent, this.GETPARENTDATAPOINTS(dataPoints, parent[0].parentId));

            return returnParents;
        }
    }

    // private persistFilter(filter: IFilter | IFilter[], action: FilterAction = FilterAction.merge) {
    //     // make sure that the old method of storing the filter is deleted
    //     const instance: VisualObjectInstance = {
    //         objectName: "general",
    //         selector: Selector,
    //         properties: {
    //             filterValues: "",
    //         },
    //     };
    //     this.hostServices.persistProperties({ remove: [instance] });
    //     this.hostServices.applyJsonFilter(
    //         filter,
    //         HierarchySlicerProperties.filterPropertyIdentifier.objectName,
    //         HierarchySlicerProperties.filterPropertyIdentifier.propertyName,
    //         action
    //     );
    // }

    private persistExpand() {
        const expanded = this.dataPoints
            .filter(d => d.isExpand)
            .map(d => d.ownId)
            .map(e => e.join("~|~"))
            .map(e => "|~" + e + "~|")
            .join("*|*");

        const instance: VisualObjectInstance = {
            objectName: "general",
            selector: Selector,
            properties: {
                expanded: expanded,
            },
        };

        this.hostServices.persistProperties(expanded !== "" ? { merge: [instance] } : { remove: [instance] });
    }

    private persistSelectAll(selectAll: boolean) {
        const instance: VisualObjectInstance = {
            objectName: "general",
            selector: Selector,
            properties: {
                selectAll: true,
            },
        };
        this.hostServices.persistProperties(selectAll ? { merge: [instance] } : { remove: [instance] });
    }

    private toggleMobileView(currentStatus: boolean) {
        let properties: { [propertyName: string]: DataViewPropertyValue } = {};
        properties[HierarchySlicerProperties.mobileViewEnabled.propertyName] = !currentStatus;
        let instance: VisualObjectInstance = {
            objectName: HierarchySlicerProperties.mobileViewEnabled.objectName,
            selector: Selector,
            properties: properties,
        };
        this.hostServices.persistProperties({ merge: [instance] });
    }
}
