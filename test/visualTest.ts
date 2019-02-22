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

import powerbi from "powerbi-visuals-api";
import { valueFormatter, textMeasurementService} from "powerbi-visuals-utils-formattingutils";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import ISelectionId = powerbi.visuals.ISelectionId;

import PixelConverter = pixelConverter;
import TextProperties = textMeasurementService.TextProperties;
import TextMeasurementService = textMeasurementService.textMeasurementService;

import { HierarchySlicer } from "../src/hierarchySlicer";

import { HierarchySlicerBuilder } from "./visualBuilder";
import { FullExpanded, ExpandTest, SelectTest, HierarchyData, HierarchyDataSet1, HierarchyDataSet2, HierarchyDataSet3, HierarchyDataSet4, HierarchyDataSet5 } from "./visualData";
import { HierarchySlicerSettings } from "../src/settings";
import { IFilter, TupleFilter } from "powerbi-models";
import { FontStyle, FontWeight, BorderStyle, Zoomed } from "../src/enums";
import { assignWith, filter, forEach } from "lodash-es";

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
        new HierarchyDataSet3(),
        new HierarchyDataSet4(),
        new HierarchyDataSet5()
    ];

    dataSets.forEach((testData, index) => {

        describe(`converter tests [dataset: ${index + 1}] =>`, () => {
            it(`same list of ownIds`, (done) => {
                const dataViewTest = testData.getDataView();
                const testOwnIds = testData.getOwnIds();
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const data = visualBuilder.instance.converter(dataViewTest, [], null);

                    expect(data.dataPoints.map((dataPoint) => dataPoint.ownId)).toEqual(testOwnIds);

                    done();
                });
            });
        });

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
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        expect(itemContainer.children.length).toBe(2);

                        if (testData.columnNames.length > 1) {
                            const itemExpander = itemContainer.firstChild;
                            expect(itemExpander.childNodes.length).toBe(2);

                            // Expanded icon styling
                            const itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                            expect(itemExpanderStyle.fill).toBe(hexToRgb(defaultSettings.items.fontColor));
                            expect(itemExpanderStyle.fontSize).toBe(measurePixelString(PixelConverter.fromPointToPixel(defaultSettings.items.textSize)));
                        }

                        const itemContainerChild = itemContainer.lastChild;
                        expect(itemContainerChild.childNodes.length).toBe(2);

                        // Checkbox styling
                        const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.height).toBe(measurePixelString(.75 * defaultSettings.items.textSize));
                        expect(checkboxStyle.width).toBe(measurePixelString(.75 * defaultSettings.items.textSize));
                        expect(checkboxStyle.marginRight).toBe(measurePixelString(PixelConverter.fromPointToPixel(.25 * defaultSettings.items.textSize)));
                        expect(checkboxStyle.marginBottom).toBe(measurePixelString(PixelConverter.fromPointToPixel(.25 * defaultSettings.items.textSize)));

                        // // Span (label) styling
                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.color).toBe(hexToRgb(defaultSettings.items.fontColor));
                        expect(labelStyle.fontFamily).toBe(fontFamilyString(defaultSettings.items.fontFamily));
                        expect(labelStyle.fontStyle).toBe(fontStyleString(defaultSettings.items.fontStyle));
                        expect(labelStyle.fontWeight).toBe(defaultSettings.items.fontWeight.toString());
                        expect(labelStyle.fontSize).toBe(fontSizeString(defaultSettings.items.textSize));
                    });

                    done();
                });
            });

            it(`default item labels [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: expandedToBe.expanded.join(",")
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    testData.getItemLabels().forEach((label, index) => {
                        const item = visualBuilder.element.find(".slicerItemContainer").find(".slicerText")[index];

                        expect(item).toHaveText(label);
                    });

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

            testData.getSearchTests().forEach((searchTest, index) => {
                it(`Search for ${searchTest.searchString} [dataset: ${index + 1}`, (done) => {
                    const selector = HierarchySlicer.ItemContainerChild.selectorName;
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    dataViewTest.metadata.objects = {
                        general: {
                            selfFilterEnabled: true,
                            expanded: expandedToBe.expanded.join(",")
                        }
                    };

                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const searchInput = visualBuilder.element.find(".searchInput");
                        searchInput.val(searchTest.searchString);
                        searchInput[0].dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

                        const searchCallBack = visualBuilder.properties[0].merge;
                        expect(searchCallBack).not.toBeEmpty();

                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                .toBe(searchTest.results);

                            const item = visualBuilder.element.find(selector).toArray().filter((row, index) =>
                                $(row).find(".slicerText")[0].textContent === searchTest.searchString);

                            $(item).click();

                            const itemCheckBoxes: HTMLElement[] = (visualBuilder.element.find(".visibleGroup").children(".row").find(".slicerCheckbox")).toArray();

                            searchTest.selectedDataPoints.forEach((datePoint) => {
                                expect(itemCheckBoxes[datePoint]).toHaveClass("selected");
                            });

                            searchTest.partialDataPoints.forEach((datePoint) => {
                                expect(itemCheckBoxes[datePoint]).toHaveClass("partiallySelected");
                            });
                            done();
                        });
                    });
                });
            });

            testData.getSearchTests().forEach((searchTest, index) => {
                it(`Search for ${searchTest.searchString} with 'Select All' [dataset: ${index + 1}`, (done) => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    dataViewTest.metadata.objects = {
                        general: {
                            selfFilterEnabled: true,
                            expanded: expandedToBe.expanded.join(",")
                        },
                        selection: {
                            selectAll: true
                        }
                    };

                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const searchInput = visualBuilder.element.find(".searchInput");
                        searchInput.val(searchTest.searchString);
                        searchInput[0].dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

                        const searchCallBack = visualBuilder.properties[0].merge;
                        expect(searchCallBack).not.toBeEmpty();

                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                .toBe(searchTest.results + (searchTest.searchString.length < 3 ? 1 : 0));

                            done();
                        });
                    });
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
                                expanded: expandedTest.expanded.join(",")
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
                                expanded: expandedTest.expanded.join(",")
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
                                expanded: expandedTest.expanded.join(",")
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
                        expanded: testValue.expanded.join(",")
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
                        expanded: testValue.expanded.join(",")
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

            it(`Empty leaf label: xxxxxxx, '' strings are empty: true [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                const emptyLeafLabel = "xxxxxxx";
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: expandedToBe.expanded.join(",")
                    },
                    selection: {
                        emptyLeafLabel: emptyLeafLabel,
                        emptyString: true,
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    testData.getItemLabels(true, emptyLeafLabel).forEach((label, index) => {
                        const item = visualBuilder.element.find(".slicerItemContainer").find(".slicerText")[index];
                        expect(item).toHaveText(label);
                        expect(item).not.toHaveText("(Blank)");
                    });

                    done();
                });
            });

            it(`Empty leaf label: xxxxxxx, '' strings are empty: false [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                const emptyLeafLabel = "xxxxxxx";
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: expandedToBe.expanded.join(",")
                    },
                    selection: {
                        emptyLeafLabel: emptyLeafLabel,
                        emptyString: false,
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    testData.getItemLabels(false, emptyLeafLabel).forEach((label, index) => {
                        const item = visualBuilder.element.find(".slicerItemContainer").find(".slicerText")[index];
                        expect(item).toHaveText(label);
                    });

                    done();
                });
            });

            it(`Single select: false [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                        expanded: expandedToBe.expanded.join(",")
                    },
                    selection: {
                        selectAll: true,
                        singleSelect: false
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const slicerContainer = visualBuilder.element.find(".slicerContainer");

                    expect(slicerContainer).toHaveClass("isMultiSelectEnabled");

                    done();
                });
            });

            it(`Single select: true [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                        expanded: expandedToBe.expanded.join(",")
                    },
                    selection: {
                        selectAll: true,
                        singleSelect: true
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const slicerContainer = visualBuilder.element.find(".slicerContainer");

                    expect(slicerContainer).not.toHaveClass("isMultiSelectEnabled");

                    done();
                });
            });

            it(`Select All label 'xxxxxxx' [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const selectAllLabel = "xxxxxxx";
                dataViewTest.metadata.objects = {
                    selection: {
                        selectAll: true,
                        selectAllLabel: selectAllLabel
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const selectAllLabelItem = visualBuilder.element.find(".slicerItemContainer").find(".slicerText")[0];

                    expect(selectAllLabelItem).toHaveText(selectAllLabel);

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

            it (`Slicer header - default label [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    header: {
                        show: true
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0];

                    expect(headerTextStyle).toContainText(testData.columnNames[0]);

                    done();
                });
            });

            it (`Slicer header - 'xxxxxxxxxx' [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const title = "xxxxxxxxxx";
                dataViewTest.metadata.objects = {
                    header: {
                        show: true,
                        title: title
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0];

                    expect(headerTextStyle).toContainText(title);

                    done();
                });
            });

            it (`Slicer header - Show summary - none selected [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    header: {
                        show: true,
                        restatement: true
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0];

                    expect(headerTextStyle).toContainText(`${testData.columnNames[0]}: All`);

                    done();
                });
            });

            // it (`Slicer header - Show summary - 1 item selected [dataset: ${index + 1}]`, (done) => {
            //     const selector = HierarchySlicer.ItemContainerChild.selectorName;
            //     const dataViewTest = testData.getDataView();
            //     const expandedToBe = testData.getFullExpanded();
            //     dataViewTest.metadata.objects = {
            //             selection: {
            //                 singleSelect: true
            //             },
            //             general: {
            //                 expanded: expandedToBe.expanded.join(",")
            //             },
            //             header: {
            //                 show: true,
            //                 restatement: true
            //             }
            //         };

            //     visualBuilder.updateRenderTimeout(dataViewTest, () => {
            //         const selectedItem = visualBuilder.element.find(selector)[0];
            //         selectedItem.click();

            //         visualBuilder.updateRenderTimeout(dataViewTest, () => {
            //             const headerTextStyle = visualBuilder.element.find(".headerText")[0];
            //             const firstItemLabel = visualBuilder.element.find(".slicerText")[0].innerText;

            //             expect(headerTextStyle).toContainText(`${testData.columnNames[0]}: ${firstItemLabel}`);

            //             done();
            //         });
            //     });
            // });

            const borderStyles = [
                { style: BorderStyle.None, result: "0px"},
                { style: BorderStyle.BottomOnly, result: "0px 0px 1px"},
                { style: BorderStyle.TopOnly, result: "1px 0px 0px"},
                { style: BorderStyle.LeftOnly, result: "0px 0px 0px 1px"},
                { style: BorderStyle.RightOnly, result: "0px 1px 0px 0px"},
                { style: BorderStyle.TopBottom, result: "1px 0px"},
                { style: BorderStyle.LeftRight, result: "0px 1px"},
                { style: BorderStyle.Frame, result: "1px"}
            ];
            const dataViewTest = testData.getDataView();
            borderStyles.forEach((borderStyle) => {
                it (`Slicer header - outline [style: ${borderStyle.style}, dataset: ${index + 1}]`, (done) => {
                    dataViewTest.metadata.objects = {
                        header: {
                            outline: borderStyle.style
                        }
                    };
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

                        expect(headerTextStyle.borderWidth).toBe(borderStyle.result);

                        done();
                    });
                });
            });

            it (`Slicer header - fontColor [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    header: {
                        fontColor: fontColor
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

                    expect(headerTextStyle.color).toBe(hexToRgb(fontColor));

                    done();
                });
            });

            it (`Slicer header - background [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const background = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    header: {
                        background: background
                    }
                };

                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerItems = visualBuilder.element.find(".headerText").toArray();

                    headerItems.forEach((headerItem) => {
                        expect(headerItem.style.backgroundColor).toBe(hexToRgb(background));
                    });

                    done();
                });
            });

            it (`Slicer header - textSize [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const textSize = 20;
                dataViewTest.metadata.objects = {
                    header: {
                        textSize: textSize
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

                    expect(headerTextStyle.fontSize).toBe(measurePixelString(textSize, "pt"));

                    done();
                });
            });

            it (`Slicer header - fontFamily [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontFamily = '"Courier New"';
                dataViewTest.metadata.objects = {
                    header: {
                        fontFamily: fontFamily
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

                    expect(headerTextStyle.fontFamily).toBe(fontFamilyString(fontFamily));

                    done();
                });
            });

            it (`Slicer header - fontStyle [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontStyle = FontStyle.Italic;
                dataViewTest.metadata.objects = {
                    header: {
                        fontStyle: fontStyle
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

                    expect(headerTextStyle.fontStyle).toBe(fontStyleString(fontStyle));

                    done();
                });
            });

            it (`Slicer header - fontWeight [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontWeight = FontWeight.SemiBold;
                dataViewTest.metadata.objects = {
                    header: {
                        fontWeight: fontWeight
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

                    expect(headerTextStyle.fontWeight).toBe(fontWeight.toString());

                    done();
                });
            });
        });

        describe(`Items settings [dataset: ${index + 1}] =>`, () => {
            it(`Item formatting - fontcolor [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    items: {
                        fontColor: fontColor
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        if (testData.columnNames.length > 1) {
                            const itemExpander = itemContainer.firstChild;

                            // Expanded icon styling
                            const itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                            expect(itemExpanderStyle.fill).toBe(hexToRgb(fontColor));
                        }

                        const itemContainerChild = itemContainer.lastChild;

                        // Checkbox styling
                        const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.borderColor).toBe(hexToRgb(fontColor));

                        // // Span (label) styling
                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.color).toBe(hexToRgb(fontColor));
                    });

                    done();
                });
            });

            it(`Item formatting - fontcolor after hover [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const hoverColor = "#FF0000";
                const fontColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    items: {
                        fontColor: fontColor,
                        hoverColor: hoverColor
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer, index) => {
                        if (testData.columnNames.length > 1) {
                            let itemExpander = itemContainer.firstChild;
                            // Mouseover event
                            itemExpander.dispatchEvent(new MouseEvent('mouseover'));
                            itemExpander = visualBuilder.element.find(".slicerItemContainer").toArray()[index].firstChild;

                            // Expanded icon styling
                            let itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                            expect(itemExpanderStyle.fill).toBe(hexToRgb(hoverColor));

                            // Mouseout event
                            itemExpander.dispatchEvent(new MouseEvent('mouseout'));
                            itemExpander = visualBuilder.element.find(".slicerItemContainer").toArray()[index].firstChild;
                            // Expanded icon styling
                            itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                            expect(itemExpanderStyle.fill).toBe(hexToRgb(fontColor));
                        }

                        let itemContainerChild = itemContainer.lastChild;
                        // Mouseover event
                        itemContainerChild.dispatchEvent(new MouseEvent('mouseover'));
                        itemContainerChild = visualBuilder.element.find(".slicerItemContainer").toArray()[index].lastChild;

                        // // Checkbox styling
                        let checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.borderColor).toBe(hexToRgb(hoverColor));

                        let labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.color).toBe(hexToRgb(hoverColor));

                        // Mouseout event
                        itemContainerChild.dispatchEvent(new MouseEvent('mouseout'));
                        itemContainerChild = visualBuilder.element.find(".slicerItemContainer").toArray()[index].lastChild;

                        // Checkbox styling
                        checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.borderColor).toBe(hexToRgb(fontColor));

                        labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.color).toBe(hexToRgb(fontColor));
                    });

                    done();
                });
            });

            it(`Item formatting - hoverColor [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const hoverColor = "#FF0000";
                dataViewTest.metadata.objects = {
                    items: {
                        hoverColor: hoverColor
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer, index) => {
                        if (testData.columnNames.length > 1) {
                            let itemExpander = itemContainer.firstChild;
                            itemExpander.dispatchEvent(new MouseEvent('mouseover'));

                            itemExpander = visualBuilder.element.find(".slicerItemContainer").toArray()[index].firstChild;

                            // Expanded icon styling
                            const itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                            expect(itemExpanderStyle.fill).toBe(hexToRgb(hoverColor));
                        }

                        let itemContainerChild = itemContainer.lastChild;
                        itemContainerChild.dispatchEvent(new MouseEvent('mouseover'));

                        itemContainerChild = visualBuilder.element.find(".slicerItemContainer").toArray()[index].lastChild;

                        // // Checkbox styling
                        const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.borderColor).toBe(hexToRgb(hoverColor));

                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.color).toBe(hexToRgb(hoverColor));
                    });

                    done();
                });
            });

            it(`Item formatting - selectColor [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const selectedColor = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selectAll: true
                    },
                    selection: {
                        selectAll: true
                    },
                    items: {
                        selectedColor: selectedColor
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        const itemContainerChild = itemContainer.lastChild;

                        // Checkbox styling
                        const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.backgroundColor).toBe(hexToRgb(selectedColor));
                    });

                    done();
                });
            });

            it(`Item formatting - background [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const background = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selectAll: true
                    },
                    selection: {
                        selectAll: true
                    },
                    items: {
                        background: background
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        const containerStyle = (itemContainer as HTMLElement).style;
                        expect(containerStyle.backgroundColor).toBe(hexToRgb(background));
                    });

                    done();
                });
            });

            it(`Item formatting - textSize [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const textSize = 16;
                dataViewTest.metadata.objects = {
                    items: {
                        textSize: textSize
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        if (testData.columnNames.length > 1) {
                            const itemExpander = itemContainer.firstChild;

                            // Expanded icon styling
                            const itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                            expect(itemExpanderStyle.fontSize).toBe(measurePixelString(PixelConverter.fromPointToPixel(textSize)));
                        }

                        const itemContainerChild = itemContainer.lastChild;

                        // Checkbox styling
                        const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.height).toBe(measurePixelString(.75 * textSize));
                        expect(checkboxStyle.width).toBe(measurePixelString(.75 * textSize));
                        expect(checkboxStyle.marginRight).toBe(measurePixelString(PixelConverter.fromPointToPixel(.25 * textSize)));
                        expect(checkboxStyle.marginBottom).toBe(measurePixelString(PixelConverter.fromPointToPixel(.25 * textSize)));

                        // // Span (label) styling
                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.fontSize).toBe(fontSizeString(textSize));
                    });

                    done();
                });
            });

            it(`Item formatting - fontFamily [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontFamily = '"Courier New"';
                dataViewTest.metadata.objects = {
                    items: {
                        fontFamily: fontFamily
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        const itemContainerChild = itemContainer.lastChild;

                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.fontFamily).toBe(fontFamilyString(fontFamily));
                    });

                    done();
                });
            });

            it(`Item formatting - fontStyle [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontStyle = FontStyle.Italic;
                dataViewTest.metadata.objects = {
                    items: {
                        fontStyle: fontStyle
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        const itemContainerChild = itemContainer.lastChild;

                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.fontStyle).toBe(fontStyleString(fontStyle));
                    });

                    done();
                });
            });

            it(`Item formatting - fontWeight [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontWeight = FontWeight.Light;
                dataViewTest.metadata.objects = {
                    items: {
                        fontWeight: fontWeight
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        const itemContainerChild = itemContainer.lastChild;

                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.fontWeight).toBe(fontWeight.toString());
                    });

                    done();
                });
            });
        });

        describe(`Search settings [dataset: ${index + 1}] =>`, () => {
            it(`Search formatting - fontColor [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const fontColor = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true
                    },
                    search: {
                        fontColor: fontColor
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const searchHeader = visualBuilder.element.find(".searchHeader")[0];

                    const inputStyle = (searchHeader.children[1] as HTMLElement).style;
                    expect(inputStyle.color).toBe(hexToRgb(fontColor));

                    done();
                });
            });

            it(`Search formatting - iconColor [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const iconColor = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true
                    },
                    search: {
                        iconColor: iconColor
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const searchHeader = visualBuilder.element.find(".searchHeader")[0];

                    const icons = $(searchHeader).find(".icon").toArray();
                    icons.forEach((icon) => {
                        const iconStyle = icon.style;
                        expect(iconStyle.fill).toBe(hexToRgb(iconColor));
                    });

                    done();
                });
            });

            it(`Search formatting - background [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const background = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true
                    },
                    search: {
                        background: background
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const searchHeader = visualBuilder.element.find(".searchHeader")[0];

                    const inputStyle = (searchHeader.children[1] as HTMLElement).style;
                    expect(inputStyle.backgroundColor).toBe(hexToRgb(background));

                    done();
                });
            });

            it(`Search formatting - textSize [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const textSize = 16;
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true
                    },
                    search: {
                        textSize: textSize
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const searchHeader = visualBuilder.element.find(".searchHeader");

                    const icons = $(searchHeader).find(".icon").toArray();
                    icons.forEach((icon) => {
                        const iconStyle = icon.style;
                        expect(iconStyle.height).toBe(measurePixelString(Math.ceil(.95 * PixelConverter.fromPointToPixel(textSize)), "px"));
                        expect(iconStyle.width).toBe(measurePixelString(Math.ceil(.95 * PixelConverter.fromPointToPixel(textSize)), "px"));
                    });

                    const inputStyle = (searchHeader[0].children[1] as HTMLElement).style;
                    expect(inputStyle.fontSize).toBe(fontSizeString(textSize));

                    done();
                });
            });
        });

        describe(`Zoom mode settings [dataset: ${index + 1}] =>`, () => {
            it(`Enlarge setting - textSize + 50% [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const enLarge = Zoomed.Normal;
                const textSize = defaultSettings.items.textSize * (1 + (enLarge /  100));
                dataViewTest.metadata.objects = {
                    mobile: {
                        enable: true,
                        enLarge: enLarge
                    }
                };
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

                    itemContainers.forEach((itemContainer) => {
                        if (testData.columnNames.length > 1) {
                            const itemExpander = itemContainer.firstChild;

                            // Expanded icon styling
                            const itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                            expect(itemExpanderStyle.fontSize).toBe(measurePixelString(PixelConverter.fromPointToPixel(textSize)));
                        }

                        const itemContainerChild = itemContainer.lastChild;

                        // Checkbox styling
                        const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                        expect(checkboxStyle.height).toBe(measurePixelString(.75 * textSize));
                        expect(checkboxStyle.width).toBe(measurePixelString(.75 * textSize));
                        expect(checkboxStyle.marginRight).toBe(measurePixelString(PixelConverter.fromPointToPixel(.25 * textSize)));
                        expect(checkboxStyle.marginBottom).toBe(measurePixelString(PixelConverter.fromPointToPixel(.25 * textSize)));

                        // // Span (label) styling
                        const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                        expect(labelStyle.fontSize).toBe(fontSizeString(textSize));
                    });

                    done();
                });
            });

            it(`Double click title -> enable zoom [dataset: ${index + 1}]`, (done) => {
                const dataViewTest = testData.getDataView();
                const textSize = defaultSettings.items.textSize * (1 + (defaultSettings.mobile.enLarge /  100));
                visualBuilder.updateRenderTimeout(dataViewTest, () => {
                    const headerTitle = visualBuilder.element.find(".headerText");
                    headerTitle.click();
                    headerTitle.click(); // 'Fake' double click as implementation is needed due different behavior for mobile

                    const enableZoom = (visualBuilder.properties[0].merge[0].properties["enable"] as boolean);

                    expect(enableZoom).toBe(true);

                    done();
                });
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
                            const expanded: string[] = (visualBuilder.properties[0].merge[0].properties["expanded"] as string).split(",");

                            expect(expanded).toEqual(expandedToBe.expanded);

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
                            const expanded: string[] = (visualBuilder.properties[0].merge[0].properties["expanded"] as string).split(",");

                            expect(expanded).toEqual(expandedToBe.expanded);

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
                                const removeExpanded: VisualObjectInstance = visualBuilder.properties[1].remove[0];
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

                it(`Click 'Clear All' with no selection [dataset: ${index + 1}]`, (done) => {
                    const dataViewTest = testData.getDataView();
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const clearAllButton = visualBuilder.element.find(".slicerHeader").find(".clear");

                        clearAllButton.click();

                        expect(visualBuilder.properties.length).toBe(0);

                        done();
                    });
                });

                it(`Click 'Clear All' with all item selected [dataset: ${index + 1}]`, (done) => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    dataViewTest.metadata.objects = {
                        selection: {
                            singleSelect: false,
                            selectAll: true
                        },
                        general: {
                            expanded: expandedToBe.expanded.join(","),
                            selectAll: true
                        }
                    };
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const clearAllButton = visualBuilder.element.find(".slicerHeader").find(".clear");

                        clearAllButton.click();

                        const removeSelectAll = visualBuilder.properties[0].remove[0];
                        expect(removeSelectAll).not.toBeEmpty();

                        const filter = visualBuilder.filter;
                        expect(filter).toBe(null);

                        done();
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
                    const selector = HierarchySlicer.ItemContainerExpander.selectorName;
                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const firstExpander = visualBuilder.element.find(selector)[0];
                        firstExpander.click();
                        const expanded: string[] = (visualBuilder.properties[0].merge[0].properties["expanded"] as string).split(",");

                        expect(expanded).toEqual(expandedToBe.expanded);

                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedToBe.expanded.join(",")
                            }
                        };

                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            expect(visualBuilder.element.find(".visibleGroup").children(".row").length)
                                .toBe(expandedToBe.number);

                            const firstExpander = visualBuilder.element.find(selector)[0];
                            firstExpander.click();

                            const removeExpanded: VisualObjectInstance = visualBuilder.properties[1].remove[0];
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

                testData.getSelectedTests().forEach((selectedTest: SelectTest, testIndex: number) => {
                    it(`Select item: ${selectedTest.description || (selectedTest.clickedDataPoints[0] + 1)}`, (done) => {
                        // Items are selected via 'ItemContainerChild'
                        const selector = HierarchySlicer.ItemContainerChild.selectorName;
                        const dataViewTest = testData.getDataView();
                        const expandedToBe = testData.getFullExpanded();
                        const allItemsCnt = testData.getOwnIds().length;
                        const selectedItemsCnt = selectedTest.selectedDataPoints.length + selectedTest.partialDataPoints.length;
                        dataViewTest.metadata.objects = {
                            selection: {
                                singleSelect: selectedTest.clickedDataPoints.length === 1
                            },
                            general: {
                                expanded: expandedToBe.expanded.join(",")
                            }
                        };

                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            selectedTest.clickedDataPoints.forEach((dataPoint) => {
                                const selectedItem = visualBuilder.element.find(selector)[dataPoint];
                                selectedItem.click();
                            });

                            const filter: any = (visualBuilder.filter as any);

                            if (!selectedTest.isSwitched) {
                                expect(filter.target).toEqual(selectedTest.target);
                                expect(filter.values).toEqual(selectedTest.values);
                            }

                            const itemCheckBoxes: HTMLElement[] = (visualBuilder.element.find(".visibleGroup").children(".row").find(".slicerCheckbox")).toArray();

                            selectedTest.selectedDataPoints.forEach((datePoint) => {
                                expect(itemCheckBoxes[datePoint]).toHaveClass("selected");
                            });

                            selectedTest.partialDataPoints.forEach((datePoint) => {
                                expect(itemCheckBoxes[datePoint]).toHaveClass("partiallySelected");
                            });

                            expect(itemCheckBoxes.filter((element) => element.classList.contains("selected")).length)
                                .toBe(selectedTest.selectedDataPoints.length);

                            expect(itemCheckBoxes.filter((element) => element.classList.contains("partiallySelected")).length)
                                .toBe(selectedTest.partialDataPoints.length);

                            expect(itemCheckBoxes.filter((element) => !element.classList.contains("selected") && !element.classList.contains("partiallySelected")).length)
                                .toBe(allItemsCnt - selectedItemsCnt);

                            done();
                        });
                    });
                });

                it(`Select 'Select All'`, (done) => {
                    // Items are selected via 'ItemContainerChild'
                    const selector = HierarchySlicer.ItemContainerChild.selectorName;
                    const dataViewTest = testData.getDataView();
                    const expandedToBe = testData.getFullExpanded();
                    const allItemsCnt = testData.getOwnIds().length;
                    dataViewTest.metadata.objects = {
                        selection: {
                            singleSelect: false,
                            selectAll: true
                        },
                        general: {
                            expanded: expandedToBe.expanded.join(",")
                        }
                    };

                    visualBuilder.updateRenderTimeout(dataViewTest, () => {
                        const selectedItem = visualBuilder.element.find(selector)[0];
                        selectedItem.click();
                        const selectedAll: boolean = (visualBuilder.properties[0].merge[0].properties["selectAll"] as boolean);

                        expect(selectedAll).toBe(true);

                        // Check render selection before visual callback
                        const itemCheckBoxes: HTMLElement[] = (visualBuilder.element.find(".visibleGroup").children(".row").find(".slicerCheckbox")).toArray();

                        expect(itemCheckBoxes.filter((element) => element.classList.contains("selected")).length)
                            .toBe(allItemsCnt + 1);

                        expect(itemCheckBoxes.filter((element) => element.classList.contains("partiallySelected")).length)
                            .toBe(0);

                        expect(itemCheckBoxes.filter((element) => !element.classList.contains("selected") && !element.classList.contains("partiallySelected")).length)
                            .toBe(0);

                        dataViewTest.metadata.objects = {
                            selection: {
                                singleSelect: false,
                                selectAll: true
                            },
                            general: {
                                expanded: expandedToBe.expanded.join(","),
                                selectAll: true
                            }
                        };

                        // Check render selection after callback
                        visualBuilder.updateRenderTimeout(dataViewTest, () => {
                            const itemCheckBoxes: HTMLElement[] = (visualBuilder.element.find(".visibleGroup").children(".row").find(".slicerCheckbox")).toArray();

                            expect(itemCheckBoxes.filter((element) => element.classList.contains("selected")).length)
                                .toBe(allItemsCnt + 1);

                            expect(itemCheckBoxes.filter((element) => element.classList.contains("partiallySelected")).length)
                                .toBe(0);

                            expect(itemCheckBoxes.filter((element) => !element.classList.contains("selected") && !element.classList.contains("partiallySelected")).length)
                                .toBe(0);

                            // Deselect 'Select All'
                            selectedItem.click();
                            const removeSelectedAll = visualBuilder.properties[2].remove[0];
                            expect(removeSelectedAll).not.toBeEmpty();

                            expect(itemCheckBoxes.filter((element) => !element.classList.contains("selected") && !element.classList.contains("partiallySelected")).length)
                                .toBe(allItemsCnt + 1);

                            done();
                        });
                    });
                });
            });

            describe(`Bookmarks [dataset: ${index + 1}] =>`, () => {
                testData.getSelectedTests().forEach((selectedTest: SelectTest, testIndex: number) => {
                    it(`Set filter for test: ${selectedTest.description || (selectedTest.clickedDataPoints[0] + 1)}`, (done) => {
                        const selector = HierarchySlicer.ItemContainerChild.selectorName;
                        const dataViewTest = testData.getDataView();
                        const expandedToBe = testData.getFullExpanded();
                        const allItemsCnt = testData.getOwnIds().length;
                        const selectedItemsCnt = selectedTest.selectedDataPoints.length + selectedTest.partialDataPoints.length;
                        const filter = [{
                            target: selectedTest.target,
                            operator: "In",
                            values: selectedTest.values,
                            $schema: "http://powerbi.com/product/schema#tuple",
                            filterType: 6
                        }];
                        dataViewTest.metadata.objects = {
                            selection: {
                                singleSelect: selectedTest.clickedDataPoints.length === 1
                            },
                            general: {
                                expanded: expandedToBe.expanded.join(",")
                            }
                        };

                        visualBuilder.updateRenderTimeoutWithCustomFilter(dataViewTest, () => {

                            const itemCheckBoxes: HTMLElement[] = (visualBuilder.element.find(".visibleGroup").children(".row").find(".slicerCheckbox")).toArray();

                            selectedTest.selectedDataPoints.forEach((datePoint) => {
                                expect(itemCheckBoxes[datePoint]).toHaveClass("selected");
                            });

                            selectedTest.partialDataPoints.forEach((datePoint) => {
                                expect(itemCheckBoxes[datePoint]).toHaveClass("partiallySelected");
                            });

                            expect(itemCheckBoxes.filter((element) => element.classList.contains("selected")).length)
                                .toBe(selectedTest.selectedDataPoints.length);

                            expect(itemCheckBoxes.filter((element) => element.classList.contains("partiallySelected")).length)
                                .toBe(selectedTest.partialDataPoints.length);

                            expect(itemCheckBoxes.filter((element) => !element.classList.contains("selected") && !element.classList.contains("partiallySelected")).length)
                                .toBe(allItemsCnt - selectedItemsCnt);

                            done();
                        }, filter);
                    });
                });
            });
        });
    });
});

describe('HierarchySlicer in high constrast mode =>', () => {
    const highConstrastBackgroundColor: string = "#000000";
    const highConstrastForegroundColor: string = "#00FF00";
    const highConstrastForegroundSelectedColor: string = "#FFFF00";

    let visualBuilder: HierarchySlicerBuilder,
        testData: HierarchyData,
        defaultSettings: HierarchySlicerSettings;

    beforeEach(() => {
        visualBuilder = new HierarchySlicerBuilder(1000, 500);
        visualBuilder.element.find(".slicerContainer").addClass("hasSelection"); // Select visual
        defaultSettings = new HierarchySlicerSettings();

        testData = new HierarchyDataSet1();

        visualBuilder.visualHost.colorPalette.isHighContrast = true;
        visualBuilder.visualHost.colorPalette.background = { value: highConstrastBackgroundColor };
        visualBuilder.visualHost.colorPalette.foreground = { value: highConstrastForegroundColor };
        visualBuilder.visualHost.colorPalette.foregroundSelected = { value: highConstrastForegroundSelectedColor };
    });

    it (`Slicer header - fontColor`, (done) => {
        const dataViewTest = testData.getDataView();
        const fontColor = "#FFFFFF";
        dataViewTest.metadata.objects = {
            header: {
                fontColor: fontColor
            }
        };

        visualBuilder.updateRenderTimeout(dataViewTest, () => {
            const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

            expect(headerTextStyle.color).toBe(hexToRgb(highConstrastForegroundColor));

            done();
        });
    });

    it (`Slicer header - backGround`, (done) => {
        const dataViewTest = testData.getDataView();
        const background = "#FFFFFF";
        dataViewTest.metadata.objects = {
            header: {
                background: background
            }
        };

        visualBuilder.updateRenderTimeout(dataViewTest, () => {
            const headerTextStyle = visualBuilder.element.find(".headerText")[0].style;

            expect(headerTextStyle.backgroundColor).toBe(hexToRgb(highConstrastBackgroundColor));

            done();
        });
    });

    it(`Item formatting - fontcolor`, (done) => {
        const dataViewTest = testData.getDataView();
        const fontColor = "#FFFFFF";
        dataViewTest.metadata.objects = {
            items: {
                fontColor: fontColor
            }
        };
        visualBuilder.updateRenderTimeout(dataViewTest, () => {
            const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

            itemContainers.forEach((itemContainer) => {
                if (testData.columnNames.length > 1) {
                    const itemExpander = itemContainer.firstChild;

                    // Expanded icon styling
                    const itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                    expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));
                }

                const itemContainerChild = itemContainer.lastChild;

                // Checkbox styling
                const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                // // Span (label) styling
                const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));
            });

            done();
        });
    });

    it(`Item formatting - fontcolor after hover`, (done) => {
        const dataViewTest = testData.getDataView();
        const hoverColor = "#FF0000";
        const fontColor = "#FFFFFF";
        dataViewTest.metadata.objects = {
            items: {
                fontColor: fontColor,
                hoverColor: hoverColor
            }
        };
        visualBuilder.updateRenderTimeout(dataViewTest, () => {
            const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

            itemContainers.forEach((itemContainer, index) => {
                if (testData.columnNames.length > 1) {
                    let itemExpander = itemContainer.firstChild;
                    // Mouseover event
                    itemExpander.dispatchEvent(new MouseEvent('mouseover'));
                    itemExpander = visualBuilder.element.find(".slicerItemContainer").toArray()[index].firstChild;

                    // Expanded icon styling
                    let itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                    expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));

                    // Mouseout event
                    itemExpander.dispatchEvent(new MouseEvent('mouseout'));
                    itemExpander = visualBuilder.element.find(".slicerItemContainer").toArray()[index].firstChild;
                    // Expanded icon styling
                    itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                    expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));
                }

                let itemContainerChild = itemContainer.lastChild;
                // Mouseover event
                itemContainerChild.dispatchEvent(new MouseEvent('mouseover'));
                itemContainerChild = visualBuilder.element.find(".slicerItemContainer").toArray()[index].lastChild;

                // Checkbox styling
                let checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                let labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));

                // Mouseout event
                itemContainerChild.dispatchEvent(new MouseEvent('mouseout'));
                itemContainerChild = visualBuilder.element.find(".slicerItemContainer").toArray()[index].lastChild;

                // Checkbox styling
                checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));
            });

            done();
        });
    });

    it(`Item formatting - hoverColor`, (done) => {
        const dataViewTest = testData.getDataView();
        const hoverColor = "#FF0000";
        dataViewTest.metadata.objects = {
            items: {
                hoverColor: hoverColor
            }
        };
        visualBuilder.updateRenderTimeout(dataViewTest, () => {
            const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

            itemContainers.forEach((itemContainer, index) => {
                if (testData.columnNames.length > 1) {
                    let itemExpander = itemContainer.firstChild;
                    itemExpander.dispatchEvent(new MouseEvent('mouseover'));

                    itemExpander = visualBuilder.element.find(".slicerItemContainer").toArray()[index].firstChild;

                    // Expanded icon styling
                    const itemExpanderStyle = (itemExpander.firstChild as HTMLElement).style;
                    expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));
                }

                let itemContainerChild = itemContainer.lastChild;
                itemContainerChild.dispatchEvent(new MouseEvent('mouseover'));

                itemContainerChild = visualBuilder.element.find(".slicerItemContainer").toArray()[index].lastChild;

                // // Checkbox styling
                const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                const labelStyle = (itemContainerChild.lastChild as HTMLElement).style;
                expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));
            });

            done();
        });
    });

    it(`Item formatting - selectColor`, (done) => {
        const dataViewTest = testData.getDataView();
        const selectedColor = "#0000FF";
        dataViewTest.metadata.objects = {
            general: {
                selectAll: true
            },
            selection: {
                selectAll: true
            },
            items: {
                selectedColor: selectedColor
            }
        };
        visualBuilder.updateRenderTimeout(dataViewTest, () => {
            const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

            itemContainers.forEach((itemContainer) => {
                const itemContainerChild = itemContainer.lastChild;

                // Checkbox styling
                const checkboxStyle = (itemContainerChild.firstChild.lastChild as HTMLElement).style;
                expect(checkboxStyle.backgroundColor).toBe(hexToRgb(highConstrastForegroundSelectedColor));
            });

            done();
        });
    });

    it(`Item formatting - background`, (done) => {
        const dataViewTest = testData.getDataView();
        const background = "#0000FF";
        dataViewTest.metadata.objects = {
            general: {
                selectAll: true
            },
            selection: {
                selectAll: true
            },
            items: {
                background: background
            }
        };
        visualBuilder.updateRenderTimeout(dataViewTest, () => {
            const itemContainers = visualBuilder.element.find(".slicerItemContainer").toArray();

            itemContainers.forEach((itemContainer) => {
                const containerStyle = (itemContainer as HTMLElement).style;
                expect(containerStyle.backgroundColor).toBe(hexToRgb(highConstrastBackgroundColor));
            });

            done();
        });
    });
});

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

function fontFamilyString(fontFamily: string) {
    return fontFamily.replace(/'/g, '"');
}

function fontStyleString(fontStyle: FontStyle) {
    switch (fontStyle) {
        case FontStyle.Normal:
            return "normal";
        case FontStyle.Italic:
            return "italic";
    }
}

function fontSizeString(fontSize: number) {
    return `${fontSize}pt`;
}

function measurePixelString(measure: number, ptpx: string = "px") {
    const numberOfAllDigits = 6;
    const numberOfDigits = numberOfAllDigits - (measure < 0 ? Math.ceil(measure) : Math.floor(measure)).toString().length;
    return `${Math.round(measure * Math.pow(10, numberOfDigits)) / Math.pow(10, numberOfDigits)}${ptpx}`;
}