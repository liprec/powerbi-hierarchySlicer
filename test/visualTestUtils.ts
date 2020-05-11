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
import { FontStyle } from "../src/enums";

export function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : "";
}

export function fontFamilyString(fontFamily: string) {
    return fontFamily.replace(/'/g, '"');
}

export function fontStyleString(fontStyle: FontStyle) {
    switch (fontStyle) {
        case FontStyle.Normal:
            return "normal";
        case FontStyle.Italic:
            return "italic";
    }
}

export function fontSizeString(fontSize: number) {
    return `${fontSize}pt`;
}

export function measurePixelString(measure: number, ptpx: string = "px") {
    const numberOfAllDigits = 6;
    const numberOfDigits =
        numberOfAllDigits - (measure < 0 ? Math.ceil(measure) : Math.floor(measure)).toString().length;
    return `${Math.round(measure * Math.pow(10, numberOfDigits)) / Math.pow(10, numberOfDigits)}${ptpx}`;
}
