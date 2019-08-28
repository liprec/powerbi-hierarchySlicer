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


"use strict";
import powerbi from "powerbi-visuals-api";
import { IFilterTarget } from "powerbi-models";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { valueType } from "powerbi-visuals-utils-typeutils";

import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ValueType = valueType.ValueType;
import ValueFormat = valueFormatter.format;

enum SQExprKind {
    ColumnRef = 2,
    Hierarchy = 6,
    HierarchyLevel = 7
}

export function extractFilterColumnTarget(categoryColumn: DataViewCategoryColumn | DataViewMetadataColumn): IFilterTarget {
    // take an expression from source or column metadata
    let expr: any = categoryColumn && (<any>categoryColumn).source && (<any>categoryColumn).source.expr
    ? (<any>categoryColumn).source.expr as any
    : (<any>categoryColumn).expr as any;

    // take table name from source.entity if column definition is simple
    let filterTargetTable: string = expr && expr.source && expr.source.entity
        ? expr.source.entity
        : null;

    // take expr.ref as column name if column definition is simple
    let filterTargetColumn: string = expr && expr.ref
        ? expr.ref
        : null;

    // special cases
    // when data structure is hierarchical
    if (expr && expr.kind === SQExprKind.HierarchyLevel) {
        let hierarchy: string = expr.arg.hierarchy;
        filterTargetColumn = expr.level;
        let hierarchyLevel: string = expr.level;

        // Only if we have hierarchical structure with virtual table, take table name from identityExprs
        // Power BI creates hierarchy for date type of data (Year, Quater, Month, Days)
        // For it, Power BI creates a virtual table and gives it generated name as... 'LocalDateTable_bcfa94c1-7c12-4317-9a5f-204f8a9724ca'
        // Visuals have to use a virtual table name as a target of JSON to filter date hierarchy properly
        filterTargetTable = expr.arg && expr.arg.arg && expr.arg.arg.entity;
        if (expr.arg && expr.arg.kind === SQExprKind.Hierarchy) {
            if ((<any>categoryColumn).identityExprs && (<any>categoryColumn).identityExprs.length) {
                const identityExprs = ((<any>categoryColumn).identityExprs[(<any>categoryColumn).identityExprs.length - 1] as any);
                filterTargetTable = identityExprs.source.entity;
            }
        } else {
            // otherwise take column name from expr
            filterTargetTable = expr.arg && expr.arg.arg && expr.arg.arg.entity;
        }

        return {
            table: filterTargetTable,
            hierarchy: hierarchy,
            hierarchyLevel: hierarchyLevel,
            column: filterTargetColumn
        };
    }

    return {
        table: filterTargetTable,
        column: filterTargetColumn
    };
}

export function convertRawValue(rawValue: PrimitiveValue, dataType: ValueTypeDescriptor, full: boolean = false): any {
    if ((dataType.dateTime) && (full)) {
       return new Date(rawValue as Date);
    } else if (dataType.numeric) {
        return rawValue as number;
    } else {
        return rawValue as string;
    }
};

export function convertAdvancedFilterConditionsToSlicerData(conditions: any, columnDefs: DataViewMetadataColumn[]): string[] {
    if (!conditions || !conditions.values || !conditions.args || !columnDefs) {
        return [];
    }

    let result: string[] = [];

    const args = conditions.args;
    conditions.values.forEach((valueArray: any) => {
        let res = "";
        valueArray.forEach((value: any, index: number) => {
            const columnIndex = columnDefs.findIndex((def) => {
                const expr = def.expr as any;
                const arg = args[index];
                const exprColumnName = expr.level ? expr.level : expr.ref;
                const argColumnName = arg.level ? arg.level : arg.ref;

                const exprTableName = expr.source ? expr.source.entity : expr.arg.hierarchy;
                const argTableName = arg.source ? arg.source.entity : arg.arg.hierarchy;
                return exprColumnName === argColumnName && exprTableName === argTableName;
            });
            if (value.value===null) {
                result.push(res);
            }
            if (columnIndex !== -1) {
                const format = columnDefs[columnIndex].format || "g";
                const dataType: ValueTypeDescriptor = columnDefs[columnIndex] && columnDefs[columnIndex].type || ValueType.fromDescriptor({ text: true });
                const labelValue = ValueFormat(convertRawValue(value.value, dataType), format)
                res += (res === "" ? "" : "_") + "|~" + labelValue.replace(/,/g, "") + "-" + columnIndex;
            }
        });

        result.push(res);
    });

    return result;
}
