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
import * as models from "powerbi-models";
import * as d3 from "d3";

import * as settings from "./settings";

import IViewport = powerbi.IViewport;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import SelectableDataPoint = interactivityutils.interactivitySelectionService.SelectableDataPoint;
import IInteractivityService = interactivityutils.interactivityBaseService.IInteractivityService;
import IFilterTarget = models.IFilterTarget;
import Selection = d3.Selection;
import HierarchySlicerSettings = settings.HierarchySlicerSettings;
import IBehaviorOptions = interactivityutils.interactivityBaseService.IBehaviorOptions;
import InteractivityServiceOptions = interactivityutils.interactivityBaseService.InteractivityServiceOptions;

export interface IHierarchySlicerDataPoint extends SelectableDataPoint {
    value: string;
    tooltip: string;
    level: number;
    mouseOver?: boolean;
    mouseOut?: boolean;
    isSelectAllDataPoint?: boolean;
    selectable?: boolean;
    partialSelected: boolean;
    id: {}; // SQExpr;
    isLeaf: boolean;
    isExpand: boolean;
    isHidden: boolean;
    isRagged: boolean;
    ownId: string;
    parentId: string;
    searchStr: string;
    isSearch: boolean;
    order: number;
    filterTarget: IFilterTarget;
}

export interface IHierarchySlicerData {
    dataPoints: IHierarchySlicerDataPoint[];
    fullTree: IHierarchySlicerDataPoint[];
    hasSelectionOverride?: boolean;
    settings: HierarchySlicerSettings;
    levels: number;
}

export interface IHierarchySlicerBehaviorOptions extends IBehaviorOptions<IHierarchySlicerDataPoint> {
    hostServices: IVisualHost;
    expanders: Selection<any>;
    slicerBodySpinner: Selection<any>;
    slicerContainer: Selection<any>;
    slicerItemContainers: Selection<any>;
    slicerItemLabels: Selection<any>;
    slicerItemInputs: Selection<any>;
    slicerClear: Selection<any>;
    slicerExpand: Selection<any>;
    slicerCollapse: Selection<any>;
    slicerHeaderText: Selection<any>;
    dataPoints: IHierarchySlicerDataPoint[];
    fullTree: IHierarchySlicerDataPoint[];
    interactivityService: IInteractivityService<IHierarchySlicerDataPoint>;
    interactivityServiceOptions: InteractivityServiceOptions;
    slicerSettings: HierarchySlicerSettings;
    levels: number;
    dataView: powerbi.DataView;
}

export interface IHierarchySlicerTreeViewOptions {
    enter: (selection: Selection<any>) => void;
    exit: (selection: Selection<any>) => void;
    update: (selection: Selection<any>) => void;
    loadMoreData: () => void;
    baseContainer: Selection<any>;
    rowHeight: number;
    viewport: IViewport;
    scrollEnabled: boolean;
    // isReadMode: () => boolean;
}

export interface IHierarchySlicerTreeView {
    data(data: any[], dataIdFunction: (d) => {}, dataAppended: boolean): IHierarchySlicerTreeView;
    rowHeight(rowHeight: number): IHierarchySlicerTreeView;
    viewport(viewport: IViewport): IHierarchySlicerTreeView;
    render(): void;
    empty(): void;
    getRealRowHeight(): number;
    updateScrollHeight(): void;
}