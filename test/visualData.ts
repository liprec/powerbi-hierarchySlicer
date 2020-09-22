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
import format = valueFormatter.format;

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
    clickedDataPoints: number[];
    target: IFilterTarget[];
    values: any[][];
    singleSelect: boolean;
    selectedDataPoints: number[];
    partialDataPoints: number[];
    whereCondition?: string;
    hideMember?: number;
    hideMemberOffset?: number;
}

enum SQExprKind {
    ColumnRef = 2,
    PropertyVariationSource = 5,
    Hierarchy = 6,
    HierarchyLevel = 7,
}

export enum DataSourceKind {
    Native = 0,
    Tabular = 1,
    MD = 2,
}

export abstract class HierarchyData extends TestDataViewBuilder {
    public abstract get DataSetName(): string;
    public dataSource: DataSourceKind = DataSourceKind.Native;
    public tableName: string = "Hierarchy";
    public hierarchyName?: string;
    public abstract tableValues: any[][];

    public abstract columnNames: string[];
    public abstract columnLabels: string[];
    public abstract columnRoles: string[];
    public abstract columnTypes: ValueType[];
    public abstract columnFormat: any[];

    public fieldsKind: SQExprKind = SQExprKind.ColumnRef;

    public abstract getExpandedTests(): ExpandTest[];
    public abstract getSelectedTests(): SelectTest[];
    public abstract getSearchTests(): SearchTest[];

    public getValue(row: number, col: number): string | number | boolean | null {
        const convertedValue = this.convertRawValue(this.tableValues[row][col], this.columnTypes[col]);
        if (convertedValue === null) return "(Blank)";
        if (!this.columnTypes[col].text) return convertedValue;
        return format(convertedValue, this.columnFormat[col]);
    }

    public getRawValue(row: number, col: number): string | number | boolean | null {
        const convertedValue = this.convertRawValue(this.tableValues[row][col], this.columnTypes[col]);
        if (convertedValue === null) return this.columnTypes[col].text ? "" : null;
        if (!this.columnTypes[col].text) return convertedValue;
        return format(convertedValue, this.columnFormat[col]);
    }

    public convertRawValue(rawValue: PrimitiveValue, dataType: ValueTypeDescriptor, full: boolean = false): any {
        // if (rawValue === null) return null;
        if (dataType.dateTime && full) {
            return new Date(<Date>rawValue);
        } else if (dataType.numeric) {
            return <number>rawValue;
        } else {
            return <string>rawValue;
        }
    }

    public getItemLabels(emptyString: boolean = true, label: string | null = null): string[] {
        return this.columnNames
            .filter(role => role === "Fields")
            .map((col, index) => {
                const rawValue = this.convertRawValue(this.tableValues[0][index], this.columnTypes[index], true);
                const formatValue =
                    rawValue === null || (emptyString && rawValue === "")
                        ? label || "(Blank)"
                        : format(rawValue, this.columnFormat[index]);
                return formatValue === "" ? String.fromCharCode(160) : formatValue;
            });
    }

    public abstract getDataView(): DataView;
    public abstract getOwnIds(): string[][];

    public getFullExpanded(): FullExpanded {
        const levels = this.columnRoles.filter(role => role === "Fields").length;
        const expanded = this.getOwnIds()
            .filter(ownId => ownId.length < levels)
            .map(ownId => "|~" + ownId.join("~|~") + "~|");
        const length = this.getOwnIds().length;

        return <FullExpanded>{
            expanded: expanded,
            length: length,
        };
    }

    public getItemCount(level: number): number {
        return this.getOwnIds().filter(ownId => ownId.length <= level).length;
    }
}
