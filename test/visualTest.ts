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

import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import { TextProperties } from "powerbi-visuals-utils-formattingutils/lib/src/interfaces";
import { pixelConverter } from "powerbi-visuals-utils-typeutils";

import PixelConverter = pixelConverter;

import { HierarchySlicer } from "../src/hierarchySlicer";

import { visualBuilder } from "./visualBuilder";
import { HierarchyData, FullExpanded, ExpandTest, SelectTest, DataSourceKind } from "./visualData";
import { visualUnitTests } from "./visualUnitTests";
import { hexToRgb, fontSizeString, measurePixelString, fontFamilyString, fontStyleString } from "./visualTestUtils";

import { HierarchyDataSet1 } from "./datasets/HierarchyDataSet1";
import { HierarchyDataSet2 } from "./datasets/HierarchyDataSet2";
import { HierarchyDataSet3 } from "./datasets/HierarchyDataSet3";
import { HierarchyDataSet4 } from "./datasets/HierarchyDataSet4";
import { HierarchyDataSet5 } from "./datasets/HierarchyDataSet5";
import { HierarchyDataSet6 } from "./datasets/HierarchyDataSet6";
import { HierarchyDataSet7 } from "./datasets/HierarchyDataSet7";

import { HierarchySlicerSettings } from "../src/hierarchySlicerSettings";
import { FontStyle, FontWeight, BorderStyle, Zoomed, SearchFilter } from "../src/enums";
import { converter } from "../src/converter";
import { IHierarchySlicerData } from "../src/interfaces";
import { IFilterTarget } from "powerbi-models";

const hideMembers: number[] = [0, 1, 2];
const renderTimeout: number = 125;

describe("HierarchySlicer unittests =>", () => {
    // tslint:disable-next-line: mocha-no-side-effect-code
    visualUnitTests();
});

describe("HierachySlicer default rendering =>", () => {
    let vBuilder: visualBuilder,
        testData: HierarchyData = new HierarchyDataSet1(), // tslint:disable-line: mocha-no-side-effect-code
        defaultSettings: HierarchySlicerSettings;

    beforeEach(() => {
        vBuilder = new visualBuilder(1000, 500);
        $($(vBuilder.element))
            .find(".slicerContainer")
            .addClass("hasSelection"); // Select visual
        defaultSettings = new HierarchySlicerSettings();
        testData = new HierarchyDataSet1();
    });

    describe(`Basic render tests =>`, () => {
        it(`no dataView, show watermark`, done => {
            vBuilder.updateRenderTimeout(
                [],
                () => {
                    expect($(vBuilder.element).find("svg").length).toBe(1); // Watermark is a SVG drawing

                    expect(
                        $(vBuilder.element)
                            .find("svg")
                            .find("rect").length
                    ).toBe(22); // rect in Watermark

                    expect(
                        $(vBuilder.element)
                            .find(".visibleGroup")
                            .children(".row").length
                    ).toBe(0); // No row items

                    done();
                },
                renderTimeout
            );
        });

        it(`default settings [dataset: ${testData.DataSetName}]`, done => {
            const dataViewTest = testData.getDataView();
            vBuilder.updateRenderTimeout(
                dataViewTest,
                () => {
                    const rowLength: number = testData.getItemCount(1); // Collapse all

                    expect(
                        $(vBuilder.element)
                            .find(".visibleGroup")
                            .children(".row").length
                    ).toBe(rowLength);

                    const slicerBodyHeightToBe =
                        vBuilder.viewport.height -
                        textMeasurementService.estimateSvgTextHeight(<TextProperties>{
                            fontFamily: HierarchySlicer.DefaultFontFamily,
                            fontSize: PixelConverter.fromPoint(defaultSettings.header.textSize),
                        }) -
                        defaultSettings.header.borderBottomWidth;

                    expect($(vBuilder.element).find(".slicerBody")[0]).toHaveCss({
                        height: `${slicerBodyHeightToBe.toString()}px`,
                    });

                    expect(
                        $(vBuilder.element)
                            .find(".slicerBody")
                            .attr("width")
                    ).toBe(vBuilder.viewport.width.toString());

                    done();
                },
                renderTimeout
            );
        });

        it(`default item formatting [dataset: ${testData.DataSetName}]`, done => {
            const dataViewTest = testData.getDataView();
            vBuilder.updateRenderTimeout(
                dataViewTest,
                () => {
                    const itemContainers = $(vBuilder.element)
                        .find(".slicerItemContainer")
                        .toArray();

                    itemContainers.forEach((itemContainer: any) => {
                        expect(itemContainer.children.length).toBe(2);

                        if (testData.columnNames.length > 1) {
                            const itemExpander = itemContainer.firstChild;
                            expect(itemExpander && itemExpander.childNodes.length).toBe(2);

                            // Expanded icon styling
                            const itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild)).style;
                            expect(itemExpanderStyle.fill).toBe(hexToRgb(defaultSettings.items.checkBoxColor));
                            expect(itemExpanderStyle.fontSize).toBe(fontSizeString(defaultSettings.items.textSize));
                        }

                        const itemContainerChild = itemContainer.lastChild;
                        expect(itemContainerChild && itemContainerChild.childNodes.length).toBe(4);

                        // Checkbox styling
                        const checkboxStyle = (<HTMLElement>(
                            (itemContainerChild &&
                                itemContainerChild.firstChild &&
                                itemContainerChild.firstChild.lastChild)
                        )).style;
                        expect(checkboxStyle.height).toBe(measurePixelString(0.75 * defaultSettings.items.textSize));
                        expect(checkboxStyle.width).toBe(measurePixelString(0.75 * defaultSettings.items.textSize));
                        expect(checkboxStyle.marginRight).toBe(
                            measurePixelString(PixelConverter.fromPointToPixel(0.25 * defaultSettings.items.textSize))
                        );
                        expect(checkboxStyle.marginBottom).toBe(
                            measurePixelString(PixelConverter.fromPointToPixel(0.25 * defaultSettings.items.textSize))
                        );

                        // Span (label) styling
                        const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                            .style;
                        expect(labelStyle.color).toBe(hexToRgb(defaultSettings.items.fontColor));
                        expect(labelStyle.fontFamily).toBe(fontFamilyString(defaultSettings.items.fontFamily));
                        expect(labelStyle.fontStyle).toBe(fontStyleString(defaultSettings.items.fontStyle));
                        expect(labelStyle.fontWeight).toBe(defaultSettings.items.fontWeight.toString());
                        expect(labelStyle.fontSize).toBe(fontSizeString(defaultSettings.items.textSize));

                        // Tooltip icon styling
                        const tooltipStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[2]))
                            .style;
                        expect(tooltipStyle.fill).toBe(hexToRgb(defaultSettings.tooltipSettings.color));
                        expect(tooltipStyle.stroke).toBe(hexToRgb(defaultSettings.tooltipSettings.color));
                    });

                    done();
                },
                renderTimeout
            );
        });

        it(`default item labels [dataset: ${testData.DataSetName}]`, done => {
            const dataViewTest = testData.getDataView();
            const expandedToBe: FullExpanded = testData.getFullExpanded();
            dataViewTest.metadata.objects = {
                general: {
                    expanded: expandedToBe.expanded.join("*|*"),
                },
            };
            vBuilder.updateRenderTimeout(
                dataViewTest,
                () => {
                    testData.getItemLabels().forEach((label, index) => {
                        const item = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .find(".slicerText")[index];

                        expect(item).toHaveText(label);
                    });

                    done();
                },
                renderTimeout
            );
        });
    });
});

describe("HierachySlicer data interactions =>", () => {
    let vBuilder: visualBuilder, defaultSettings: HierarchySlicerSettings;

    beforeEach(() => {
        vBuilder = new visualBuilder(1000, 500);
        $(vBuilder.element)
            .find(".slicerContainer")
            .addClass("hasSelection"); // Select visual
        defaultSettings = new HierarchySlicerSettings();
    });

    // tslint:disable-next-line: mocha-no-side-effect-code
    const dataSets: HierarchyData[] = [
        new HierarchyDataSet1(),
        new HierarchyDataSet2(),
        new HierarchyDataSet3(),
        new HierarchyDataSet4(),
        new HierarchyDataSet5(),
        new HierarchyDataSet6(),
        new HierarchyDataSet7(),
        // new HierarchyDataSet8(),
    ];

    // tslint:disable-next-line: mocha-no-side-effect-code max-func-body-length
    dataSets.forEach(testData => {
        describe(`converter tests [dataset: ${testData.DataSetName}] =>`, () => {
            it(`same list of ownIds`, done => {
                const dataViewTest = testData.getDataView();
                const testOwnIds = testData.getOwnIds();
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const data: IHierarchySlicerData = <IHierarchySlicerData>(
                            converter(dataViewTest, [], "", SearchFilter.Wildcard, defaultSettings)
                        );
                        data.dataPoints.forEach((dataPoint, index) =>
                            dataPoint.ownId.forEach((id, i) => expect(id).toEqual(testOwnIds[index][i]))
                        );

                        done();
                    },
                    renderTimeout
                );
            });
        });

        describe(`Visual context menu [dataset: ${testData.DataSetName}] =>`, () => {
            it(`Search on (selfFilterEnabled: true) [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const slicerBodyHeightToBe =
                            vBuilder.viewport.height -
                            textMeasurementService.estimateSvgTextHeight(<TextProperties>{
                                fontFamily: HierarchySlicer.DefaultFontFamily,
                                fontSize: PixelConverter.fromPoint(defaultSettings.search.textSize),
                            }) -
                            textMeasurementService.estimateSvgTextHeight(<TextProperties>{
                                fontFamily: HierarchySlicer.DefaultFontFamily,
                                fontSize: PixelConverter.fromPoint(defaultSettings.header.textSize),
                            }) -
                            defaultSettings.header.borderBottomWidth -
                            2;
                        const slicerBodyHeightStyle = (<HTMLElement>$(vBuilder.element).find(".slicerBody")[0]).style
                            .height;

                        expect(slicerBodyHeightStyle).toBe(`${slicerBodyHeightToBe.toString()}px`);

                        done();
                    },
                    renderTimeout
                );
            });

            testData.getSearchTests().forEach((searchTest, index) => {
                it(`Search for ${searchTest.searchString} [dataset: ${index + 1}`, done => {
                    const selector = HierarchySlicer.ItemContainerChild.selectorName;
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    dataViewTest.metadata.objects = {
                        general: {
                            selfFilterEnabled: true,
                            expanded: expandedToBe.expanded.join("*|*"),
                        },
                    };

                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const searchInput = $(vBuilder.element).find(".searchInput");
                            searchInput.val(searchTest.searchString);
                            searchInput[0].dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

                            const searchCallBack = vBuilder.properties[0].merge;
                            expect(searchCallBack).not.toBeEmpty();

                            vBuilder.updateRenderTimeout(
                                dataViewTest,
                                () => {
                                    expect(
                                        $(vBuilder.element)
                                            .find(".visibleGroup")
                                            .children(".row").length
                                    ).toBe(searchTest.results);

                                    const item = $(vBuilder.element)
                                        .find(selector)
                                        .toArray()
                                        .filter(
                                            (row: any, index: number) =>
                                                $(row).find(".slicerText")[0].textContent === searchTest.searchString
                                        );

                                    $(item).click();

                                    vBuilder.updateRenderTimeout(
                                        dataViewTest,
                                        () => {
                                            const itemCheckBoxes: HTMLElement[] = <HTMLElement[]>$(vBuilder.element)
                                                .find(".visibleGroup")
                                                .children(".row")
                                                .find(".slicerCheckbox")
                                                .toArray();

                                            searchTest.selectedDataPoints &&
                                                searchTest.selectedDataPoints.forEach(dataPoint => {
                                                    expect(itemCheckBoxes[dataPoint]).toHaveClass("selected");
                                                });

                                            searchTest.partialDataPoints &&
                                                searchTest.partialDataPoints.forEach(dataPoint => {
                                                    expect(itemCheckBoxes[dataPoint]).toHaveClass("partiallySelected");
                                                });
                                            done();
                                        },
                                        renderTimeout
                                    );
                                },
                                renderTimeout
                            );
                        },
                        renderTimeout
                    );
                });
            });

            testData.getSearchTests().forEach((searchTest, index) => {
                it(`Search for ${searchTest.searchString} with 'Select All' [dataset: ${index + 1}`, done => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    dataViewTest.metadata.objects = {
                        general: {
                            selfFilterEnabled: true,
                            expanded: expandedToBe.expanded.join("*|*"),
                        },
                        selection: {
                            singleSelect: false,
                            selectAll: true,
                        },
                    };

                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const searchInput = $(vBuilder.element).find(".searchInput");
                            searchInput.val(searchTest.searchString);
                            searchInput[0].dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

                            const searchCallBack = vBuilder.properties[0].merge;
                            expect(searchCallBack).not.toBeEmpty();

                            vBuilder.updateRenderTimeout(
                                dataViewTest,
                                () => {
                                    expect(
                                        $(vBuilder.element)
                                            .find(".visibleGroup")
                                            .children(".row").length
                                    ).toBe(searchTest.results + 1);

                                    done();
                                },
                                renderTimeout
                            );
                        },
                        renderTimeout
                    );
                });
            });
        });

        describe(`Saved settings restored =>`, () => {
            describe(`Restore saved 'expanded' setting [dataset: ${testData.DataSetName}] =>`, () => {
                testData.getExpandedTests().forEach((expandedTest, testIndex) => {
                    it(`Restore expanded [dataset: ${testData.DataSetName}, test: ${testIndex + 1}]`, done => {
                        const dataViewTest = testData.getDataView();
                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedTest.expanded.join("*|*"),
                            },
                        };
                        vBuilder.updateRenderTimeout(
                            dataViewTest,
                            () => {
                                expect(
                                    $(vBuilder.element)
                                        .find(".visibleGroup")
                                        .children(".row").length
                                ).toBe(expandedTest.count);

                                done();
                            },
                            renderTimeout
                        );
                    });
                });

                testData.getExpandedTests().forEach((expandedTest: ExpandTest, testIndex: number) => {
                    it(`Restore expanded (selectAll: true) [dataset: ${testData.DataSetName}, test: ${testIndex +
                        1}]`, done => {
                        const dataViewTest = testData.getDataView();
                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedTest.expanded.join("*|*"),
                            },
                            selection: {
                                singleSelect: false,
                                selectAll: true,
                            },
                        };
                        vBuilder.updateRenderTimeout(
                            dataViewTest,
                            () => {
                                expect(
                                    $(vBuilder.element)
                                        .find(".visibleGroup")
                                        .children(".row").length
                                ).toBe(expandedTest.count + 1);

                                done();
                            },
                            renderTimeout
                        );
                    });
                });
            });
        });

        describe(`Selection settings [dataset: ${testData.DataSetName}] =>`, () => {
            hideMembers.forEach((hideMember: number) => {
                testData.getExpandedTests().forEach((expandedTest: ExpandTest, testIndex: number) => {
                    it(`Restore expanded (hideMembers: ${hideMember}) [dataset: ${testData.DataSetName}]`, done => {
                        const dataViewTest = testData.getDataView();
                        dataViewTest.metadata.objects = {
                            general: {
                                expanded: expandedTest.expanded.join("*|*"),
                            },
                            selection: {
                                hideMembers: hideMember,
                            },
                        };
                        vBuilder.updateRenderTimeout(
                            dataViewTest,
                            () => {
                                expect(
                                    $(vBuilder.element)
                                        .find(".visibleGroup")
                                        .children(".row").length
                                ).toBe(expandedTest.count + expandedTest.hideMembersOffset[hideMember]);
                                done();
                            },
                            renderTimeout
                        );
                    });
                });
            });

            it(`Restore expanded, old settings  (emptyLeafs: false) [dataset: ${testData.DataSetName}]`, done => {
                if (testData.getExpandedTests().length === 0) {
                    done();
                    return;
                }

                // old behavior, now [hideMembers: 1]
                const dataViewTest = testData.getDataView();
                const testValue: ExpandTest = testData.getExpandedTests()[0];
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: testValue.expanded.join("*|*"),
                    },
                    selection: {
                        emptyLeafs: false,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        expect(
                            $(vBuilder.element)
                                .find(".visibleGroup")
                                .children(".row").length
                        ).toBe(testValue.count + testValue.hideMembersOffset[1]);
                        done();
                    },
                    renderTimeout
                );
            });

            it(`Restore expanded, old settings (emptyLeafs: true) [dataset: ${testData.DataSetName}]`, done => {
                if (testData.getExpandedTests().length === 0) {
                    done();
                    return;
                }

                // old behavior, now [hideMembers: 0]
                const dataViewTest = testData.getDataView();
                const testValue: ExpandTest = testData.getExpandedTests()[0];
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: testValue.expanded.join("*|*"),
                    },
                    selection: {
                        emptyLeafs: true,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        expect(
                            $(vBuilder.element)
                                .find(".visibleGroup")
                                .children(".row").length
                        ).toBe(testValue.count + testValue.hideMembersOffset[0]);
                        done();
                    },
                    renderTimeout
                );
            });

            it(`Empty leaf label: xxxxxxx, '' strings are empty: true [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                const emptyLeafLabel = "xxxxxxx";
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: expandedToBe.expanded.join("*|*"),
                    },
                    selection: {
                        emptyLeafLabel: emptyLeafLabel,
                        emptyString: true,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        testData.getItemLabels(true, emptyLeafLabel).forEach((label, index) => {
                            const item = $(vBuilder.element)
                                .find(".slicerItemContainer")
                                .find(".slicerText")[index];
                            expect(item).toHaveText(label);
                            expect(item).not.toHaveText("(Blank)");
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Empty leaf label: xxxxxxx, '' strings are empty: false [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                const emptyLeafLabel = "xxxxxxx";
                dataViewTest.metadata.objects = {
                    general: {
                        expanded: expandedToBe.expanded.join("*|*"),
                    },
                    selection: {
                        emptyLeafLabel: emptyLeafLabel,
                        emptyString: false,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        testData.getItemLabels(false, emptyLeafLabel).forEach((label, index) => {
                            const item = $(vBuilder.element)
                                .find(".slicerItemContainer")
                                .find(".slicerText")[index];
                            expect(item).toHaveText(label);
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Single select: true [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                        expanded: expandedToBe.expanded.join("*|*"),
                    },
                    selection: {
                        singleSelect: false,
                        selectAll: true,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const slicerContainer = $(vBuilder.element).find(".slicerContainer");

                        expect(slicerContainer).not.toHaveClass("isMultiSelectEnabled");

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Single select: false, Multi-select with CTRL: false [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                        expanded: expandedToBe.expanded.join("*|*"),
                    },
                    selection: {
                        singleSelect: false,
                        selectAll: true,
                        ctrlSelect: false,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const slicerContainer = $(vBuilder.element).find(".slicerContainer");

                        expect(slicerContainer).toHaveClass("isMultiSelectEnabled");

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Single select: false, Multi-select with CTRL: true [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const expandedToBe: FullExpanded = testData.getFullExpanded();
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                        expanded: expandedToBe.expanded.join("*|*"),
                    },
                    selection: {
                        singleSelect: false,
                        selectAll: true,
                        ctrlSelect: true,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const slicerContainer = $(vBuilder.element).find(".slicerContainer");

                        expect(slicerContainer).not.toHaveClass("isMultiSelectEnabled");

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Select All label 'xxxxxxx' [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const selectAllLabel = "xxxxxxx";
                dataViewTest.metadata.objects = {
                    selection: {
                        singleSelect: false,
                        selectAll: true,
                        selectAllLabel: selectAllLabel,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const selectAllLabelItem = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .find(".slicerText")[0];

                        expect(selectAllLabelItem).toHaveText(selectAllLabel);

                        done();
                    },
                    renderTimeout
                );
            });
        });

        describe(`Slicer Header settings [dataset: ${testData.DataSetName}] =>`, () => {
            it(`Show: false [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    header: {
                        show: false,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const slicerBodyHeightToBe =
                            vBuilder.viewport.height - defaultSettings.header.borderBottomWidth;
                        const slicerBodyHeightStyle = (<HTMLElement>$(vBuilder.element).find(".slicerBody")[0]).style
                            .height;

                        expect(slicerBodyHeightStyle).toBe(`${slicerBodyHeightToBe.toString()}px`);

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - default label [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    header: {
                        show: true,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = $(vBuilder.element).find(".headerText")[0];

                        expect(headerTextStyle).toContainText(testData.columnLabels[0]);

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - 'xxxxxxxxxx' [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const title = "xxxxxxxxxx";
                dataViewTest.metadata.objects = {
                    header: {
                        show: true,
                        title: title,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = $(vBuilder.element).find(".headerText")[0];

                        expect(headerTextStyle).toContainText(title);

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - Show summary - none selected [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                dataViewTest.metadata.objects = {
                    header: {
                        show: true,
                        restatement: true,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = $(vBuilder.element).find(".headerText")[0];

                        expect(headerTextStyle).toContainText(`${testData.columnLabels[0]}: All`);

                        done();
                    },
                    renderTimeout
                );
            });

            // it(`Slicer header - Show summary - 1 item selected [dataset: ${testData.DataSetName}]`, done => {
            //     const selector = HierarchySlicer.ItemContainerChild.selectorName;
            //     const dataViewTest = testData.getDataView();
            //     const expandedToBe = testData.getFullExpanded();
            //     dataViewTest.metadata.objects = {
            //         selection: {
            //             singleSelect: true,
            //         },
            //         general: {
            //             expanded: expandedToBe.expanded.join("*|*"),
            //         },
            //         header: {
            //             show: true,
            //             restatement: true,
            //         },
            //     };

            //     vBuilder.updateRenderTimeout(
            //         dataViewTest,
            //         () => {
            //             const selectedItem = $(vBuilder.element).find(selector)[0];
            //             selectedItem.click();

            //             vBuilder.updateRenderTimeout(
            //                 dataViewTest,
            //                 () => {
            //                     const firstItemLabel = $(vBuilder.element).find(".slicerText")[0].innerText;
            //                     const headerTextStyle = $(vBuilder.element).find(".headerText")[0].innerText;

            //                     expect(headerTextStyle).toBe(`${testData.columnLabels[0]}: ${firstItemLabel}`);

            //                     done();
            //                 },
            //                 renderTimeout
            //             );
            //         },
            //         renderTimeout
            //     );
            // });

            const borderStyles = [
                { style: BorderStyle.None, result: "0px" },
                { style: BorderStyle.BottomOnly, result: "0px 0px 1px" },
                { style: BorderStyle.TopOnly, result: "1px 0px 0px" },
                { style: BorderStyle.LeftOnly, result: "0px 0px 0px 1px" },
                { style: BorderStyle.RightOnly, result: "0px 1px 0px 0px" },
                { style: BorderStyle.TopBottom, result: "1px 0px" },
                { style: BorderStyle.LeftRight, result: "0px 1px" },
                { style: BorderStyle.Frame, result: "1px" },
            ];
            const dataViewTest = testData.getDataView();
            borderStyles.forEach(borderStyle => {
                it(`Slicer header - outline [style: ${borderStyle.style}, dataset: ${testData.DataSetName}]`, done => {
                    dataViewTest.metadata.objects = {
                        header: {
                            outline: borderStyle.style,
                        },
                    };
                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                            expect(headerTextStyle.borderWidth).toBe(borderStyle.result);

                            done();
                        },
                        renderTimeout
                    );
                });
            });

            it(`Slicer header - fontColor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    header: {
                        fontColor: fontColor,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                        expect(headerTextStyle.color).toBe(hexToRgb(fontColor));

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - background [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const background = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    header: {
                        background: background,
                    },
                };

                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerItems = $(vBuilder.element)
                            .find(".headerText")
                            .toArray();

                        headerItems.forEach((headerItem: HTMLElement) => {
                            expect(headerItem.style.backgroundColor).toBe(hexToRgb(background));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - textSize [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const textSize = 20;
                dataViewTest.metadata.objects = {
                    header: {
                        textSize: textSize,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                        expect(headerTextStyle.fontSize).toBe(fontSizeString(textSize));

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - fontFamily [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontFamily = '"Courier New"';
                dataViewTest.metadata.objects = {
                    header: {
                        fontFamily: fontFamily,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                        expect(headerTextStyle.fontFamily).toBe(fontFamilyString(fontFamily));

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - fontStyle [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontStyle = FontStyle.Italic;
                dataViewTest.metadata.objects = {
                    header: {
                        fontStyle: fontStyle,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                        expect(headerTextStyle.fontStyle).toBe(fontStyleString(fontStyle));

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Slicer header - fontWeight [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontWeight = FontWeight.SemiBold;
                dataViewTest.metadata.objects = {
                    header: {
                        fontWeight: fontWeight,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                        expect(headerTextStyle.fontWeight).toBe(fontWeight.toString());

                        done();
                    },
                    renderTimeout
                );
            });
        });

        describe(`Items settings [dataset: ${testData.DataSetName}] =>`, () => {
            it(`Item formatting - fontcolor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    items: {
                        fontColor: fontColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            const itemContainerChild = itemContainer.lastChild;

                            // Span (label) styling
                            const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.color).toBe(hexToRgb(fontColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - fontcolor after hover [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const hoverColor = "#FF0000";
                const fontColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    items: {
                        fontColor: fontColor,
                        hoverColor: hoverColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any, index: number) => {
                            let itemContainerChild = itemContainer.lastChild;
                            // Mouseover event
                            itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseover"));
                            itemContainerChild = $(vBuilder.element)
                                .find(".slicerItemContainer")
                                .toArray()[index].lastChild;

                            let labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.color).toBe(hexToRgb(hoverColor));

                            // Mouseout event
                            itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseout"));
                            itemContainerChild = $(vBuilder.element)
                                .find(".slicerItemContainer")
                                .toArray()[index].lastChild;

                            labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1])).style;
                            expect(labelStyle.color).toBe(hexToRgb(fontColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - checkBoxColor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const checkBoxColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    items: {
                        checkBoxColor: checkBoxColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            if (testData.columnNames.length > 1) {
                                const itemExpander = itemContainer.firstChild;

                                // Expanded icon styling
                                const itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild))
                                    .style;
                                expect(itemExpanderStyle.fill).toBe(hexToRgb(checkBoxColor));
                            }

                            const itemContainerChild = itemContainer.lastChild;

                            // Checkbox styling
                            const checkboxStyle = (<HTMLElement>(
                                (itemContainerChild &&
                                    itemContainerChild.firstChild &&
                                    itemContainerChild.firstChild.lastChild)
                            )).style;
                            expect(checkboxStyle.borderColor).toBe(hexToRgb(checkBoxColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - tooltipColor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const tooltipIconColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    tooltipSettings: {
                        color: tooltipIconColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            const itemContainerChild = itemContainer.lastChild;

                            // Tooltip icon styling
                            const tooltipStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[2]))
                                .style;
                            expect(tooltipStyle.fill).toBe(hexToRgb(tooltipIconColor));
                            expect(tooltipStyle.stroke).toBe(hexToRgb(tooltipIconColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - checkBoxColor after hover [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const hoverColor = "#FF0000";
                const checkBoxColor = "#FFFFFF";
                dataViewTest.metadata.objects = {
                    items: {
                        checkBoxColor: checkBoxColor,
                        hoverColor: hoverColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any, index: number) => {
                            if (testData.columnNames.length > 1) {
                                let itemExpander = itemContainer.firstChild;
                                // Mouseover event
                                itemExpander && itemExpander.dispatchEvent(new MouseEvent("mouseover"));
                                itemExpander = $(vBuilder.element)
                                    .find(".slicerItemContainer")
                                    .toArray()[index].firstChild;

                                // Expanded icon styling
                                let itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild)).style;
                                expect(itemExpanderStyle.fill).toBe(hexToRgb(hoverColor));

                                // Mouseout event
                                itemExpander && itemExpander.dispatchEvent(new MouseEvent("mouseout"));
                                itemExpander = $(vBuilder.element)
                                    .find(".slicerItemContainer")
                                    .toArray()[index].firstChild;
                                // Expanded icon styling
                                itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild)).style;
                                expect(itemExpanderStyle.fill).toBe(hexToRgb(checkBoxColor));
                            }

                            let itemContainerChild = itemContainer.lastChild;
                            // Mouseover event
                            itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseover"));
                            itemContainerChild = $(vBuilder.element)
                                .find(".slicerItemContainer")
                                .toArray()[index].lastChild;

                            // Checkbox styling
                            let checkboxStyle = (<HTMLElement>(
                                (itemContainerChild &&
                                    itemContainerChild.firstChild &&
                                    itemContainerChild.firstChild.lastChild)
                            )).style;
                            expect(checkboxStyle.borderColor).toBe(hexToRgb(hoverColor));

                            // Mouseout event
                            itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseout"));
                            itemContainerChild = $(vBuilder.element)
                                .find(".slicerItemContainer")
                                .toArray()[index].lastChild;

                            // Checkbox styling
                            checkboxStyle = (<HTMLElement>(
                                (itemContainerChild &&
                                    itemContainerChild.firstChild &&
                                    itemContainerChild.firstChild.lastChild)
                            )).style;
                            expect(checkboxStyle.borderColor).toBe(hexToRgb(checkBoxColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - hoverColor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const hoverColor = "#FF0000";
                dataViewTest.metadata.objects = {
                    items: {
                        hoverColor: hoverColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any, index: number) => {
                            if (testData.columnNames.length > 1) {
                                let itemExpander = itemContainer.firstChild;
                                itemExpander && itemExpander.dispatchEvent(new MouseEvent("mouseover"));

                                itemExpander = $(vBuilder.element)
                                    .find(".slicerItemContainer")
                                    .toArray()[index].firstChild;

                                // Expanded icon styling
                                const itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild))
                                    .style;
                                expect(itemExpanderStyle.fill).toBe(hexToRgb(hoverColor));
                            }

                            let itemContainerChild = itemContainer.lastChild;
                            itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseover"));

                            itemContainerChild = $(vBuilder.element)
                                .find(".slicerItemContainer")
                                .toArray()[index].lastChild;

                            // // Checkbox styling
                            const checkboxStyle = (<HTMLElement>(
                                (itemContainerChild &&
                                    itemContainerChild.firstChild &&
                                    itemContainerChild.firstChild.lastChild)
                            )).style;
                            expect(checkboxStyle.borderColor).toBe(hexToRgb(hoverColor));

                            const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.color).toBe(hexToRgb(hoverColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - selectColor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const selectedColor = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selectAll: true,
                    },
                    selection: {
                        singleSelect: false,
                        selectAll: true,
                    },
                    items: {
                        selectedColor: selectedColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            const itemContainerChild = itemContainer.lastChild;

                            // Checkbox styling
                            const checkboxStyle = (<HTMLElement>(
                                (itemContainerChild &&
                                    itemContainerChild.firstChild &&
                                    itemContainerChild.firstChild.lastChild)
                            )).style;
                            expect(checkboxStyle.backgroundColor).toBe(hexToRgb(selectedColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - background [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const background = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selectAll: true,
                    },
                    selection: {
                        singleSelect: false,
                        selectAll: true,
                    },
                    items: {
                        background: background,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            const containerStyle = (<HTMLElement>itemContainer).style;
                            expect(containerStyle.backgroundColor).toBe(hexToRgb(background));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - textSize [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const textSize = 16;
                dataViewTest.metadata.objects = {
                    items: {
                        textSize: textSize,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            if (testData.columnNames.length > 1) {
                                const itemExpander = itemContainer.firstChild;

                                // Expanded icon styling
                                const itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild))
                                    .style;
                                expect(itemExpanderStyle.fontSize).toBe(fontSizeString(textSize));
                            }

                            const itemContainerChild = itemContainer.lastChild;

                            // Checkbox styling
                            const checkboxStyle = (<HTMLElement>(
                                (itemContainerChild &&
                                    itemContainerChild.firstChild &&
                                    itemContainerChild.firstChild.lastChild)
                            )).style;
                            expect(checkboxStyle.height).toBe(measurePixelString(0.75 * textSize));
                            expect(checkboxStyle.width).toBe(measurePixelString(0.75 * textSize));
                            expect(checkboxStyle.marginRight).toBe(
                                measurePixelString(PixelConverter.fromPointToPixel(0.25 * textSize))
                            );
                            expect(checkboxStyle.marginBottom).toBe(
                                measurePixelString(PixelConverter.fromPointToPixel(0.25 * textSize))
                            );

                            // // Span (label) styling
                            const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.fontSize).toBe(fontSizeString(textSize));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - fontFamily [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontFamily = '"Courier New"';
                dataViewTest.metadata.objects = {
                    items: {
                        fontFamily: fontFamily,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            const itemContainerChild = itemContainer.lastChild;

                            const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.fontFamily).toBe(fontFamilyString(fontFamily));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - fontStyle [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontStyle = FontStyle.Italic;
                dataViewTest.metadata.objects = {
                    items: {
                        fontStyle: fontStyle,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            const itemContainerChild = itemContainer.lastChild;

                            const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.fontStyle).toBe(fontStyleString(fontStyle));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Item formatting - fontWeight [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontWeight = FontWeight.Light;
                dataViewTest.metadata.objects = {
                    items: {
                        fontWeight: fontWeight,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            const itemContainerChild = itemContainer.lastChild;

                            const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.fontWeight).toBe(fontWeight.toString());
                        });

                        done();
                    },
                    renderTimeout
                );
            });
        });

        describe(`Search settings [dataset: ${testData.DataSetName}] =>`, () => {
            it(`Search formatting - fontColor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const fontColor = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                    },
                    search: {
                        fontColor: fontColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const searchHeader = $(vBuilder.element).find(".searchHeader")[0];

                        const inputStyle = (<HTMLElement>searchHeader.childNodes[1]).style;
                        expect(inputStyle.color).toBe(hexToRgb(fontColor));

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Search formatting - iconColor [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const iconColor = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                    },
                    search: {
                        iconColor: iconColor,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const searchHeader = $(vBuilder.element).find(".searchHeader")[0];

                        const icons = $(searchHeader)
                            .find(".icon")
                            .toArray();
                        icons.forEach((icon: HTMLElement) => {
                            const iconStyle = icon.style;
                            expect(iconStyle.fill).toBe(hexToRgb(iconColor));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Search formatting - background [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const background = "#0000FF";
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                    },
                    search: {
                        background: background,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const searchHeader = $(vBuilder.element).find(".searchHeader")[0];

                        const inputStyle = (<HTMLElement>searchHeader.childNodes[1]).style;
                        expect(inputStyle.backgroundColor).toBe(hexToRgb(background));

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Search formatting - textSize [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const textSize = 16;
                dataViewTest.metadata.objects = {
                    general: {
                        selfFilterEnabled: true,
                    },
                    search: {
                        textSize: textSize,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const searchHeader = $(vBuilder.element).find(".searchHeader");

                        const icons = $(searchHeader)
                            .find(".search")
                            .toArray();
                        icons.forEach((icon: HTMLElement) => {
                            const iconStyle = icon.style;
                            expect(iconStyle.height).toBe(
                                measurePixelString(Math.ceil(0.95 * PixelConverter.fromPointToPixel(textSize)), "px")
                            );
                            expect(iconStyle.width).toBe(
                                measurePixelString(Math.ceil(0.95 * PixelConverter.fromPointToPixel(textSize)), "px")
                            );
                        });

                        const inputStyle = (<HTMLElement>searchHeader[0].childNodes[1]).style;
                        expect(inputStyle.fontSize).toBe(fontSizeString(textSize));

                        done();
                    },
                    renderTimeout
                );
            });
        });

        describe(`Zoom mode settings [dataset: ${testData.DataSetName}] =>`, () => {
            it(`Enlarge setting - textSize + 50% [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const enLarge = Zoomed.Normal;
                const textSize = defaultSettings.items.textSize * (1 + enLarge / 100);
                dataViewTest.metadata.objects = {
                    mobile: {
                        enable: true,
                        enLarge: enLarge,
                    },
                };
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const itemContainers = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray();

                        itemContainers.forEach((itemContainer: any) => {
                            if (testData.columnNames.length > 1) {
                                const itemExpander = itemContainer.firstChild;

                                // Expanded icon styling
                                const itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild))
                                    .style;
                                expect(itemExpanderStyle.fontSize).toBe(fontSizeString(textSize));
                            }

                            const itemContainerChild = itemContainer.lastChild;

                            // Checkbox styling
                            const checkboxStyle = (<HTMLElement>(
                                (itemContainerChild &&
                                    itemContainerChild.firstChild &&
                                    itemContainerChild.firstChild.lastChild)
                            )).style;
                            expect(checkboxStyle.height).toBe(measurePixelString(0.75 * textSize));
                            expect(checkboxStyle.width).toBe(measurePixelString(0.75 * textSize));
                            expect(checkboxStyle.marginRight).toBe(
                                measurePixelString(PixelConverter.fromPointToPixel(0.25 * textSize))
                            );
                            expect(checkboxStyle.marginBottom).toBe(
                                measurePixelString(PixelConverter.fromPointToPixel(0.25 * textSize))
                            );

                            // // Span (label) styling
                            const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1]))
                                .style;
                            expect(labelStyle.fontSize).toBe(fontSizeString(textSize));
                        });

                        done();
                    },
                    renderTimeout
                );
            });

            it(`Double click title -> enable zoom [dataset: ${testData.DataSetName}]`, done => {
                const dataViewTest = testData.getDataView();
                const textSize = defaultSettings.items.textSize * (1 + defaultSettings.mobile.enLarge / 100);
                vBuilder.updateRenderTimeout(
                    dataViewTest,
                    () => {
                        const headerTitle = $(vBuilder.element).find(".headerText");
                        headerTitle.click();
                        headerTitle.click(); // 'Fake' double click as implementation is needed due different behavior for mobile

                        const visualProperties = vBuilder.properties[0];
                        const enableZoom =
                            visualProperties &&
                            visualProperties.merge &&
                            visualProperties.merge[0] &&
                            <boolean>visualProperties.merge[0].properties["enable"];

                        expect(enableZoom).toBe(true);

                        done();
                    },
                    renderTimeout
                );
            });
        });

        describe(`Slicer interacton [dataset: ${testData.DataSetName}] =>`, () => {
            describe(`Header buttons [dataset: ${testData.DataSetName}] =>`, () => {
                it(`Click 'Expand All' [dataset: ${testData.DataSetName}]`, done => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const expandAllButton = $(vBuilder.element)
                                .find(".slicerHeader")
                                .find(".expand");

                            if (testData.columnNames.length > 1) {
                                expandAllButton.click();
                                const visualProperties = vBuilder.properties[0];
                                const expanded: string[] = (<string>(
                                    (visualProperties &&
                                        visualProperties.merge &&
                                        visualProperties.merge[0] &&
                                        visualProperties.merge[0].properties["expanded"])
                                )).split("*|*");

                                expect(expanded).toEqual(expandedToBe.expanded);

                                dataViewTest.metadata.objects = {
                                    general: {
                                        expanded: expandedToBe.expanded.join("*|*"),
                                    },
                                };

                                vBuilder.updateRenderTimeout(
                                    dataViewTest,
                                    () => {
                                        expect(
                                            $(vBuilder.element)
                                                .find(".visibleGroup")
                                                .children(".row").length
                                        ).toBe(expandedToBe.length);
                                        done();
                                    },
                                    renderTimeout
                                );
                            } else {
                                expect(expandAllButton).toHaveCss({ opacity: "0" });

                                done();
                            }
                        },
                        renderTimeout
                    );
                });

                it(`Click 'Collapse All' [dataset: ${testData.DataSetName}]`, done => {
                    const dataViewTest = testData.getDataView();
                    const collapseLength: number = testData.getItemCount(1);
                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const collapseAllButton = $(vBuilder.element)
                                .find(".slicerHeader")
                                .find(".collapse");

                            if (testData.columnNames.length > 1) {
                                collapseAllButton.click();

                                vBuilder.updateRenderTimeout(
                                    dataViewTest,
                                    () => {
                                        expect(
                                            $(vBuilder.element)
                                                .find(".visibleGroup")
                                                .children(".row").length
                                        ).toBe(collapseLength);
                                        done();
                                    },
                                    renderTimeout
                                );
                            } else {
                                expect(collapseAllButton).toHaveCss({ opacity: "0" });

                                done();
                            }
                        },
                        renderTimeout
                    );
                });

                it(`Click 'Expand All -> 'Collapse All' [dataset: ${testData.DataSetName}]`, done => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    const collapseLength: number = testData.getItemCount(1);
                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const expandAllButton = $(vBuilder.element)
                                .find(".slicerHeader")
                                .find(".expand");
                            const collapseAllButton = $(vBuilder.element)
                                .find(".slicerHeader")
                                .find(".collapse");

                            if (testData.columnNames.length > 1) {
                                // Click 'Expand All'
                                expandAllButton.click();
                                const visualProperties = vBuilder.properties[0];
                                const expanded: string[] = (<string>(
                                    (visualProperties &&
                                        visualProperties.merge &&
                                        visualProperties.merge[0] &&
                                        visualProperties.merge[0].properties["expanded"])
                                )).split("*|*");

                                expect(expanded).toEqual(expandedToBe.expanded);

                                dataViewTest.metadata.objects = {
                                    general: {
                                        expanded: expandedToBe.expanded.join("*|*"),
                                    },
                                };

                                vBuilder.updateRenderTimeout(
                                    dataViewTest,
                                    () => {
                                        expect(
                                            $(vBuilder.element)
                                                .find(".visibleGroup")
                                                .children(".row").length
                                        ).toBe(expandedToBe.length);

                                        // Click 'Collapse All'
                                        collapseAllButton.click();
                                        // expanded object only removed if there is somthing to collapse
                                        const visualProperties = vBuilder.properties[1];
                                        const removeExpanded = visualProperties.remove && visualProperties.remove[0];
                                        expect(removeExpanded).not.toBeEmpty();

                                        dataViewTest.metadata.objects = undefined;

                                        vBuilder.updateRenderTimeout(
                                            dataViewTest,
                                            () => {
                                                expect(
                                                    $(vBuilder.element)
                                                        .find(".visibleGroup")
                                                        .children(".row").length
                                                ).toBe(collapseLength);
                                                done();
                                            },
                                            renderTimeout
                                        );
                                    },
                                    renderTimeout
                                );
                            } else {
                                expect(expandAllButton).toHaveCss({ opacity: "0" });
                                expect(collapseAllButton).toHaveCss({ opacity: "0" });

                                done();
                            }
                        },
                        renderTimeout
                    );
                });

                it(`Click 'Clear All' with no selection [dataset: ${testData.DataSetName}]`, done => {
                    const dataViewTest = testData.getDataView();
                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const clearAllButton = $(vBuilder.element)
                                .find(".slicerHeader")
                                .find(".clear");

                            clearAllButton.click();

                            expect(vBuilder.properties.length).toBe(0);

                            done();
                        },
                        renderTimeout
                    );
                });

                it(`Click 'Clear All' with all item selected [dataset: ${testData.DataSetName}]`, done => {
                    const dataViewTest = testData.getDataView();
                    const expandedToBe: FullExpanded = testData.getFullExpanded();
                    dataViewTest.metadata.objects = {
                        selection: {
                            singleSelect: false,
                            selectAll: true,
                        },
                        general: {
                            expanded: expandedToBe.expanded.join("*|*"),
                            selectAll: true,
                        },
                    };
                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const clearAllButton = $(vBuilder.element)
                                .find(".slicerHeader")
                                .find(".clear");

                            clearAllButton.click();

                            const visualProperties = vBuilder.properties[0];
                            const removeSelectAll = visualProperties.remove && visualProperties.remove[0];
                            expect(removeSelectAll).not.toBeEmpty();

                            const filter = vBuilder.filter;
                            expect(filter).toEqual([]);

                            done();
                        },
                        renderTimeout
                    );
                });
            });

            describe(`Tree interaction [dataset: ${testData.DataSetName}] =>`, () => {
                it(`Expand and collapse first item' [dataset: ${testData.DataSetName}]`, done => {
                    if (testData.getExpandedTests().length === 0) {
                        done();
                        return;
                    }

                    const dataViewTest = testData.getDataView();
                    const expandedToBe: ExpandTest = testData.getExpandedTests()[0];
                    const collapseLength: number = testData.getItemCount(1);
                    const selector = HierarchySlicer.ItemContainerExpander.selectorName;
                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const firstExpander: HTMLElement = <HTMLElement>$(vBuilder.element).find(selector)[0];
                            firstExpander.click();
                            const visualProperties = vBuilder.properties[0];
                            const expanded: string[] = (<string>(
                                (visualProperties &&
                                    visualProperties.merge &&
                                    visualProperties.merge[0] &&
                                    visualProperties.merge[0].properties["expanded"])
                            )).split("*|*");

                            expect(expanded).toEqual(expandedToBe.expanded);

                            dataViewTest.metadata.objects = {
                                general: {
                                    expanded: expandedToBe.expanded.join("*|*"),
                                },
                            };

                            vBuilder.updateRenderTimeout(
                                dataViewTest,
                                () => {
                                    expect(
                                        $(vBuilder.element)
                                            .find(".visibleGroup")
                                            .children(".row").length
                                    ).toBe(expandedToBe.count);

                                    const firstExpander: HTMLElement = <HTMLElement>(
                                        $(vBuilder.element).find(selector)[0]
                                    );
                                    firstExpander.click();

                                    const visualProperties = vBuilder.properties[1];
                                    const removeExpanded = visualProperties.remove && visualProperties.remove[0];
                                    expect(removeExpanded).not.toBeEmpty();

                                    dataViewTest.metadata.objects = undefined;

                                    vBuilder.updateRenderTimeout(
                                        dataViewTest,
                                        () => {
                                            expect(
                                                $(vBuilder.element)
                                                    .find(".visibleGroup")
                                                    .children(".row").length
                                            ).toBe(collapseLength);
                                            done();
                                        },
                                        renderTimeout
                                    );
                                },
                                renderTimeout
                            );
                        },
                        renderTimeout
                    );
                });
            });

            describe(`Selection interaction [dataset: ${testData.DataSetName}] =>`, () => {
                testData.getSelectedTests().forEach((selectedTest: SelectTest, testIndex: number) => {
                    it(`Select item: ${selectedTest.description || selectedTest.clickedDataPoints[0] + 1}`, done => {
                        // Items are selected via 'ItemContainerChild'
                        const selector = HierarchySlicer.ItemContainerChild.selectorName;
                        const dataViewTest = testData.getDataView();
                        const expandedToBe = testData.getFullExpanded();
                        const allItemsCnt = testData.getOwnIds().length - (selectedTest.hideMemberOffset || 0);
                        const selectedItemsCnt =
                            selectedTest.selectedDataPoints.length + selectedTest.partialDataPoints.length;
                        const hideMembers = <number>selectedTest.hideMember;
                        dataViewTest.metadata.objects = {
                            selection: {
                                singleSelect: selectedTest.singleSelect,
                                ctrlSelect: selectedTest.clickedDataPoints.length === 1,
                                hideMembers,
                            },
                            general: {
                                expanded: expandedToBe.expanded.join("*|*"),
                            },
                        };

                        vBuilder.updateRenderTimeout(
                            dataViewTest,
                            () => {
                                selectedTest.clickedDataPoints.forEach(dataPoint => {
                                    const selectedItem: HTMLElement = <HTMLElement>(
                                        $(vBuilder.element).find(selector)[dataPoint]
                                    );
                                    selectedItem.click();
                                });

                                const filter: any = <any>vBuilder.filter;

                                expect(filter.target).toEqual(selectedTest.target);
                                expect(filter.values).toEqual(selectedTest.values);

                                const itemCheckBoxes: HTMLElement[] = <HTMLElement[]>$(vBuilder.element)
                                    .find(".visibleGroup")
                                    .children(".row")
                                    .find(".slicerCheckbox")
                                    .toArray();

                                selectedTest.selectedDataPoints.forEach(dataPoint => {
                                    expect(itemCheckBoxes[dataPoint]).toHaveClass("selected");
                                });

                                selectedTest.partialDataPoints.forEach(dataPoint => {
                                    expect(itemCheckBoxes[dataPoint]).toHaveClass("partiallySelected");
                                });

                                expect(
                                    itemCheckBoxes.filter(element => element.classList.contains("selected")).length
                                ).toBe(selectedTest.selectedDataPoints.length);

                                expect(
                                    itemCheckBoxes.filter(element => element.classList.contains("partiallySelected"))
                                        .length
                                ).toBe(selectedTest.partialDataPoints.length);

                                expect(
                                    itemCheckBoxes.filter(
                                        element =>
                                            !element.classList.contains("selected") &&
                                            !element.classList.contains("partiallySelected")
                                    ).length
                                ).toBe(allItemsCnt - selectedItemsCnt);

                                done();
                            },
                            renderTimeout
                        );
                    });
                });

                // tslint:disable-next-line: max-func-body-length
                it(`Select 'Select All'`, done => {
                    // Items are selected via 'ItemContainerChild'
                    const selector = HierarchySlicer.ItemContainerChild.selectorName;
                    const dataViewTest = testData.getDataView();
                    const expandedToBe = testData.getFullExpanded();
                    const allItemsCnt = testData.getOwnIds().length;
                    dataViewTest.metadata.objects = {
                        selection: {
                            singleSelect: false,
                            selectAll: true,
                        },
                        general: {
                            expanded: expandedToBe.expanded.join("*|*"),
                        },
                    };

                    vBuilder.updateRenderTimeout(
                        dataViewTest,
                        () => {
                            const selectedItem: HTMLElement = <HTMLElement>$(vBuilder.element).find(selector)[0];
                            selectedItem.click();
                            const visualProperties = vBuilder.properties[0];
                            const selectedAll =
                                <boolean>visualProperties &&
                                visualProperties.merge &&
                                visualProperties.merge[0] &&
                                visualProperties.merge[0].properties["selectAll"];

                            expect(selectedAll).toBe(true);

                            // Check render selection before visual callback
                            const itemCheckBoxes: HTMLElement[] = <HTMLElement[]>$(vBuilder.element)
                                .find(".visibleGroup")
                                .children(".row")
                                .find(".slicerCheckbox")
                                .toArray();

                            expect(
                                itemCheckBoxes.filter(element => element.classList.contains("selected")).length
                            ).toBe(allItemsCnt + 1);

                            expect(
                                itemCheckBoxes.filter(element => element.classList.contains("partiallySelected")).length
                            ).toBe(0);

                            expect(
                                itemCheckBoxes.filter(
                                    element =>
                                        !element.classList.contains("selected") &&
                                        !element.classList.contains("partiallySelected")
                                ).length
                            ).toBe(0);

                            dataViewTest.metadata.objects = {
                                selection: {
                                    singleSelect: false,
                                    selectAll: true,
                                },
                                general: {
                                    expanded: expandedToBe.expanded.join("*|*"),
                                    selectAll: true,
                                },
                            };

                            // Check render selection after callback
                            vBuilder.updateRenderTimeout(
                                dataViewTest,
                                () => {
                                    const itemCheckBoxes: HTMLElement[] = <HTMLElement[]>$(vBuilder.element)
                                        .find(".visibleGroup")
                                        .children(".row")
                                        .find(".slicerCheckbox")
                                        .toArray();

                                    expect(
                                        itemCheckBoxes.filter(element => element.classList.contains("selected")).length
                                    ).toBe(allItemsCnt + 1);

                                    expect(
                                        itemCheckBoxes.filter(element =>
                                            element.classList.contains("partiallySelected")
                                        ).length
                                    ).toBe(0);

                                    expect(
                                        itemCheckBoxes.filter(
                                            element =>
                                                !element.classList.contains("selected") &&
                                                !element.classList.contains("partiallySelected")
                                        ).length
                                    ).toBe(0);

                                    // Deselect 'Select All'
                                    selectedItem.click();
                                    const visualProperties = vBuilder.properties[2];
                                    const removeSelectedAll = visualProperties.remove && visualProperties.remove[0];
                                    expect(removeSelectedAll).not.toBeEmpty();

                                    expect(
                                        itemCheckBoxes.filter(
                                            element =>
                                                !element.classList.contains("selected") &&
                                                !element.classList.contains("partiallySelected")
                                        ).length
                                    ).toBe(allItemsCnt + 1);

                                    done();
                                },
                                renderTimeout
                            );
                        },
                        renderTimeout
                    );
                });
            });

            describe(`Bookmarks [dataset: ${testData.DataSetName}] =>`, () => {
                testData.getSelectedTests().forEach((selectedTest: SelectTest, testIndex: number) => {
                    it(`Set filter for test: ${selectedTest.description ||
                        selectedTest.clickedDataPoints[0] + 1}`, done => {
                        const selector = HierarchySlicer.ItemContainerChild.selectorName;
                        const dataViewTest = testData.getDataView();
                        const expandedToBe = testData.getFullExpanded();
                        const allItemsCnt = testData.getOwnIds().length - (selectedTest.hideMemberOffset || 0);
                        const selectedItemsCnt =
                            selectedTest.selectedDataPoints.length + selectedTest.partialDataPoints.length;
                        const hideMembers = <number>selectedTest.hideMember;
                        const target: IFilterTarget[] =
                            testData.dataSource === DataSourceKind.Native
                                ? selectedTest.target.map((t: any) => {
                                      return {
                                          table: t.table,
                                          column: t.column,
                                      };
                                  })
                                : selectedTest.target;
                        const filter = [
                            {
                                target: target,
                                operator: "In",
                                values: selectedTest.values,
                                $schema: "http://powerbi.com/product/schema#tuple", // tslint:disable-line: no-http-string
                                filterType: 6,
                            },
                        ];

                        dataViewTest.metadata.objects = {
                            selection: {
                                singleSelect: selectedTest.clickedDataPoints.length === 1,
                                hideMembers,
                            },
                            general: {
                                expanded: expandedToBe.expanded.join("*|*"),
                                filter: {
                                    whereItems: selectedTest.whereCondition,
                                },
                            },
                        };

                        vBuilder.updateRenderTimeoutWithCustomFilter(
                            dataViewTest,
                            () => {
                                const itemCheckBoxes: HTMLElement[] = <HTMLElement[]>$(vBuilder.element)
                                    .find(".visibleGroup")
                                    .children(".row")
                                    .find(".slicerCheckbox")
                                    .toArray();

                                selectedTest.selectedDataPoints.forEach(dataPoint => {
                                    expect(itemCheckBoxes[dataPoint]).toHaveClass("selected");
                                });

                                selectedTest.partialDataPoints.forEach(dataPoint => {
                                    expect(itemCheckBoxes[dataPoint]).toHaveClass("partiallySelected");
                                });

                                expect(
                                    itemCheckBoxes.filter(element => element.classList.contains("selected")).length
                                ).toBe(selectedTest.selectedDataPoints.length);

                                expect(
                                    itemCheckBoxes.filter(element => element.classList.contains("partiallySelected"))
                                        .length
                                ).toBe(selectedTest.partialDataPoints.length);

                                expect(
                                    itemCheckBoxes.filter(
                                        element =>
                                            !element.classList.contains("selected") &&
                                            !element.classList.contains("partiallySelected")
                                    ).length
                                ).toBe(allItemsCnt - selectedItemsCnt);

                                done();
                            },
                            filter,
                            renderTimeout
                        );
                    });
                });
            });
        });
    });
});

describe("HierarchySlicer in high constrast mode =>", () => {
    const highConstrastBackgroundColor: string = "#000000";
    const highConstrastForegroundColor: string = "#00FF00";
    const highConstrastForegroundSelectedColor: string = "#FFFF00";

    let vBuilder: visualBuilder,
        testData: HierarchyData = new HierarchyDataSet1(), // tslint:disable-line: mocha-no-side-effect-code
        defaultSettings: HierarchySlicerSettings;

    beforeEach(() => {
        vBuilder = new visualBuilder(1000, 500);
        $(vBuilder.element)
            .find(".slicerContainer")
            .addClass("hasSelection"); // Select visual
        defaultSettings = new HierarchySlicerSettings();

        testData = new HierarchyDataSet1();

        vBuilder.visualHost.colorPalette.isHighContrast = true;
        vBuilder.visualHost.colorPalette.background = { value: highConstrastBackgroundColor };
        vBuilder.visualHost.colorPalette.foreground = { value: highConstrastForegroundColor };
        vBuilder.visualHost.colorPalette.foregroundSelected = { value: highConstrastForegroundSelectedColor };
    });

    it(`Slicer header - fontColor`, done => {
        const dataViewTest = testData.getDataView();
        const fontColor = "#FFFFFF";
        dataViewTest.metadata.objects = {
            header: {
                fontColor: fontColor,
            },
        };

        vBuilder.updateRenderTimeout(
            dataViewTest,
            () => {
                const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                expect(headerTextStyle.color).toBe(hexToRgb(highConstrastForegroundColor));

                done();
            },
            renderTimeout
        );
    });

    it(`Slicer header - backGround`, done => {
        const dataViewTest = testData.getDataView();
        const background = "#FFFFFF";
        dataViewTest.metadata.objects = {
            header: {
                background: background,
            },
        };

        vBuilder.updateRenderTimeout(
            dataViewTest,
            () => {
                const headerTextStyle = (<HTMLElement>$(vBuilder.element).find(".headerText")[0]).style;

                expect(headerTextStyle.backgroundColor).toBe(hexToRgb(highConstrastBackgroundColor));

                done();
            },
            renderTimeout
        );
    });

    it(`Item formatting - fontcolor`, done => {
        const dataViewTest = testData.getDataView();
        const fontColor = "#FFFFFF";
        dataViewTest.metadata.objects = {
            items: {
                fontColor: fontColor,
            },
        };
        vBuilder.updateRenderTimeout(
            dataViewTest,
            () => {
                const itemContainers = $(vBuilder.element)
                    .find(".slicerItemContainer")
                    .toArray();

                itemContainers.forEach((itemContainer: any) => {
                    if (testData.columnNames.length > 1) {
                        const itemExpander = itemContainer.firstChild;

                        // Expanded icon styling
                        const itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild)).style;
                        expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));
                    }

                    const itemContainerChild = itemContainer.lastChild;

                    // Checkbox styling
                    const checkboxStyle = (<HTMLElement>(
                        (itemContainerChild && itemContainerChild.firstChild && itemContainerChild.firstChild.lastChild)
                    )).style;
                    expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                    // Span (label) styling
                    const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1])).style;
                    expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));
                });

                done();
            },
            renderTimeout
        );
    });

    it(`Item formatting - fontcolor after hover`, done => {
        const dataViewTest = testData.getDataView();
        const hoverColor = "#FF0000";
        const fontColor = "#FFFFFF";
        dataViewTest.metadata.objects = {
            items: {
                fontColor: fontColor,
                hoverColor: hoverColor,
            },
        };
        vBuilder.updateRenderTimeout(
            dataViewTest,
            () => {
                const itemContainers = $(vBuilder.element)
                    .find(".slicerItemContainer")
                    .toArray();

                itemContainers.forEach((itemContainer: any, index: number) => {
                    if (testData.columnNames.length > 1) {
                        let itemExpander = itemContainer.firstChild;
                        // Mouseover event
                        itemExpander && itemExpander.dispatchEvent(new MouseEvent("mouseover"));
                        itemExpander = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray()[index].firstChild;

                        // Expanded icon styling
                        let itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild)).style;
                        expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));

                        // Mouseout event
                        itemExpander && itemExpander.dispatchEvent(new MouseEvent("mouseout"));
                        itemExpander = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray()[index].firstChild;
                        // Expanded icon styling
                        itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild)).style;
                        expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));
                    }

                    let itemContainerChild = itemContainer.lastChild;
                    // Mouseover event
                    itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseover"));
                    itemContainerChild = $(vBuilder.element)
                        .find(".slicerItemContainer")
                        .toArray()[index].lastChild;

                    // Checkbox styling
                    let checkboxStyle = (<HTMLElement>(
                        (itemContainerChild && itemContainerChild.firstChild && itemContainerChild.firstChild.lastChild)
                    )).style;
                    expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                    // Span (label) styling
                    let labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1])).style;
                    expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));

                    // Mouseout event
                    itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseout"));
                    itemContainerChild = $(vBuilder.element)
                        .find(".slicerItemContainer")
                        .toArray()[index].lastChild;

                    // Checkbox styling
                    checkboxStyle = (<HTMLElement>(
                        (itemContainerChild && itemContainerChild.firstChild && itemContainerChild.firstChild.lastChild)
                    )).style;
                    expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                    // Span (label) styling
                    labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1])).style;
                    expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));
                });

                done();
            },
            renderTimeout
        );
    });

    it(`Item formatting - hoverColor`, done => {
        const dataViewTest = testData.getDataView();
        const hoverColor = "#FF0000";
        dataViewTest.metadata.objects = {
            items: {
                hoverColor: hoverColor,
            },
        };
        vBuilder.updateRenderTimeout(
            dataViewTest,
            () => {
                const itemContainers = $(vBuilder.element)
                    .find(".slicerItemContainer")
                    .toArray();

                itemContainers.forEach((itemContainer: any, index: number) => {
                    if (testData.columnNames.length > 1) {
                        let itemExpander = itemContainer.firstChild;
                        itemExpander && itemExpander.dispatchEvent(new MouseEvent("mouseover"));

                        itemExpander = $(vBuilder.element)
                            .find(".slicerItemContainer")
                            .toArray()[index].firstChild;

                        // Expanded icon styling
                        const itemExpanderStyle = (<HTMLElement>(itemExpander && itemExpander.firstChild)).style;
                        expect(itemExpanderStyle.fill).toBe(hexToRgb(highConstrastForegroundColor));
                    }

                    let itemContainerChild = itemContainer.lastChild;
                    itemContainerChild && itemContainerChild.dispatchEvent(new MouseEvent("mouseover"));

                    itemContainerChild = $(vBuilder.element)
                        .find(".slicerItemContainer")
                        .toArray()[index].lastChild;

                    // Checkbox styling
                    const checkboxStyle = (<HTMLElement>(
                        (itemContainerChild && itemContainerChild.firstChild && itemContainerChild.firstChild.lastChild)
                    )).style;
                    expect(checkboxStyle.borderColor).toBe(hexToRgb(highConstrastForegroundColor));

                    const labelStyle = (<HTMLElement>(itemContainerChild && itemContainerChild.childNodes[1])).style;
                    expect(labelStyle.color).toBe(hexToRgb(highConstrastForegroundColor));
                });

                done();
            },
            renderTimeout
        );
    });

    it(`Item formatting - selectColor`, done => {
        const dataViewTest = testData.getDataView();
        const selectedColor = "#0000FF";
        dataViewTest.metadata.objects = {
            general: {
                selectAll: true,
            },
            selection: {
                singleSelect: false,
                selectAll: true,
            },
            items: {
                selectedColor: selectedColor,
            },
        };
        vBuilder.updateRenderTimeout(
            dataViewTest,
            () => {
                const itemContainers = $(vBuilder.element)
                    .find(".slicerItemContainer")
                    .toArray();

                itemContainers.forEach((itemContainer: any) => {
                    const itemContainerChild = itemContainer.lastChild;

                    // Checkbox styling
                    const checkboxStyle = (<HTMLElement>(
                        (itemContainerChild && itemContainerChild.firstChild && itemContainerChild.firstChild.lastChild)
                    )).style;
                    expect(checkboxStyle.backgroundColor).toBe(hexToRgb(highConstrastForegroundSelectedColor));
                });

                done();
            },
            renderTimeout
        );
    });

    it(`Item formatting - background`, done => {
        const dataViewTest = testData.getDataView();
        const background = "#0000FF";
        dataViewTest.metadata.objects = {
            general: {
                selectAll: true,
            },
            selection: {
                singleSelect: false,
                selectAll: true,
            },
            items: {
                background: background,
            },
        };
        vBuilder.updateRenderTimeout(
            dataViewTest,
            () => {
                const itemContainers = $(vBuilder.element)
                    .find(".slicerItemContainer")
                    .toArray();

                itemContainers.forEach((itemContainer: any) => {
                    const containerStyle = (<HTMLElement>itemContainer).style;
                    expect(containerStyle.backgroundColor).toBe(hexToRgb(highConstrastBackgroundColor));
                });

                done();
            },
            renderTimeout
        );
    });
});
