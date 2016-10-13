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
    // powerbi.extensibility.utils.type
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    // powerbi.extensibility.utils.svg
    import SVGUtil = powerbi.extensibility.utils.svg;
    // d3
    import Selection = d3.Selection;

    export interface HierarchySlicerTreeViewOptions {
        enter: (selection: Selection<any>) => void;
        exit: (selection: Selection<any>) => void;
        update: (selection: Selection<any>) => void;
        //loadMoreData: () => void;
        baseContainer: Selection<any>;
        rowHeight: number;
        viewport: IViewport;
        scrollEnabled: boolean;
        //isReadMode: () => boolean;
    }

    export interface IHierarchySlicerTreeView {
        data(data: any[], dataIdFunction: (d) => {}, dataAppended: boolean): IHierarchySlicerTreeView;
        rowHeight(rowHeight: number): IHierarchySlicerTreeView;
        viewport(viewport: IViewport): IHierarchySlicerTreeView;
        render(): void;
        empty(): void;
    }

    export module HierarchySlicerTreeViewFactory {
        export function createListView(options): IHierarchySlicerTreeView {
            return new HierarchySlicerTreeView(options);
        }
    }

    /**
     * A UI Virtualized List, that uses the D3 Enter, Update & Exit pattern to update rows.
     * It can create lists containing either HTML or SVG elements.
     */
    class HierarchySlicerTreeView implements IHierarchySlicerTreeView {
        private getDatumIndex: (d: any) => {};
        private _data: any[];
        private _totalRows: number;

        private options: HierarchySlicerTreeViewOptions;
        private visibleGroupContainer: Selection<Element>;
        private scrollContainer: Selection<Element>;
        private scrollbarInner: Selection<Element>;
        private renderTimeoutId: number;

        /**
         * The value indicates the percentage of data already shown
         * in the list view that triggers a loadMoreData call.
         */
        private static loadMoreDataThreshold = 0.8;
        private static defaultRowHeight = 1;

        public constructor(options: HierarchySlicerTreeViewOptions) {
            // make a copy of options so that it is not modified later by caller
            this.options = $.extend(true, {}, options);

            this.options.baseContainer
                //.style("overflow-y", "auto")
                .attr("drag-resize-disabled", true);

            this.scrollbarInner = options.baseContainer
                .append("div")
                .classed("scrollbar-inner", true)

            this.scrollContainer = this.scrollbarInner
                .append("div")
                .classed("scrollRegion", true);

            this.visibleGroupContainer = this.scrollContainer
                .append("div")
                .classed("visibleGroup", true);

            HierarchySlicerTreeView.SetDefaultOptions(options);
        }

        private static SetDefaultOptions(options: HierarchySlicerTreeViewOptions) {
            options.rowHeight = options.rowHeight || HierarchySlicerTreeView.defaultRowHeight;
        }

        public rowHeight(rowHeight: number): HierarchySlicerTreeView {
            this.options.rowHeight = Math.ceil(rowHeight);// + 2; // Margin top/bottom

            return this;
        }

        public data(data: any[], getDatumIndex: (d) => {}, dataReset: boolean = false): IHierarchySlicerTreeView {
            this._data = data;
            this.getDatumIndex = getDatumIndex;

            this.setTotalRows();

            if (dataReset)
                $(this.scrollbarInner.node()).scrollTop(0);

            return this;
        }

        public viewport(viewport: IViewport): IHierarchySlicerTreeView {
            this.options.viewport = viewport;

            return this;
        }

        public empty(): void {
            this._data = [];
            this.render();
        }

        public render(): void {
            let options = this.options;
            let visibleGroupContainer = this.visibleGroupContainer;
            let totalRows = this._totalRows;
            let rowHeight = options.rowHeight || HierarchySlicerTreeView.defaultRowHeight;
            let visibleRows = this._totalRows; //this.getVisibleRows() || 1;
            let scrollTop: number = 0; //this.scrollbarInner.node().scrollTop;
            let scrollPosition = (scrollTop === 0) ? 0 : Math.floor(scrollTop / rowHeight);
            let transformAttr = SVGUtil.translateWithPixels(0, scrollPosition * rowHeight);

            let rowSelection = visibleGroupContainer
                .selectAll(".row")
                .data(<HierarchySlicerDataPoint[]>this._data);

            rowSelection
                .enter()
                .append("div")
                .classed("row", true)

            rowSelection
                .style({
                    "height": PixelConverter.fromPointToPixel(this.options.rowHeight) + "px"
                });

            rowSelection.call((selection: Selection<any>) => {
                options.enter(selection);
            });

            rowSelection.call((selection: Selection<any>) => {
                options.update(selection);
            });

            rowSelection
                .exit()
                .call(d => options.exit(d))
                .remove();
        }

        private setTotalRows(): void {
            let data = this._data;
            this._totalRows = data ? data.length : 0;
        }

        private getVisibleRows(): number {
            let minimumVisibleRows = 1;
            let rowHeight = this.options.rowHeight;
            let viewportHeight = this.options.viewport.height;

            if (!rowHeight || rowHeight < 1)
                return minimumVisibleRows;

            if (this.options.scrollEnabled)
                return Math.min(Math.ceil(viewportHeight / rowHeight), this._totalRows) || minimumVisibleRows;

            return Math.min(Math.floor(viewportHeight / rowHeight), this._totalRows) || minimumVisibleRows;
        }
    }
}