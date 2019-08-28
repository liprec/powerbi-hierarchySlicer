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
import { IFilterTarget, ITupleElementValue, PrimitiveValueType } from "powerbi-models";

// powerbi.extensibility.utils.test
import { testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;
import TestDataViewBuilderColumnOptions = testDataViewBuilder.TestDataViewBuilderColumnOptions;

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

// powerbi.extensibility.utils.formatting
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import ValueFormat = valueFormatter.format;

export interface FullExpanded {
    expanded: string[];
    length: number;
}

export interface ExpandTest {
    expanded: string[];
    count: number;
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
    isSwitched?: boolean;
    clickedDataPoints: number[];
    target: IFilterTarget[];
    values: ITupleElementValue[][];
    selectedDataPoints: number[];
    partialDataPoints: number[];
    whereCondition?: string;
}

enum SQExprKind {
    ColumnRef = 2,
    PropertyVariationSource = 5,
    Hierarchy = 6,
    HierarchyLevel = 7,
}

enum DataSourceKind {
    Native = 0,
    Tabular = 1,
    MD = 2,
}

export abstract class HierarchyData extends TestDataViewBuilder {
    public dataSource: DataSourceKind = DataSourceKind.Native;
    public tableName: string = "Hierarchy";
    public tableGuid: string = "LocalDateTable_bcfa94c1-7c12-4317-9a5f-204f8a9724ca";
    public hierarchyName?: string;
    public tableValues: any[][];

    public columnNames: string[];
    public columnTypes: ValueType[];
    public columnFormat: any[];

    public fieldsKind: SQExprKind = SQExprKind.ColumnRef;

    public abstract getExpandedTests(): ExpandTest[];
    public abstract getSelectedTests(): SelectTest[];
    public abstract getSearchTests(): SearchTest[];

    public getValue(row: number, col: number): string | number | boolean | null {
        const convertedValue = this.convertRawValue(this.tableValues[row][col], this.columnTypes[col]);
        if (convertedValue === null) return null;
        if (!this.columnTypes[col].text) return convertedValue;
        return ValueFormat(convertedValue, this.columnFormat[col]);
    }

    public convertRawValue(rawValue: PrimitiveValue, dataType: ValueTypeDescriptor, full: boolean = false): any {
        if (rawValue === null) return null;
        if (dataType.dateTime && full) {
            return new Date(rawValue as Date);
        } else if (dataType.numeric) {
            return rawValue as number;
        } else {
            return rawValue as string;
        }
    }

    public getItemLabels(emptyString: boolean = true, label: string | null = null): string[] {
        return this.columnNames.map((col, index) => {
            const rawValue = this.convertRawValue(this.tableValues[0][index], this.columnTypes[index], true);
            const formatValue =
                rawValue === null || (emptyString && rawValue === "")
                    ? label || "(Blank)"
                    : ValueFormat(rawValue, this.columnFormat[index]);
            return formatValue === "" ? String.fromCharCode(160) : formatValue;
        });
    }

    public getOwnIds(length: number | undefined = undefined): string[] {
        const columnLength = length || this.columnNames.length;
        const encodeValues = this.tableValues.map(row =>
            row.map(
                (value, i) =>
                    "|~" +
                    ValueFormat(this.convertRawValue(value, this.columnTypes[i]), this.columnFormat[i]).replace(
                        /,/g,
                        ""
                    ) +
                    "-" +
                    i
            )
        );
        const encodeExpandValues = encodeValues.map(row =>
            row.map((value, index, row) => row.slice(0, index + 1).join("_"))
        );

        return Array.from({ length: columnLength })
            .map((col, i) => encodeExpandValues.map(row => row[i])) // Transpose matrix
            .map(row => row.filter((value, index, self) => self.indexOf(value) === index)) // Make unique
            .join(",")
            .split(",")
            .sort();
    }

    public getFullExpanded(): FullExpanded {
        const columnLength = this.columnNames.length;
        const expanded = this.getOwnIds(columnLength - 1);
        const length = this.getOwnIds(columnLength).length;

        return <FullExpanded>{
            expanded: expanded,
            length: length,
        };
    }

    public getLevelCount(level: number): number {
        return this.getOwnIds(level).length;
    }

    public getDataView(columnNames?: string[], emptyValues: boolean = false): DataView {
        const columns = this.columnNames.map((field, index) => {
            let expr;
            if (this.fieldsKind === SQExprKind.HierarchyLevel) {
                expr = {
                    arg: {
                        arg: {
                            entity: this.tableName,
                            kind: 0,
                        },
                        hierarchy: this.hierarchyName,
                        kind: 6,
                    },
                    level: field,
                    kind: this.fieldsKind,
                };
            }
            if (this.fieldsKind === SQExprKind.ColumnRef) {
                expr = {
                    source: {
                        entity: this.tableName,
                        kind: 0,
                    },
                    ref: field.replace(" ", ""),
                    kind: this.fieldsKind,
                };
            }
            if (this.fieldsKind === SQExprKind.PropertyVariationSource) {
                expr = {
                    arg: {
                        arg: {
                            arg: {
                                entity: this.tableName,
                                kind: 0,
                            },
                            name: "Variation",
                            property: (this.hierarchyName as any).replace("Hierarchy", ""),
                            kind: 5,
                        },
                        hierarchy: this.hierarchyName,
                        kind: 6,
                    },
                    level: field,
                    kind: 7,
                };
            }
            return {
                roles: { Fields: true },
                type: this.columnTypes[index],
                format: this.columnFormat[index],
                displayName: field,
                queryName:
                    this.tableName +
                    (this.fieldsKind === SQExprKind.PropertyVariationSource ? "Variation." : "") +
                    (this.hierarchyName ? `.${this.hierarchyName}.` : ".") +
                    field,
                expr: expr,
                discourageAggregationAcrossGroups:
                    this.dataSource === DataSourceKind.MD && index === 0 ? true : undefined,
                index: index,
                identityExprs: [],
            };
        });
        const rows = this.tableValues.map((row: any[]) => {
            return row;
        });
        const categorialDataView: TestDataViewBuilderColumnOptions[] = this.columnNames.map((column, index) => {
            return <TestDataViewBuilderColumnOptions>{
                source: columns[index],
                values: rows[index],
            };
        });
        let identityExprs: any;
        let identityFields = TestDataViewBuilder.getDataViewBuilderColumnIdentitySources(categorialDataView);
        if (this.fieldsKind === SQExprKind.PropertyVariationSource) {
            columns.forEach((c, index) => {
                let ref = c.displayName.replace(" ", "");
                c.identityExprs = <any>[
                    {
                        source: {
                            entity: this.tableGuid,
                            kind: 0,
                        },
                        ref: ref,
                        kind: SQExprKind.ColumnRef,
                    },
                ];
            });
        }
        const dataView = {
            table: {
                columns: columns,
                identityFields: this.dataSource === DataSourceKind.MD ? identityExprs : identityFields,
                rows: rows,
            },
            metadata: {
                columns: columns,
            },
        };
        return dataView;
    }
}

export class HierarchyDataSet1 extends HierarchyData {
    public tableName: string = "DataSet1";
    public columnNames: string[] = ["Level 1", "Level 2", "Level 3", "Value"];
    public tableValues = [
        ["L1", null, null, 1],
        ["L1", "L11", "L111", 2],
        ["L1", "L11", "L112", 3],
        ["L1", "L12", null, 4],
        ["L1", "L12", "L123", 5],
    ];
    public columnTypes: ValueType[] = [
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ numeric: true }),
    ];
    public columnFormat = [undefined, undefined, undefined, "0"];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~L1-0"],
                count: 4,
                hideMembersOffset: [0, -1, 0],
            },
            {
                expanded: ["|~L1-0", "|~L1-0_|~(Blank)-1", "|~L1-0_|~L11-1"],
                count: 7,
                hideMembersOffset: [0, -2, -1],
            },
            {
                expanded: ["|~L1-0", "|~L1-0_|~L11-1"],
                count: 6,
                hideMembersOffset: [0, -1, 0],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                partialDataPoints: [],
            },
            {
                clickedDataPoints: [1],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[1].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(0, 1) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [1, 2, 3],
                partialDataPoints: [0],
            },
            {
                description: `${this.getValue(1, 3)}`,
                clickedDataPoints: [6],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[1].replace(" ", ""),
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[2].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getValue(1, 0) as PrimitiveValueType },
                        { value: this.getValue(1, 1) as PrimitiveValueType },
                        { value: this.getValue(1, 2) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [6, 5],
                partialDataPoints: [0, 4],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "L11",
                results: 6,
                selectedDataPoints: [1, 2, 3, 4, 5],
                partialDataPoints: [0],
            },
            <SearchTest>{
                searchString: "L123",
                results: 4,
                selectedDataPoints: [2, 3],
                partialDataPoints: [0, 1],
            },
        ];
    }
}

export class HierarchyDataSet2 extends HierarchyData {
    public tableName: string = "DataSet2";
    public columnNames: string[] = ["Level 1", "Level 2"];
    public tableValues = [["L1", null], ["L1", "L11"], ["L1", "L12"], ["L_2", "L12"], ["L1", "L13"]];
    public columnTypes = [ValueType.fromDescriptor({ text: true }), ValueType.fromDescriptor({ text: true })];
    public columnFormat = [undefined, undefined];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~L1-0"],
                count: 6,
                hideMembersOffset: [0, -1, 0],
            },
            {
                expanded: ["|~L1-0", "|~L_2-0"],
                count: 7,
                hideMembersOffset: [0, -1, 0],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [0, 1, 2, 3, 4],
                partialDataPoints: [],
            },
            {
                description: `${this.getValue(0, 0)} and ${this.getValue(3, 0)}`,
                clickedDataPoints: [0, 5],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [
                    [{ value: this.getValue(0, 0) as PrimitiveValueType }],
                    [{ value: this.getValue(3, 0) as PrimitiveValueType }],
                ],
                selectedDataPoints: [0, 1, 2, 3, 4, 5, 6],
                partialDataPoints: [],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "L_2",
                results: 2,
                selectedDataPoints: [0, 1],
                partialDataPoints: [],
            },
            <SearchTest>{
                searchString: "L_",
                results: 7,
                selectedDataPoints: [],
                partialDataPoints: [],
            },
        ];
    }
}

export class HierarchyDataSet3 extends HierarchyData {
    public tableName: string = "Hierarchy";
    public columnNames: string[] = ["Date"];
    public tableValues = [
        ["2018-01-01T00:00:00.000Z"],
        ["2018-01-02T00:00:00.000Z"],
        ["2018-01-03T00:00:00.000Z"],
        ["2018-01-04T00:00:00.000Z"],
        ["2018-01-05T00:00:00.000Z"],
    ];
    public columnTypes = [ValueType.fromDescriptor({ dateTime: true })];
    public columnFormat = ["dd MMM, yyyy"];

    public getExpandedTests(): ExpandTest[] {
        return [];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: `${this.tableValues[0][0]}`,
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [0],
                partialDataPoints: [],
            },
            {
                description: `${this.tableValues[0][0]} and ${this.tableValues[1][0]}`,
                clickedDataPoints: [0, 1],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [
                    [{ value: this.getValue(0, 0) as PrimitiveValueType }],
                    [{ value: this.getValue(1, 0) as PrimitiveValueType }],
                ],
                selectedDataPoints: [0, 1],
                partialDataPoints: [],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "Jan",
                results: 5,
                selectedDataPoints: [],
                partialDataPoints: [],
            },
            <SearchTest>{
                searchString: "January",
                results: 0,
                selectedDataPoints: [],
                partialDataPoints: [],
            },
        ];
    }
}

export class HierarchyDataSet4 extends HierarchyData {
    public tableName: string = "DataSet3";
    public columnNames: string[] = ["Parent", "Child"];
    public tableValues = [[null, 2], [1, 1], [2, null], [2, 3], [1, 5], [null, 6]];
    public columnTypes = [ValueType.fromDescriptor({ numeric: true }), ValueType.fromDescriptor({ numeric: true })];
    public columnFormat = ["0", "0"];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~(Blank)-0"],
                count: 5,
                hideMembersOffset: [0, -3, 0],
            },
            {
                expanded: ["|~1-0"],
                count: 5,
                hideMembersOffset: [0, -1, -1],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: "'(Blank)'",
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [0, 1, 2],
                partialDataPoints: [],
            },
            {
                description: `${this.getValue(0, 0)} and ${this.getValue(1, 1)}`,
                clickedDataPoints: [0, 4],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[1].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(0, 1) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(5, 1) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(1, 0) as PrimitiveValueType },
                        { value: this.getValue(1, 1) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [0, 1, 2, 4],
                partialDataPoints: [3],
            },
            {
                description: `${this.getValue(0, 0)} and ${this.getValue(1, 1)} (columns/values switched)`,
                isSwitched: true,
                clickedDataPoints: [0, 4],
                target: [
                    {
                        column: this.columnNames[1].replace(" ", ""),
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getValue(0, 1) as PrimitiveValueType },
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(5, 1) as PrimitiveValueType },
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(1, 1) as PrimitiveValueType },
                        { value: this.getValue(1, 0) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [0, 1, 2, 4],
                partialDataPoints: [3],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }
}

export class HierarchyDataSet5 extends HierarchyData {
    public tableName: string = "DataSet5";
    public columnNames: string[] = ["Parent", "Child"];
    public tableValues = [["", "2"], ["1", "1"], ["2", ""], ["2", "3"], ["1", "5"], ["", "6"]];
    public columnTypes = [ValueType.fromDescriptor({ text: true }), ValueType.fromDescriptor({ text: true })];
    public columnFormat = [undefined, undefined];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~-0"],
                count: 5,
                hideMembersOffset: [0, -3, 0],
            },
            {
                expanded: ["|~1-0"],
                count: 5,
                hideMembersOffset: [0, -1, -1],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: "Empty string",
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [0, 1, 2],
                partialDataPoints: [],
            },
            {
                description: `${this.getValue(0, 0)} and ${this.getValue(1, 1)}`,
                clickedDataPoints: [0, 4],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[1].replace(" ", ""),
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(0, 1) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(5, 1) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(1, 0) as PrimitiveValueType },
                        { value: this.getValue(1, 1) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [0, 1, 2, 4],
                partialDataPoints: [3],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }
}

export class HierarchyDataSet6 extends HierarchyData {
    public tableName: string = "DataSet6";
    public hierarchyName = "Hierarchy";
    public columnNames: string[] = ["Parent", "Child"];
    public tableValues = [["", "2"], ["1", "1"], ["2", ""], ["2", "3"], ["1", "5"], ["", "6"]];
    public columnTypes = [ValueType.fromDescriptor({ text: true }), ValueType.fromDescriptor({ text: true })];
    public columnFormat = [undefined, undefined];
    public fieldsKind = SQExprKind.HierarchyLevel;

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~-0"],
                count: 5,
                hideMembersOffset: [0, -3, 0],
            },
            {
                expanded: ["|~1-0"],
                count: 5,
                hideMembersOffset: [0, -1, -1],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: "Empty string",
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0].replace(" ", ""),
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [0, 1, 2],
                partialDataPoints: [],
                whereCondition: JSON.parse(`
                    [
                        {
                            "condition": {
                                "_kind": 10,
                                "args": [
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Parent",
                                        "kind": 7
                                    }
                                ],
                                "values": [
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "",
                                            "typeEncodedValue": "''",
                                            "valueEncoded": "''",
                                            "kind": 17
                                        }
                                    ]
                                ],
                                "kind": 10
                            }
                        }
                    ]
                `),
            },
            {
                description: `'${this.getValue(0, 0)}' and ${this.getValue(1, 1)}`,
                clickedDataPoints: [0, 4],
                target: [
                    {
                        column: this.columnNames[0].replace(" ", ""),
                        table: this.tableName,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0].replace(" ", ""),
                    },
                    {
                        column: this.columnNames[1].replace(" ", ""),
                        table: this.tableName,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[1].replace(" ", ""),
                    },
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(0, 1) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(5, 1) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(1, 0) as PrimitiveValueType },
                        { value: this.getValue(1, 1) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [0, 1, 2, 4],
                partialDataPoints: [3],
                whereCondition: JSON.parse(`
                    [
                        {
                            "condition": {
                                "_kind": 10,
                                "args": [
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Parent",
                                        "kind": 7
                                    },
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Child",
                                        "kind": 7
                                    }
                                ],
                                "values": [
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "",
                                            "typeEncodedValue": "''",
                                            "valueEncoded": "''",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "2",
                                            "typeEncodedValue": "'2'",
                                            "valueEncoded": "'2'",
                                            "kind": 17
                                        }
                                    ],
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "",
                                            "typeEncodedValue": "''",
                                            "valueEncoded": "''",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "6",
                                            "typeEncodedValue": "'6'",
                                            "valueEncoded": "'6'",
                                            "kind": 17
                                        }
                                    ],
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "1",
                                            "typeEncodedValue": "'1'",
                                            "valueEncoded": "'1'",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "1",
                                            "typeEncodedValue": "'1'",
                                            "valueEncoded": "'1'",
                                            "kind": 17
                                        }
                                    ]
                                ],
                                "kind": 10
                            }
                        }
                    ]
                `),
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }
}

export class HierarchyDataSet7 extends HierarchyData {
    public dataSource = DataSourceKind.MD;
    public tableName: string = "DataSet7";
    public hierarchyName = "Organizations";
    public columnNames = [
        "Organization Level 01",
        "Organization Level 02",
        "Organization Level 03",
        "Organization Level 04",
    ];
    public tableValues = [
        ["AdventureWorks Cycle", "AdventureWorks Cycle", null, null],
        ["AdventureWorks Cycle", "European Operations", "European Operations", null],
        ["AdventureWorks Cycle", "European Operations", "France", null],
        ["AdventureWorks Cycle", "European Operations", "Germany", null],
        ["AdventureWorks Cycle", "North America Operations", "Canadian Division", null],
        ["AdventureWorks Cycle", "North America Operations", "North America Operations", null],
        ["AdventureWorks Cycle", "North America Operations", "USA Operations", "Central Division"],
        ["AdventureWorks Cycle", "North America Operations", "USA Operations", "Northeast Division"],
        ["AdventureWorks Cycle", "North America Operations", "USA Operations", "Northwest Division"],
        ["AdventureWorks Cycle", "North America Operations", "USA Operations", "Southeast Division"],
        ["AdventureWorks Cycle", "North America Operations", "USA Operations", "Southwest Division"],
        ["AdventureWorks Cycle", "North America Operations", "USA Operations", "USA Operations"],
        ["AdventureWorks Cycle", "Pacific Operations", "Australia", null],
        ["AdventureWorks Cycle", "Pacific Operations", "Pacific Operations", null],
    ];
    public columnTypes = [
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
    ];
    public columnFormat = [undefined, undefined, undefined, undefined];
    public fieldsKind = SQExprKind.HierarchyLevel;

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~AdventureWorks Cycle-0"],
                count: 5,
                hideMembersOffset: [0, 0, -1],
            },
            {
                expanded: ["|~AdventureWorks Cycle-0", "|~AdventureWorks Cycle-0_|~AdventureWorks Cycle-1"],
                count: 6,
                hideMembersOffset: [0, -1, -2],
            },
            {
                expanded: ["|~AdventureWorks Cycle-0", "|~AdventureWorks Cycle-0_|~European Operations-1"],
                count: 8,
                hideMembersOffset: [0, 0, -2],
            },
            {
                expanded: [
                    "|~AdventureWorks Cycle-0",
                    "|~AdventureWorks Cycle-0_|~North America Operations-1",
                    "|~AdventureWorks Cycle-0_|~North America Operations-1_|~USA Operations-2",
                ],
                count: 14,
                hideMembersOffset: [0, 0, -3],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: "Root level",
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0],
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                ],
                partialDataPoints: [],
                whereCondition: JSON.parse(`
                    [
                        {
                            "condition": {
                                "_kind": 10,
                                "args": [
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "DataSet7",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Organizations",
                                            "kind": 6
                                        },
                                        "level": "Organization Level 01",
                                        "kind": 7
                                    }
                                ],
                                "values": [
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "AdventureWorks Cycle",
                                            "typeEncodedValue": "'AdventureWorks Cycle'",
                                            "valueEncoded": "'AdventureWorks Cycle'",
                                            "kind": 17
                                        }
                                    ]
                                ],
                                "kind": 10
                            }
                        }
                    ]
                `),
            },
            {
                description: `${this.getValue(4, 1)}`,
                clickedDataPoints: [11],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0],
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableName,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[1],
                    },
                ],
                values: [
                    [
                        { value: this.getValue(4, 0) as PrimitiveValueType },
                        { value: this.getValue(4, 1) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
                partialDataPoints: [0],
                whereCondition: JSON.parse(`
                    [
                        {
                            "condition": {
                                "_kind": 10,
                                "args": [
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "DataSet7",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Organizations",
                                            "kind": 6
                                        },
                                        "level": "Organization Level 01",
                                        "kind": 7
                                    },
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "DataSet7",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Organizations",
                                            "kind": 6
                                        },
                                        "level": "Organization Level 02",
                                        "kind": 7
                                    }
                                ],
                                "values": [
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "AdventureWorks Cycle",
                                            "typeEncodedValue": "'AdventureWorks Cycle'",
                                            "valueEncoded": "'AdventureWorks Cycle'",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "North America Operations",
                                            "typeEncodedValue": "'North America Operations'",
                                            "valueEncoded": "'North America Operations'",
                                            "kind": 17
                                        }
                                    ]
                                ],
                                "kind": 10
                            }
                        }
                    ]
                `),
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }
}

export class HierarchyDataSet8 extends HierarchyData {
    public dataSource = DataSourceKind.Native;
    public tableName: string = "LocalDateTable_bcfa94c1-7c12-4317-9a5f-204f8a9724ca";
    public hierarchyName = "Date Hierarchy";
    public columnNames = ["Year", "Month", "Date"];
    public tableValues = [
        // TODO: Wrong row order due missing 'sort by column' in tests
        [2018, "April", 1],
        [2018, "April", 2],
        [2018, "February", 1],
        [2018, "February", 2],
        [2018, "February", 3],
        [2018, "January", 1],
        [2018, "March", 1],
        [2018, "March", 2],
        [2018, "March", 3],
        [2018, "March", 4],
        [2018, "March", 5],
        [2018, "March", 6],
        [2018, "March", 7],
        [2018, "March", 8],
    ];
    public columnTypes = [
        ValueType.fromDescriptor({ numeric: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ numeric: true }),
    ];
    public columnFormat = [undefined, undefined, undefined];
    public fieldsKind = SQExprKind.PropertyVariationSource;

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~2018-0"],
                count: 5,
                hideMembersOffset: [0, 0, 0],
            },
            {
                expanded: ["|~2018-0", "|~2018-0_|~February-1"],
                count: 8,
                hideMembersOffset: [0, 0, 0],
            },
            {
                expanded: ["|~2018-0", "|~2018-0_|~March-1"],
                count: 13,
                hideMembersOffset: [0, 0, 0],
            },
            {
                expanded: ["|~2018-0", "|~2018-0_|~February-1", "|~2018-0_|~March-1"],
                count: 16,
                hideMembersOffset: [0, 0, 0],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: `${this.getValue(0, 0)}`,
                clickedDataPoints: [0],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableGuid,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0],
                    },
                ],
                values: [[{ value: this.getValue(0, 0) as PrimitiveValueType }]],
                selectedDataPoints: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
                partialDataPoints: [],
                whereCondition: JSON.parse(`
                    [
                        {
                            "condition": {
                                "_kind": 10,
                                "args": [
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_bcfa94c1-7c12-4317-9a5f-204f8a9724ca",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Year",
                                        "kind": 7
                                    }
                                ],
                                "values": [
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 260,
                                                "category": null,
                                                "primitiveType": 4,
                                                "extendedType": 260,
                                                "categoryString": null,
                                                "text": false,
                                                "numeric": true,
                                                "integer": true,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": 2018,
                                            "valueEncoded": "1028L",
                                            "kind": 17
                                        }
                                    ]
                                ],
                                "kind": 10
                            }
                        }
                    ]
                `),
            },
            {
                description: `${this.getValue(0, 1)} ${this.getValue(0, 2)}, ${this.getValue(0, 0)} and ${this.getValue(
                    2,
                    1
                )} ${this.getValue(2, 2)}, ${this.getValue(2, 0)}`,
                clickedDataPoints: [2, 5],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableGuid,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0],
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableGuid,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[1],
                    },
                    {
                        column: this.columnNames[2],
                        table: this.tableGuid,
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[2],
                    },
                ],
                values: [
                    [
                        { value: this.getValue(0, 0) as PrimitiveValueType },
                        { value: this.getValue(0, 1) as PrimitiveValueType },
                        { value: this.getValue(0, 2) as PrimitiveValueType },
                    ],
                    [
                        { value: this.getValue(2, 0) as PrimitiveValueType },
                        { value: this.getValue(2, 1) as PrimitiveValueType },
                        { value: this.getValue(2, 2) as PrimitiveValueType },
                    ],
                ],
                selectedDataPoints: [2, 5],
                partialDataPoints: [0, 1, 4],
                whereCondition: JSON.parse(`
                    [
                        {
                            "condition": {
                                "_kind": 10,
                                "args": [
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_bcfa94c1-7c12-4317-9a5f-204f8a9724ca",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Year",
                                        "kind": 7
                                    },
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_bcfa94c1-7c12-4317-9a5f-204f8a9724ca",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Month",
                                        "kind": 7
                                    },
                                    {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_bcfa94c1-7c12-4317-9a5f-204f8a9724ca",
                                                "variable": "d",
                                                "kind": 0
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Date",
                                        "kind": 7
                                    }
                                ],
                                "values": [
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 260,
                                                "category": null,
                                                "primitiveType": 4,
                                                "extendedType": 260,
                                                "categoryString": null,
                                                "text": false,
                                                "numeric": true,
                                                "integer": true,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": 2018,
                                            "valueEncoded": "2018L",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "April",
                                            "typeEncodedValue": "'April'",
                                            "valueEncoded": "'April'",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 260,
                                                "category": null,
                                                "primitiveType": 4,
                                                "extendedType": 260,
                                                "categoryString": null,
                                                "text": false,
                                                "numeric": true,
                                                "integer": true,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": 1,
                                            "valueEncoded": "1L",
                                            "kind": 17
                                        }
                                    ],
                                    [
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": 2018,
                                            "valueEncoded": "2018L",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 1,
                                                "category": null,
                                                "primitiveType": 1,
                                                "extendedType": 1,
                                                "categoryString": null,
                                                "text": true,
                                                "numeric": false,
                                                "integer": false,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": "February",
                                            "typeEncodedValue": "'February'",
                                            "valueEncoded": "'February'",
                                            "kind": 17
                                        },
                                        {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 260,
                                                "category": null,
                                                "primitiveType": 4,
                                                "extendedType": 260,
                                                "categoryString": null,
                                                "text": false,
                                                "numeric": true,
                                                "integer": true,
                                                "bool": false,
                                                "dateTime": false,
                                                "duration": false,
                                                "binary": false,
                                                "none": false
                                            },
                                            "value": 1,
                                            "valueEncoded": "1L",
                                            "kind": 17
                                        }
                                    ]
                                ],
                                "kind": 10
                            }
                        }
                    ]
                `),
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }
}
