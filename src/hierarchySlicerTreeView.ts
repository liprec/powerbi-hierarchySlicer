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
import * as svgutils from "powerbi-visuals-utils-svgutils";
import * as typeutils from "powerbi-visuals-utils-typeutils";
import * as d3 from "d3";

import {extend} from "lodash-es";

import * as interfaces from "./interfaces";

import IViewport = powerbi.IViewport;
import TranslateWithPixels = svgutils.manipulation.translateWithPixels;
import PixelConverter = typeutils.pixelConverter;
import Selection = d3.Selection;

import IHierarchySlicerTreeView = interfaces.IHierarchySlicerTreeView;
import IHierarchySlicerTreeViewOptions = interfaces.IHierarchySlicerTreeViewOptions;
import IHierarchySlicerDataPoint = interfaces.IHierarchySlicerDataPoint;

export module HierarchySlicerTreeViewFactory {
    export function createListView(options): IHierarchySlicerTreeView {
        return new HierarchySlicerTreeView(options);
    }
}

export class HierarchySlicerTreeView implements IHierarchySlicerTreeView {
    private getDatumIndex: (d: any) => {};
    private _data: any[];
    private _totalRows: number;

    private options: IHierarchySlicerTreeViewOptions;
    private visibleGroupContainer: Selection<any>;
    private scrollContainer: Selection<any>;
    private scrollbarInner: Selection<any>;
    private renderTimeoutId: number;

    /**
     * The value indicates the percentage of data already shown
     * in the list view that triggers a loadMoreData call.
     */
    private static loadMoreDataThreshold = 0.8;
    private static defaultRowHeight = 1;

    public constructor(options: IHierarchySlicerTreeViewOptions) {
        // make a copy of options so that it is not modified later by caller
        this.options = extend(true, {}, options);

        this.scrollbarInner = options.baseContainer
            .append("div")
            .classed("scrollbar-inner", true)
            .on("scroll", () => {
                this.renderImpl(this.options.rowHeight);
                const scrollHeight = this.options.scrollEnabled ? Math.min(this.getContainerHeight(), (this.getVisibleRows() * this.options.rowHeight)) : this.getContainerHeight();
                this.scrollbarInner.style("height", scrollHeight + "px").attr("height", scrollHeight);
            });

        this.scrollContainer = this.scrollbarInner
            .append("div")
            .classed("scrollRegion", true);

        this.visibleGroupContainer = this.scrollContainer
            .append("div")
            .classed("visibleGroup", true);

        // const scrollInner = $(this.scrollbarInner.node());
        // scrollInner.scrollbar({ignoreOverlay: false, ignoreMobile: false, onDestroy: () => scrollInner.off("scroll")});
        // $(options.baseContainer.node()).find(".scroll-element").attr("drag-resize-disabled", "true");

        options.baseContainer.select(".scroll-element").attr("drag-resize-disabled", "true");

        HierarchySlicerTreeView.SetDefaultOptions(options);
    }

    private getContainerHeight(): number {
        return (this.options.baseContainer.node() as HTMLElement).offsetHeight;
    }
    private getContainerWidth(): number {
        return (this.options.baseContainer.node() as HTMLElement).offsetWidth;
    }

    private static SetDefaultOptions(options: IHierarchySlicerTreeViewOptions) {
        options.rowHeight = options.rowHeight || HierarchySlicerTreeView.defaultRowHeight;
    }

    public rowHeight(rowHeight: number): HierarchySlicerTreeView {
        this.options.rowHeight = Math.ceil(rowHeight); // + 2; // Margin top/bottom

        return this;
    }

    public getRealRowHeight(): number {
        return this.options.rowHeight || HierarchySlicerTreeView.defaultRowHeight;
    }

    public updateScrollHeight() {
        const scrollHeight = this.options.scrollEnabled ? Math.min(this.getContainerHeight(), (this.getVisibleRows() * this.options.rowHeight)) : this.getContainerHeight();

        this.scrollbarInner.style("height", scrollHeight + "px").attr("height", scrollHeight);
    }

    public data(data: any[], getDatumIndex: (d: any) => {}, dataReset: boolean = false): IHierarchySlicerTreeView {
        this._data = data;
        this.getDatumIndex = getDatumIndex;

        this.setTotalRows();

        if (dataReset) {
            (this.scrollbarInner.node() as HTMLElement).scrollTo({top: 0});
        }

        return this;
    }

    public viewport(viewport: IViewport): IHierarchySlicerTreeView {
        this.render();

        return this;
    }

    public empty(): void {
        this._data = [];
        this.render();
    }

    public render(): void {
        if (this.renderTimeoutId)
            window.clearTimeout(this.renderTimeoutId);
        this.renderTimeoutId = window.setTimeout(() => {
            this.getRowHeight().then((rowHeight: number) => this.renderImpl(rowHeight));
            this.renderTimeoutId = undefined;
        }, 0);
    }

    private renderImpl(rowHeight: number) {
        const totalHeight = this.options.scrollEnabled ? Math.max(0, (this._totalRows * rowHeight)) : this.getContainerHeight();
        this.scrollContainer.style("height", totalHeight + "px").attr("height", totalHeight);

        this.defaultScrollToFrame(
            this,
            true /*loadMoreData*/,
            this.options.rowHeight || HierarchySlicerTreeView.defaultRowHeight,
            (this.scrollbarInner.node() as HTMLElement).scrollTop,
            this._totalRows,
            this.visibleGroupContainer,
            this.options.baseContainer
        );
    }

    private defaultScrollToFrame(treeView: HierarchySlicerTreeView, loadMoreData: boolean, rowHeight: number, scrollTop: number, totalElements: number, visibleGroupContainer: Selection<any>, baseContainer: Selection<any>) {
        const visibleRows = this.getVisibleRows();
        const scrollPosition = (scrollTop === 0) ? 0 : Math.floor(scrollTop / rowHeight);
        const transformAttr = TranslateWithPixels(0, scrollPosition * rowHeight);
        visibleGroupContainer.style({
            // order matters for proper overriding
            "transform": (d) => transformAttr,
            "-webkit-transform": transformAttr
        });
        const position0 = Math.max(0, Math.min(scrollPosition, totalElements - visibleRows + 1)),
              position1 = position0 + visibleRows;

        this.updateScrollHeight();
        this.performScrollToFrame(position0, position1, totalElements, visibleRows, loadMoreData);
    }

    private performScrollToFrame(position0: number, position1: number, totalRows: number, visibleRows: number, loadMoreData: boolean) {
        const options = this.options;
        const visibleGroupContainer = this.visibleGroupContainer;
        const rowSelection = visibleGroupContainer
            .selectAll(".row")
            .data(<any>this._data.slice(position0, Math.min(position1, totalRows)), <any>this.getDatumIndex);
        rowSelection
            .enter()
            .append("div")
            .classed("row", true)
            .call((d) => options.enter(d));
        rowSelection.order();
        const rowUpdateSelection = visibleGroupContainer.selectAll(".row:not(.transitioning)");
        rowUpdateSelection.call((d) => options.update(d));
        rowSelection
            .exit()
            .call((d) => options.exit(d))
            .remove();
        if (loadMoreData && visibleRows !== totalRows && position1 >= totalRows * HierarchySlicerTreeView.loadMoreDataThreshold)
            options.loadMoreData();
    }

    private setTotalRows(): void {
        let data = this._data;
        this._totalRows = data ? data.length : 0;
    }

    private getVisibleRows(): number {
        const minimumVisibleRows = 1;
        const options = this.options;
        const rowHeight = options.rowHeight;
        const containerHeight = this.getContainerHeight();

        if (!rowHeight || rowHeight < 1) {
            return minimumVisibleRows;
        }

        const viewportRowCount = containerHeight / rowHeight;
        if (this.options.scrollEnabled) {
            return Math.min(Math.ceil(viewportRowCount) + 1, this._totalRows) || minimumVisibleRows;
        }

        return Math.min(Math.floor(viewportRowCount), this._totalRows) || minimumVisibleRows;
    }

    private getRowHeight(): Promise<{}> {
        let cancelMeasurePass;
        const treeView = this;
        const options = treeView.options;

        // render the first item to calculate the row height
        this.defaultScrollToFrame(
            this,
            false /*loadMoreData*/,
            this.options.rowHeight || HierarchySlicerTreeView.defaultRowHeight,
            (this.scrollbarInner.node() as HTMLElement).scrollTop,
            this._totalRows,
            this.visibleGroupContainer,
            this.options.baseContainer
        );

        return new Promise((resolve, reject) => {

            if (cancelMeasurePass) {
                cancelMeasurePass;
            }

            // if there is no data, resolve and return
            if (!(this._data && this._data.length && options)) {
                treeView.rowHeight(HierarchySlicerTreeView.defaultRowHeight);
                return resolve(options.rowHeight);
            }
            const requestAnimationFrameId = window.requestAnimationFrame((() => {
                // Measure row height. Take non empty rows to measure the row height because if the first row is empty, it returns incorrect height
                // which causes scrolling issues.
                let rows = treeView.visibleGroupContainer.selectAll(".row").filter((function () { return this.textContent !== ""; }));
                // For image slicer, the text content will be empty. Hence just select the rows for that and then we use the first row height
                if (rows.empty()) {
                    rows = treeView.visibleGroupContainer.select(".row");
                }
                if (!rows.empty()) {
                    const firstRow = rows.node();

                    // If the container (child) has margins amd the row (parent) doesn"t, the child"s margins will collapse into the parent.
                    // outerHeight doesn"t report the correct height for the parent in this case, but it does measure the child properly.
                    // Fix for #7497261 Measures both and take the max to work around this issue.

                    const rowHeight = Math.max(HierarchySlicerTreeView.outerHeight(firstRow as HTMLElement), HierarchySlicerTreeView.outerHeight(firstRow.firstChild as HTMLElement));

                    treeView.rowHeight(rowHeight);
                    return resolve(rowHeight);
                }
                cancelMeasurePass = undefined;
                window.cancelAnimationFrame(requestAnimationFrameId);
            }));
            cancelMeasurePass = () => {
                window.cancelAnimationFrame(requestAnimationFrameId);
                return reject();
            };

        });
    }

    private static outerHeight(el: HTMLElement): number {
        let height = el.offsetHeight;
        let style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }
}