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
import { manipulation } from "powerbi-visuals-utils-svgutils";
import { Selection } from "d3-selection";

import { extend } from "lodash-es";

import SimpleBar from "simplebar";

import * as interfaces from "./interfaces";

import IViewport = powerbi.IViewport;
import TranslateWithPixels = manipulation.translateWithPixels;

import IHierarchySlicerTreeView = interfaces.IHierarchySlicerTreeView;
import IHierarchySlicerTreeViewOptions = interfaces.IHierarchySlicerTreeViewOptions;

export module HierarchySlicerTreeViewFactory {
    export function createListView(options: IHierarchySlicerTreeViewOptions): IHierarchySlicerTreeView {
        return new HierarchySlicerTreeView(options);
    }
}

export class HierarchySlicerTreeView implements IHierarchySlicerTreeView {
    private getDatumIndex: (d: any) => {};
    private _data: any[];
    private _totalRows: number;

    private options: IHierarchySlicerTreeViewOptions;
    private visibleGroupContainer: Selection<any, any, any, any>;
    private scrollContainer: Selection<any, any, any, any>;
    private scrollbarInner: Selection<any, any, any, any>;
    private renderTimeoutId: number | undefined;
    private scrollBar: any;
    private mouseClick: boolean = false;

    /**
     * The value indicates the percentage of data already shown
     * in the list view that triggers a loadMoreData call.
     */
    private static loadMoreDataThreshold = 0.8;
    private static defaultRowHeight = 1;

    public constructor(options: IHierarchySlicerTreeViewOptions) {
        // make a copy of options so that it is not modified later by caller
        this.options = extend(true, {}, options);

        this.scrollbarInner = options.baseContainer.append("div").classed("scrollbar-inner", true);

        this.scrollContainer = this.scrollbarInner.append("div").classed("scrollRegion", true);

        this.visibleGroupContainer = this.scrollContainer.append("div").classed("visibleGroup", true);

        this.scrollBar = new SimpleBar(this.scrollbarInner.node() as HTMLElement);
        this.scrollBar.getScrollElement().addEventListener("scroll", () => {
            this.renderImpl(this.options.rowHeight);
        });

        document.addEventListener("mouseleave", event => {
            if (event.buttons === 1) {
                this.mouseClick = true;
            }
        });

        document.addEventListener("mouseenter", event => {
            if (this.mouseClick && event.buttons === 0) {
                const newEvent = document.createEvent("MouseEvent");
                newEvent.initEvent("mouseup", false, true);
                document.dispatchEvent(newEvent);
                this.mouseClick = false;
            }
        });

        options.baseContainer.select(".scroll-element").attr("drag-resize-disabled", "true");

        HierarchySlicerTreeView.SetDefaultOptions(options);
    }

    private getContainerHeight(): number {
        return (this.options.baseContainer.node() as HTMLElement).offsetHeight;
    }

    // private getContainerWidth(): number {
    //     return (this.options.baseContainer.node() as HTMLElement).offsetWidth;
    // }

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

    public data(data: any[], getDatumIndex: (d: any) => {}, dataReset: boolean = false): IHierarchySlicerTreeView {
        this._data = data;
        this.getDatumIndex = getDatumIndex;

        this.setTotalRows();

        if (dataReset) {
            this.scrollBar.getScrollElement().scrollTop = 0;
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
        if (this.renderTimeoutId) window.clearTimeout(this.renderTimeoutId);
        this.renderTimeoutId = window.setTimeout(() => {
            this.getRowHeight().then((rowHeight: number) => this.renderImpl(rowHeight));
            this.renderTimeoutId = undefined;
        }, 100);
    }

    private renderImpl(rowHeight: number) {
        const totalHeight = this.options.scrollEnabled
            ? Math.max(0, this._totalRows * rowHeight)
            : this.getContainerHeight();

        this.defaultScrollToFrame(
            this,
            this.options.moreData,
            this.options.rowHeight || HierarchySlicerTreeView.defaultRowHeight,
            this.scrollBar.getScrollElement().scrollTop,
            this._totalRows,
            this.visibleGroupContainer,
            this.options.baseContainer
        );
    }

    private defaultScrollToFrame(
        treeView: HierarchySlicerTreeView,
        loadMoreData: boolean,
        rowHeight: number,
        scrollTop: number,
        totalElements: number,
        visibleGroupContainer: Selection<any, any, any, any>,
        baseContainer: Selection<any, any, any, any>
    ) {
        const visibleRows = this.getVisibleRows();
        const scrollPosition = scrollTop === 0 ? 0 : Math.floor(scrollTop / rowHeight);
        const transformAttr = TranslateWithPixels(0, scrollPosition * rowHeight);
        visibleGroupContainer
            // order matters for proper overriding
            .style("transform", d => transformAttr)
            .style("-webkit-transform", transformAttr);
        const position0 = Math.max(0, Math.min(scrollPosition, totalElements - visibleRows + 1)),
            position1 = position0 + visibleRows + 10;

        this.performScrollToFrame(position0, position1, totalElements, visibleRows, loadMoreData);
    }

    private performScrollToFrame(
        position0: number,
        position1: number,
        totalRows: number,
        visibleRows: number,
        loadMoreData: boolean
    ) {
        const options = this.options;
        const visibleGroupContainer = this.visibleGroupContainer;

        const rowSelection = visibleGroupContainer
            .selectAll(".row")
            .data(<any>this._data.slice(position0, Math.min(position1, totalRows)), <any>this.getDatumIndex);
        rowSelection
            .enter()
            .append("div")
            .classed("row", true)
            .call(d => options.enter(d));
        rowSelection.order();
        const rowUpdateSelection = visibleGroupContainer.selectAll(".row:not(.transitioning)");
        rowUpdateSelection.call(d => options.update(d));
        rowSelection
            .exit()
            .call(d => options.exit(d))
            .remove();
        if (loadMoreData) options.loadMoreData(); // && visibleRows !== totalRows && position1 >= totalRows * HierarchySlicerTreeView.loadMoreDataThreshold)
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
        let cancelMeasurePass: any;
        const treeView = this;
        const options = treeView.options;

        // render the first item to calculate the row height
        this.defaultScrollToFrame(
            this,
            this.options.moreData,
            this.options.rowHeight || HierarchySlicerTreeView.defaultRowHeight,
            this.scrollBar.getScrollElement().scrollTop,
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
            const requestAnimationFrameId = window.requestAnimationFrame(d => {
                // Measure row height. Take non empty rows to measure the row height because if the first row is empty, it returns incorrect height
                // which causes scrolling issues.
                let rows = treeView.visibleGroupContainer.selectAll(".row").filter(function() {
                    return (this as HTMLElement).textContent !== "";
                });
                // For image slicer, the text content will be empty. Hence just select the rows for that and then we use the first row height
                if (rows.empty()) {
                    rows = treeView.visibleGroupContainer.select(".row");
                }
                if (!rows.empty()) {
                    const firstRow = rows.node();

                    // If the container (child) has margins amd the row (parent) doesn"t, the child"s margins will collapse into the parent.
                    // outerHeight doesn"t report the correct height for the parent in this case, but it does measure the child properly.
                    // Fix for #7497261 Measures both and take the max to work around this issue.

                    const rowHeight = Math.max(
                        HierarchySlicerTreeView.outerHeight(firstRow as HTMLElement),
                        HierarchySlicerTreeView.outerHeight((firstRow as HTMLHtmlElement).firstChild as HTMLElement)
                    );

                    treeView.rowHeight(rowHeight);
                    return resolve(rowHeight);
                }
                cancelMeasurePass = undefined;
                window.cancelAnimationFrame(requestAnimationFrameId);
            });
            cancelMeasurePass = () => {
                window.cancelAnimationFrame(requestAnimationFrameId);
                return reject();
            };
        });
    }

    private static outerHeight(el: HTMLElement): number {
        let height = el.offsetHeight;
        const style: CSSStyleDeclaration = getComputedStyle(el);

        height += parseInt(style.marginTop as string) + parseInt(style.marginBottom as string);
        return height;
    }
}
