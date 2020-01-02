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
        expandAll:
            '<svg  width="100%" height="100%" viewBox="0 0 24 24"><path d="M19 18h-6v6h-2v-6h-6v-2h6v-6h2v6h6v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        collapseAll:
            '<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M19 18h-14v-2h14v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        clearAll:
            '<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M5 15h14v-2h-14v2zm-2 4h14v-2h-14v2zm-2 4h14v-2h-14v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        collapse:
            '<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M9 5l7 7l-7 7Z" /><path d="M0 0h24v24H0z" fill="none"/></svg>',
        expand:
            '<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M17 9l0 10l-10 0Z" /><path d="M0 0h24v24H0z" fill="none"/></svg>',
        checkboxTick:
            '<svg width="100%" height="100%" viewBox="0 0 1 1"><path d="M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z" style="fill:#ffffff;fill-opacity:1;stroke:none" /></svg>',
        search:
            '<svg  width="100%" height="100%" viewBox="0 0 24 24"><path d="M15.75 15q1.371 0 2.602-0.521t2.168-1.459 1.459-2.168 0.521-2.602-0.521-2.602-1.459-2.168-2.168-1.459-2.602-0.521-2.602 0.521-2.168 1.459-1.459 2.168-0.521 2.602 0.521 2.602 1.459 2.168 2.168 1.459 2.602 0.521zM7.5 8.25q0-3.41 1.98-5.391t3.568-2.42 3.85-0.439 4.242 1.98 2.42 3.568 0.439 3.85-1.98 4.242-3.568 2.42-2.701 0.439q-2.93 0-5.273-1.91l-9.199 9.188q-0.223 0.223-0.527 0.223t-0.527-0.223-0.223-0.527 0.223-0.527l9.188-9.199q-1.91-2.344-1.91-5.273z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        delete:
            '<svg  width="100%" height="100%" viewBox="0 0 24 24"><path d="M10.889 10l8.926 8.936-0.879 0.879-8.936-8.926-8.936 8.926-0.879-0.879 8.926-8.936-8.926-8.936 0.879-0.879 8.936 8.926 8.936-8.926 0.879 0.879z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        // tslint:disable-next-line: prettier
        watermark:
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" x="0px" y="0px" xmlns:xml="http://www.w3.org/XML/1998/namespace" xml:space="preserve" enable-background="new 0 0 400 300">
                <rect fill="#f4f4f4" x="-0.1" y="0" width="400.1" height="300" />
                <rect fill="#d0d2d3" x="11.8" y="17.7" width="34.7" height="15.3" />
                <line fill="none" stroke="#d0d2d3" stroke-miterlimit="10" x1="3.4" y1="44.3" x2="389.4" y2="44.3" />
                <g><rect fill="#d0d2d3" x="34.1" y="57" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="12.8" y="55" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="44.1" y="81" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="79" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="44.1" y="105" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="103" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="34.1" y="129" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="12.8" y="127" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="44.1" y="153" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="151" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="54.1" y="177" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="32.8" y="175" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="54.1" y="201" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="32.8" y="199" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="44.1" y="225" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="223" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="34.1" y="249" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="12.8" y="247" width="11.3" height="11.3" /></g>
                <g><rect fill="#d0d2d3" x="44.1" y="273" width="33.8" height="7.7" /><rect fill="none" stroke="#d0d2d3" stroke-miterlimit="10" stroke-width="2" x="22.8" y="271" width="11.3" height="11.3" /></g>
            </svg>`,
    };
}
