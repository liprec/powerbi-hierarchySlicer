/*
 * 
 * Copyright (c) 2016 Jan Pieter Posthuma
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

module powerbi.extensibility.visual {
    // powerbi.extensibility.utils.interactivity
    import IInteractiveBehavior = powerbi.extensibility.utils.interactivity.IInteractiveBehavior;
    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import ISelectionHandler = powerbi.extensibility.utils.interactivity.ISelectionHandler;
    // powerbi.extensibility.utils.sq
    import SQExpr = powerbi.extensibility.utils.sq.SQExpr;
    import SQExprBuilder = powerbi.extensibility.utils.sq.SQExprBuilder;
    import SemanticFilter_ext = powerbi.extensibility.utils.sq.SemanticFilter;
    // d3
    import Selection = d3.Selection;
    // powerbi.data
    import ISemanticFilter = powerbi.data.ISemanticFilter;


    export class HierarchySlicerWebBehavior implements IInteractiveBehavior {
        private hostServices: IVisualHost;
        private expanders: Selection<any>;
        private options: HierarchySlicerBehaviorOptions;
        private slicers: Selection<any>;
        private slicerBodySpinner: Selection<any>;
        private slicerItemLabels: Selection<any>;
        private slicerItemInputs: Selection<any>;
        private dataPoints: HierarchySlicerDataPoint[];
        private interactivityService: IInteractivityService;
        private selectionHandler: ISelectionHandler;
        private settings: HierarchySlicerSettings;
        private levels: number;
        private initFilter: boolean = true;

        public HierarchySlicerWebBehavior() {
            this.initFilter = true;
        }

        public bindEvents(options: HierarchySlicerBehaviorOptions, selectionHandler: ISelectionHandler): void {
            let expanders = this.expanders = options.expanders;
            let slicers: Selection<any> = this.slicers = options.slicerItemContainers;
            this.slicerBodySpinner = options.slicerBodySpinner;
            this.slicerItemLabels = options.slicerItemLabels;
            this.slicerItemInputs = options.slicerItemInputs;
            this.dataPoints = options.dataPoints;
            this.interactivityService = options.interactivityService;
            this.selectionHandler = selectionHandler;
            this.settings = options.slicerSettings;
            this.hostServices = options.hostServices;
            this.levels = options.levels;
            this.options = options;

            let slicerClear = options.slicerClear;
            let slicerExpand = options.slicerExpand;
            let slicerCollapse = options.slicerCollapse;

            if ((this.dataPoints.filter((d) => d.selected).length > 0) && this.initFilter) {
                this.initFilter = false;
                this.applyFilter();
            }

            expanders.on("click", (d: HierarchySlicerDataPoint, i: number) => {
                d.isExpand = !d.isExpand;
                this.addSpinner();
                this.persistExpand(false);
            });

            expanders.on("mouseover", (d: HierarchySlicerDataPoint, i:number) => {
                if (d.selectable) {
                    d.mouseOver = true;
                    d.mouseOut = false;
                    this.renderMouseover();
                }
            });

            expanders.on("mouseout", (d: HierarchySlicerDataPoint) => {
                if (d.selectable) {
                    d.mouseOver = false;
                    d.mouseOut = true;
                    this.renderMouseover();
                }
            });


            slicerCollapse.on("click", (d: HierarchySlicerDataPoint) => {
                if (this.dataPoints.filter((d) => d.isExpand).length > 0) {
                    this.addSpinner();
                    this.dataPoints.filter((d) => !d.isLeaf).forEach((d) => d.isExpand = false);
                    this.persistExpand(true);
                }
            });

            slicerExpand.on("click", (d: HierarchySlicerDataPoint) => {
                if (this.dataPoints.filter((d) => !d.isExpand && !d.isLeaf).length > 0) {
                    this.addSpinner();
                    this.dataPoints.filter((d) => !d.isLeaf).forEach((d) => d.isExpand = true);
                    this.persistExpand(true);
                }
            });

            options.slicerContainer.classed("hasSelection", true);

            slicers.on("mouseover", (d: HierarchySlicerDataPoint) => {
                if (d.selectable) {
                    d.mouseOver = true;
                    d.mouseOut = false;
                    this.renderMouseover();
                }
            });

            slicers.on("mouseout", (d: HierarchySlicerDataPoint) => {
                if (d.selectable) {
                    d.mouseOver = false;
                    d.mouseOut = true;
                    this.renderMouseover();
                }
            });

            slicers.on("click", (d: HierarchySlicerDataPoint, index) => {
                if (!d.selectable) {
                    return;
                }
                this.addSpinner();
                let settings: HierarchySlicerSettings = this.settings;
                (d3.event as MouseEvent).preventDefault();
                if (!settings.general.singleselect) { // multi select value
                    let selected = d.selected;
                    d.selected = !selected; // Toggle selection
                    if (!selected || !d.isLeaf) {
                        let selectDataPoints = this.dataPoints.filter((dp) => dp.parentId.indexOf(d.ownId) >= 0);
                        for (let i = 0; i < selectDataPoints.length; i++) {
                            if (selected === selectDataPoints[i].selected) {
                                selectDataPoints[i].selected = !selected;
                            }
                        }
                        selectDataPoints = this.getParentDataPoints(this.dataPoints, d.parentId);
                        for (let i = 0; i < selectDataPoints.length; i++) {
                            if (!selected && !selectDataPoints[i].selected) {
                                selectDataPoints[i].selected = !selected;
                            } else if (selected && (this.dataPoints.filter((dp) => dp.selected && dp.level === d.level && dp.parentId === d.parentId).length === 0)) {
                                selectDataPoints[i].selected = !selected;
                            }
                        }
                    }
                    if (d.isLeaf) {
                        if (this.dataPoints.filter((d) => d.selected && d.isLeaf).length === 0) { // Last leaf disabled
                            this.dataPoints.map((d) => d.selected = false); // Clear selection
                        }
                    }
                }
                else { // single select value
                    let selected = d.selected;
                    this.dataPoints.map((d) => d.selected = false); // Clear selection
                    if (!selected) {
                        let selectDataPoints = [d]; //Self
                        selectDataPoints = selectDataPoints.concat(this.dataPoints.filter((dp) => dp.parentId.indexOf(d.ownId) >= 0)); // Children
                        selectDataPoints = selectDataPoints.concat(this.getParentDataPoints(this.dataPoints, d.parentId)); // Parents
                        if (selectDataPoints) {
                            for (let i = 0; i < selectDataPoints.length; i++) {
                                selectDataPoints[i].selected = true;
                            }
                        }
                    }
                }

                this.applyFilter();
            });

            slicerClear.on("click", (d: HierarchySlicerDataPoint) => {
                this.selectionHandler.handleClearSelection();
                this.persistFilter(null);
            });
        }

        private addSpinner() {
            this.slicerBodySpinner
                .style({"visibility":"visible"})
            let spinner = this.slicerBodySpinner
                .append("div")
                .classed("xlarge", true)
                .classed("powerbi-spinner", true)
                .style({
                    "margin": "0px;",
                    "padding-left": "5px;",
                    "display": "block;",
                    "top": "25%",
                    "right": "50%",
                    "position": "absolute"
                })
                .attr("ng-if", "viewModel.showProgressBar")
                .append("div")
                .classed("spinner", true)           
            for (let i = 0; i < 5; i++) {
                spinner.append("div")
                    .classed("circle", true);
            }
        }

        private renderMouseover(): void {
            this.slicerItemLabels.style({
                "color": (d: HierarchySlicerDataPoint) => {
                    if (d.mouseOver)
                        return this.settings.slicerText.hoverColor;
                    else if (d.mouseOut) {
                        if (d.selected)
                            return this.settings.slicerText.fontColor;
                        else
                            return this.settings.slicerText.fontColor;
                    }
                    else
                        return this.settings.slicerText.fontColor; //fallback
                }
            });
            this.expanders.style({
                "color": (d: HierarchySlicerDataPoint) => {
                    if (d.mouseOver)
                        return this.settings.slicerText.hoverColor;
                    else if (d.mouseOut) {
                        if (d.selected)
                            return this.settings.slicerText.fontColor;
                        else
                            return this.settings.slicerText.fontColor;
                    }
                    else
                        return this.settings.slicerText.fontColor; //fallback
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
            slicers.each(function (d: HierarchySlicerDataPoint) {
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
                slicerSpan.style.borderColor = d.selected ? settings.slicerText.selectedColor : settings.slicerText.fontColor;
                slicerSpan.style.backgroundColor = d.selected ? settings.slicerText.selectedColor : "transparent";
            });
        }

        public applyFilter() {
            if (this.dataPoints.length === 0) { // Called without data
                return;
            }
            let selectNrValues: number = 0
            let filter: ISemanticFilter;
            let rootLevels = this.dataPoints.filter((d) => d.level === 0 && d.selected);
            
            if (!rootLevels || (rootLevels.length === 0)) {
                this.selectionHandler.handleClearSelection();
                this.persistFilter(null);
            }
            else {
                selectNrValues++;
                let children = this.getChildFilters(this.dataPoints, rootLevels[0].ownId, 1);
                let rootFilters = [];
                if (children) {
                    rootFilters.push(SQExprBuilder.and(rootLevels[0].id, children.filters));
                    selectNrValues += children.memberCount;
                } else {
                    rootFilters.push(rootLevels[0].id);
                }
                
                if (rootLevels.length > 1) {
                    for (let i = 1; i < rootLevels.length; i++) {
                        selectNrValues++;
                        children = this.getChildFilters(this.dataPoints, rootLevels[i].ownId, 1);
                        if (children) {
                            rootFilters.push(SQExprBuilder.and(rootLevels[i].id, children.filters));
                            selectNrValues += children.memberCount;
                        } else {
                            rootFilters.push(rootLevels[i].id);
                        }
                    }
                }
                
                let rootFilter: SQExpr = rootFilters[0];
                for (let i = 1; i < rootFilters.length; i++) {
                    rootFilter = SQExprBuilder.or(rootFilter, rootFilters[i]);
                }

                if (selectNrValues > 120) {

                }
                
                filter = SemanticFilter_ext.fromSQExpr(rootFilter);
                let f = SemanticFilter_ext.fromSQExpr(rootFilter);
                this.persistFilter(f);
            }
        }

        private getParentDataPoints(dataPoints: HierarchySlicerDataPoint[], parentId: string): HierarchySlicerDataPoint[] {
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

        private getChildFilters(dataPoints: HierarchySlicerDataPoint[], parentId: string, level: number): { filters: SQExpr; memberCount: number; } {
            let memberCount: number = 0;
            let childFilters = dataPoints.filter((d) => d.level === level && d.parentId === parentId && d.selected);
            let totalChildren = dataPoints.filter((d) => d.level === level && d.parentId === parentId).length;
            if (!childFilters || (childFilters.length === 0)) {
                return;
            }
            else if (childFilters[0].isLeaf) { // Leaf level
                if ((totalChildren !== childFilters.length) || this.options.slicerSettings.general.selfFilterEnabled) { // Needs extra check for empty search string
                    let returnFilter = childFilters[0].id;
                    memberCount += childFilters.length;
                    if (childFilters.length > 1) {
                        for (let i = 1; i < childFilters.length; i++) {
                            returnFilter = SQExprBuilder.or(returnFilter, childFilters[i].id);
                        }
                    }
                    return {
                        filters: returnFilter,
                        memberCount: memberCount,
                    };
                } else {
                    return;
                }
            } else {
                let returnFilter: SQExpr;
                let allSelected = (totalChildren === childFilters.length);
                memberCount += childFilters.length;
                for (let i = 0; i < childFilters.length; i++) {
                    let childChildFilter = this.getChildFilters(dataPoints, childFilters[i].ownId, level + 1);
                    if ((childChildFilter) || this.options.slicerSettings.general.selfFilterEnabled) { // Needs extra check for empty search string
                        allSelected = false;
                        memberCount += childChildFilter.memberCount;
                        if (returnFilter) {
                            returnFilter = SQExprBuilder.or(returnFilter,
                                SQExprBuilder.and(childFilters[i].id,
                                    childChildFilter.filters));
                        } else {
                            returnFilter = SQExprBuilder.and(childFilters[i].id, childChildFilter.filters);
                        }
                    } else {
                        if (returnFilter) {
                            returnFilter = SQExprBuilder.or(returnFilter, childFilters[i].id);
                        } else {
                            returnFilter = childFilters[i].id;
                        }
                    }
                }
                return allSelected ? undefined : {
                    filters: returnFilter,
                    memberCount: memberCount,
                };
            }
        }

        private persistFilter(filter: ISemanticFilter) {
            let properties: { [propertyName: string]: DataViewPropertyValue } = {};
            if (filter) {
                properties[hierarchySlicerProperties.filterPropertyIdentifier.propertyName] = filter;
            } else {
                properties[hierarchySlicerProperties.filterPropertyIdentifier.propertyName] = "";
            }
            let filterValues = this.dataPoints.filter((d) => d.selected).map((d) => d.ownId).join(",");
            if (filterValues) {
                properties[hierarchySlicerProperties.filterValuePropertyIdentifier.propertyName] = filterValues;
            } else {
                properties[hierarchySlicerProperties.filterValuePropertyIdentifier.propertyName] = "";
            }

            // let selectionIdKeys =  this.dataPoints.filter((d) => d.selected).map(d => (d as any).getKey());
            // properties[hierarchySlicerProperties.filterPropertyIdentifier.propertyName] = selectionIdKeys && JSON.stringify(selectionIdKeys) || "";

            properties = {};
            properties["filter"] = filter;

            let objects: VisualObjectInstancesToPersist = {
                merge: [
                    <VisualObjectInstance>{
                        objectName: "general",//hierarchySlicerProperties.filterPropertyIdentifier.objectName,
                        properties: properties,
                        selector: undefined
                    }]
            };

            this.hostServices.persistProperties(objects);
            //let json = //JSON.stringify(filter);
            let json = {
                    "target": {
                        "table": "Orders",
                        "column": "Customer Segment"
                    },
                    "logicalOperator": "And",
                    "conditions": [{
                        "value": "Small Business",
                        "operator": "Is"
                    }]
                };
            //this.hostServices.applyJsonFilter(json, "general", "filter");
            //this.hostServices.persistProperties(objects)
            (<any>this.selectionHandler).sendSelectionToHost(null);
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
            (<any>this.selectionHandler).sendSelectionToHost();
        }
    }
}