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

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";

import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

import { BorderStyle, FontStyle, FontWeight, HideMembers, Zoomed } from "./enums";

const fontFamily: string = "wf_standard-font,helvetica,arial,sans-serif";

export class HierarchySlicerSettings extends DataViewObjectsParser {
    public general: GeneralSettings = new GeneralSettings();
    public selection: SelectionSettings = new SelectionSettings();
    public header: HeaderSettings = new HeaderSettings();
    public items: SlicerTextSettings = new SlicerTextSettings();
    public search: SearchSettings = new SearchSettings();
    public mobile: MobileSettings = new MobileSettings();
}

class GeneralSettings {
    public selectAll: boolean = false;
    public filterValues: string | undefined = undefined;
    public expanded: string = "";
    public selfFilterEnabled: boolean = false;
    public searching: boolean = false;
    public filter: string = "";
    public spinnerDelay: number = 250;
    public maxDataPoints: number = 30000;
}

class SelectionSettings {
    public singleSelect: boolean = true;
    public emptyLeafs: boolean | undefined = undefined;
    public hideMembers: HideMembers = HideMembers.Never;
    public emptyLeafLabel: string = "";
    public emptyString: boolean = true;
    public emptyLeafLabelDefault: string = "(Blank)";
    public selectAll: boolean = false;
    public selectAllLabel: string = "Select All";
}

class HeaderSettings {
    public show: boolean = true;
    public title: string = "";
    public defaultTitle: string = "";
    public restatement: boolean = false;
    public fontColor: string = "#666666";
    public background: string = "";
    public outline: BorderStyle = BorderStyle.None;
    public textSize: number = 10;
    public fontFamily: string = fontFamily;
    public fontStyle: number = FontStyle.Normal;
    public fontWeight: number = FontWeight.Normal;
    public borderBottomWidth: number = 1;
    public outlineWeight: number = 1;
    public outlineColor: string = "#A6A6A6";
    public textSizeZoomed: number = 10;
}

class SlicerTextSettings {
    public fontColor: string = "#666666";
    public hoverColor: string = "#212121";
    public selectedColor: string = "#444444";
    public background: string = "";
    public textSize: number = 10;
    public fontFamily: string = fontFamily;
    public fontStyle: number = FontStyle.Normal;
    public fontWeight: number = FontWeight.Normal;
    public textSizeZoomed: number = 10;
}

class SearchSettings {
    public addSelection: boolean = true;
    public fontColor: string = "#808080";
    public iconColor: string = "#666666";
    public background: string = "";
    public fontFamily: string = fontFamily;
    public textSize: number = 10;
    public textSizeZoomed: number = 10;
}

class MobileSettings {
    public enable: boolean = false;
    public title: boolean = true;
    public focus: boolean = true;
    public enLarge: number = Zoomed.Normal;
    public zoomed: boolean = false;
}