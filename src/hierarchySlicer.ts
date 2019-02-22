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
import { interactivitySelectionService, interactivityBaseService } from "powerbi-visuals-utils-interactivityutils";
import { valueFormatter, textMeasurementService} from "powerbi-visuals-utils-formattingutils";
import { IMargin, CssConstants } from "powerbi-visuals-utils-svgutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";
import { IFilterTarget, TupleFilter, FilterType, ITupleFilterTarget, IFilterColumnTarget, ITupleFilter } from "powerbi-models";
import { select, Selection } from "d3-selection";

import { isEqual, uniqWith } from "lodash-es";

import "@babel/polyfill";
import "./matchesPolyfill";

import "../style/hierarchySlicer.less";

import * as interfaces from "./interfaces";
import * as settings from "./settings";
import * as webBehavior from "./hierarchySlicerWebBehavior";
import * as treeView from "./hierarchySlicerTreeView";
import * as enums from "./enums";

import DataView = powerbi.DataView;
import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;
import IViewport = powerbi.IViewport;
import IFilter = powerbi.IFilter;
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import DataRepetitionSelector = powerbi.data.DataRepetitionSelector;
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
import ValueFormat = valueFormatter.valueFormatter.format;
import TextProperties = textMeasurementService.TextProperties;
import TextMeasurementService = textMeasurementService.textMeasurementService;

import IHierarchySlicerBehaviorOptions = interfaces.IHierarchySlicerBehaviorOptions;
import IHierarchySlicerTreeView = interfaces.IHierarchySlicerTreeView;
import IHierarchySlicerTreeViewOptions = interfaces.IHierarchySlicerTreeViewOptions;
import IHierarchySlicerDataPoint = interfaces.IHierarchySlicerDataPoint;
import IHierarchySlicerData = interfaces.IHierarchySlicerData;
import HierarchySlicerSettings = settings.HierarchySlicerSettings;
import HierarchySlicerWebBehavior = webBehavior.HierarchySlicerWebBehavior;
import HierarchySlicerTreeViewFactory = treeView.HierarchySlicerTreeViewFactory;

import BorderStyle = enums.BorderStyle;
import FontStyle = enums.FontStyle;
import HideMembers = enums.HideMembers;
import { ValueType } from "powerbi-visuals-utils-typeutils/lib/valueType";

export class HierarchySlicer implements IVisual {
    // MDL icons
    private IconSet = {
        expandAll: "<svg  width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M19 19h-6v6h-2v-6H5v-2h6V11h2v6h6v2z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
        collapseAll: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M19 19H5v-2h14v2z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
        clearAll: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M5 19h14v-2H5v2zm-2 4h14v-2H3v2zM7 13v2h14V13H7z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
        collapse: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M9 5l7 7l-7 7Z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
        expand: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M17 9l0 10l-10 0Z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
        checkboxTick: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 1 1\"><path d=\"M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z\" style=\"fill:#ffffff;fill-opacity:1;stroke:none\" /></svg>",
        search: "<svg  width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M15.75 15q1.371 0 2.602-0.521t2.168-1.459 1.459-2.168 0.521-2.602-0.521-2.602-1.459-2.168-2.168-1.459-2.602-0.521-2.602 0.521-2.168 1.459-1.459 2.168-0.521 2.602 0.521 2.602 1.459 2.168 2.168 1.459 2.602 0.521zM7.5 8.25q0-3.41 1.98-5.391t3.568-2.42 3.85-0.439 4.242 1.98 2.42 3.568 0.439 3.85-1.98 4.242-3.568 2.42-2.701 0.439q-2.93 0-5.273-1.91l-9.199 9.188q-0.223 0.223-0.527 0.223t-0.527-0.223-0.223-0.527 0.223-0.527l9.188-9.199q-1.91-2.344-1.91-5.273z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
        delete: "<svg  width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M10.889 10l8.926 8.936-0.879 0.879-8.936-8.926-8.936 8.926-0.879-0.879 8.926-8.936-8.926-8.936 0.879-0.879 8.936 8.926 8.936-8.926 0.879 0.879z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
    };
    // Slicer watermark
    private SVGs = {
        watermark:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" x="0px" y="0px" xmlns:xml="http://www.w3.org/XML/1998/namespace" xml:space="preserve" enable-background="new 0 0 400 300">
        <rect fill="#f4f4f4" x="-0.1" y="0" width="400.1" height="300" />
        <rect fill="#d0d2d3" x="11.8" y="17.7" width="34.7" height="15.3" />
        <line fill="none" stroke="#d0d2d3" stroke-miterlimit="10" x1="3.4" y1="44.3" x2="389.4" y2="44.3" />
        <g><rect fill="#d0d2d3" x="34.1" y="57" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="12.8" y="55" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="44.1" y="81" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="79" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="44.1" y="105" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="103" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="34.1" y="129" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="12.8" y="127" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="44.1" y="153" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="151" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="54.1" y="177" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="32.8" y="175" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="54.1" y="201" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="32.8" y="199" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="44.1" y="225" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="223" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="34.1" y="249" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="12.8" y="247" width="11.3" height="11.3" /></g>
        <g><rect fill="#d0d2d3" x="44.1" y="273" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="271" width="11.3" height="11.3" /></g>
        </svg>`
    };
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
    private jsonFilters: IFilter[];
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

    public static setDuplicatedColumns(tupleFilter: ITupleFilter) {
        if (tupleFilter && tupleFilter.filterType === FilterType.Tuple && tupleFilter.target.length === 1) {
            tupleFilter.target.push(tupleFilter.target[0]);
            for (let conditionsIndex = 0; conditionsIndex < tupleFilter.values.length; conditionsIndex++) {
                tupleFilter.values[conditionsIndex].push(tupleFilter.values[conditionsIndex][0]);
            }
        }
    }
    public static setUniqueFilterConditions(tupleFilter: ITupleFilter) {
        const targetLength: number = tupleFilter.target.length;
        tupleFilter.target = uniqWith(tupleFilter.target as IFilterTarget[], (a: IFilterTarget, b: IFilterTarget) => {
            return (a as IFilterColumnTarget).table === (b as IFilterColumnTarget).table &&
            (a as IFilterColumnTarget).column === (b as IFilterColumnTarget).column;
        });
        if (targetLength === tupleFilter.target.length) return; // No deduplication needed
        for (let conditionsIndex = 0; conditionsIndex < tupleFilter.values.length; conditionsIndex++) {
            tupleFilter.values[conditionsIndex] = uniqWith(tupleFilter.values[conditionsIndex], (a, b) => {
                return a.value === b.value;
            });
        }

        return tupleFilter;
    }
    public converter(dataView: DataView, jsonFilters: IFilter[], searchText: string): IHierarchySlicerData {
        if (!dataView ||
            !dataView.table ||
            !dataView.table.rows ||
            !(dataView.table.rows.length > 0) ||
            !dataView.table.columns ||
            !(dataView.table.columns.length > 0)) {
            return {
                dataPoints: [],
                fullTree: [],
                settings: null,
                levels: null,
            };
        }

        let convertRawValue = (rawValue: PrimitiveValue, dataType: ValueTypeDescriptor, full: boolean = false) => {
            if ((dataType.dateTime) && (full)) {
               return new Date(rawValue as Date);
            } else if (dataType.numeric) {
                return rawValue as number;
            } else {
                return rawValue as string;
            }
        };

        const hierarchyRows = dataView.metadata.columns.filter((c) => c.roles["Fields"]); // Filter out 'Values' level
        const hierarchyRowIndex = hierarchyRows.map((c) => c.index);
        const rows = dataView.table.rows.map((r) => hierarchyRowIndex.map((i) => r[i]));
        const columns = hierarchyRowIndex.map((i) => dataView.table.columns[i]);
        const columnsMetadata = hierarchyRowIndex.map((i) => dataView.metadata.columns[i]);
        const levels = hierarchyRows.length - 1;
        let dataPoints = [];
        let fullTree = [];
        let identityValues = [];
        let iValues = [];
        let selectedIds = [];
        let expandedIds = [];
        let order = 0;
        let isRagged = false;
        let parentIndex = [];

        if (jsonFilters) {
            if (jsonFilters.length > 0) {
                let tupleFilter = jsonFilters[0] as ITupleFilter;
                // if tuple filter had duplicated columns need to remove them
                // because there is no real second colum to extract formatting options
                if (tupleFilter.filterType === FilterType.Tuple) {
                    HierarchySlicer.setUniqueFilterConditions(tupleFilter as ITupleFilter);
                }
                const jFilter = jsonFilters[0] as any;
                selectedIds = jFilter.values.map((d) => "|~" + (
                        Array.isArray(d) ?
                        d.map((dp, i) => {
                            const index = dataView.metadata.columns.filter((c) => c.queryName === jFilter.target[i].table + '.' + jFilter.target[i].column)[0].index;
                            return { value: ValueFormat(dp.value, columns[index].format).replace(/,/g, "") + "-" + index.toString(), index: index };
                        }).sort((dp1, dp2) => dp1.index - dp2.index).map((dp) => dp.value).join('_|~')
                        : ValueFormat(d, columns[0].format).replace(/,/g, "") + "-0"));
            } else if (this.settings.general.filterValues && (this.settings.general.filterValues !== "")) {
                selectedIds = this.settings.general.filterValues.split(",");
            }
        }
        expandedIds = this.settings.general.expanded.split(",");
        this.settings.header.defaultTitle = dataView.metadata.columns[0].displayName;

        if (this.settings.selection.selectAll) {
            dataPoints.push({
                identity: "selectAll",
                selected: false,
                value: this.settings.selection.selectAllLabel,
                label: this.settings.selection.selectAllLabel,
                tooltip: this.settings.selection.selectAllLabel,
                level: 0,
                selectable: true,
                partialSelected: false,
                isLeaf: true,
                isExpand: false,
                isHidden: false,
                isRagged: false,
                isSearch: false,
                id: "selectAll",
                ownId: "selectAll",
                parentId: "none",
                orderArray: [0, 0, -1],
                order: -1,
                filterTarget: undefined
            });
        }
        for (let r = 0; r < rows.length; r++) {
            let parentId: string = "";
            let parentSearchStr: string = "";
            let rowValuePrev = undefined;
            isRagged = false;
            for (let c = 0; c < rows[r].length; c++) {
                if (r === 0) {
                    iValues.push([]);
                }

                let columnFormat = columns[c].format;
                let dataType: ValueTypeDescriptor = columns[c].type;
                let rowValue = convertRawValue(rows[r][c], dataType, true);
                let labelValueId = ValueFormat(convertRawValue(rows[r][c], dataType), columnFormat);
                let labelValue: string;

                rowValue = (this.settings.selection.emptyString && rowValue === "") ? null : rowValue;
                switch (this.settings.selection.hideMembers) {
                    case HideMembers.Empty:
                        isRagged = rowValue === null;
                        labelValue = ValueFormat(rowValue, columnFormat);
                        break;
                    case HideMembers.ParentName:
                        isRagged = rowValue === rowValuePrev;
                        labelValue = ValueFormat(rowValue, columnFormat);
                        rowValuePrev = rowValue;
                        break;
                    case HideMembers.Never:
                    default:
                        labelValue = (rowValue === null ? (this.settings.selection.emptyLeafLabel || this.settings.selection.emptyLeafLabelDefault) : ValueFormat(rowValue, columnFormat));
                }

                let ownId = parentId + (parentId === "" ? "" : "_") + "|~" + labelValueId.replace(/,/g, "") + "-" + c;
                let searchStr = parentSearchStr + labelValue.replace(/,/g, "");
                let isLeaf = c === levels;
                const filterTarget: IFilterTarget = {
                    table: (columnsMetadata[c].identityExprs[0] as any).source.entity,
                    column: columns[c].displayName
                };
                const selected = this.settings.general.selectAll || selectedIds.filter((d) => ownId.indexOf(d) > -1).length > 0;

                let dataPoint: IHierarchySlicerDataPoint = {
                    filterTarget: filterTarget,
                    identity: ownId, // Some unique value to 'trick' the interactivityService with overrideSelectionFromData
                    selected: selected,
                    value: labelValueId,
                    label: labelValue,
                    dataType: dataType,
                    isEmpty: rows[r][c] === null,
                    tooltip: labelValue,
                    level: c,
                    selectable: true,
                    partialSelected: false,
                    isLeaf: isLeaf,
                    isExpand: expandedIds === [] ? false : expandedIds.filter((d) => d === ownId).length > 0 || false,
                    isHidden: c === 0 ? false : true, // Default true. Real status based on the expanded properties of parent(s)
                    isRagged: isRagged,
                    id: null,
                    ownId: ownId,
                    parentId: parentId,
                    searchStr: searchStr,
                    isSearch: this.settings.search.addSelection ? selected : false,
                    orderArray: [],
                    order: null,
                };

                parentId = ownId;
                parentSearchStr = searchStr;
                if (identityValues.indexOf(ownId) === -1) {
                    if (iValues[c].indexOf(ownId)) {
                        iValues[c].push(ownId);
                    }
                    dataPoint.orderArray = ownId.split('_|~')
                                                .map((d, i, t) => 1 + iValues[i].indexOf(t.slice(0, i + 1).join('_|~'))) // Lookup indexes of ownIds
                                                .concat(Array.from({length: levels - c}, () => 0)); // Stuff array to zero's
                    identityValues.push(ownId);
                    dataPoints.push(dataPoint);
                }
            }
        }
        dataPoints.forEach((d) => { d.order = d.order === -1 ? -1 : d.orderArray.reduce((t, c, i) => (t * (iValues[i].length + 1)) + c, 0); } );
        dataPoints.sort((d1, d2) => d1.order - d2.order);

        // Determine partiallySelected
        for (let l = levels; l >= 1; l--) {
            const selectedNodes = dataPoints.filter((d) => d.selected && d.level === l);
            if (selectedNodes.length > 0) {
                for (let n = 0; n < selectedNodes.length; n++) {
                    const parents = dataPoints
                                        .filter((d) => d.ownId === selectedNodes[n].parentId)
                                        .filter((value, index, self) => self.indexOf(value) === index); // Make unique
                    for (let p = 0; p < parents.length; p++) {
                        const children = dataPoints.filter((d) => d.parentId === parents[p].ownId);
                        if (children.length > children.filter((d) => d.selected && !d.partialSelected).length) {
                            parents[p].partialSelected = true;
                            parents[p].selected = true;
                        }
                        if (children.length === children.filter((d) => d.selected && !d.partialSelected).length) {
                            parents[p].selected = true;
                        }
                    }
                }
            }
        }
        // Store fullTree including hidden ragged members
        fullTree = dataPoints;
        // New leafs excluding ragged members
        if (dataPoints.filter((d) => d.isRagged === true).length > 0) {
            dataPoints = dataPoints.filter((d) => d.isRagged === false);
            for (let l = 0; l <= levels - 1; l++) {
                const parents = dataPoints.filter((d) => d.level === l);
                parents.forEach((d) => d.isLeaf = (dataPoints.filter((dp) => dp.parentId === d.ownId).length === 0));
            }
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

        if (this.settings.general.selfFilterEnabled && searchText && searchText.length > 2) {
            this.settings.general.searching = true;
            searchText = searchText.toLowerCase();
            dataPoints
                .filter((d) => d.ownId !== "selectAll")
                .filter((d) => d.searchStr.toLowerCase().indexOf(searchText) >= 0)
                .map((d) => d.isSearch = true);
            dataPoints
                .filter((d) => d.isSearch)
                .forEach((d) => HierarchySlicerWebBehavior.getParentDataPoints(dataPoints, d.parentId).map((dp) => dp.isSearch = true));
            dataPoints = dataPoints
                .filter((d) => d.isSearch)
                .filter((value, index, self) => self.indexOf(value) === index)
                .sort((d1, d2) => d1.order - d2.order);
        } else {
            this.settings.general.searching = false;
        }

        // Select All level
        if ((this.settings.selection.selectAll) && (!this.settings.general.searching)) {
            const selected = dataPoints.filter((d) => d.selected).length;
            dataPoints[0].selected = selected > 0 ? true : false;
            dataPoints[0].partialSelected = (selected === 0) ||
                dataPoints.filter((d) => d.selected).length === dataPoints.length ? false : true;
        }
        return {
            dataPoints: dataPoints,
            fullTree: fullTree,
            settings: this.settings,
            levels: levels,
            hasSelectionOverride: true,
        };
    }

    constructor(options: VisualConstructorOptions) {
        this.root = options.element;
        this.hostServices = options.host;

        this.behavior = new HierarchySlicerWebBehavior();
        this.interactivityService = createInteractivitySelectionService(options.host);

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

        let treeViewOptions: IHierarchySlicerTreeViewOptions = {
            rowHeight: this.getRowHeight(),
            enter: rowEnter,
            exit: rowExit,
            update: rowUpdate,
            loadMoreData: this.onLoadMoreData,
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
            { title: "Clear", class: HierarchySlicer.Clear.className, icon: this.IconSet.clearAll, level: 0 },
            { title: "Expand all", class: HierarchySlicer.Expand.className, icon: this.IconSet.expandAll, level: 1 },
            { title: "Collapse all", class: HierarchySlicer.Collapse.className, icon: this.IconSet.collapseAll, level: 1 }
        ];
        this.slicerHeaderContainer = rootContainer.append("div").classed(HierarchySlicer.HeaderContainer.className, true);
        this.slicerHeader = this.slicerHeaderContainer
            .append("div")
            .classed(HierarchySlicer.Header.className, true);

        this.slicerHeader
            .selectAll(HierarchySlicer.Icon.className)
            .data(headerButtonData)
            .enter()
            .append("div")
            .classed(HierarchySlicer.Icon.className, true)
            .classed("hiddenicon", !this.settings.mobile.zoomed)
            .attr("title", (d) => d.title)
            .each(function (d) { this.classList.add(d.class); }) // funcion due to this.classList
            .html((d) => d.icon);

        this.slicerHeader
            .append("div")
            .classed(HierarchySlicer.HeaderText.className, true);

        this.createSearchHeader(this.slicerHeaderContainer);
    }

    public update(options: VisualUpdateOptions) {
        this.handleLandingPage(options);
        if (!options ||
            !options.dataViews ||
            !options.dataViews[0] ||
            !options.viewport) {
            return;
        }

        this.isInFocus = false;
        this.dataView = options.dataViews ? options.dataViews[0] : undefined;
        if (!this.dataView) {
            return;
        }
        this.jsonFilters = options.jsonFilters;
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
            resetScrollbarPosition = !HierarchySlicer.hasSameTableIdentity(existingDataView, this.dataView);
        }
        this.updateInternal(resetScrollbarPosition);
    }

    private static hasSameTableIdentity(dataView1: DataView, dataView2: DataView): boolean {
        if (dataView1
            && dataView2
            && dataView1.table // in table view mapping is null
            && dataView2.table) { // in table view mapping is null
            // debugger;
            let dv1TableIdentity = dataView1.table.identity;
            let dv2TableIdentity = dataView2.table.identity;
            if (dv1TableIdentity
                && dv2TableIdentity
                && dv1TableIdentity.length === dv2TableIdentity.length) {
                for (let i = 0, len = dv1TableIdentity.length; i < len; i++) {
                    let dv1Identity: DataRepetitionSelector = dv1TableIdentity[i];
                    let dv2Identity: DataRepetitionSelector = dv2TableIdentity[i];

                    // debugger;
                    if (!isEqual((<any>dv1Identity).scopeId, (<any>dv2Identity).scopeId))
                        return false;
                }

                return true;
            }
        }

        return false;
    }

    private updateInternal(resetScrollbar: boolean) {
        this.updateSlicerBodyDimensions();

        const data = this.data = this.converter(this.dataView, this.jsonFilters, (this.searchInput.node() as HTMLInputElement).value);
        this.maxLevels = this.data.levels + 1;

        if (data.dataPoints.length === 0) {
            this.treeView.empty();
            return;
        }

        this.updateSettings();
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
        this.settings.items.fontColor = this.isHighContrast ? this.colorPalette.foreground.value : this.settings.items.fontColor;
        this.settings.items.selectedColor = this.isHighContrast ? this.colorPalette.foregroundSelected.value : this.settings.items.selectedColor;
        this.settings.items.background = this.isHighContrast ? this.colorPalette.background.value : this.settings.items.background;
        this.settings.items.hoverColor = this.isHighContrast ? this.colorPalette.foreground.value : this.settings.items.hoverColor;
        this.settings.items.textSizeZoomed = this.settings.items.textSize * (this.settings.mobile.zoomed ? (1 + (this.settings.mobile.enLarge / 100.)) : 1);
    }

    private updateHeaderStyle(): void {
        // Used setting values -> High Contrast
        this.settings.header.fontColor = this.isHighContrast ? this.colorPalette.foreground.value : this.settings.header.fontColor;
        this.settings.header.background = this.isHighContrast ? this.colorPalette.background.value : this.settings.header.background;
        this.settings.header.textSizeZoomed = this.settings.header.textSize * (this.settings.mobile.zoomed ? (1 + (this.settings.mobile.enLarge / 100.)) : 1);
    }

    private updateSearchStyle(): void {
        // Used setting values -> High Contrast
        this.settings.search.fontColor = this.isHighContrast ? this.colorPalette.foreground.value : this.settings.search.fontColor;
        this.settings.search.iconColor = this.isHighContrast ? this.colorPalette.foreground.value : this.settings.search.iconColor;
        this.settings.search.background = this.isHighContrast ? this.colorPalette.background.value : this.settings.search.background;
        this.settings.search.textSizeZoomed = this.settings.search.textSize * (this.settings.mobile.zoomed ? (1 + (this.settings.mobile.enLarge / 100.)) : 1);
    }

    private updateMobileSettings(): void {
        this.settings.mobile.zoomed = this.settings.mobile.enable || (this.isInFocus && this.settings.mobile.focus) || false;
    }

    private updateSlicerBodyDimensions(): void {
        let slicerViewport: IViewport = this.getBodyViewport(this.viewport);
        this.slicerBody
            .style("height", `${slicerViewport.height}px`)
            .style("width", "100%");
    }

    private onEnterSelection(rowSelection: Selection<any, any, any, any>): void {
        if (!this.settings) return;
        const _this = this;
        const treeItemElementParent: Selection<any, any, any, any> = rowSelection
            .selectAll(HierarchySlicer.ItemContainer.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .append("li")
            .classed(HierarchySlicer.ItemContainer.className, true);

        treeItemElementParent
            .style("background-color", this.settings.items.background);

        treeItemElementParent
            .exit()
            .remove();

        // Expand/collapse
        const expandCollapse: Selection<any, any, any, any> = treeItemElementParent
            .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .insert("div", ":first-child")
            .classed(HierarchySlicer.ItemContainerExpander.className, true);

        expandCollapse
            .selectAll(".icon")
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .insert("div")
            .classed("icon", true)
            .classed("icon-left", true)
            .style("visibility", (d) => d.isLeaf ? "hidden" : "visible")
            .style("font-size", PixelConverter.toString(PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed)))
            .style("margin-left", (d) => PixelConverter.toString(-this.settings.items.textSizeZoomed / (2.5)))
            .style("width", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))))
            .style("height", PixelConverter.toString(Math.ceil(1.35 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))))
            .style("fill", this.settings.items.fontColor)
            .html((d) => d.isExpand ? this.IconSet.expand : this.IconSet.collapse);

        expandCollapse
            .selectAll(".spinner-icon")
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .insert("div") // Spinner location
            .classed("spinner-icon", true)
            .style("display", "none")
            .style("font-size", PixelConverter.toString(PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed)))
            .style("margin-left", PixelConverter.toString(-this.settings.items.textSizeZoomed / (2.5)))
            .style("width", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))))
            .style("height", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.items.textSizeZoomed))));

        expandCollapse
            .exit()
            .remove();

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
            .style("width", (.75 * this.settings.items.textSizeZoomed) + "px")
            .style("height", (.75 * this.settings.items.textSizeZoomed) + "px")
            .style("margin-right", PixelConverter.fromPointToPixel(.25 * this.settings.items.textSizeZoomed) + "px")
            .style("margin-bottom", PixelConverter.fromPointToPixel(.25 * this.settings.items.textSizeZoomed) + "px");

        const labelElement = treeItemElement
            .selectAll(HierarchySlicer.LabelText.selectorName)
            .data((d: IHierarchySlicerDataPoint) => [d])
            .enter()
            .append("span")
            .classed(HierarchySlicer.LabelText.className, true);

        labelElement
                .style("color", this.settings.items.fontColor)
                .style("font-size", this.settings.items.textSizeZoomed + "pt")
                .style("font-family", this.settings.items.fontFamily)
                .style("font-weight", this.settings.items.fontWeight)
                .style("font-style", () => {
                    switch (this.settings.items.fontStyle) {
                        case FontStyle.Normal:
                            return "normal";
                        case FontStyle.Italic:
                            return "italic";
                    }
                });

        const maxLevel = this.maxLevels;
        const mobileScale = this.settings.mobile.zoomed ? (1 + (this.settings.mobile.enLarge / 100.)) : 1;

        treeItemElementParent.each(function(d, i) {
            const item = select(this);
            item
                .style("padding-left", (maxLevel === 1 ? 0 : ((d.level * mobileScale) * _this.settings.items.textSizeZoomed)) + "px")
                .style("margin-left" , maxLevel === 1 ? "-2px" : undefined);
        });
    }

    private getheaderTitle(title: string) {
        let fullTitle = title.trim();
        if (this.settings.header.restatement) {
            let statement = ": ";
            let len = this.data.dataPoints.length;
            let selected = this.data.dataPoints
                .filter((d) => d.selected && !d.partialSelected)
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

    private onUpdateSelection(rowSelection: Selection<any, any, any, any>, interactivityService: IInteractivityService<IHierarchySlicerDataPoint>): void {
        const _this = this;
        let data = this.data;
        if (data) {
            if (this.settings.header.show) {
                this.slicerHeader.style("display", "block");
            } else {
                this.slicerHeader.style("display", "none");
            }
            this.slicerHeader.select(HierarchySlicer.HeaderText.selectorName)
                .text(this.getheaderTitle(this.settings.header.title || this.settings.header.defaultTitle))
                .style("color", this.settings.header.fontColor)
                .style("background-color", this.settings.header.background)
                .style("border-style", this.settings.header.outline === BorderStyle.None ? 'none' : "solid")
                .style("border-color", this.settings.header.outlineColor)
                .style("border-width", this.getBorderWidth(this.settings.header.outline, this.settings.header.outlineWeight))
                .style("font-size", this.settings.header.textSizeZoomed + "pt")
                .style("font-family", this.settings.header.fontFamily)
                .style("font-weight", this.settings.header.fontWeight)
                .style("font-style", () => {
                    switch (this.settings.header.fontStyle) {
                        case FontStyle.Normal:
                            return "normal";
                        case FontStyle.Italic:
                            return "italic";
                    }
                });

            const icons = this.slicerHeader.selectAll(HierarchySlicer.Icon.selectorName);
            icons
                .classed("hiddenicon", !this.settings.mobile.zoomed)
                .style("height", PixelConverter.toString(PixelConverter.fromPointToPixel(this.settings.header.textSizeZoomed)))
                .style("width", PixelConverter.toString(PixelConverter.fromPointToPixel(this.settings.header.textSizeZoomed)))
                .style("fill", this.settings.header.fontColor)
                .style("background-color", this.settings.header.background)
                .style("opacity", (d: any) => data.levels >= d.level ? "1" : "0" );

            this.slicerBody
                .classed("slicerBody", true);

            let slicerText = rowSelection.selectAll(HierarchySlicer.LabelText.selectorName);

            slicerText.text((d: IHierarchySlicerDataPoint) => d.label === "" ? String.fromCharCode(160) : d.label);

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
                    overrideSelectionFromData: true
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
                    behavior: this.behavior
                };

                interactivityService.bind(behaviorOptions);

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
        if (!this.waitingForData && this.dataView && this.dataView.metadata && this.dataView.metadata.segment) {
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
        const searchHeight: number = this.settings.general.selfFilterEnabled
            ? TextMeasurementService.estimateSvgTextHeight(HierarchySlicer.getTextProperties(this.settings.search.textSizeZoomed)) + 2
            : 0;
        return TextMeasurementService.estimateSvgTextHeight(
            HierarchySlicer.getTextProperties(+this.settings.header.textSizeZoomed)) + searchHeight;
    }

    private getRowHeight(): number {
        return this.rowHeight || TextMeasurementService.estimateSvgTextHeight(
            HierarchySlicer.getTextProperties(this.settings.items.textSizeZoomed));
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

    private getBorderWidth(outlineElement: BorderStyle, outlineWeight) {
        switch (outlineElement) {
            case BorderStyle.None:
            default:
                return "0px";
            case BorderStyle.BottomOnly:
                return "0px 0px " + outlineWeight + "px 0px";
            case BorderStyle.TopOnly:
                return outlineWeight + "px 0px 0px 0px";
            case BorderStyle.LeftOnly:
                return '0px 0px 0px ' + outlineWeight + 'px';
            case BorderStyle.RightOnly:
                return '0px ' + outlineWeight + 'px 0px 0px';
            case BorderStyle.TopBottom:
                return outlineWeight + "px 0px " + outlineWeight + "px 0px";
            case BorderStyle.LeftRight:
                return "0px " + outlineWeight + "px 0px " + outlineWeight + "px";
            case BorderStyle.Frame:
                return outlineWeight + "px";
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
            .style("width", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))))
            .style("height", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))))
            .html(this.IconSet.search)
            .on("click", () => {
                this.hostServices.persistProperties({
                    merge: [{
                        objectName: "general",
                        selector: null,
                        properties: {
                            counter: counter++
                        }
                    }]
                });
            });

        this.searchInput = this.searchHeader
            .append("input")
            .attr("type", "text")
            .attr("drag-resize-disabled", "true")
            .classed("searchInput", true)
            .style("font-size", `${this.settings.search.textSizeZoomed}pt`)
            .style("color", this.settings.search.fontColor)
            .style("background-color", this.settings.search.background)
            .on("input", () => {
                this.hostServices.persistProperties({
                    merge: [{
                        objectName: "general",
                        selector: null,
                        properties: {
                            counter: counter++
                        }
                    }]
                });
            });

        this.searchHeader
            .append("div")
            .classed(HierarchySlicer.Icon.className, true)
            .classed("delete", true)
            .style("fill", this.settings.search.iconColor)
            .style("width", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))))
            .style("height", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))))
            .html(this.IconSet.delete)
            .on("click", () => {
                (this.searchInput.node() as HTMLInputElement).value = "";
                this.hostServices.persistProperties({
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
        this.searchHeader.classed("show", this.settings.general.selfFilterEnabled);
        this.searchHeader.classed("collapsed", !this.settings.general.selfFilterEnabled);
        if (this.settings.general.selfFilterEnabled) {
            let icons = this.searchHeader.selectAll(HierarchySlicer.Icon.selectorName);
            icons
                .style("fill", this.settings.search.iconColor)
                .style("width", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))))
                .style("height", PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSizeZoomed))));
            let searchInput = this.searchHeader.selectAll(".searchInput");
            searchInput
                .style("color", this.settings.search.fontColor)
                .style("font-size", `${this.settings.search.textSizeZoomed}pt`)
                .style("background-color", this.settings.search.background)
                .style("font-size", this.settings.search.textSizeZoomed)
                .style("font-family", this.settings.items.fontFamily);
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
        div.innerHTML = this.SVGs.watermark;
        return div;
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const instanceEnumeration: VisualObjectInstanceEnumeration = HierarchySlicerSettings.enumerateObjectInstances(
            this.settings || HierarchySlicerSettings.getDefault(),
            options);

        let instances: VisualObjectInstance[] = [];

        switch (options.objectName) {
            case "general":
                // ignore rendering general settings ( it include only hidden properties )
                return;
            case "selection":
                if (!this.settings.selection.selectAll) {
                    this.removeEnumerateObject(instanceEnumeration, "selectAllLabel");
                }
                if (this.settings.selection.hideMembers !== HideMembers.Never) {
                    this.removeEnumerateObject(instanceEnumeration, "emptyLeafLabel");
                }
                break;
            case "search":
                if (!this.settings.general.selfFilterEnabled) return;

                if (this.settings.selection.singleSelect) {
                    this.removeEnumerateObject(instanceEnumeration, "addSelection");
                }
                break;
            case "mobile":
                this.removeEnumerateObject(instanceEnumeration, "focus"); // new API => no detection of focus mode
                break;
            break;
        }

        instances.forEach((instance: VisualObjectInstance) => { this.addAnInstanceToEnumeration(instanceEnumeration, instance); });
            return instanceEnumeration;
    }

    public addAnInstanceToEnumeration(instanceEnumeration: VisualObjectInstanceEnumeration, instance: VisualObjectInstance): void {
        if ((instanceEnumeration as VisualObjectInstanceEnumerationObject).instances) {
            (instanceEnumeration as VisualObjectInstanceEnumerationObject)
                .instances
                .push(instance);
        } else {
            (instanceEnumeration as VisualObjectInstance[]).push(instance);
        }
    }

    public removeEnumerateObject(instanceEnumeration: VisualObjectInstanceEnumeration, objectName: string): void {
        if ((instanceEnumeration as VisualObjectInstanceEnumerationObject).instances) {
            delete (instanceEnumeration as VisualObjectInstanceEnumerationObject)
                .instances[0].properties[objectName];
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