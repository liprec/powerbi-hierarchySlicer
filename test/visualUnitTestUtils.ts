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

import { parseOwnId, parseExpand, parseOldOwnId, parseNewOwnId } from "../src/utils";

export function testparseOldOwnId() {
    describe("Unit test parseOldOwnId()", () => {
        it("Parse '|~2013-0_|~Qtr 1-1'", done => {
            const input: string = "|~2013-0_|~Qtr 1-1";
            const expectedResult: string[] = ["2013", "Qtr 1"];
            const result: string[] = parseOldOwnId(input);
            expect(result).toEqual(expectedResult);
            done();
        });

        it("Parse '|~2013-0'", done => {
            const input: string = "|~2013-0";
            const expectedResult: string[] = ["2013"];
            const result: string[] = parseOldOwnId(input);
            expect(result).toEqual(expectedResult);
            done();
        });
    });
}

export function testparseNewOwnId() {
    describe("Unit test parseNewOwnId()", () => {
        it("Parse '|~2013~|~Qtr 1~|'", done => {
            const input: string = "|~2013~|~Qtr 1~|";
            const expectedResult: string[] = ["2013", "Qtr 1"];
            const result: string[] = parseNewOwnId(input);
            expect(result).toEqual(expectedResult);
            done();
        });

        it("Parse '|~2013~|'", done => {
            const input: string = "|~2013~|";
            const expectedResult: string[] = ["2013"];
            const result: string[] = parseNewOwnId(input);
            expect(result).toEqual(expectedResult);
            done();
        });
    });
}

export function testparseOwnId() {
    describe("Unit test parseOwnId()", () => {
        it("Parse '|~2013-0_|~Qtr 1-1' (old)", done => {
            const input: string = "|~2013-0_|~Qtr 1-1";
            const expectedResult: string[] = ["2013", "Qtr 1"];
            const result: string[] = parseOwnId(input);
            expect(result).toEqual(expectedResult);
            done();
        });

        it("Parse '|~2013~|~Qtr 1~|' (new)", done => {
            const input: string = "|~2013~|~Qtr 1~|";
            const expectedResult: string[] = ["2013", "Qtr 1"];
            const result: string[] = parseNewOwnId(input);
            expect(result).toEqual(expectedResult);
            done();
        });
    });
}

export function testparseExpand() {
    describe("Unit test parseOwnId()", () => {
        it("Parse '|~2013~|~Qtr 1~|*|*|~2014~|'", done => {
            const input: string = "|~2013~|~Qtr 1~|*|*|~2014~|";
            const expectedResult: string[][] = [["2013", "Qtr 1"], ["2014"]];
            const result: string[][] = parseExpand(input);
            expect(result).toEqual(expectedResult);
            done();
        });

        it("Parse '|~2013-0_|~Qtr 1-1,|~2014-0'", done => {
            const input: string = "|~2013-0_|~Qtr 1-1,|~2014-0";
            const expectedResult: string[][] = [["2013", "Qtr 1"], ["2014"]];
            const result: string[][] = parseExpand(input);
            expect(result).toEqual(expectedResult);
            done();
        });

        it("Parse empty string ''", done => {
            const input: string = "";
            const expectedResult: string[][] = [];
            const result: string[][] = parseExpand(input);
            expect(result).toEqual(expectedResult);
            done();
        });

        it("Parse '|~Last name, Name~|'", done => {
            const input: string = "|~Last name, Name~|";
            const expectedResult: string[][] = [["Last name, Name"]];
            const result: string[][] = parseExpand(input);
            expect(result).toEqual(expectedResult);
            done();
        });

        it("Parse '|~Last name, Name~|*|*|~Last name 2, Name 2~|'", done => {
            const input: string = "|~Last name, Name~|*|*|~Last name 2, Name 2~|";
            const expectedResult: string[][] = [["Last name, Name"], ["Last name 2, Name 2"]];
            const result: string[][] = parseExpand(input);
            expect(result).toEqual(expectedResult);
            done();
        });
    });
}
