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

// powerbi.extensibility.utils.test
import { testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;
import TestDataViewBuilderColumnOptions = testDataViewBuilder.TestDataViewBuilderColumnOptions;

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

// powerbi.extensibility.utils.formatting
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import ValueFormat = valueFormatter.valueFormatter.format;

export interface FullExpanded {
    expanded: string[];
    length: number;
}

export interface ExpandTest {
    expanded: string;
    number: number;
    hideMembersOffset: number[];
}

export abstract class HierarchyData extends TestDataViewBuilder {
    public tableName: string = "Hierarchy";
    public tableValues: any[][];

    public columnNames: string[];
    public columnTypes: any[];
    public columnFormat: any[];

    public abstract getExpandedTests(): ExpandTest[];

    public getFullExpanded(): FullExpanded {
        const columnLength = this.columnNames.length;
        const encodeValues = this.tableValues.map((row) => row.map((value, i) => "|~" + ValueFormat(value, this.columnFormat[i]).replace(/,/g, "") + "-" + i));
        const encodeExpandValues = encodeValues.map((row) => row.map((value, index, row) => row.slice(0, index + 1).join("_")));
        const expanded = Array.from({length: columnLength - 1}).map((col, i) => encodeExpandValues.map(row => row[i]))
            .map((row) => row.filter((value, index, self) => self.indexOf(value) === index))    // Make unique
            .join(",").split(",");
        const length = Array.from({length: columnLength}).map((col, i) => encodeExpandValues.map(row => row[i]))  // Transpose matrix
            .map((row) => row.filter((value, index, self) => self.indexOf(value) === index))    // Make unique
            .join(",").split(",").length;
        return <FullExpanded>{
            expanded: expanded,
            length: length
        };
    }

    public getLevelCount(level: number): number {
        return this.tableValues.map((row) => { return row[level - 1]; })
            .filter((value, index, self) => self.indexOf(value) === index)
            .length;
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
    public columnTypes: any[] = [
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
                expanded: "|~L1-0",
                number: 4,
                hideMembersOffset: [0, -1, 0]
            },
            {
                expanded: "|~L1-0,|~L1-0_|~(Blank)-1,|~L1-0_|~L11-1",
                number: 7,
                hideMembersOffset: [0, -2, -1]
            },
            {
                expanded: "|~L1-0,|~L1-0_|~L11-1",
                number: 6,
                hideMembersOffset: [0, -1, 0]
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
        [     "L1",     "L11"],
        [     "L_2",    "L12"],
        [     "L1",     "L12"],
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
                expanded: "|~L1-0",
                number: 5,
                hideMembersOffset: [0, -1, 0]
            },
            {
                expanded: "|~L1-0,|~L_2-0",
                number: 6,
                hideMembersOffset: [0, -1, 0]
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
}