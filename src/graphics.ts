/*
 *
 * Copyright (c) 2020 Jan Pieter Posthuma / DataScenarios
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
// MDL icons
export class Graphics {
    public static Icons = {
        expandAll: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [["d", "M5 18h6.5v6.5h1.5v-6.5h6.5v-1.5h-6.5v-6.5h-1.5v6.5h-6.5v1.5z"]],
                    },
                ],
            },
        ],
        collapseAll: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [["d", "M5 18h14v-1.5h-14v1.5z"]],
                    },
                ],
            },
        ],
        clearAll: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [["d", "M7 12.5h14v-1.5h-14v1.5z"]],
                    },
                    {
                        element: "path",
                        attributes: [["d", "M5 16.5h14v-1.5h-14v1.5z"]],
                    },
                    {
                        element: "path",
                        attributes: [["d", "M3 20.5h14v-1.5h-14v1.5z"]],
                    },
                ],
            },
        ],

        collapse: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [["d", "M9 7l7 7l-7 7Z"]],
                    },
                    {
                        element: "path",
                        attributes: [
                            ["d", "M0 0h24v24H0z"],
                            ["fill", "none"],
                        ],
                    },
                ],
            },
        ],
        expand: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [["d", "M17 11l0 10l-10 0Z"]],
                    },
                    {
                        element: "path",
                        attributes: [
                            ["d", "M0 0h24v24H0z"],
                            ["fill", "none"],
                        ],
                    },
                ],
            },
        ],

        search: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [
                            [
                                "d",
                                "M15.75 0q1.137 0 2.191 0.293t1.969 0.832 1.67 1.295 1.295 1.67 0.832 1.969 0.293 2.191-0.293 2.191-0.832 1.969-1.295 1.67-1.67 1.295-1.969 0.832-2.191 0.293q-1.465 0-2.807-0.492t-2.467-1.418l-9.199 9.188q-0.223 0.223-0.527 0.223t-0.527-0.223-0.223-0.527 0.223-0.527l9.188-9.199q-0.926-1.125-1.418-2.467t-0.492-2.807q0-1.137 0.293-2.191t0.832-1.969 1.295-1.67 1.67-1.295 1.969-0.832 2.191-0.293zM15.75 15q1.395 0 2.625-0.533t2.145-1.447 1.447-2.145 0.533-2.625-0.533-2.625-1.447-2.145-2.145-1.447-2.625-0.533-2.625 0.533-2.145 1.447-1.447 2.145-0.533 2.625 0.533 2.625 1.447 2.145 2.145 1.447 2.625 0.533z",
                            ],
                        ],
                    },
                ],
            },
        ],
        exact: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [["d", "M0 18v-1.5h24v1.5h-15zM0 10.5h24v1.5h-24v-1.5zM0 4.5v1.5h24v-1.5h19.5z"]],
                    },
                ],
            },
        ],
        wildcard: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [
                            [
                                "d",
                                "M22.77 6.656l-9.27 5.344 9.27 5.344-0.75 1.313-9.27-5.355v10.699h-1.5v-10.699l-9.27 5.355-0.75-1.313 9.27-5.344-9.27-5.344 0.75-1.313 9.27 5.355v-10.699h1.5v10.699l9.27-5.355 0.75 1.313z",
                            ],
                        ],
                    },
                ],
            },
        ],
        start: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [
                            ["d", "M0 18v-1.5h15v1.5h-15zM0 10.5h24v1.5h-24v-1.5zM19.5 4.5v1.5h-19.5v-1.5h19.5z"],
                        ],
                    },
                ],
            },
        ],
        end: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [
                            ["d", "M9 18v-1.5h15v1.5h-15zM0 10.5h24v1.5h-24v-1.5zM5.5 4.5v1.5h19.5v-1.5h19.5z"],
                        ],
                    },
                ],
            },
        ],

        info: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [
                            [
                                "d",
                                "M11.75 0.5q1.559 0 2.994 0.398t2.689 1.131 2.279 1.758 1.758 2.279 1.131 2.689 0.398 2.994-0.398 2.994-1.131 2.689-1.758 2.279-2.279 1.758-2.689 1.131-2.994 0.398-2.994-0.398-2.689-1.131-2.279-1.758-1.758-2.279-1.131-2.689-0.398-2.994 0.398-2.994 1.131-2.689 1.758-2.279 2.279-1.758 2.689-1.131 2.994-0.398zM11.75 21.5q1.336 0 2.584-0.352t2.332-0.984 1.975-1.523 1.523-1.975 0.984-2.326 0.352-2.59q0-1.336-0.352-2.584t-0.984-2.332-1.523-1.975-1.975-1.523-2.332-0.984-2.584-0.352q-1.348 0-2.59 0.352t-2.326 0.984-1.975 1.523-1.523 1.975-0.984 2.332-0.352 2.584 0.352 2.584 0.984 2.332 1.523 1.975 1.975 1.523 2.326 0.984 2.59 0.352zM11 6.5h1.5v7.5h-1.5v-7.5zM11 15.5h1.5v1.5h-1.5v-1.5z",
                            ],
                        ],
                    },
                ],
            },
        ],
        triangle: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [["d", "M22.5 11.566l-11.566-11.566h11.566v11.566z"]],
                    },
                ],
            },
        ],
        horizontaldots: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [
                            [
                                "d",
                                "M3 10.5q0.316 0 0.586 0.117t0.475 0.322 0.322 0.475 0.117 0.586-0.117 0.586-0.322 0.475-0.475 0.322-0.586 0.117-0.586-0.117-0.475-0.322-0.322-0.475-0.117-0.586 0.117-0.586 0.322-0.475 0.475-0.322 0.586-0.117zM12 10.5q0.316 0 0.586 0.117t0.475 0.322 0.322 0.475 0.117 0.586-0.117 0.586-0.322 0.475-0.475 0.322-0.586 0.117-0.586-0.117-0.475-0.322-0.322-0.475-0.117-0.586 0.117-0.586 0.322-0.475 0.475-0.322 0.586-0.117zM21 10.5q0.316 0 0.586 0.117t0.475 0.322 0.322 0.475 0.117 0.586-0.117 0.586-0.322 0.475-0.475 0.322-0.586 0.117-0.586-0.117-0.475-0.322-0.322-0.475-0.117-0.586 0.117-0.586 0.322-0.475 0.475-0.322 0.586-0.117z",
                            ],
                        ],
                    },
                ],
            },
        ],
        verticaldots: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 24 24"],
                    ["height", "100%"],
                    ["width", "100%"],
                ],
                children: [
                    {
                        element: "path",
                        attributes: [
                            [
                                "d",
                                "M20 19.5q0.316 0 0.586 0.117t0.475 0.322 0.322 0.475 0.117 0.586-0.117 0.586-0.322 0.475-0.475 0.322-0.586 0.117-0.586-0.117-0.475-0.322-0.322-0.475-0.117-0.586 0.117-0.586 0.322-0.475 0.475-0.322 0.586-0.117zM20 10.5q0.316 0 0.586 0.117t0.475 0.322 0.322 0.475 0.117 0.586-0.117 0.586-0.322 0.475-0.475 0.322-0.586 0.117-0.586-0.117-0.475-0.322-0.322-0.475-0.117-0.586 0.117-0.586 0.322-0.475 0.475-0.322 0.586-0.117zM20 4.5q-0.316 0-0.586-0.117t-0.475-0.322-0.322-0.475-0.117-0.586 0.117-0.586 0.322-0.475 0.475-0.322 0.586-0.117 0.586 0.117 0.475 0.322 0.322 0.475 0.117 0.586-0.117 0.586-0.322 0.475-0.475 0.322-0.586 0.117z",
                            ],
                        ],
                    },
                ],
            },
        ],
        watermark: [
            {
                element: "svg",
                attributes: [
                    ["viewBox", "0 0 400 300"],
                    ["x", "0px"],
                    ["y", "0px"],
                    ["xmlns:xml", "http://www.w3.org/XML/1998/namespace"], // tslint:disable-line: no-http-string
                    ["xml:space", "preserve"],
                    ["enable-background", "new 0 0 400 300"],
                ],
                children: [
                    {
                        element: "rect",
                        attributes: [
                            ["fill", "#f4f4f4"],
                            ["x", "-0.1"],
                            ["y", "0"],
                            ["width", "400.1"],
                            ["height", "300"],
                        ],
                    },
                    {
                        element: "rect",
                        attributes: [
                            ["fill", "#d0d2d3"],
                            ["x", "11.8"],
                            ["y", "17.7"],
                            ["width", "34.7"],
                            ["height", "15.3"],
                        ],
                    },
                    {
                        element: "line",
                        attributes: [
                            ["fill", "none"],
                            ["stroke", "#d0d2d3"],
                            ["stroke-miterlimit", "10"],
                            ["x1", "3.4"],
                            ["y1", "44.3"],
                            ["x2", "389.4"],
                            ["y2", "44.3"],
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "34.1"],
                                    ["y", "57"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "12.8"],
                                    ["y", "55"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "44.1"],
                                    ["y", "81"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "22.8"],
                                    ["y", "79"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "44.1"],
                                    ["y", "105"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "22.8"],
                                    ["y", "103"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "34.1"],
                                    ["y", "129"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "12.8"],
                                    ["y", "127"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "44.1"],
                                    ["y", "153"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "22.8"],
                                    ["y", "151"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "54.1"],
                                    ["y", "177"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "32.8"],
                                    ["y", "175"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "54.1"],
                                    ["y", "201"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "32.8"],
                                    ["y", "199"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "44.1"],
                                    ["y", "225"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "22.8"],
                                    ["y", "223"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "34.1"],
                                    ["y", "249"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "12.8"],
                                    ["y", "247"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                    {
                        element: "g",
                        children: [
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "#d0d2d3"],
                                    ["x", "44.1"],
                                    ["y", "273"],
                                    ["width", "33.8"],
                                    ["height", "7.7"],
                                ],
                            },
                            {
                                element: "rect",
                                attributes: [
                                    ["fill", "none"],
                                    ["stroke", "#d0d2d3"],
                                    ["stroke-miterlimit", "10"],
                                    ["stroke-width", "2"],
                                    ["x", "22.8"],
                                    ["y", "271"],
                                    ["width", "11.3"],
                                    ["height", "11.3"],
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    public static EXPANDALL(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.expandAll);
    }

    public static COLLAPSEALL(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.collapseAll);
    }

    public static CLEARALL(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.clearAll);
    }

    public static EXPAND(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.expand);
    }

    public static COLLAPSE(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.collapse);
    }

    public static SEARCH(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.search);
    }

    public static EXACT(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.exact);
    }

    public static WILDCARD(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.wildcard);
    }

    public static START(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.start);
    }

    public static END(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.end);
    }

    public static INFO(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.info);
    }

    public static TRIANGLE(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.triangle);
    }

    public static HORIZONTALDOTS(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.horizontaldots);
    }

    public static VERTICALDOTS(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.verticaldots);
    }

    public static EMPTYROOT(root: HTMLElement): void {
        if (root.hasChildNodes()) root.removeChild(<HTMLElement>root.firstChild);
    }

    public static WATERMARK(root: HTMLElement): void {
        Graphics.createChildren(root, Graphics.Icons.watermark);
    }

    private static createChildren(root: HTMLElement, children: any[]) {
        children.forEach(child => {
            const element: HTMLElement = document.createElementNS("http://www.w3.org/2000/svg", child.element); // tslint:disable-line: no-http-string
            if (child.attributes) {
                (<any[]>child.attributes).forEach(info => {
                    element.setAttribute(info[0], info[1]);
                });
            }
            if (child.children) {
                Graphics.createChildren(element, child.children);
            }
            root.appendChild(element);
        });
    }
}
