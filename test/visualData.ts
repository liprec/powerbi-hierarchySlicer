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
import DataView = powerbi.DataView;

// powerbi.extensibility.utils.test
import { testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;
import TestDataViewBuilderColumnOptions = testDataViewBuilder.TestDataViewBuilderColumnOptions;

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;


export class HierarchyData extends TestDataViewBuilder {
    public tableName: string = "Hierarchy";
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

    public static totalExpandedTests: number = 2;
    public static getExpandedString(testNumber: number) {
        switch (testNumber) {
            case 1:
                return {
                    expanded: "|~L1-0",
                    number: 4,
                    hideMembersOffset: [0, -1, 0]
                };
            case 2:
                return {
                    expanded: "|~L1-0,|~L1-0_|~L11-1",
                    number: 6,
                    hideMembersOffset: [0, -1, 0]
                };
            case 3:
                return {
                    expanded: "|~L1-0,|~L1-0_|~(Blank)-1,|~L1-0_|~L11-1",
                    number: 7,
                    hideMembersOffset: [0, -2, -1]
                };
        }
    }
}