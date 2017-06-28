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
    // powerbi.extensibility.utils.dataview
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    import IMargin = powerbi.extensibility.utils.svg.IMargin;
    export class HierarchySlicerSettings extends DataViewObjectsParser {
        public general: GeneralSettings = new GeneralSettings();

        public margin: IMargin = {
            top: 50,
            bottom: 50,
            right: 50,
            left: 50
        };
        public selection: SelectionSettings = new SelectionSettings();
        public header: HeaderSettings = new HeaderSettings();
        public headerText: HeaderTextSettings = new HeaderTextSettings();
        public slicerText: SlicerTextSettings = new SlicerTextSettings();
        public slicerItemContainer: SlicerItemContainerSettings = new SlicerItemContainerSettings();
        public items: ItemSettings = new ItemSettings();
    }

    class SelectionSettings {
        public singleSelect: boolean = true;
    }

    class GeneralSettings {
        public selection: string = "";
        public filterValues: string = "";
        public expanded: boolean = false;
        public hidden: boolean = false;
        public formatString: string = "";
        public selfFilterEnabled: boolean = false;
        public filter: string = "";
        public outlineColor: string = "#808080";
        public outlineWeight: number = 1;

        public version: string = "801";
    }
    class HeaderSettings {
        public show: boolean = true;
        public title: string = "";
        public fontColor: string = "#666666";
        public background: string = undefined;
        public textSize: string = "12";
        public borderBottomWidth: number = 1;
    }

    class HeaderTextSettings {
        public marginLeft: number = 8;
        public marginTop: number = 0;
    }

    class SlicerTextSettings {
        public emptyLeafs: boolean = false;
        public textSize: number = 12;
        public height: number = 18;
        public width: number = 0;
        public fontColor: string = "#666666";
        public hoverColor: string = "#212121";
        public selectedColor: string = "#444444";
        public unselectedColor: string = "#ffffff";
        public disabledColor: string = "grey";
        public marginLeft: number = 8;
        public outline: string = "Frame";
        public background: string = undefined;
        public transparency: number = 0;
        public outlineColor: string = "#000000";
        public outlineWeight: number = 1;
        public borderStyle: string = "Cut";
    }

    class SlicerItemContainerSettings {
        public marginTop: number = 5;
        public marginLeft: number = 0;
    }

    class ItemSettings {
        public fontColor: string = "#666666";
        public background: string = undefined;
        public selectedColor: string = "#444444";
        public hoverColor: string = "#212121";
        public textSize: string = "12";
    }
}