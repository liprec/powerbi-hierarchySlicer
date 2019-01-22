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

import powerbi from "powerbi-visuals-api";
import { valueFormatter, textMeasurementService} from "powerbi-visuals-utils-formattingutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import PrimitiveValue = powerbi.PrimitiveValue;

import PixelConverter = pixelConverter;
import TextProperties = textMeasurementService.TextProperties;
import TextMeasurementService = textMeasurementService.textMeasurementService;

import { HierarchySlicer } from "../src/hierarchySlicer";

import { HierarchySlicerBuilder } from "./visualBuilder";
import { HierarchyData } from "./visualData";
import { HierarchySlicerSettings } from "../src/settings";

describe("HierachySlicer", () => {
    let visualBuilder: HierarchySlicerBuilder,
        defaultDataViewBuilder: HierarchyData,
        defaultSettings: HierarchySlicerSettings,
        dataView: DataView;

    beforeEach(() => {
        visualBuilder = new HierarchySlicerBuilder(1000, 500);
        defaultDataViewBuilder = new HierarchyData();
        defaultSettings = new HierarchySlicerSettings();
        dataView = defaultDataViewBuilder.getDataView();
    });

    describe("DOM tests", () => {
        it("no dataView, show watermark", (done) => {
            visualBuilder.updateRenderTimeout([], () => {
                expect(visualBuilder.element.find("svg").length)
                    .toBe(1); // Watermark is a SVG drawing

                expect(visualBuilder.element.find("svg").find("rect").length)
                    .toBe(22); // rect in Watermark

                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                    .toBe(0); // No row items

                done();
            });
        });

        it("default settings", (done) => {
            const dataViewtest = dataView;
            visualBuilder.updateRenderTimeout(dataViewtest, () => {
                const rowLength: number = 1; // Collapse all

                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                    .toBe(rowLength);

                const slicerBodyHeightToBe = visualBuilder.viewport.height -
                    TextMeasurementService.estimateSvgTextHeight(
                        <TextProperties>{
                            fontFamily: HierarchySlicer.DefaultFontFamily,
                            fontSize: PixelConverter.fromPoint(defaultSettings.header.textSize),
                        }) -
                    defaultSettings.header.borderBottomWidth;
                const slicerBodyHeightStyle = visualBuilder.element.find(".slicerBody")[0].style.height;

                expect(slicerBodyHeightStyle)
                    .toBe(`${slicerBodyHeightToBe.toString()}px`);

                expect(visualBuilder.element.find(".slicerBody").attr("width"))
                    .toBe(visualBuilder.viewport.width.toString());

                done();
            });
        });

        it("Slicer Header: false", (done) => {
            const dataViewtest = dataView;
            dataViewtest.metadata.objects = {
                header: {
                    show: false
                }
            };

            visualBuilder.updateRenderTimeout(dataViewtest, () => {
                const slicerBodyHeightToBe = visualBuilder.viewport.height -
                    defaultSettings.header.borderBottomWidth;
                const slicerBodyHeightStyle = visualBuilder.element.find(".slicerBody")[0].style.height;

                expect(slicerBodyHeightStyle)
                    .toBe(`${slicerBodyHeightToBe.toString()}px`);

                done();
            });
        });

        it("Search on (selfFilterEnabled: true)", (done) => {
            const dataViewtest = dataView;
            dataViewtest.metadata.objects = {
                general: {
                    selfFilterEnabled: true
                }
            };

            visualBuilder.updateRenderTimeout(dataViewtest, () => {
                const slicerBodyHeightToBe = visualBuilder.viewport.height -
                    TextMeasurementService.estimateSvgTextHeight(
                        <TextProperties>{
                            fontFamily: HierarchySlicer.DefaultFontFamily,
                            fontSize: PixelConverter.fromPoint(defaultSettings.search.textSize),
                        }) -
                    TextMeasurementService.estimateSvgTextHeight(
                        <TextProperties>{
                            fontFamily: HierarchySlicer.DefaultFontFamily,
                            fontSize: PixelConverter.fromPoint(defaultSettings.header.textSize),
                        }) -
                    defaultSettings.header.borderBottomWidth
                    - 2;
                const slicerBodyHeightStyle = visualBuilder.element.find(".slicerBody")[0].style.height;

                expect(slicerBodyHeightStyle)
                    .toBe(`${slicerBodyHeightToBe.toString()}px`);

                done();
            });
        });

        it("Simulate expanding", (done) => {
            for (let i = 1; i < HierarchyData.totalExpandedTests; i++) {
                const testValue = HierarchyData.getExpandedString(i);
                const dataViewtest = dataView;
                dataViewtest.metadata.objects = {
                    general: {
                        expanded: testValue.expanded
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewtest, () => {
                    expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                        .toBe(testValue.number);

                    done();
                });
            }
        });

        it("Simulate expanding (selectAll: true)", (done) => {
            for (let i = 1; i < HierarchyData.totalExpandedTests; i++) {
                const testValue = HierarchyData.getExpandedString(i);
                const dataViewtest = dataView;
                dataViewtest.metadata.objects = {
                    general: {
                        expanded: testValue.expanded
                    },
                    selection: {
                        selectAll: true
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewtest, () => {
                    expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                        .toBe(testValue.number + 1);

                    done();
                });
            }
        });

        it("Simulate expanding (hideMembers: 1)", (done) => {
            simulateHideMembers(dataView, visualBuilder, done, 1);
        });

        it("Simulate expanding (hideMembers: 2)", (done) => {
            simulateHideMembers(dataView, visualBuilder, done, 2);
        });

        it("Simulate expanding, old settings  (emptyLeafs: false)", (done) => {
            // old behavior, now [hideMembers: 1]
            const dataViewtest = dataView;
            const testValue = HierarchyData.getExpandedString(2);
            dataViewtest.metadata.objects = {
                general: {
                    expanded: testValue.expanded
                },
                selection: {
                    emptyLeafs: false
                }
            };
            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                    .toBe(testValue.number + testValue.hideMembersOffset[1]);
                done();
            });
        });

        it("Simulate expanding, old settings (emptyLeafs: true)", (done) => {
            // old behavior, now [hideMembers: 0]
            const dataViewtest = dataView;
            const testValue = HierarchyData.getExpandedString(2);
            dataViewtest.metadata.objects = {
                general: {
                    expanded: testValue.expanded
                },
                selection: {
                    emptyLeafs: true
                }
            };
            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                    .toBe(testValue.number + testValue.hideMembersOffset[0]);
                done();
            });
        });
    });

    describe("Header clicks", () => {
        it("Click 'Expand All'", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const expandAllButton = visualBuilder.element.find(".slicerHeader").find(".expand");
                expandAllButton.click();

                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                    .toBe(14);
                done();
            });
        });

        it("Click 'Collapse All'", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const collapseAllButton = visualBuilder.element.find(".slicerHeader").find(".collapse");
                collapseAllButton.click();

                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                    .toBe(1);
                done();
            });
        });

        it("Click 'Expand All' + 'Collapse All'", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                const expandAllButton = visualBuilder.element.find(".slicerHeader").find(".expand");
                const collapseAllButton = visualBuilder.element.find(".slicerHeader").find(".collapse");
                    expandAllButton.click();
                    collapseAllButton.click();

                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                    .toBe(1);
                done();
            });
        });
    });
});

function simulateHideMembers(dataView: powerbi.DataView, visualBuilder: HierarchySlicerBuilder, done: DoneFn, hideMember: number) {
    for (let i = 1; i < HierarchyData.totalExpandedTests; i++) {
        const testValue = HierarchyData.getExpandedString(i);
        const dataViewtest = dataView;
        dataViewtest.metadata.objects = {
            general: {
                expanded: testValue.expanded
            },
            selection: {
                hideMembers: hideMember
            }
        };
        visualBuilder.updateRenderTimeout(dataView, () => {
            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                .toBe(testValue.number + testValue.hideMembersOffset[hideMember]);
            done();
        });
    }
}

