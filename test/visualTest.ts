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
import VisualObjectInstance = powerbi.VisualObjectInstance;

import PixelConverter = pixelConverter;
import TextProperties = textMeasurementService.TextProperties;
import TextMeasurementService = textMeasurementService.textMeasurementService;

import { HierarchySlicer } from "../src/hierarchySlicer";

import { HierarchySlicerBuilder } from "./visualBuilder";
import { HierarchyData, FullExpanded, ExpandTest, HierarchyDataSet1, HierarchyDataSet2, HierarchyDataSet3 } from "./visualData";
import { HierarchySlicerSettings } from "../src/settings";

const hideMembers: number[] = [0, 1, 2];

describe("HierachySlicer =>", () => {
    let visualBuilder: HierarchySlicerBuilder,
        defaultSettings: HierarchySlicerSettings;

    beforeEach(() => {
        visualBuilder = new HierarchySlicerBuilder(1000, 500);
        visualBuilder.element.find(".slicerContainer").addClass("hasSelection"); // Select visual
        defaultSettings = new HierarchySlicerSettings();
    });

    const dataSets: HierarchyData[] = [
        new HierarchyDataSet1(),
        new HierarchyDataSet2(),
        new HierarchyDataSet3()
    ];

    dataSets.forEach((testData, index) => {

        describe(`Basic render tests [dataset: ${index + 1}] =>`, () => {
            it(`no dataView, show watermark [dataset: ${index + 1}]`, (done) => {
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

            it(`default settings [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const rowLength: number = testData.getLevelCount(1); // Collapse all

                    expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                        .toBe(rowLength);

                    const slicerBodyHeightToBe = visualBuilder.viewport.height -
                        TextMeasurementService.estimateSvgTextHeight(
                            <TextProperties>{
                                fontFamily: HierarchySlicer.DefaultFontFamily,
                                fontSize: PixelConverter.fromPoint(defaultSettings.header.textSize),
                            }) -
                        defaultSettings.header.borderBottomWidth;

                    expect(visualBuilder.element.find(".slicerBody")[0])
                        .toHaveCss({ height: `${slicerBodyHeightToBe.toString()}px` });

                    expect(visualBuilder.element.find(".slicerBody").attr("width"))
                        .toBe(visualBuilder.viewport.width.toString());

                    done();
                });
            });

            it(`default item formatting [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainer = visualBuilder.element.find(".slicerItemContainer")[0];
                    expect(itemContainer.children.length).toBe(2);

                    if (testData.columnNames.length > 1) {
                        const itemExpander = itemContainer.firstChild;
                        expect(itemExpander.childNodes.length).toBe(2);
                    }

                    const itemContainerChild = itemContainer.lastChild;
                    expect(itemContainerChild.childNodes.length).toBe(2);

                    done();
                });
            });
        });

        describe(`Visual context menu [dataset: ${index + 1}] =>`, () => {
            it(`Search on (selfFilterEnabled: true) [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
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
        });

        describe(`Saved settings restored =>`, () => {
            describe(`Restore saved 'expanded' setting [dataset: ${index + 1}] =>`, () => {
                testData.getExpandedTests().forEach((expandedTest, testIndex) => {
                    it(`Restore expanded [dataset: ${index + 1}, test: ${testIndex + 1}]`, (done) => {
                        const dataViewTest = testData.getDataView();
                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedTest.expanded
                            }
                        };
                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                .toBe(expandedTest.number);

                            done();
                        });
                    });
                });

                testData.getExpandedTests().forEach((expandedTest: ExpandTest, testIndex: number) => {
                    it(`Restore expanded (selectAll: true) [dataset: ${index + 1}, test: ${testIndex + 1}]`, (done) => {
                        const dataViewTest = testData.getDataView();
                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedTest.expanded
                            },
                            selection: {
                                selectAll: true
                            }
                        };
                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                .toBe(expandedTest.number + 1);

                            done();
                        });
                    });
                });
            });
        });

        describe(`Selection settings [dataset: ${index + 1}] =>`, () => {
            hideMembers.forEach((hideMember) => {
                testData.getExpandedTests().forEach((expandedTest: ExpandTest, testIndex: number) => {
                    it(`Restore expanded (hideMembers: ${hideMember}) [dataset: ${index + 1}, test: ${testIndex + 1}]`, (done) => {
                        const dataViewTest = testData.getDataView();
                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedTest.expanded
                            },
                            selection: {
                                hideMembers: hideMember
                            }
                        };
                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                .toBe(expandedTest.number + expandedTest.hideMembersOffset[hideMember]);
                            done();
                        });
                    });
                });
            });

            it(`Restore expanded, old settings  (emptyLeafs: false) [dataset: ${index + 1}]`, (done) => {
                if (testData.getExpandedTests().length === 0) {
                    done();
                    return;
                }

                // old behavior, now [hideMembers: 1]
                const dataViewTest = testData.getDataView();
                const testValue: ExpandTest = testData.getExpandedTests()[1];
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: testValue.expanded
                    },
                    selection: {
                        emptyLeafs: false
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                        .toBe(testValue.number + testValue.hideMembersOffset[1]);
                    done();
                });
            });

            it(`Restore expanded, old settings (emptyLeafs: true) [dataset: ${index + 1}]`, (done) => {
                if (testData.getExpandedTests().length === 0) {
                    done();
                    return;
                }

                // old behavior, now [hideMembers: 0]
                const dataViewTest = testData.getDataView();
                const testValue: ExpandTest = testData.getExpandedTests()[1];
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: testValue.expanded
                    },
                    selection: {
                        emptyLeafs: true
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                        .toBe(testValue.number + testValue.hideMembersOffset[0]);
                    done();
                });
            });
        });

        describe(`Slicer Header settings [dataset: ${index + 1}] =>`, () => {
            it(`Show: false [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    header: {
                        show: false
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const slicerBodyHeightToBe = visualBuilder.viewport.height -
                        defaultSettings.header.borderBottomWidth;
                    const slicerBodyHeightStyle = visualBuilder.element.find(".slicerBody")[0].style.height;

                    expect(slicerBodyHeightStyle)
                        .toBe(`${slicerBodyHeightToBe.toString()}px`);

                    done();
                });
            });
        });

        describe(`Items settings [dataset: ${index + 1}] =>`, () => {
            it("dummy", (done) => {
                done();
            });
        });

        describe(`Search settings [dataset: ${index + 1}] =>`, () => {
            it("dummy", (done) => {
                done();
            });
        });

        describe(`Zoom mode settings [dataset: ${index + 1}] =>`, () => {
            it("dummy", (done) => {
                done();
            });
        });

        describe(`Slicer interacton [dataset: ${index + 1}] =>`, () => {
            describe(`Header buttons [dataset: ${index + 1}] =>`, () => {
                it(`Click 'Expand All' [dataset: ${index + 1}]`, (done) => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const expandAllButton = visualBuilder.element.find(".slicerHeader").find(".expand");

                        if (testData.columnNames.length > 1) {
                            expandAllButton.click();
                            const expanded: string[] = (visualBuilder.properties.merge[0].properties["expanded"] as string).split(",");
                            // Same length
                            expect(expanded.length).toBe(expandedToBe.expanded.length);
                            // Same items
                            expect(expanded.filter((d) => expandedToBe.expanded.indexOf(d) === -1).length).toEqual(0);

                            dataViewTest.metadata.objects = {
                                general: {
                                    expanded: expandedToBe.expanded.join(",")
                                }
                            };

                            visualBuilder.updateRenderTimeout(dataViewTest, () => {
                                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                    .toBe(expandedToBe.length);
                                done();
                            });
                        } else {
                            expect(expandAllButton).toHaveCss({ opacity: "0" });

                            done();
                        }
                    });
                });

                it(`Click 'Collapse All' [dataset: ${index + 1}]`, (done) => {
                    const dataViewTest = testData.getDataView();
                    const collapseLength: number = testData.getLevelCount(1);
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const collapseAllButton = visualBuilder.element.find(".slicerHeader").find(".collapse");

                        if (testData.columnNames.length > 1) {
                            collapseAllButton.click();

                            visualBuilder.updateRenderTimeout(dataViewTest, () => {
                                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                    .toBe(collapseLength);
                                done();
                            });
                        } else {
                            expect(collapseAllButton).toHaveCss({ opacity: "0" });

                            done();
                        }
                    });
                });

                it(`Click 'Expand All -> 'Collapse All' [dataset: ${index + 1}]`, (done) => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    const collapseLength: number = testData.getLevelCount(1);
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const expandAllButton = visualBuilder.element.find(".slicerHeader").find(".expand");
                        const collapseAllButton = visualBuilder.element.find(".slicerHeader").find(".collapse");

                        if (testData.columnNames.length > 1) {
                            // Click 'Expand All'
                            expandAllButton.click();
                            const expanded: string[] = (visualBuilder.properties.merge[0].properties["expanded"] as string).split(",");
                            // Same length
                            expect(expanded.length).toBe(expandedToBe.expanded.length);
                            // Same items
                            expect(expanded.filter((d) => expandedToBe.expanded.indexOf(d) === -1).length).toEqual(0);

                            dataViewTest.metadata.objects = {
                                general: {
                                    expanded: expandedToBe.expanded.join(",")
                                }
                            };

                            visualBuilder.updateRenderTimeout(dataViewTest, () => {
                                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                    .toBe(expandedToBe.length);

                                // Click 'Collapse All'
                                collapseAllButton.click();
                                // expanded object only removed if there is somthing to collapse
                                const removeExpanded: VisualObjectInstance = visualBuilder.properties.remove[0];
                                expect(removeExpanded).not.toBeEmpty();

                                dataViewTest.metadata.objects = undefined;

                                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                                    expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                        .toBe(collapseLength);
                                    done();
                                });
                            });
                        } else {
                            expect(expandAllButton).toHaveCss({ opacity: "0" });
                            expect(collapseAllButton).toHaveCss({ opacity: "0" });

                            done();
                        }
                    });
                });
            });

            describe(`Tree interaction [dataset: ${index + 1}] =>`, () => {
                it(`Expand and collapse first item' [dataset: ${index + 1}]`, (done) => {
                    if (testData.getExpandedTests().length === 0) {
                        done();
                        return;
                    }

                    const dataViewTest = testData.getDataView();
                    const expandedToBe: ExpandTest  = testData.getExpandedTests()[0];
                    const collapseLength: number = testData.getLevelCount(1);
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const firstExpander = visualBuilder.element.find(".slicerItemContainerExpander")[0];
                        firstExpander.click();
                        const expanded: string[] = (visualBuilder.properties.merge[0].properties["expanded"] as string).split(",");
                        // Same length
                        expect(expanded.length).toBe(1);
                        // Same items
                        expect(expanded[0]).toEqual(expandedToBe.expanded);

                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedToBe.expanded
                            }
                        };

                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                .toBe(expandedToBe.number);

                            const firstExpander = visualBuilder.element.find(".slicerItemContainerExpander")[0];
                            firstExpander.click();

                            const removeExpanded: VisualObjectInstance = visualBuilder.properties.remove[0];
                            expect(removeExpanded).not.toBeEmpty();

                            dataViewTest.metadata.objects = undefined;

                            visualBuilder.updateRenderTimeout(dataViewTest, () => {
                                expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                    .toBe(collapseLength);
                                done();
                            });
                        });
                    });
                });
            });

            describe(`Selection interaction [dataset: ${index + 1}] =>`, () => {
                it("dummy", (done) => {
                    done();
                });
            });
        });
    });
});