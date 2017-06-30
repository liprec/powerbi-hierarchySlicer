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
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import ClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.ClassAndSelector;
    import createClassAndSelector = powerbi.extensibility.utils.svg.CssConstants.createClassAndSelector;

    import IInteractivityService = powerbi.extensibility.utils.interactivity.IInteractivityService;
    import SelectableDataPoint = powerbi.extensibility.utils.interactivity.SelectableDataPoint;
    import createInteractivityService = powerbi.extensibility.utils.interactivity.createInteractivityService;

    import Selection = d3.Selection;
    import UpdateSelection = d3.selection.Update;
    import IMargin = powerbi.extensibility.utils.svg.IMargin;

    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import TextMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    import DataViewObjects = powerbi.DataViewObjects;
    import DataViewObjectsModule = powerbi.extensibility.utils.dataview.DataViewObjects;



    export class HierarchySlicer implements IVisual {
        // MDL icons
        private IconSet = {
            expandAll: `<svg  width="100%" height="100%" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,
            collapseAll: `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,
            clearAll: `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,
            expand: `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`,
            checkboxTick: `<svg width="100%" height="100%" viewBox="0 0 1 1"><path d="M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /></svg>`
        };
        private root: HTMLElement;
        private searchHeader: JQuery;
        private searchInput: JQuery;
        private behavior: HierarchySlicerWebBehavior;
        // private selectionManager: SelectionManager;
        private viewport: IViewport;
        private hostServices: IVisualHost;
        private interactivityService: IInteractivityService;
        private settings: HierarchySlicerSettings;
        private dataView: DataView;
        private data: HierarchySlicerData;
        private treeView: IHierarchySlicerTreeView;
        private margin: IMargin;
        private maxLevels: number;
        private waitingForData: boolean;
        private slicerContainer: Selection<any>;
        private slicerHeader: Selection<any>;
        private slicerBody: Selection<any>;
        private slicerBodySpinner: Selection<any>;

        public static DefaultFontFamily: string = "Segoe UI, Tahoma, Verdana, Geneva, sans-serif";
        public static DefaultFontSizeInPt: number = 11;

        private static Container: ClassAndSelector = createClassAndSelector("slicerContainer");
        private static Body: ClassAndSelector = createClassAndSelector("slicerBody");
        private static BodySpinner: ClassAndSelector = createClassAndSelector("slicerBodySpinner");
        private static ItemContainer: ClassAndSelector = createClassAndSelector("slicerItemContainer");
        private static ItemContainerExpander: ClassAndSelector = createClassAndSelector("slicerItemContainerExpander");
        private static ItemContainerChild: ClassAndSelector = createClassAndSelector("slicerItemContainerChild");
        private static LabelText: ClassAndSelector = createClassAndSelector("slicerText");
        private static CountText: ClassAndSelector = createClassAndSelector("slicerCountText");
        private static Checkbox: ClassAndSelector = createClassAndSelector("checkbox");
        private static Header: ClassAndSelector = createClassAndSelector("slicerHeader");
        private static HeaderText: ClassAndSelector = createClassAndSelector("headerText");
        private static Icon: ClassAndSelector = createClassAndSelector("icon");
        private static Collapse: ClassAndSelector = createClassAndSelector("collapse");
        private static Expand: ClassAndSelector = createClassAndSelector("expand");
        private static Clear: ClassAndSelector = createClassAndSelector("clear");
        private static HeaderSpinner: ClassAndSelector = createClassAndSelector("headerSpinner");
        private static Input: ClassAndSelector = createClassAndSelector("slicerCheckbox");

        public converter(dataView: DataView, searchText: string): HierarchySlicerData {
            if (!dataView ||
                !dataView.table ||
                !dataView.table.rows ||
                !(dataView.table.rows.length > 0) ||
                !dataView.table.columns ||
                !(dataView.table.columns.length > 0)) {
                return {
                    dataPoints: [],
                    settings: null,
                    levels: null,
                };
            }

            let rows = dataView.table.rows;
            let columns = dataView.table.columns;
            let levels = rows[0].length - 1;
            let dataPoints = [];
            // let defaultSettings: HierarchySlicerSettings = this.DefaultSlicerSettings();
            let identityValues = [];
            let selectedIds = [];
            let expandedIds = [];
            let selectionFilter;
            let order: number = 0;
            let isRagged: boolean = false;
            let raggedParents = [];
            debugger;
            selectedIds = this.settings.general.selected.split(",");
            expandedIds = this.settings.general.expanded.split(",");

            for (let r = 0; r < rows.length; r++) {
                let parentExpr = null;
                let parentId: string = "";

                for (let c = 0; c < rows[r].length; c++) {
                    if ((rows[r][c] === null) && (!this.settings.slicerText.emptyLeafs)) {
                        isRagged = true;
                        raggedParents.push(parentId);
                        break;
                    }

                    let format = dataView.table.columns[c].format;
                    let dataType: ValueTypeDescriptor = dataView.table.columns[c].type;
                    let labelValue: string = valueFormatter.format(rows[r][c], format);
                    labelValue = labelValue === null ? "(blank)" : labelValue;

                    let ownId = parentId + (parentId === "" ? "" : "_") + labelValue.replace(/,/g, "") + "-" + c;
                    let isLeaf = c === rows[r].length - 1;
                    let dataPoint: HierarchySlicerDataPoint = {
                        filterTarget: {
                            table: dataView.table.columns[c].queryName.substr(0, dataView.table.columns[c].queryName.indexOf(".")),
                            column: dataView.table.columns[c].displayName
                        },
                        identity: null, // identity,
                        selected: selectedIds.filter((d) => d === ownId).length > 0,
                        value: labelValue,
                        tooltip: labelValue,
                        level: c,
                        selectable: true,
                        partialSelected: false,
                        isLeaf: isLeaf,
                        isExpand: expandedIds === [] ? false : expandedIds.filter((d) => d === ownId).length > 0 || false,
                        isHidden: c === 0 ? false : true, // Default true. Real status based on the expanded properties of parent(s)
                        id: null, // filterExpr,
                        ownId: ownId,
                        parentId: parentId,
                        order: order++,
                    };

                    parentId = ownId;

                    if (identityValues.indexOf(ownId) === -1) {
                        identityValues.push(ownId);
                        dataPoints.push(dataPoint);
                    }
                }
            }

            // Redefine isLeaf for Ragged hierarchies
            if (isRagged) {
                dataPoints.filter((d) => raggedParents.filter((d1) => d1 === d.ownId).length > 0).forEach((d) => d.isLeaf = true);
            }

            if (this.settings.general.selfFilterEnabled && searchText && searchText.length > 2) { // Threasholt value toevoegen
                searchText = searchText.toLowerCase();
                let filteredDataPoints = dataPoints.filter((d) => d.value.toLowerCase().indexOf(searchText) >= 0);
                for (let l = 1; l <= levels; l++) {
                    let levelDataPoints = filteredDataPoints.filter((d) => d.level === l);
                    levelDataPoints.filter((d) => filteredDataPoints.indexOf(d.parentId) < 0) // Missing Parents
                        .forEach((d) => filteredDataPoints.push(dataPoints.filter((dp) => dp.ownId === d.parentId && dp.level === l - 1)[0]));
                }
                dataPoints = filteredDataPoints.filter((value, index, self) => self.indexOf(value) === index)
                    .sort((d1, d2) => d1.order - d2.order); // set new dataPoints based on the searchText
            }

            // Set isHidden property
            let parentRootNodes = [];
            let parentRootNodesTemp = [];
            let parentRootNodesTotal = [];
            for (let l = 0; l < levels; l++) {
                let expandedRootNodes = dataPoints.filter((d) => d.isExpand && d.level === l);
                if (expandedRootNodes.length > 0) {
                    for (let n = 0; n < expandedRootNodes.length; n++) {
                        parentRootNodesTemp = parentRootNodes.filter((p) => expandedRootNodes[n].parentId === p.ownId); // Is parent expanded?
                        if (l === 0 || (parentRootNodesTemp.length > 0)) {
                            parentRootNodesTotal = parentRootNodesTotal.concat(expandedRootNodes[n]);
                            dataPoints.filter((d) => d.parentId === expandedRootNodes[n].ownId && d.level === l + 1).forEach((d) => d.isHidden = false);
                        }
                    }
                }
                parentRootNodes = parentRootNodesTotal;
            }

            // Determine partiallySelected
            for (let l = 0; l < levels; l++) {
                let selectedRootNodes = dataPoints.filter((d) => d.selected && d.level === l);
                if (selectedRootNodes.length > 0) {
                    for (let n = 0; n < selectedRootNodes.length; n++) {
                        let children = dataPoints.filter((d) => d.parentId === selectedRootNodes[n].ownId);
                        if (children.length > children.filter((d) => d.selected).length) {
                            selectedRootNodes[n].partialSelected = true;
                        }
                    }
                }
            }
            return {
                dataPoints: dataPoints,
                settings: this.settings,
                levels: levels,
                hasSelectionOverride: true,
            };
        }

        constructor(options: VisualConstructorOptions) {
            this.root = options.element;
            this.hostServices = options.host;

            this.behavior = new HierarchySlicerWebBehavior();
            this.interactivityService = createInteractivityService(options.host);
        }

        private init(options: VisualUpdateOptions): void {
            this.viewport = options.viewport;

            this.slicerContainer = d3.select(this.root)
                .append("div")
                .classed(HierarchySlicer.Container.className, true);

            this.renderHeader(this.slicerContainer);
            this.renderBody(this.slicerContainer);

            let rowEnter = (rowSelection: Selection<any>) => {
                this.onEnterSelection(rowSelection);
            };

            let rowUpdate = (rowSelection: Selection<any>) => {
                this.onUpdateSelection(rowSelection, this.interactivityService);
            };

            let rowExit = (rowSelection: Selection<any>) => {
                // rowSelection.remove();
            };

            let treeViewOptions: HierarchySlicerTreeViewOptions = {
                rowHeight: this.getRowHeight(),
                enter: rowEnter,
                exit: rowExit,
                update: rowUpdate,
                // loadMoreData: () => this.onLoadMoreData(),
                scrollEnabled: true,
                viewport: this.getBodyViewport(this.viewport),
                baseContainer: this.slicerBody,
                // isReadMode: () => {
                //     return (this.hostServices.getViewMode() !== ViewMode.Edit);
                // }
            };

            this.treeView = HierarchySlicerTreeViewFactory.createListView(treeViewOptions);
        }

        private renderHeader(rootContainer: Selection<any>): void {
            const self: HierarchySlicer = this;
            this.slicerHeader = rootContainer
                .append("header")
                .classed(HierarchySlicer.Header.className, true);
            const headerButtonData = [
                { title: "Clear", class: HierarchySlicer.Clear.className, icon: this.IconSet.clearAll },
                { title: "Expand all", class: HierarchySlicer.Expand.className, icon: this.IconSet.expandAll },
                { title: "Collapse all", class: HierarchySlicer.Collapse.className, icon: this.IconSet.collapseAll }
            ];
            this.slicerHeader
                .selectAll(HierarchySlicer.Icon.className)
                .data(headerButtonData)
                .enter()
                .append("button")
                .classed(HierarchySlicer.Icon.className, true)
                .attr("title", (d) => d.title)
                .each(function (d) { this.classList.add(d.class); })
                .on("mouseover", function (d) { d3.select(this).style("color", self.settings.slicerText.hoverColor); })
                .on("mouseout", function (d) { d3.select(this).style("color", self.settings.slicerText.fontColor); })
                .html((d) => d.icon);

            this.slicerHeader
                .append("span")
                .classed(HierarchySlicer.HeaderSpinner.className, true);
            this.slicerHeader
                .append("div")
                .classed(HierarchySlicer.HeaderText.className, true);

            this.createSearchHeader($(this.slicerHeader.node()));
        }

        private renderBody(rootContainer: Selection<any>): void {
            this.slicerBody = rootContainer
                .append("div")
                .classed(HierarchySlicer.Body.className, true);

            this.slicerBodySpinner = this.slicerBody
                .append("div")
                .classed(HierarchySlicer.BodySpinner.className, true);
        }

        public update(options: VisualUpdateOptions) {
            if (!options ||
                !options.dataViews ||
                !options.dataViews[0] ||
                !options.viewport) {
                return;
            }

            this.dataView = options.dataViews ? options.dataViews[0] : undefined;
            if (!this.dataView) {
                return;
            }

            this.settings = HierarchySlicer.parseSettings(this.dataView);

            if (!this.viewport) {
                this.viewport = options.viewport;
                this.init(options);
            }

            if (options.viewport.height === this.viewport.height
                && options.viewport.width === this.viewport.width) {
                this.waitingForData = false;
            } else {
                this.viewport = options.viewport;
            }

            let resetScrollbarPosition: boolean = true;
            const existingDataView = this.dataView;

            if (existingDataView) {
                resetScrollbarPosition = !HierarchySlicer.hasSameCategoryIdentity(existingDataView, this.dataView);
            }

            this.updateInternal(resetScrollbarPosition);
        }

        private static hasSameCategoryIdentity(dataView1: DataView, dataView2: DataView): boolean {
            if (dataView1
                && dataView2
                && dataView1.categorical
                && dataView2.categorical) {
                let dv1Categories = dataView1.categorical.categories;
                let dv2Categories = dataView2.categorical.categories;
                if (dv1Categories
                    && dv2Categories
                    && dv1Categories.length === dv2Categories.length) {
                    for (let i = 0, len = dv1Categories.length; i < len; i++) {
                        let dv1Identity = dv1Categories[i].identity;
                        let dv2Identity = dv2Categories[i].identity;

                        let dv1Length = dv1Identity.length;
                        if (dv1Length !== dv2Identity.length)
                            return false;

                        for (let j = 0; j < dv1Length; j++) {
                            if (!_.isEqual(dv1Identity[j].key, dv2Identity[j].key))
                                return false;
                        }
                    }

                    return true;
                }
            }

            return false;
        }

        private updateInternal(resetScrollbar: boolean) {
            this.updateSlicerBodyDimensions();

            let dataView = this.dataView,
                data = this.data = this.converter(dataView, this.searchInput.val());

            this.maxLevels = this.data.levels + 1;

            if (data.dataPoints.length === 0) {
                this.treeView.empty();
                return;
            }

            this.updateSettings();

            this.treeView
                .viewport(this.getBodyViewport(this.viewport))
                .rowHeight(PixelConverter.fromPointToPixel(this.settings.slicerText.textSize))
                .data(
                data.dataPoints.filter((d) => !d.isHidden), // Expand/Collapse
                (d: HierarchySlicerDataPoint) => $.inArray(d, data.dataPoints),
                resetScrollbar
                )
                .render();

            this.updateSearchHeader();
            this.removeSpinner();
        }

        private updateSettings(): void {
            this.updateSelectionStyle();
        }

        private updateSelectionStyle(): void {
            this.slicerContainer.classed("isMultiSelectEnabled", !this.settings.selection.singleSelect);
        }

        private updateSlicerBodyDimensions(): void {
            let slicerViewport: IViewport = this.getBodyViewport(this.viewport);
            this.slicerBody
                .style({
                    "height": PixelConverter.toString(slicerViewport.height),
                    "width": "100%",
                });
        }

        private removeSpinner() {
            this.slicerBodySpinner
                .style({
                    "background-color": this.settings.slicerText.background || "#FFF",
                    "width": "100%",
                    "height": "100%",
                    "visibility": "hidden"
                });

            let spinner = this.slicerBodySpinner.selectAll("div")
                .remove();
        }

        private onEnterSelection(rowSelection: Selection<any>): void {
            let settings = this.settings;
            let treeItemElementParent: UpdateSelection<any> = rowSelection
                .selectAll("li")
                .data((d: HierarchySlicerDataPoint) => {
                    return [d];
                });
            treeItemElementParent
                .exit()
                .remove();

            treeItemElementParent
                .style({
                    "background-color": settings.slicerText.background,
                    "height": "100%"
                });

            treeItemElementParent
                .enter()
                .append("li")
                .classed(HierarchySlicer.ItemContainer.className, true);


            // Expand/collapse
            if (this.maxLevels > 1) {
                let expandCollapse: UpdateSelection<any> = treeItemElementParent
                    .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
                    .data((d: HierarchySlicerDataPoint) => {
                        return [d];
                    });
                    expandCollapse.exit().remove();
                expandCollapse
                    .enter()
                    .insert("button", ":first-child")
                    .classed(HierarchySlicer.ItemContainerExpander.className, true)
                    .classed("collapsed", (d) => !d.isExpand)
                    .classed("expanded", (d) => d.isExpand)
                    .style({
                        "visibility": (d) => d.isLeaf ? "hidden" : "visible",
                        "margin-bottom": "3px",
                        "font-size": PixelConverter.toString(PixelConverter.fromPointToPixel(settings.slicerText.textSize)),
                        "width": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(settings.slicerText.textSize))),
                        "height": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(settings.slicerText.textSize))),
                        "color": settings.slicerText.fontColor,
                    })
                    .html(this.IconSet.expand);
            } else { // No expand/collapse
                treeItemElementParent
                    .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
                    .remove();
            }

            let treeItemElement: UpdateSelection<any> = treeItemElementParent
                .selectAll(HierarchySlicer.ItemContainerChild.selectorName)
                .data((d: HierarchySlicerDataPoint) => {
                    return [d];
                });
            treeItemElement.exit().remove();

            treeItemElement
                .enter()
                .append("label")
                .classed(HierarchySlicer.ItemContainerChild.className, true);

            let checkBoxInput: UpdateSelection<any> = treeItemElement
                .selectAll("input")
                .data((d: HierarchySlicerDataPoint) => {
                    return [d];
                });

            checkBoxInput
                .enter()
                .append("input")
                .attr("type", "checkbox")
                .each(function (d) {
                    if (d.selected) {
                        d3.select(this).attr("checked", true);
                    }
                });

            let alignCorrection = Math.ceil(.1 * PixelConverter.fromPointToPixel(settings.slicerText.textSize));
            if (alignCorrection <= 2) {
                alignCorrection = 0;
            }

            let checkBoxSpan: UpdateSelection<any> = treeItemElement
                .selectAll(HierarchySlicer.Checkbox.selectorName)
                .data((d: HierarchySlicerDataPoint) => {
                    return [d];
                });

            checkBoxSpan
                .enter()
                .append("span")
                .classed(HierarchySlicer.Checkbox.className, true);

            checkBoxSpan
                .style({
                    "width": Math.ceil(.75 * settings.slicerText.textSize) + "px",
                    "height": Math.ceil(.75 * settings.slicerText.textSize) + "px",
                    "margin-top": alignCorrection + "px",
                    "margin-right": Math.ceil(.25 * settings.slicerText.textSize) + "px"
                });

            let labelElement: UpdateSelection<any> = treeItemElement
                .selectAll(HierarchySlicer.LabelText.selectorName)
                .data((d: HierarchySlicerDataPoint) => {
                    return [d];
                });

            labelElement
                .enter()
                .append("span")
                .classed(HierarchySlicer.LabelText.className, true);

            labelElement
                .style({
                    "color": settings.slicerText.fontColor,
                    "font-size": PixelConverter.fromPoint(settings.slicerText.textSize),
                    "padding-bottom": alignCorrection + "px",
                });

            let maxLevel = this.maxLevels;

            treeItemElementParent.each(function (d: HierarchySlicerDataPoint, i: number) {
                let item = d3.select(this);
                item.style("padding-left", (maxLevel === 1 ? 8 : (d.level * settings.slicerText.textSize)) + "px");
            });

            /* Exits */
            labelElement.exit().remove();
            checkBoxSpan.exit().remove();
            checkBoxInput.exit().remove();
        }

        private onUpdateSelection(rowSelection: Selection<any>, interactivityService: IInteractivityService): void {
            let settings: HierarchySlicerSettings = this.settings;
            let data = this.data;
            if (data) {
                if (settings.header.show) {
                    this.slicerHeader.style("display", "block");
                } else {
                    this.slicerHeader.style("display", "none");
                }
                this.slicerHeader.select(HierarchySlicer.HeaderText.selectorName)
                    .text(settings.header.title.trim())
                    .style({
                        "color": settings.header.fontColor,
                        "background-color": settings.header.background,
                        "font-size": PixelConverter.fromPoint(+settings.header.textSize),
                    });

                // Header icons
                this.slicerHeader.selectAll("button")
                    .style({
                        "width": PixelConverter.toString(PixelConverter.fromPointToPixel(+settings.header.textSize)),
                        "height": PixelConverter.toString(PixelConverter.fromPointToPixel(+settings.header.textSize)),
                        "font-size": PixelConverter.toString(Math.ceil(.75 * PixelConverter.fromPointToPixel(+settings.header.textSize))),
                        "color": settings.slicerText.fontColor,
                    });

                this.slicerBody
                    .classed("slicerBody", true);

                let slicerText = rowSelection.selectAll(HierarchySlicer.LabelText.selectorName);

                slicerText.text((d: HierarchySlicerDataPoint) => {
                    return d.value;
                });

                if (interactivityService && this.slicerBody) {
                    let body = this.slicerBody.attr("width", this.viewport.width);
                    let expanders = body.selectAll(HierarchySlicer.ItemContainerExpander.selectorName);
                    let slicerItemContainers = body.selectAll(HierarchySlicer.ItemContainerChild.selectorName);
                    let slicerItemLabels = body.selectAll(HierarchySlicer.LabelText.selectorName);
                    let slicerItemInputs = body.selectAll(HierarchySlicer.Input.selectorName);
                    let slicerClear = this.slicerHeader.select(HierarchySlicer.Clear.selectorName);
                    let slicerExpand = this.slicerHeader.select(HierarchySlicer.Expand.selectorName);
                    let slicerCollapse = this.slicerHeader.select(HierarchySlicer.Collapse.selectorName);
                    let headerSpinner = this.slicerHeader.select(HierarchySlicer.HeaderSpinner.selectorName);

                    // Remove header spinner
                    try {
                        $(headerSpinner)[0][0].children[0].remove();
                        headerSpinner.style("float", "none");
                    } catch (e) { }
                    let behaviorOptions: HierarchySlicerBehaviorOptions = {
                        hostServices: this.hostServices,
                        dataPoints: data.dataPoints,
                        expanders: expanders,
                        slicerBodySpinner: this.slicerBodySpinner,
                        slicerContainer: this.slicerContainer,
                        slicerItemContainers: slicerItemContainers,
                        slicerItemLabels: slicerItemLabels,
                        slicerItemInputs: slicerItemInputs,
                        slicerClear: slicerClear,
                        slicerExpand: slicerExpand,
                        slicerCollapse: slicerCollapse,
                        headerSpinner: headerSpinner,
                        interactivityService: interactivityService,
                        slicerSettings: data.settings,
                        levels: data.levels,
                    };

                    try { // strange bug in PBI May 2016 craches
                        interactivityService.bind(
                            data.dataPoints,
                            this.behavior,
                            behaviorOptions,
                            {
                                overrideSelectionFromData: true,
                                hasSelectionOverride: data.hasSelectionOverride
                            });
                    } catch (e) {
                    }

                    this.behavior.styleSlicerInputs(
                        rowSelection.select(HierarchySlicer.ItemContainerChild.selectorName),
                        this.interactivityService.hasSelection());
                }
                else {
                    this.behavior.styleSlicerInputs(
                        rowSelection.select(HierarchySlicer.ItemContainerChild.selectorName),
                        false);
                }

            }
        }

        private onLoadMoreData(): void {
            if (!this.waitingForData && this.dataView.metadata && this.dataView.metadata.segment) {
                // this.hostServices.loadMoreData();
                this.waitingForData = true;
            }
        }

        public static getTextProperties(textSize?: number): TextProperties {
            return <TextProperties>{
                fontFamily: HierarchySlicer.DefaultFontFamily,
                fontSize: PixelConverter.fromPoint(textSize || HierarchySlicer.DefaultFontSizeInPt),
            };
        }

        private getHeaderHeight(): number {
            return TextMeasurementService.estimateSvgTextHeight(
                HierarchySlicer.getTextProperties(+this.settings.header.textSize));
        }

        private getRowHeight(): number {
            return TextMeasurementService.estimateSvgTextHeight(
                HierarchySlicer.getTextProperties(this.settings.slicerText.textSize));
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
                width: currentViewport.width
            };
        }

        private createSearchHeader(container: JQuery): void {
            this.searchHeader = $("<div>")
                .appendTo(container)
                .addClass("searchHeader")
                .addClass("collapsed");

            let counter = 0;
            $("<div>").appendTo(this.searchHeader)
                .attr("title", "Search")
                .addClass("powervisuals-glyph")
                .addClass("search")
                .on("click", () => this.hostServices.persistProperties(<VisualObjectInstancesToPersist>{
                    merge: [{
                        objectName: "general",
                        selector: null,
                        properties: {
                            counter: counter++
                        }
                    }]
                }));

            this.searchInput = $("<input>").appendTo(this.searchHeader)
                .attr("type", "text")
                .attr("drag-resize-disabled", "true")
                .addClass("searchInput")
                .on("input", () => this.hostServices.persistProperties(<VisualObjectInstancesToPersist>{
                    merge: [{
                        objectName: "general",
                        selector: null,
                        properties: {
                            counter: counter++
                        }
                    }]
                }));

            $("<div>").appendTo(this.searchHeader)
                .attr("title", "Delete")
                .addClass("delete glyphicon pbi-glyph-close glyph-micro")
                .addClass("delete")
                .on("click", () => {
                    this.searchInput[0].nodeValue = "";
                    this.hostServices.persistProperties(<VisualObjectInstancesToPersist>{
                        merge: [{
                            objectName: "general",
                            selector: null,
                            properties: {
                                counter: counter++
                            }
                        }]
                    });
                });
        }

        private updateSearchHeader(): void {
            this.searchHeader.toggleClass("show", this.settings.general.selfFilterEnabled);
            this.searchHeader.toggleClass("collapsed", !this.settings.general.selfFilterEnabled);
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const instanceEnumeration: VisualObjectInstanceEnumeration = HierarchySlicerSettings.enumerateObjectInstances(
                this.settings || HierarchySlicerSettings.getDefault(),
                options);
            // ignore rendering general settings ( it include only hidden properties )
            if (options.objectName === "general") {
                return;
            }
            return instanceEnumeration;
        }

        public destroy(): void {
            // TODO: Perform any cleanup tasks here
        }

        private static parseSettings(dataView: DataView): HierarchySlicerSettings {
            const settings: HierarchySlicerSettings = HierarchySlicerSettings.parse<HierarchySlicerSettings>(dataView);
            return settings;
        }
    }
}