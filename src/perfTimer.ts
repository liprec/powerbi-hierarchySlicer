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

export class PerfTimer {
    public static START(name: string, enabled: boolean = false) {
        let performance: Performance = window.performance;
        if (!performance || !performance.mark || !enabled) return () => {};
        if (console.time) console.time(name);
        let startMark: string = name + " start";
        performance.mark(startMark);
        console.log(startMark);
        return () => {
            let end: string = name + " end";
            performance.mark(end);
            // NOTE: Chromium supports performance.mark but not performance.measure.
            if (performance.measure) performance.measure(name, startMark, end);
            if (console.timeEnd) console.timeEnd(name);
        };
    }

    public static LOGTIME(action: any) {
        // Desktop"s old Chromium doesn"t support use of Performance Markers yet
        let start: number = Date.now();
        action();
        return Date.now() - start;
    }

    public static LOGMSG(message: string, enabled: boolean = false) {
        if (!enabled) return () => {};
        console.log(message);
    }
}
