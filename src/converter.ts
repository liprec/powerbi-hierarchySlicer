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
import { IFilterTarget } from "powerbi-models";
import { valueType } from "powerbi-visuals-utils-typeutils";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import { IHierarchySlicerData, IHierarchySlicerDataPoint } from "./interfaces";
import { PerfTimer } from "./perfTimer";
import { HideMembers, TraceEvents } from "./enums";
import { extractFilterColumnTarget, parseFilter, convertRawValue } from "./utils";
import { HierarchySlicerSettings } from "./settings";
import { HierarchySlicerWebBehavior } from "./hierarchySlicerWebBehavior";

import DataView = powerbi.DataView;
import IFilter = powerbi.IFilter;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewTableRow = powerbi.DataViewTableRow;
import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
import ValueType = valueType.ValueType;
import ValueFormat = valueFormatter.format;

export function converter(
    dataView: DataView | undefined,
    jsonFilters: IFilter[] | undefined,
    searchText: string,
    settings: HierarchySlicerSettings,
    selectionBuilder: ISelectionIdBuilder | undefined
): IHierarchySlicerData {
    let timer = PerfTimer.start(TraceEvents.convertor);
    if (
        !dataView ||
        !dataView.table ||
        !dataView.table.rows ||
        !(dataView.table.rows.length > 0) ||
        !dataView.table.columns ||
        !(dataView.table.columns.length > 0)
    ) {
        return {
            dataPoints: [],
            fullTree: [],
            settings: <HierarchySlicerSettings>HierarchySlicerSettings.getDefault(),
            levels: -1,
        };
    }

    const rawColumns = dataView.table && dataView.table.columns;
    const hierarchyRows: DataViewMetadataColumn[] = dataView.metadata.columns.filter((c: DataViewMetadataColumn) =>
        c.roles ? c.roles["Fields"] : false
    ); // Filter out 'Values' level
    const hierarchyRowIndex: (number | undefined)[] = hierarchyRows.map((c: DataViewMetadataColumn) => c.index);
    const rows: DataViewTableRow[] = dataView.table.rows.map((r: DataViewTableRow) =>
        hierarchyRowIndex.map((i: number) => r[i])
    );
    const columns: DataViewMetadataColumn[] = hierarchyRowIndex.map((i: number) => rawColumns[i]);
    const columnsMetadata = hierarchyRowIndex.map((i: number) => dataView.metadata.columns[i]);
    const columnFilters: IFilterTarget[] = columns.map((c: DataViewMetadataColumn) => extractFilterColumnTarget(c));
    const levels = hierarchyRows.length - 1;
    let dataPoints: IHierarchySlicerDataPoint[] = [];
    let fullTree: IHierarchySlicerDataPoint[] = [];
    let identityValues: string[] = [];
    let iValues: any[][] = [];
    let selectedIds: string[] = [];
    let expandedIds: string[] = [];
    let order: number = 0;
    let isRagged: boolean = false;
    let parentIndex: number[] = [];
    selectedIds = parseFilter(jsonFilters, columnFilters, columns, dataView, settings.general.filterValues);
    expandedIds = settings.general.expanded.split(",");
    settings.header.defaultTitle = dataView.metadata.columns[0].displayName;

    if (settings.selection.selectAll) {
        const dataPointSelectAll: IHierarchySlicerDataPoint = {
            identity: "selectAll",
            selected: false,
            value: settings.selection.selectAllLabel,
            label: settings.selection.selectAllLabel,
            level: 0,
            isEmpty: false,
            dataType: ValueType.fromDescriptor(<valueType.IValueTypeDescriptor>{ text: true }),
            selectable: true,
            partialSelected: false,
            isLeaf: true,
            isExpand: false,
            isHidden: false,
            isRagged: false,
            isSearch: false,
            ownId: "selectAll",
            parentId: "none",
            searchStr: "",
            orderArray: [0, 0, -1],
            order: -2,
        };
        dataPoints.push(dataPointSelectAll);
    }
    for (let r = 0; r < rows.length; r++) {
        let parentId: string = "";
        let parentSearchStr: string = "";
        let rowValuePrev: string | number | Date | null = null;
        let toolTip: VisualTooltipDataItem[] = [];
        isRagged = false;
        for (let c = 0; c < rows[r].length; c++) {
            if (r === 0) {
                iValues.push([]);
            }

            let columnFormat: string = (columns[c] && columns[c].format) || "g";
            let dataType: ValueTypeDescriptor =
                (columns[c] && columns[c].type) ||
                ValueType.fromDescriptor(<valueType.IValueTypeDescriptor>{ text: true });
            let rowValue: string | number | Date | null = convertRawValue(rows[r][c], dataType, true);
            let labelValueId: string = ValueFormat(convertRawValue(rows[r][c], dataType), columnFormat);
            let labelValue: string;

            rowValue = settings.selection.emptyString && rowValue === "" ? null : rowValue;
            switch (settings.selection.hideMembers) {
                case HideMembers.Empty:
                    isRagged = rowValue === null;
                    labelValue = ValueFormat(rowValue, columnFormat);
                    break;
                case HideMembers.ParentName:
                    isRagged = r + c > 0 && rowValue === rowValuePrev;
                    labelValue = ValueFormat(rowValue, columnFormat);
                    rowValuePrev = rowValue;
                    break;
                case HideMembers.Never:
                default:
                    labelValue =
                        rowValue === null
                            ? settings.selection.emptyLeafLabel || settings.selection.emptyLeafLabelDefault
                            : ValueFormat(rowValue, columnFormat);
            }

            let ownId: string =
                parentId + (parentId === "" ? "" : "_") + "|~" + labelValueId.replace(/,/g, "") + "-" + c;
            let searchStr: string = parentSearchStr + labelValue.replace(/,/g, "");
            let isLeaf: boolean = c === levels;
            const filterTarget: IFilterTarget = columnFilters[c];
            const selected: boolean =
                settings.general.selectAll || selectedIds.filter(d => ownId.indexOf(d) > -1).length > 0;
            toolTip = toolTip.concat([
                { displayName: columns[c].displayName, value: labelValue } as VisualTooltipDataItem,
            ]);

            const selectionId = selectionBuilder && selectionBuilder.withTable(dataView.table, r).createSelectionId();

            let dataPoint: IHierarchySlicerDataPoint = {
                filterTarget: filterTarget,
                identity: ownId, // Some unique value to 'trick' the interactivityService with overrideSelectionFromData
                selected: selected,
                value: labelValueId,
                label: labelValue,
                dataType: dataType,
                isEmpty: rows[r][c] === null,
                tooltip: toolTip,
                level: c,
                selectable: true,
                partialSelected: false,
                isLeaf: isLeaf,
                isExpand: expandedIds === [] ? false : expandedIds.filter(d => d === ownId).length > 0 || false,
                isHidden: c === 0 ? false : true, // Default true. Real status based on the expanded properties of parent(s)
                isRagged: isRagged,
                ownId: ownId,
                parentId: parentId,
                searchStr: searchStr,
                isSearch: settings.search.addSelection ? selected : false,
                orderArray: [],
                order: -1,
                selectionId: selectionId,
            };

            parentId = ownId;
            parentSearchStr = searchStr;
            if (identityValues.indexOf(ownId) === -1) {
                if (iValues[c].indexOf(ownId)) {
                    iValues[c].push(ownId);
                }
                dataPoint.orderArray = ownId
                    .split("_|~")
                    .map((d: string, i: number, t: string[]) => 1 + iValues[i].indexOf(t.slice(0, i + 1).join("_|~"))) // Lookup indexes of ownIds
                    .concat(Array.from({ length: levels - c }, () => 0)); // Stuff array to zero's
                identityValues.push(ownId);
                dataPoints.push(dataPoint);
            }
        }
    }
    dataPoints.forEach((d: IHierarchySlicerDataPoint) => {
        d.order =
            d.order === -2
                ? -1
                : d.orderArray.reduce((t: any, c: any, i: number) => t * (iValues[i].length + 1) + c, 0);
    });
    dataPoints.sort((d1: IHierarchySlicerDataPoint, d2: IHierarchySlicerDataPoint) => d1.order - d2.order);

    // Determine partiallySelected
    for (let l = levels; l >= 1; l--) {
        const selectedNodes = dataPoints.filter(d => d.selected && d.level === l);
        if (selectedNodes.length > 0) {
            for (let n = 0; n < selectedNodes.length; n++) {
                const parents = dataPoints
                    .filter(d => d.ownId === selectedNodes[n].parentId)
                    .filter((value, index, self) => self.indexOf(value) === index); // Make unique
                for (let p = 0; p < parents.length; p++) {
                    const children = dataPoints.filter(d => d.parentId === parents[p].ownId);
                    if (children.length > children.filter(d => d.selected && !d.partialSelected).length) {
                        parents[p].partialSelected = true;
                        parents[p].selected = true;
                    }
                    if (children.length === children.filter(d => d.selected && !d.partialSelected).length) {
                        parents[p].selected = true;
                    }
                }
            }
        }
    }
    // Store fullTree including hidden ragged members
    fullTree = dataPoints;
    // New leafs excluding ragged members
    if (dataPoints.filter((d: IHierarchySlicerDataPoint) => d.isRagged === true).length > 0) {
        dataPoints = dataPoints.filter((d: IHierarchySlicerDataPoint) => d.isRagged === false);
        for (let l = 0; l <= levels - 1; l++) {
            const parents = dataPoints.filter((d: IHierarchySlicerDataPoint) => d.level === l);
            parents.forEach(
                (d: IHierarchySlicerDataPoint) =>
                    (d.isLeaf =
                        dataPoints.filter((dp: IHierarchySlicerDataPoint) => dp.parentId === d.ownId).length === 0)
            );
        }
    }

    // Set isHidden property
    let parentRootNodes: IHierarchySlicerDataPoint[] = [];
    let parentRootNodesTemp: IHierarchySlicerDataPoint[] = [];
    let parentRootNodesTotal: IHierarchySlicerDataPoint[] = [];
    for (let l = 0; l < levels; l++) {
        let expandedRootNodes = dataPoints.filter((d: IHierarchySlicerDataPoint) => d.isExpand && d.level === l);
        if (expandedRootNodes.length > 0) {
            for (let n = 0; n < expandedRootNodes.length; n++) {
                parentRootNodesTemp = parentRootNodes.filter(
                    (p: IHierarchySlicerDataPoint) => expandedRootNodes[n].parentId === p.ownId
                ); // Is parent expanded?
                if (l === 0 || parentRootNodesTemp.length > 0) {
                    parentRootNodesTotal = parentRootNodesTotal.concat(expandedRootNodes[n]);
                    dataPoints
                        .filter(
                            (d: IHierarchySlicerDataPoint) =>
                                d.parentId === expandedRootNodes[n].ownId && d.level === l + 1
                        )
                        .forEach((d: IHierarchySlicerDataPoint) => (d.isHidden = false));
                }
            }
        }
        parentRootNodes = parentRootNodesTotal;
    }

    if (settings.general.selfFilterEnabled && searchText && searchText.length > 2) {
        settings.general.searching = true;
        searchText = searchText.toLowerCase();
        dataPoints
            .filter((d: IHierarchySlicerDataPoint) => d.ownId !== "selectAll")
            .filter((d: IHierarchySlicerDataPoint) => d.searchStr.toLowerCase().indexOf(searchText) >= 0)
            .map((d: IHierarchySlicerDataPoint) => (d.isSearch = true));
        dataPoints
            .filter((d: IHierarchySlicerDataPoint) => d.isSearch)
            .forEach((d: IHierarchySlicerDataPoint) =>
                HierarchySlicerWebBehavior.getParentDataPoints(dataPoints, d.parentId).map(dp => (dp.isSearch = true))
            );
        dataPoints = dataPoints
            .filter((d: IHierarchySlicerDataPoint) => d.isSearch)
            .filter(
                (d: IHierarchySlicerDataPoint, index: number, self: IHierarchySlicerDataPoint[]) =>
                    self.indexOf(d) === index
            )
            .sort((d1: IHierarchySlicerDataPoint, d2: IHierarchySlicerDataPoint) => d1.order - d2.order);
    } else {
        settings.general.searching = false;
    }

    // Select All level
    if (settings.selection.selectAll && !settings.general.searching) {
        const selected = dataPoints.filter((d: IHierarchySlicerDataPoint) => d.selected).length;
        dataPoints[0].selected = selected > 0 ? true : false;
        dataPoints[0].partialSelected =
            selected === 0 ||
            dataPoints.filter((d: IHierarchySlicerDataPoint) => d.selected).length === dataPoints.length
                ? false
                : true;
    }
    timer();
    return {
        dataPoints: dataPoints,
        fullTree: fullTree,
        settings: settings,
        levels: levels,
        hasSelectionOverride: true,
    };
}
