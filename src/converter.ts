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
import { isEqual } from "lodash-es";

import { IHierarchySlicerData, IHierarchySlicerDataPoint } from "./interfaces";
import { PerfTimer } from "./perfTimer";
import { HideMembers, TraceEvents, SearchFilter } from "./enums";
import {
    extractFilterColumnTarget,
    parseFilter,
    convertRawValue,
    parseExpand,
    wildcardFilter,
    getHierarchyColumns,
    getCommonLevel,
    applyFilter,
} from "./utils";
import { HierarchySlicerSettings } from "./hierarchySlicerSettings";

import DataView = powerbi.DataView;
import IFilter = powerbi.IFilter;
import DataViewMetadata = powerbi.DataViewMetadata;
import DataViewMatrix = powerbi.DataViewMatrix;
import DataViewMatrixNode = powerbi.DataViewMatrixNode;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import CustomVisualOpaqueIdentity = powerbi.visuals.CustomVisualOpaqueIdentity;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ValueType = valueType.ValueType;
import format = valueFormatter.format;

export function converter(
    dataView: DataView | undefined,
    jsonFilters: IFilter[] | undefined,
    searchText: string | undefined,
    searchFilter: SearchFilter,
    settings: HierarchySlicerSettings
): IHierarchySlicerData | undefined {
    let timer = PerfTimer.START(TraceEvents.convertor, settings.general.telemetry);
    if (checkEmptyDataset(dataView)) {
        timer();
        return;
    }
    const dataModel: DataViewMatrix = <DataViewMatrix>(dataView && dataView.matrix);
    const metadata: DataViewMetadata = <DataViewMetadata>(dataView && dataView.metadata);
    const hierarchyColumns: DataViewMetadataColumn[] = getHierarchyColumns(metadata, dataModel.rows.levels); // Filter out 'Values' level
    const columns: DataViewMatrixNode[] = <DataViewMatrixNode[]>dataModel.rows.root.children;
    const columnFilters: IFilterTarget[] = hierarchyColumns.map((c: DataViewMetadataColumn) =>
        extractFilterColumnTarget(c)
    );
    let levels = hierarchyColumns.length - 1;
    let dataPoints: IHierarchySlicerDataPoint[] = [];
    let fullTree: IHierarchySlicerDataPoint[] = [];
    const expanded: string[][] = parseExpand(settings.general.expanded);
    let isRagged: boolean = false;

    if (settings.selection.selectAll && !settings.selection.singleSelect) {
        const dataPointSelectAll: IHierarchySlicerDataPoint = {
            identity: "",
            selected: false,
            value: [settings.selection.selectAllLabel],
            label: settings.selection.selectAllLabel,
            tooltip: [{ displayName: settings.selection.selectAllLabel, value: "" }],
            level: -1,
            selectable: true,
            partialSelected: false,
            isLeaf: true,
            isExpand: false,
            isHidden: false,
            isRagged: false,
            ownId: ["selectAll"],
            parentId: [],
        };
        dataPoints.push(dataPointSelectAll);
    }

    dataPoints = dataPoints.concat(
        parseNodes(columns, metadata, settings, expanded, null, [], [], [], [], 0, isRagged)
    );

    processJsonFilters(jsonFilters, dataPoints, columnFilters, metadata, settings);

    // Determine partiallySelected
    processPartialSelected(dataPoints, levels);

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
                        dataPoints.filter((dp: IHierarchySlicerDataPoint) => isEqual(dp.parentId, d.ownId)).length ===
                        0)
            );
        }
    }

    if (searchText) {
        processSearch(dataPoints, searchText, searchFilter, settings.search.addSelection, settings.general.expanded);
    } else {
        processExpanded(dataPoints, levels, settings.general.expanded);
    }

    if (settings.selection.selectAll) {
        processSelectAll(dataPoints, settings.general.selectAll, searchText === undefined);
    }
    timer();
    return {
        dataPoints: dataPoints,
        fullTree: fullTree,
        columnFilters: columnFilters,
        levels: levels,
        hasSelectionOverride: true,
    };
}

function parseNodes(
    nodes: DataViewMatrixNode[],
    metadata: DataViewMetadata,
    settings: HierarchySlicerSettings,
    expanded: string[][],
    parentRawValue: string | number | Date | null,
    parentValue: (string | number | null)[],
    parentTooltip: VisualTooltipDataItem[],
    parentId: string[],
    parentIdentity: CustomVisualOpaqueIdentity[],
    level: number,
    isRagged: boolean
): IHierarchySlicerDataPoint[] {
    let dataPoints: IHierarchySlicerDataPoint[] = [];
    nodes.forEach((node: DataViewMatrixNode) => {
        const nodeMetadata = metadata.columns[level];
        const formatstring: string = nodeMetadata.format || "g";
        const dataType: ValueTypeDescriptor =
            nodeMetadata.type || ValueType.fromDescriptor(<valueType.IValueTypeDescriptor>{ text: true });
        let label: string;
        let rawValue: string | number | Date | null = convertRawValue(node.value, dataType, true);
        rawValue = settings.selection.emptyString && rawValue === "" ? null : rawValue;
        switch (settings.selection.hideMembers) {
            case HideMembers.Empty:
                isRagged = rawValue === null;
                label = format(rawValue, formatstring);
                break;
            case HideMembers.ParentName:
                isRagged = level > 0 && rawValue === parentRawValue;
                label = format(rawValue, formatstring);
                break;
            case HideMembers.Never:
            default:
                label =
                    rawValue === null
                        ? settings.selection.emptyLeafLabel || settings.selection.emptyLeafLabelDefault
                        : format(rawValue, formatstring);
        }
        const valueString: string = format(convertRawValue(node.value, dataType), formatstring);
        const isLeaf: boolean = node.children === undefined;
        const id: string[] = parentId.concat([valueString]);
        const tooltip: VisualTooltipDataItem[] = parentTooltip.concat([
            <VisualTooltipDataItem>{ displayName: nodeMetadata.displayName, value: label },
        ]);
        const nodeIdentity = parentIdentity.concat(<CustomVisualOpaqueIdentity>node.identity);
        const value: (string | number | null)[] = parentValue.concat([
            node.value === null ? null : dataType.numeric ? Number(valueString) : valueString,
        ]);
        const dataPoint: IHierarchySlicerDataPoint = {
            identity: `|~${id.join("~|")}|`,
            value,
            label,
            tooltip,
            nodeIdentity,
            level,
            selected: false,
            selectable: true,
            partialSelected: false,
            isRagged,
            isLeaf,
            isExpand: expanded === [] ? false : expanded.filter(e => isEqual(e, id)).length > 0 || false,
            isHidden: level === 0 ? false : true, // Default true. Real status based on the expanded properties of parent(s)
            ownId: id,
            parentId: parentId,
        };
        dataPoints.push(dataPoint);
        if (node.children) {
            dataPoints = dataPoints.concat(
                parseNodes(
                    <DataViewMatrixNode[]>node.children,
                    metadata,
                    settings,
                    expanded,
                    rawValue,
                    value,
                    tooltip,
                    id,
                    nodeIdentity,
                    level + 1,
                    isRagged
                )
            );
        }
    });
    return dataPoints;
}

export function checkEmptyDataset(dataView: DataView | undefined) {
    return (
        !dataView ||
        !dataView.matrix ||
        !dataView.matrix.rows ||
        !dataView.matrix.rows.root ||
        !dataView.matrix.rows.root.children ||
        !(dataView.matrix.rows.root.children.length > 0)
    );
}

export function processJsonFilters(
    jsonFilters: IFilter[] | undefined,
    dataPoints: IHierarchySlicerDataPoint[],
    columnFilters: IFilterTarget[],
    metadata: DataViewMetadata,
    settings: HierarchySlicerSettings
) {
    dataPoints.forEach((dataPoint: IHierarchySlicerDataPoint) => {
        dataPoint.selected = settings.general.selectAll;
        dataPoint.partialSelected = false;
    });
    const selectedIds: string[][] = parseFilter(jsonFilters, columnFilters, metadata, settings.general.filterValues);
    const level = selectedIds.length > 0 ? selectedIds[0].length : 0;
    dataPoints.forEach((dataPoint: IHierarchySlicerDataPoint) => {
        if (selectedIds.filter(selectedId => isEqual(selectedId, dataPoint.ownId.slice(0, level))).length > 0) {
            dataPoint.selected = true;
        }
    });
}

export function processPartialSelected(dataPoints: IHierarchySlicerDataPoint[], levels: number) {
    for (let l = levels; l >= 1; l--) {
        const selectedNodes = dataPoints.filter(d => d.selected && d.level === l);
        if (selectedNodes.length > 0) {
            for (let n = 0; n < selectedNodes.length; n++) {
                const parents = dataPoints
                    .filter(d => isEqual(d.ownId, selectedNodes[n].parentId))
                    .filter((value, index, self) => self.indexOf(value) === index); // Make unique
                for (let p = 0; p < parents.length; p++) {
                    const children = dataPoints.filter(d => isEqual(d.parentId, parents[p].ownId));
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
}

export function processExpanded(dataPoints: IHierarchySlicerDataPoint[], levels: number, expanded: string) {
    const expand: string[][] = parseExpand(expanded);
    if (expand === []) return;
    dataPoints.forEach(
        (dataPoint: IHierarchySlicerDataPoint) =>
            (dataPoint.isExpand = expand.filter(e => isEqual(e, dataPoint.ownId)).length > 0)
    );
    processHidden(dataPoints, levels);
}

export function processHidden(dataPoints: IHierarchySlicerDataPoint[], levels: number) {
    // Set isHidden property
    let parentRootNodes: IHierarchySlicerDataPoint[] = [];
    let parentRootNodesTemp: IHierarchySlicerDataPoint[] = [];
    let parentRootNodesTotal: IHierarchySlicerDataPoint[] = [];
    dataPoints.forEach((d: IHierarchySlicerDataPoint) => (d.isHidden = d.level > 0));
    for (let l = 0; l < levels; l++) {
        const expandedRootNodes = dataPoints.filter((d: IHierarchySlicerDataPoint) => d.isExpand && d.level === l);
        if (expandedRootNodes.length > 0) {
            for (let n = 0; n < expandedRootNodes.length; n++) {
                parentRootNodesTemp = parentRootNodes.filter((p: IHierarchySlicerDataPoint) =>
                    isEqual(expandedRootNodes[n].parentId, p.ownId)
                ); // Is parent expanded?
                if (l === 0 || parentRootNodesTemp.length > 0) {
                    parentRootNodesTotal = parentRootNodesTotal.concat(expandedRootNodes[n]);
                    dataPoints
                        .filter(
                            (d: IHierarchySlicerDataPoint) =>
                                isEqual(d.parentId, expandedRootNodes[n].ownId) && d.level === l + 1
                        )
                        .forEach((d: IHierarchySlicerDataPoint) => (d.isHidden = false));
                }
            }
        }
        parentRootNodes = parentRootNodesTotal;
    }
}

export function processSearch(
    dataPoints: IHierarchySlicerDataPoint[],
    searchText: string = "",
    searchFilter: SearchFilter,
    addSelection: boolean,
    expanded: string
) {
    const searchString = searchText.toLowerCase();
    const parents: string[][] = [];
    const children: string[][] = [];
    const expand: string[][] = parseExpand(expanded);
    dataPoints.forEach((d: IHierarchySlicerDataPoint) => {
        d.isHidden = (addSelection && d.selected) || isEqual(d.ownId, ["selectAll"]) ? d.isHidden : true;
        d.isExpand = addSelection && d.selected ? d.isExpand : false;
    });
    dataPoints.forEach((d: IHierarchySlicerDataPoint) => {
        if (d.ownId[0] === "selectAll") return;
        if (wildcardFilter(d.ownId[d.level].toLowerCase(), searchString, searchFilter)) {
            d.isHidden = false;
            d.parentId.forEach((p, i) => {
                const parentId = d.parentId.slice(0, i + 1);
                if (parents.filter(parent => isEqual(parent, parentId)).length === 0) {
                    parents.push(parentId);
                }
            });
            if (expand.filter(e => isEqual(e, d.ownId)).length > 0) {
                d.isExpand = true;
                if (children.filter(child => isEqual(child, d.ownId)).length === 0) {
                    children.push(d.ownId);
                }
            }
        }
    });
    dataPoints.forEach((d: IHierarchySlicerDataPoint) => {
        if (parents.filter(parent => isEqual(parent, d.ownId)).length > 0) {
            d.isHidden = false;
            d.isExpand = true;
        }
    });
    dataPoints.forEach((d: IHierarchySlicerDataPoint) => {
        if (children.filter(child => isEqual(child, d.ownId.slice(0, child.length))).length > 0) {
            d.isHidden = false;
            d.isExpand = true;
        }
    });
}

export function processSelectAll(
    dataPoints: IHierarchySlicerDataPoint[],
    selectAll: boolean = false,
    searching: boolean
) {
    // Select All level
    const selected = dataPoints.filter((d: IHierarchySlicerDataPoint) => d.selected && !isEqual(d.ownId, ["selectAll"]))
        .length;
    const partialSelected = dataPoints.filter(
        (d: IHierarchySlicerDataPoint) => (!d.selected || d.partialSelected) && !isEqual(d.ownId, ["selectAll"])
    ).length;
    dataPoints[0].selected = selected > 0 ? true : false;
    dataPoints[0].partialSelected = partialSelected > 0 && selected > 0 ? true : false;
}

export function processSingleSelect(
    hostServices: IVisualHost,
    dataPoints: IHierarchySlicerDataPoint[],
    columnFilters: IFilterTarget[],
    levels: number
) {
    let selectionDataPoints = dataPoints.filter(
        (d: IHierarchySlicerDataPoint) => d.selected && !isEqual(d.ownId, ["selectAll"])
    );
    if (selectionDataPoints.length === 0) {
        dataPoints[0].selected = true;
        dataPoints[0].partialSelected = false;
        processPartialSelected(dataPoints, levels);
    }
    const filterLevel = getCommonLevel(selectionDataPoints);
    selectionDataPoints = dataPoints.filter(
        (d: IHierarchySlicerDataPoint) => d.selected && !isEqual(d.ownId, ["selectAll"]) && d.level === filterLevel
    );
    if (selectionDataPoints.length > 1) {
        selectionDataPoints.forEach((d, i) => {
            if (i !== 0) {
                d.selected = false;
                d.partialSelected = false;
            }
        });
    }
    applyFilter(hostServices, dataPoints, columnFilters, filterLevel);
}
