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

 // powerbi
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import PrimitiveValue = powerbi.PrimitiveValue;
import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;

// powerbi.models
import { IFilterTarget, ITupleElementValue, IFilterColumnTarget } from "powerbi-models";

// powerbi.extensibility.utils.test
import { testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;
import TestDataViewBuilderColumnOptions = testDataViewBuilder.TestDataViewBuilderColumnOptions;

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

// powerbi.extensibility.utils.formatting
import { valueFormatter, dateTimeSequence } from "powerbi-visuals-utils-formattingutils";
import ValueFormat = valueFormatter.valueFormatter.format;

// HierarchySlicer
import { IHierarchySlicerDataPoint } from "../src/interfaces";
import { PrimitiveType } from "powerbi-visuals-utils-typeutils/lib/valueType";

export interface FullExpanded {
    expanded: string[];
    length: number;
}

export interface ExpandTest {
    expanded: string[];
    number: number;
    hideMembersOffset: number[];
}

export interface SearchTest {
    searchString: string;
    results: number;
    selectedDataPoints?: number[];
    partialDataPoints?: number[];
}

export interface SelectTest {
    description?: string;
    clickedDataPoints: number[];
    target: IFilterTarget[];
    values: ITupleElementValue[][];
    selectedDataPoints: number[];
    partialDataPoints: number[];
}

export abstract class HierarchyData extends TestDataViewBuilder {
    public tableName: string = "Hierarchy";
    public tableValues: any[][];

    public columnNames: string[];
    public columnTypes: ValueType[];
    public columnFormat: any[];

    public abstract getExpandedTests(): ExpandTest[];
    public abstract getSelectedTests(): SelectTest[];
    public abstract getSearchTests(): SearchTest[];

    public getValue(row: number, col: number): string | number | boolean {
        const convertedValue = this.convertRawValue(this.tableValues[row][col], this.columnTypes[col]);
        if (convertedValue === null) return null;
        if (!this.columnTypes[col].text) return convertedValue;
        return ValueFormat(convertedValue, this.columnFormat[col]);
    }

    public convertRawValue(rawValue: PrimitiveValue, dataType: ValueTypeDescriptor, full: boolean = false): any {
        if (rawValue === null) return null;
        if ((dataType.dateTime) && (full)) {
           return new Date(rawValue as Date);
        } else if (dataType.numeric) {
            return rawValue as number;
        } else {
            return rawValue as string;
        }
    }

    public getItemLabels(): string[] {
        return this.columnNames.map((col, index) => ValueFormat(this.convertRawValue(this.tableValues[0][index], this.columnTypes[index], true), this.columnFormat[index]));
    }

    public getOwnIds(length: number = undefined): string[] {
        const columnLength = length || this.columnNames.length;
        const encodeValues = this.tableValues.map((row) => row.map((value, i) => "|~" + ValueFormat(this.convertRawValue(value, this.columnTypes[i]), this.columnFormat[i]).replace(/,/g, "") + "-" + i));
        const encodeExpandValues = encodeValues.map((row) => row.map((value, index, row) => row.slice(0, index + 1).join("_")));

        return Array.from({length: columnLength}).map((col, i) => encodeExpandValues.map(row => row[i]))  // Transpose matrix
            .map((row) => row.filter((value, index, self) => self.indexOf(value) === index))    // Make unique
            .join(",").split(",").sort();
    }

    public getFullExpanded(): FullExpanded {
        const columnLength = this.columnNames.length;
        const expanded = this.getOwnIds(columnLength - 1);
        const length = this.getOwnIds(columnLength).length;

        return <FullExpanded>{
            expanded: expanded,
            length: length
        };
    }

    public getLevelCount(level: number): number {
        return this.getOwnIds(level).length;
    }

    public getDataView(columnNames?: string[], emptyValues: boolean = false): DataView {
        const columns = this.columnNames.map((field, index) => {
            return {
                displayName: field,
                roles: { Fields: true },
                type: this.columnTypes[index],
                format: this.columnFormat[index],
                index: index,
                identityExprs: undefined
            };
        });
        const rows = this.tableValues.map((row: any[]) => {
            return row;
        });
        const categorialDataView: TestDataViewBuilderColumnOptions[] = this.columnNames.map((column, index) => {
            return <TestDataViewBuilderColumnOptions>{
                source: columns[index],
                values: rows[index]
            };
        });
        let identityFields = TestDataViewBuilder.getDataViewBuilderColumnIdentitySources(categorialDataView);
        columns.forEach((c, index) =>
            c.identityExprs = [ {
                fields: identityFields[index].fields,
                identities: identityFields[index].identities,
                source: {
                    "entity": this.tableName
                }
            } ]
        );
        const dataView = {
            table: {
                columns: columns,
                identityFields: identityFields,
                rows: rows
            },
            metadata: {
                columns: columns
            }
        };
        return dataView;
    }
}

export class HierarchyDataSet1 extends HierarchyData {
    public columnNames: string[] =
        ["Level 1", "Level 2", "Level 3", "Value"];
    public tableValues: any[][] = [
        [     "L1",      null,      null,      1],
        [     "L1",     "L11",    "L111",      2],
        [     "L1",     "L11",    "L112",      3],
        [     "L1",     "L12",      null,      4],
        [     "L1",     "L12",    "L123",      5],
    ];
    public columnTypes: ValueType[] = [
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ numeric: true })
    ];
    public columnFormat: any[] = [
        undefined, undefined, undefined, "0"
    ];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: [ "|~L1-0" ],
                number: 4,
                hideMembersOffset: [0, -1, 0]
            },
            {
                expanded: [ "|~L1-0", "|~L1-0_|~(Blank)-1", "|~L1-0_|~L11-1" ],
                number: 7,
                hideMembersOffset: [0, -2, -1]
            },
            {
                expanded: [ "|~L1-0", "|~L1-0_|~L11-1" ],
                number: 6,
                hideMembersOffset: [0, -1, 0]
            }
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                clickedDataPoints: [ 0 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) }
                    ]
                ],
                selectedDataPoints: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ],
                partialDataPoints: []
            },
            {
                clickedDataPoints: [ 1 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) },
                        { value: this.getValue(0, 1) }
                    ]
                ],
                selectedDataPoints: [ 1, 2, 3 ],
                partialDataPoints: [ 0 ]
            },
            {
                description: `${this.getValue(1, 3)}`,
                clickedDataPoints: [ 6 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableName
                    },
                    {
                        column: this.columnNames[2],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(1, 0) },
                        { value: this.getValue(1, 1) },
                        { value: this.getValue(1, 2) }
                    ]
                ],
                selectedDataPoints: [ 6, 5 ],
                partialDataPoints: [ 0, 4 ]
            }
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "L11",
                results: 6,
                selectedDataPoints: [ 1, 2, 3, 4, 5 ],
                partialDataPoints: [ 0 ]
            },
            <SearchTest>{
                searchString: "L123",
                results: 4,
                selectedDataPoints: [ 2, 3 ],
                partialDataPoints: [ 0, 1 ]
            }
        ];
    }
}

export class HierarchyDataSet2 extends HierarchyData {
    public tableName: string = "Hierarchy";
    public columnNames: string[] =
        ["Level 1", "Level 2"];
    public tableValues: any[][] = [
        [     "L1",      null],
        [     "L1",     "L11"],
        [     "L1",     "L12"],
        [     "L_2",    "L12"],
        [     "L1",     "L13"],
    ];
    public columnTypes: any[] = [
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true })
    ];
    public columnFormat: any[] = [
        undefined, undefined
    ];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: [ "|~L1-0" ],
                number: 6,
                hideMembersOffset: [0, -1, 0]
            },
            {
                expanded: [ "|~L1-0", "|~L_2-0" ],
                number: 7,
                hideMembersOffset: [0, -1, 0]
            }
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                clickedDataPoints: [ 0 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) }
                    ]
                ],
                selectedDataPoints: [ 0, 1, 2, 3, 4 ],
                partialDataPoints: []
            },
            {
                description: `${this.getValue(0, 0)} and ${this.getValue(3, 0)}`,
                clickedDataPoints: [ 0, 5 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) }
                    ],
                    [
                        { value: this.getValue(3, 0) }
                    ]
                ],
                selectedDataPoints: [ 0, 1, 2, 3, 4, 5, 6 ],
                partialDataPoints: []
            }
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "L_2",
                results: 2,
                selectedDataPoints: [ 0, 1 ],
                partialDataPoints: []
            },
            <SearchTest>{
                searchString: "L_",
                results: 7,
                selectedDataPoints: [],
                partialDataPoints: []
            }
        ];
    }
}

export class HierarchyDataSet3 extends HierarchyData {
    public tableName: string = "Hierarchy";
    public columnNames: string[] =
        ["Date"];
    public tableValues: any[][] = [
        ["2018-01-01T00:00:00.000Z"],
        ["2018-01-02T00:00:00.000Z"],
        ["2018-01-03T00:00:00.000Z"],
        ["2018-01-04T00:00:00.000Z"],
        ["2018-01-05T00:00:00.000Z"],
    ];
    public columnTypes: any[] = [
        ValueType.fromDescriptor({ dateTime: true })
    ];
    public columnFormat: any[] = [
        "dd MMM, yyyy"
    ];

    public getExpandedTests(): ExpandTest[] {
        return [];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: `${this.tableValues[0][0]}`,
                clickedDataPoints: [ 0 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) }
                    ]
                ],
                selectedDataPoints: [ 0 ],
                partialDataPoints: []
            },
            {
                description: `${this.tableValues[0][0]} and ${this.tableValues[1][0]}`,
                clickedDataPoints: [ 0, 1 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) }
                    ],
                    [
                        { value: this.getValue(1, 0) }
                    ]
                ],
                selectedDataPoints: [ 0, 1 ],
                partialDataPoints: []
            }
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "Jan",
                results: 5,
                selectedDataPoints: [],
                partialDataPoints: []
            },
            <SearchTest>{
                searchString: "January",
                results: 0,
                selectedDataPoints: [],
                partialDataPoints: []
            }
        ];
    }
}

export class HierarchyDataSet4 extends HierarchyData {
    public tableName: string = "Hierarchy";
    public columnNames: string[] =
        ["Parent", "Child"];
    public tableValues: any[][] = [
        [ null,    2 ],
        [    1,    1 ],
        [    2, null ],
        [    2,    3 ],
        [    1,    5 ],
        [ null,    6 ]
    ];
    public columnTypes: any[] = [
        ValueType.fromDescriptor({ numeric: true }),
        ValueType.fromDescriptor({ numeric: true })
    ];
    public columnFormat: any[] = [
        "0", "0"
    ];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: [ "|~(Blank)-0" ],
                number: 5,
                hideMembersOffset: [0, -3, 0]
            },
            {
                expanded: [ "|~1-0" ],
                number: 5,
                hideMembersOffset: [0, -1, -1]
            }
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: "'(Blank)'",
                clickedDataPoints: [ 0 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) }
                    ]
                ],
                selectedDataPoints: [ 0, 1, 2 ],
                partialDataPoints: []
            },
            {
                description: `${this.getValue(0, 0)} and ${this.getValue(1, 1)}`,
                clickedDataPoints: [ 0, 4 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) },
                        { value: this.getValue(0, 1) }
                    ],
                    [
                        { value: this.getValue(0, 0) },
                        { value: this.getValue(5, 1) }
                    ],
                    [
                        { value: this.getValue(1, 0) },
                        { value: this.getValue(1, 1) }
                    ]
                ],
                selectedDataPoints: [ 0, 1, 2, 4 ],
                partialDataPoints: [ 3 ]
            }
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }
}

export class HierarchyDataSet5 extends HierarchyData {
    public tableName: string = "Hierarchy";
    public columnNames: string[] =
        ["Parent", "Child"];
    public tableValues: any[][] = [
        [  "", "2" ],
        [ "1", "1" ],
        [ "2",  "" ],
        [ "2", "3" ],
        [ "1", "5" ],
        [  "", "6" ]
    ];
    public columnTypes: any[] = [
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true })
    ];
    public columnFormat: any[] = [
        undefined, undefined
    ];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: [ "|~-0" ],
                number: 5,
                hideMembersOffset: [0, 0, 0]
            },
            {
                expanded: [ "|~1-0" ],
                number: 5,
                hideMembersOffset: [0, 0, -1]
            }
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: "Empty string",
                clickedDataPoints: [ 0 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) }
                    ]
                ],
                selectedDataPoints: [ 0, 1, 2 ],
                partialDataPoints: []
            },
            {
                description: `${this.getValue(0, 0)} and ${this.getValue(1, 1)}`,
                clickedDataPoints: [ 0, 4 ],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableName
                    }
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) },
                        { value: this.getValue(0, 1) }
                    ],
                    [
                        { value: this.getValue(0, 0) },
                        { value: this.getValue(5, 1) }
                    ],
                    [
                        { value: this.getValue(1, 0) },
                        { value: this.getValue(1, 1) }
                    ]
                ],
                selectedDataPoints: [ 0, 1, 2, 4 ],
                partialDataPoints: [ 3 ]
            }
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }
}