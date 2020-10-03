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

import simplebar from "simplebar";

import { IHierarchySlicerDataPoint, IHierarchySlicerTreeView, IHierarchySlicerTreeViewOptions } from "./interfaces";

import IViewport = powerbi.IViewport;
import translateWithPixels = manipulation.translateWithPixels;
import { isFirefox } from "./utils";

export module HierarchySlicerTreeViewFactory {
    export function createListView(options: IHierarchySlicerTreeViewOptions): IHierarchySlicerTreeView {
        return new HierarchySlicerTreeView(options);
    }
}

export class HierarchySlicerTreeView implements IHierarchySlicerTreeView {
    private getDatumIndex: (d: IHierarchySlicerDataPoint) => {};
    private _data: any[];
    private _totalRows: number;

    private options: IHierarchySlicerTreeViewOptions;
    private visibleGroupContainer: Selection<any, any, any, any>;
    private scrollContainer: Selection<any, any, any, any>;
    private scrollbarInner: Selection<any, any, any, any>;
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

        this.visibleGroupContainer = this.scrollContainer
            .append("ul")
            .attr("role", "tree")
            .classed("visibleGroup", true);

        this.scrollBar = new simplebar(<HTMLElement>this.scrollbarInner.node(), {
            autoHide: false,
            scrollbarMinSize: 5,
        });
        this.scrollBar.getScrollElement().addEventListener("scroll", () => this.render());

        document.addEventListener("mouseleave", (event) => {
            if (event.buttons === 1) {
                this.mouseClick = true;
            }
        });

        document.addEventListener("mouseenter", (event) => {
            if (this.mouseClick && event.buttons === 0) {
                const newEvent = document.createEvent("MouseEvent");
                newEvent.initEvent("mouseup", false, true);
                document.dispatchEvent(newEvent);
                this.mouseClick = false;
            }
        });

        options.baseContainer.select(".scroll-element").attr("drag-resize-disabled", "true");

        HierarchySlicerTreeView.setDefaultOptions(options);
    }

    private getContainerHeight(): number {
        return (<HTMLElement>this.options.baseContainer.node()).offsetHeight;
    }

    // private getContainerWidth(): number {
    //     return (this.options.baseContainer.node() as HTMLElement).offsetWidth;
    // }

    private static setDefaultOptions(options: IHierarchySlicerTreeViewOptions) {
        options.rowHeight = options.rowHeight || HierarchySlicerTreeView.defaultRowHeight;
    }

    public rowHeight(rowHeight: number): HierarchySlicerTreeView {
        this.options.rowHeight = Math.ceil(rowHeight); // + 2; // Margin top/bottom

        return this;
    }

    public getRealRowHeight(): number {
        return this.options.rowHeight || HierarchySlicerTreeView.defaultRowHeight;
    }

    public isScrollbarVisible(): boolean {
        const bodyHeight = (<HTMLElement>this.options.baseContainer.node()).offsetHeight;
        const scrollHeight = (<HTMLElement>this.scrollContainer.node()).offsetHeight;
        return bodyHeight < scrollHeight;
    }

    public data(
        data: any[],
        getDatumIndex: (d: IHierarchySlicerDataPoint) => {},
        dataReset: boolean = false
    ): IHierarchySlicerTreeView {
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
        this.performScrollToFrame(0, 0, 0, 0, false);
    }

    public render(): void {
        requestAnimationFrame(() => {
            this.renderImpl(this.options.rowHeight);
        });
    }

    private renderImpl(rowHeight: number) {
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
        const transformAttr = translateWithPixels(0, scrollPosition * rowHeight);

        if (!isFirefox()) {
            visibleGroupContainer
                // order matters for proper overriding
                .style("transform", (d) => transformAttr)
                .style("-webkit-transform", transformAttr);
        }
        const position0 = Math.max(0, Math.min(scrollPosition, totalElements - visibleRows + 2)),
            position1 = position0 + visibleRows + 10;

        this.performScrollToFrame(position0, position1, totalElements, visibleRows, loadMoreData);

        this.storeRowHeight();

        const rowUpdateSelection = visibleGroupContainer.selectAll(".row:not(.transitioning)");
        rowUpdateSelection.call((d) => this.options.recalc(d));
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
            // .style("max-height", `${this.getRealRowHeight()}px`)
            .call((d) => options.enter(d));
        rowSelection.order();
        const rowUpdateSelection = visibleGroupContainer.selectAll(".row:not(.transitioning)");
        rowUpdateSelection.call((d) => options.update(d));
        rowSelection
            .exit()
            .call((d) => options.exit(d))
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
            return Math.min(Math.ceil(viewportRowCount), this._totalRows) || minimumVisibleRows;
        }

        return Math.min(Math.floor(viewportRowCount), this._totalRows) || minimumVisibleRows;
    }

    private storeRowHeight() {
        let rows = this.visibleGroupContainer.selectAll(".row").filter(function () {
            return (<HTMLElement>this).textContent !== "";
        });
        if (!rows.empty()) {
            const firstRow = rows.selectAll(".slicerText").node();

            const rowHeight = HierarchySlicerTreeView.outerHeight(<HTMLElement>firstRow);

            this.rowHeight(rowHeight);
        }
    }

    private static outerHeight(el: HTMLElement): number {
        let height = el.offsetHeight;
        const style: CSSStyleDeclaration = getComputedStyle(el);

        // height += parseInt(<string>style.marginTop) + parseInt(<string>style.marginBottom);
        return height;
    }
}
