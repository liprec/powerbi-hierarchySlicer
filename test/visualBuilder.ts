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

// powerbi
import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

// powerbi.extensibility
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

// powerbi.extensibility.utils.test
import { VisualBuilderBase, MockISelectionManager, MockIVisualHost } from "powerbi-visuals-utils-testutils";

import { HierarchySlicer } from "../src/hierarchySlicer";

export class HierarchySlicerBuilder extends VisualBuilderBase<HierarchySlicer> {
    public selectionManager: SelectionManagerWithBookmarks;

    constructor(width: number, height: number) {
        super(width, height, "HierarchySlicer1458836712039");
    }

    protected build(options: VisualConstructorOptions): HierarchySlicer {
        options.host.createSelectionManager = () => {
            this.selectionManager = new SelectionManagerWithBookmarks();
            // this.visualHost = new SimulatedVisualHost();
            return this.selectionManager;
        };

        return new HierarchySlicer(options);
    }

    public get instance(): HierarchySlicer {
        return this.visual;
    }
}

export class SelectionManagerWithBookmarks extends MockISelectionManager {
    private selectionCallback: (ids: ISelectionId[]) => void;
    private selectedSelectionIds: ISelectionId[] = [];

    public registerOnSelectCallback(callback: (ids: ISelectionId[]) => void): void {
        this.selectionCallback = callback;
    }

    public sendSelectionToCallback(selectionIds: ISelectionId[]): void {
        this.selectedSelectionIds = selectionIds;
        this.selectionCallback(selectionIds);
    }

    public getSelectionIds(): ISelectionId[] {
        return this.selectedSelectionIds as ISelectionId[];
    }
}

export class SimulatedVisualHost extends MockIVisualHost {

}