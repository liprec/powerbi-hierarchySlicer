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

// Date with auto hierarchy

// powerbi
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

// powerbi.models
import { PrimitiveValueType } from "powerbi-models";

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

import { HierarchyData, ExpandTest, SelectTest, SearchTest } from "../visualData";

export class HierarchyDataSet3 extends HierarchyData {
    public get DataSetName(): string {
        return "HierarchyDataSet3";
    }
    public hierarchyName: string = "Date Hierarchy";
    public tableName: string = "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e";
    public tableValues = [
        [2018, "Qtr 1", "February", 1],
        [2018, "Qtr 1", "February", 2],
        [2018, "Qtr 1", "February", 3],
        [2018, "Qtr 1", "February", 4],
        [2018, "Qtr 1", "February", 5],
        [2018, "Qtr 1", "February", 6],
        [2018, "Qtr 1", "February", 7],
        [2018, "Qtr 1", "February", 8],
        [2018, "Qtr 1", "February", 9],
        [2018, "Qtr 1", "February", 10],
        [2018, "Qtr 1", "February", 11],
        [2018, "Qtr 1", "February", 12],
        [2018, "Qtr 1", "February", 13],
        [2018, "Qtr 1", "February", 14],
        [2018, "Qtr 1", "February", 15],
        [2018, "Qtr 1", "February", 16],
        [2018, "Qtr 1", "February", 17],
        [2018, "Qtr 1", "February", 18],
        [2018, "Qtr 1", "February", 19],
        [2018, "Qtr 1", "February", 20],
        [2018, "Qtr 1", "February", 21],
        [2018, "Qtr 1", "February", 22],
        [2018, "Qtr 1", "February", 23],
        [2018, "Qtr 1", "February", 24],
        [2018, "Qtr 1", "February", 25],
        [2018, "Qtr 1", "February", 26],
        [2018, "Qtr 1", "February", 27],
        [2018, "Qtr 1", "February", 28],
    ];
    public columnNames: string[] = ["Year", "Quarter", "Month", "Day"];
    public columnLabels: string[] = ["Year", "Quarter", "Month", "Day"];
    public columnRoles: string[] = ["Fields", "Fields", "Fields", "Fields"];
    public columnTypes = [
        ValueType.fromDescriptor({ numeric: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ numeric: true }),
    ];
    public columnFormat = [undefined, undefined, undefined, undefined];

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
                        column: this.columnNames[0],
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0],
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getRawValue(0, 0) }
                    ]
                ], // tslint:disable-line: prettier
                whereCondition: JSON.parse(`[{"condition":{"_kind":10,"args":[{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e","variable":"l","kind":0},"hierarchy":"Date Hierarchy","kind":6},"level":"Year","kind":7}],"values":[[{"_kind":17,"type":{"underlyingType":260,"category":null,"primitiveType":4,"extendedType":260,"categoryString":null,"text":false,"numeric":true,"integer":true,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":2018,"typeEncodedValue":"2018L","valueEncoded":"2018L","kind":17}]],"kind":10}}]`), // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], // tslint:disable-line: prettier
                partialDataPoints: [],
            },
            {
                description: `${this.tableValues[0][0]}, ${this.tableValues[0][1]}, ${this.tableValues[0][2]} and ${this.tableValues[0][3]}`,
                clickedDataPoints: [3],
                target: [
                    {
                        column: this.columnNames[0],
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[0],
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[1],
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[1],
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[2],
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[2],
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[3],
                        hierarchy: this.hierarchyName,
                        hierarchyLevel: this.columnNames[3],
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getRawValue(0, 0) },
                        { value: this.getRawValue(0, 1) },
                        { value: this.getRawValue(0, 2) },
                        { value: this.getRawValue(0, 3) },
                    ], // tslint:disable-line: prettier
                ],
                whereCondition: JSON.parse(`[{"condition":{"_kind":10,"args":[{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e","variable":"l","kind":0},"hierarchy":"Date Hierarchy","kind":6},"level":"Year","kind":7},{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e","variable":"l","kind":0},"hierarchy":"Date Hierarchy","kind":6},"level":"Quarter","kind":7},{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e","variable":"l","kind":0},"hierarchy":"Date Hierarchy","kind":6},"level":"Month","kind":7},{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e","variable":"l","kind":0},"hierarchy":"Date Hierarchy","kind":6},"level":"Day","kind":7}],"values":[[{"_kind":17,"type":{"underlyingType":260,"category":null,"primitiveType":4,"extendedType":260,"categoryString":null,"text":false,"numeric":true,"integer":true,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":2018,"typeEncodedValue":"2018L","valueEncoded":"2018L","kind":17},{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"Qtr 1","typeEncodedValue":"'Qtr 1'","valueEncoded":"'Qtr 1'","kind":17},{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"February","typeEncodedValue":"'February'","valueEncoded":"'February'","kind":17},{"_kind":17,"type":{"underlyingType":260,"category":null,"primitiveType":4,"extendedType":260,"categoryString":null,"text":false,"numeric":true,"integer":true,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":1,"typeEncodedValue":"1L","valueEncoded":"1L","kind":17}]],"kind":10}}]`), // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [3],
                partialDataPoints: [0, 1, 2],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "February",
                results: 31,
                selectedDataPoints: [],
                partialDataPoints: [],
            },
            <SearchTest>{
                searchString: "Februari",
                results: 0,
                selectedDataPoints: [],
                partialDataPoints: [],
            },
        ];
    }

    public getOwnIds(): string[][] {
        return [
            ["2018"],
            ["2018", "Qtr 1"],
            ["2018", "Qtr 1", "February"],
            ["2018", "Qtr 1", "February", "1"],
            ["2018", "Qtr 1", "February", "2"],
            ["2018", "Qtr 1", "February", "3"],
            ["2018", "Qtr 1", "February", "4"],
            ["2018", "Qtr 1", "February", "5"],
            ["2018", "Qtr 1", "February", "6"],
            ["2018", "Qtr 1", "February", "7"],
            ["2018", "Qtr 1", "February", "8"],
            ["2018", "Qtr 1", "February", "9"],
            ["2018", "Qtr 1", "February", "10"],
            ["2018", "Qtr 1", "February", "11"],
            ["2018", "Qtr 1", "February", "12"],
            ["2018", "Qtr 1", "February", "13"],
            ["2018", "Qtr 1", "February", "14"],
            ["2018", "Qtr 1", "February", "15"],
            ["2018", "Qtr 1", "February", "16"],
            ["2018", "Qtr 1", "February", "17"],
            ["2018", "Qtr 1", "February", "18"],
            ["2018", "Qtr 1", "February", "19"],
            ["2018", "Qtr 1", "February", "20"],
            ["2018", "Qtr 1", "February", "21"],
            ["2018", "Qtr 1", "February", "22"],
            ["2018", "Qtr 1", "February", "23"],
            ["2018", "Qtr 1", "February", "24"],
            ["2018", "Qtr 1", "February", "25"],
            ["2018", "Qtr 1", "February", "26"],
            ["2018", "Qtr 1", "February", "27"],
            ["2018", "Qtr 1", "February", "28"],
        ]; // tslint:disable-line: prettier
    }

    // tslint:disable-next-line: max-func-body-length
    public getDataView(): DataView {
        return <DataView>JSON.parse(`
        {
            "matrix": {
                "rows": {
                    "levels": [
                        {
                            "sources": [
                                {
                                    "roles": {
                                        "Fields": true
                                    },
                                    "type": {
                                        "underlyingType": 66308,
                                        "category": "Years",
                                        "temporalType": {
                                            "underlyingType": 66308,
                                            "year": true,
                                            "quarter": false,
                                            "month": false,
                                            "day": false,
                                            "paddedDateTableDate": false
                                        },
                                        "primitiveType": 4,
                                        "extendedType": 66308,
                                        "categoryString": "Years",
                                        "text": false,
                                        "numeric": true,
                                        "integer": true,
                                        "bool": false,
                                        "dateTime": false,
                                        "duration": false,
                                        "binary": false,
                                        "none": false,
                                        "temporal": {
                                            "underlyingType": 66308,
                                            "year": true,
                                            "quarter": false,
                                            "month": false,
                                            "day": false,
                                            "paddedDateTableDate": false
                                        }
                                    },
                                    "displayName": "Year",
                                    "queryName": "DataSet3.Date.Variation.Date Hierarchy.Year",
                                    "expr": {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 5,
                                                "arg": {
                                                    "_kind": 0,
                                                    "entity": "DataSet3",
                                                    "variable": "d",
                                                    "kind": 0
                                                },
                                                "name": "Variation",
                                                "property": "Date",
                                                "kind": 5
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Year",
                                        "kind": 7
                                    },
                                    "index": 0,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                "kind": 0
                                            },
                                            "ref": "Year",
                                            "kind": 2
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "sources": [
                                {
                                    "roles": {
                                        "Fields": true
                                    },
                                    "type": {
                                        "underlyingType": 262657,
                                        "category": "Quarters",
                                        "temporalType": {
                                            "underlyingType": 262657,
                                            "year": false,
                                            "quarter": true,
                                            "month": false,
                                            "day": false,
                                            "paddedDateTableDate": false
                                        },
                                        "primitiveType": 1,
                                        "extendedType": 262657,
                                        "categoryString": "Quarters",
                                        "text": true,
                                        "numeric": false,
                                        "integer": false,
                                        "bool": false,
                                        "dateTime": false,
                                        "duration": false,
                                        "binary": false,
                                        "none": false,
                                        "temporal": {
                                            "underlyingType": 262657,
                                            "year": false,
                                            "quarter": true,
                                            "month": false,
                                            "day": false,
                                            "paddedDateTableDate": false
                                        }
                                    },
                                    "displayName": "Quarter",
                                    "queryName": "DataSet3.Date.Variation.Date Hierarchy.Quarter",
                                    "expr": {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 5,
                                                "arg": {
                                                    "_kind": 0,
                                                    "entity": "DataSet3",
                                                    "variable": "d",
                                                    "kind": 0
                                                },
                                                "name": "Variation",
                                                "property": "Date",
                                                "kind": 5
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Quarter",
                                        "kind": 7
                                    },
                                    "index": 1,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                "kind": 0
                                            },
                                            "ref": "Quarter",
                                            "kind": 2
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "sources": [
                                {
                                    "roles": {
                                        "Fields": true
                                    },
                                    "type": {
                                        "underlyingType": 131585,
                                        "category": "Months",
                                        "temporalType": {
                                            "underlyingType": 131585,
                                            "year": false,
                                            "quarter": false,
                                            "month": true,
                                            "day": false,
                                            "paddedDateTableDate": false
                                        },
                                        "primitiveType": 1,
                                        "extendedType": 131585,
                                        "categoryString": "Months",
                                        "text": true,
                                        "numeric": false,
                                        "integer": false,
                                        "bool": false,
                                        "dateTime": false,
                                        "duration": false,
                                        "binary": false,
                                        "none": false,
                                        "temporal": {
                                            "underlyingType": 131585,
                                            "year": false,
                                            "quarter": false,
                                            "month": true,
                                            "day": false,
                                            "paddedDateTableDate": false
                                        }
                                    },
                                    "displayName": "Month",
                                    "queryName": "DataSet3.Date.Variation.Date Hierarchy.Month",
                                    "expr": {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 5,
                                                "arg": {
                                                    "_kind": 0,
                                                    "entity": "DataSet3",
                                                    "variable": "d",
                                                    "kind": 0
                                                },
                                                "name": "Variation",
                                                "property": "Date",
                                                "kind": 5
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Month",
                                        "kind": 7
                                    },
                                    "index": 2,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                "kind": 0
                                            },
                                            "ref": "Month",
                                            "kind": 2
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "sources": [
                                {
                                    "roles": {
                                        "Fields": true
                                    },
                                    "type": {
                                        "underlyingType": 328452,
                                        "category": "DayOfMonth",
                                        "temporalType": {
                                            "underlyingType": 328452,
                                            "year": false,
                                            "quarter": false,
                                            "month": false,
                                            "day": true,
                                            "paddedDateTableDate": false
                                        },
                                        "primitiveType": 4,
                                        "extendedType": 328452,
                                        "categoryString": "DayOfMonth",
                                        "text": false,
                                        "numeric": true,
                                        "integer": true,
                                        "bool": false,
                                        "dateTime": false,
                                        "duration": false,
                                        "binary": false,
                                        "none": false,
                                        "temporal": {
                                            "underlyingType": 328452,
                                            "year": false,
                                            "quarter": false,
                                            "month": false,
                                            "day": true,
                                            "paddedDateTableDate": false
                                        }
                                    },
                                    "displayName": "Day",
                                    "queryName": "DataSet3.Date.Variation.Date Hierarchy.Day",
                                    "expr": {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 5,
                                                "arg": {
                                                    "_kind": 0,
                                                    "entity": "DataSet3",
                                                    "variable": "d",
                                                    "kind": 0
                                                },
                                                "name": "Variation",
                                                "property": "Date",
                                                "kind": 5
                                            },
                                            "hierarchy": "Date Hierarchy",
                                            "kind": 6
                                        },
                                        "level": "Day",
                                        "kind": 7
                                    },
                                    "index": 3,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                "kind": 0
                                            },
                                            "ref": "Day",
                                            "kind": 2
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "root": {
                        "childIdentityFields": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                    "kind": 0
                                },
                                "ref": "Year",
                                "kind": 2
                            }
                        ],
                        "children": [
                            {
                                "level": 0,
                                "levelValues": [
                                    {
                                        "value": 2018,
                                        "levelSourceIndex": 0
                                    }
                                ],
                                "value": 2018,
                                "identity": {
                                    "kind": 1,
                                    "_expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                "kind": 0
                                            },
                                            "ref": "Year",
                                            "kind": 2
                                        },
                                        "right": {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 260,
                                                "category": {},
                                                "primitiveType": 4,
                                                "extendedType": 260,
                                                "categoryString": {},
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
                                        "kind": 13
                                    },
                                    "_key": {
                                        "factoryMethod": {},
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Year\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":2018}}}}"
                                    },
                                    "expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                "kind": 0
                                            },
                                            "ref": "Year",
                                            "kind": 2
                                        },
                                        "right": {
                                            "_kind": 17,
                                            "type": {
                                                "underlyingType": 260,
                                                "category": {},
                                                "primitiveType": 4,
                                                "extendedType": 260,
                                                "categoryString": {},
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
                                            "typeEncodedValue": "2018L",
                                            "valueEncoded": "2018L",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Year\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":2018}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                            "kind": 0
                                        },
                                        "ref": "Quarter",
                                        "kind": 2
                                    }
                                ],
                                "children": [
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "Qtr 1",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "Qtr 1",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                        "kind": 0
                                                    },
                                                    "ref": "Quarter",
                                                    "kind": 2
                                                },
                                                "right": {
                                                    "_kind": 17,
                                                    "type": {
                                                        "underlyingType": 1,
                                                        "category": {},
                                                        "primitiveType": 1,
                                                        "extendedType": 1,
                                                        "categoryString": {},
                                                        "text": true,
                                                        "numeric": false,
                                                        "integer": false,
                                                        "bool": false,
                                                        "dateTime": false,
                                                        "duration": false,
                                                        "binary": false,
                                                        "none": false
                                                    },
                                                    "value": "Qtr 1",
                                                    "valueEncoded": "'Qtr 1'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Quarter\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Qtr 1\\"}}}}"
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                        "kind": 0
                                                    },
                                                    "ref": "Quarter",
                                                    "kind": 2
                                                },
                                                "right": {
                                                    "_kind": 17,
                                                    "type": {
                                                        "underlyingType": 1,
                                                        "category": {},
                                                        "primitiveType": 1,
                                                        "extendedType": 1,
                                                        "categoryString": {},
                                                        "text": true,
                                                        "numeric": false,
                                                        "integer": false,
                                                        "bool": false,
                                                        "dateTime": false,
                                                        "duration": false,
                                                        "binary": false,
                                                        "none": false
                                                    },
                                                    "value": "Qtr 1",
                                                    "typeEncodedValue": "'Qtr 1'",
                                                    "valueEncoded": "'Qtr 1'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Quarter\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Qtr 1\\"}}}}"
                                        },
                                        "childIdentityFields": [
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                    "kind": 0
                                                },
                                                "ref": "Month",
                                                "kind": 2
                                            }
                                        ],
                                        "children": [
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "February",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "February",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                "kind": 0
                                                            },
                                                            "ref": "Month",
                                                            "kind": 2
                                                        },
                                                        "right": {
                                                            "_kind": 17,
                                                            "type": {
                                                                "underlyingType": 1,
                                                                "category": {},
                                                                "primitiveType": 1,
                                                                "extendedType": 1,
                                                                "categoryString": {},
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
                                                            "valueEncoded": "'February'",
                                                            "kind": 17
                                                        },
                                                        "kind": 13
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Month\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"February\\"}}}}"
                                                    },
                                                    "expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                "kind": 0
                                                            },
                                                            "ref": "Month",
                                                            "kind": 2
                                                        },
                                                        "right": {
                                                            "_kind": 17,
                                                            "type": {
                                                                "underlyingType": 1,
                                                                "category": {},
                                                                "primitiveType": 1,
                                                                "extendedType": 1,
                                                                "categoryString": {},
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
                                                        "kind": 13
                                                    },
                                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Month\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"February\\"}}}}"
                                                },
                                                "childIdentityFields": [
                                                    {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                            "kind": 0
                                                        },
                                                        "ref": "Day",
                                                        "kind": 2
                                                    }
                                                ],
                                                "children": [
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 1,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 1,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
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
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":1}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
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
                                                                    "typeEncodedValue": "1L",
                                                                    "valueEncoded": "1L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":1}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 2,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 2,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 2,
                                                                    "valueEncoded": "2L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":2}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 2,
                                                                    "typeEncodedValue": "2L",
                                                                    "valueEncoded": "2L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":2}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 3,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 3,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 3,
                                                                    "valueEncoded": "3L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":3}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 3,
                                                                    "typeEncodedValue": "3L",
                                                                    "valueEncoded": "3L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":3}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 4,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 4,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 4,
                                                                    "valueEncoded": "4L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":4}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 4,
                                                                    "typeEncodedValue": "4L",
                                                                    "valueEncoded": "4L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":4}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 5,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 5,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 5,
                                                                    "valueEncoded": "5L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":5}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 5,
                                                                    "typeEncodedValue": "5L",
                                                                    "valueEncoded": "5L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":5}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 6,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 6,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 6,
                                                                    "valueEncoded": "6L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":6}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 6,
                                                                    "typeEncodedValue": "6L",
                                                                    "valueEncoded": "6L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":6}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 7,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 7,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 7,
                                                                    "valueEncoded": "7L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":7}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 7,
                                                                    "typeEncodedValue": "7L",
                                                                    "valueEncoded": "7L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":7}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 8,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 8,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 8,
                                                                    "valueEncoded": "8L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":8}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 8,
                                                                    "typeEncodedValue": "8L",
                                                                    "valueEncoded": "8L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":8}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 9,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 9,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 9,
                                                                    "valueEncoded": "9L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":9}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 9,
                                                                    "typeEncodedValue": "9L",
                                                                    "valueEncoded": "9L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":9}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 10,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 10,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 10,
                                                                    "valueEncoded": "10L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":10}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 10,
                                                                    "typeEncodedValue": "10L",
                                                                    "valueEncoded": "10L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":10}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 11,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 11,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 11,
                                                                    "valueEncoded": "11L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":11}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 11,
                                                                    "typeEncodedValue": "11L",
                                                                    "valueEncoded": "11L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":11}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 12,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 12,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 12,
                                                                    "valueEncoded": "12L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":12}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 12,
                                                                    "typeEncodedValue": "12L",
                                                                    "valueEncoded": "12L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":12}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 13,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 13,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 13,
                                                                    "valueEncoded": "13L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":13}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 13,
                                                                    "typeEncodedValue": "13L",
                                                                    "valueEncoded": "13L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":13}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 14,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 14,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 14,
                                                                    "valueEncoded": "14L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":14}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 14,
                                                                    "typeEncodedValue": "14L",
                                                                    "valueEncoded": "14L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":14}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 15,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 15,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 15,
                                                                    "valueEncoded": "15L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":15}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 15,
                                                                    "typeEncodedValue": "15L",
                                                                    "valueEncoded": "15L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":15}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 16,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 16,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 16,
                                                                    "valueEncoded": "16L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":16}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 16,
                                                                    "typeEncodedValue": "16L",
                                                                    "valueEncoded": "16L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":16}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 17,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 17,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 17,
                                                                    "valueEncoded": "17L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":17}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 17,
                                                                    "typeEncodedValue": "17L",
                                                                    "valueEncoded": "17L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":17}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 18,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 18,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 18,
                                                                    "valueEncoded": "18L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":18}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 18,
                                                                    "typeEncodedValue": "18L",
                                                                    "valueEncoded": "18L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":18}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 19,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 19,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 19,
                                                                    "valueEncoded": "19L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":19}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 19,
                                                                    "typeEncodedValue": "19L",
                                                                    "valueEncoded": "19L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":19}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 20,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 20,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 20,
                                                                    "valueEncoded": "20L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":20}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 20,
                                                                    "typeEncodedValue": "20L",
                                                                    "valueEncoded": "20L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":20}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 21,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 21,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 21,
                                                                    "valueEncoded": "21L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":21}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 21,
                                                                    "typeEncodedValue": "21L",
                                                                    "valueEncoded": "21L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":21}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 22,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 22,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 22,
                                                                    "valueEncoded": "22L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":22}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 22,
                                                                    "typeEncodedValue": "22L",
                                                                    "valueEncoded": "22L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":22}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 23,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 23,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 23,
                                                                    "valueEncoded": "23L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":23}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 23,
                                                                    "typeEncodedValue": "23L",
                                                                    "valueEncoded": "23L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":23}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 24,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 24,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 24,
                                                                    "valueEncoded": "24L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":24}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 24,
                                                                    "typeEncodedValue": "24L",
                                                                    "valueEncoded": "24L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":24}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 25,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 25,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 25,
                                                                    "valueEncoded": "25L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":25}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 25,
                                                                    "typeEncodedValue": "25L",
                                                                    "valueEncoded": "25L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":25}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 26,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 26,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 26,
                                                                    "valueEncoded": "26L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":26}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 26,
                                                                    "typeEncodedValue": "26L",
                                                                    "valueEncoded": "26L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":26}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 27,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 27,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 27,
                                                                    "valueEncoded": "27L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":27}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 27,
                                                                    "typeEncodedValue": "27L",
                                                                    "valueEncoded": "27L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":27}}}}"
                                                        }
                                                    },
                                                    {
                                                        "level": 3,
                                                        "levelValues": [
                                                            {
                                                                "value": 28,
                                                                "levelSourceIndex": 0
                                                            }
                                                        ],
                                                        "value": 28,
                                                        "identity": {
                                                            "kind": 1,
                                                            "_expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 28,
                                                                    "valueEncoded": "28L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "_key": {
                                                                "factoryMethod": {},
                                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":28}}}}"
                                                            },
                                                            "expr": {
                                                                "_kind": 13,
                                                                "comparison": 0,
                                                                "left": {
                                                                    "_kind": 2,
                                                                    "source": {
                                                                        "_kind": 0,
                                                                        "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                                                        "kind": 0
                                                                    },
                                                                    "ref": "Day",
                                                                    "kind": 2
                                                                },
                                                                "right": {
                                                                    "_kind": 17,
                                                                    "type": {
                                                                        "underlyingType": 260,
                                                                        "category": {},
                                                                        "primitiveType": 4,
                                                                        "extendedType": 260,
                                                                        "categoryString": {},
                                                                        "text": false,
                                                                        "numeric": true,
                                                                        "integer": true,
                                                                        "bool": false,
                                                                        "dateTime": false,
                                                                        "duration": false,
                                                                        "binary": false,
                                                                        "none": false
                                                                    },
                                                                    "value": 28,
                                                                    "typeEncodedValue": "28L",
                                                                    "valueEncoded": "28L",
                                                                    "kind": 17
                                                                },
                                                                "kind": 13
                                                            },
                                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e\\"},\\"r\\":\\"Day\\"}},\\"r\\":{\\"const\\":{\\"t\\":4,\\"v\\":28}}}}"
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                "columns": {
                    "levels": [],
                    "root": {
                        "children": []
                    }
                },
                "valueSources": []
            },
            "single": {},
            "metadata": {
                "columns": [
                    {
                        "roles": {
                            "Fields": true
                        },
                        "type": {
                            "underlyingType": 66308,
                            "category": "Years",
                            "temporalType": {
                                "underlyingType": 66308,
                                "year": true,
                                "quarter": false,
                                "month": false,
                                "day": false,
                                "paddedDateTableDate": false
                            },
                            "primitiveType": 4,
                            "extendedType": 66308,
                            "categoryString": "Years",
                            "text": false,
                            "numeric": true,
                            "integer": true,
                            "bool": false,
                            "dateTime": false,
                            "duration": false,
                            "binary": false,
                            "none": false,
                            "temporal": {
                                "underlyingType": 66308,
                                "year": true,
                                "quarter": false,
                                "month": false,
                                "day": false,
                                "paddedDateTableDate": false
                            }
                        },
                        "displayName": "Year",
                        "queryName": "DataSet3.Date.Variation.Date Hierarchy.Year",
                        "expr": {
                            "_kind": 7,
                            "arg": {
                                "_kind": 6,
                                "arg": {
                                    "_kind": 5,
                                    "arg": {
                                        "_kind": 0,
                                        "entity": "DataSet3",
                                        "variable": "d",
                                        "kind": 0
                                    },
                                    "name": "Variation",
                                    "property": "Date",
                                    "kind": 5
                                },
                                "hierarchy": "Date Hierarchy",
                                "kind": 6
                            },
                            "level": "Year",
                            "kind": 7
                        },
                        "index": 0,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                    "kind": 0
                                },
                                "ref": "Year",
                                "kind": 2
                            }
                        ]
                    },
                    {
                        "roles": {
                            "Fields": true
                        },
                        "type": {
                            "underlyingType": 262657,
                            "category": "Quarters",
                            "temporalType": {
                                "underlyingType": 262657,
                                "year": false,
                                "quarter": true,
                                "month": false,
                                "day": false,
                                "paddedDateTableDate": false
                            },
                            "primitiveType": 1,
                            "extendedType": 262657,
                            "categoryString": "Quarters",
                            "text": true,
                            "numeric": false,
                            "integer": false,
                            "bool": false,
                            "dateTime": false,
                            "duration": false,
                            "binary": false,
                            "none": false,
                            "temporal": {
                                "underlyingType": 262657,
                                "year": false,
                                "quarter": true,
                                "month": false,
                                "day": false,
                                "paddedDateTableDate": false
                            }
                        },
                        "displayName": "Quarter",
                        "queryName": "DataSet3.Date.Variation.Date Hierarchy.Quarter",
                        "expr": {
                            "_kind": 7,
                            "arg": {
                                "_kind": 6,
                                "arg": {
                                    "_kind": 5,
                                    "arg": {
                                        "_kind": 0,
                                        "entity": "DataSet3",
                                        "variable": "d",
                                        "kind": 0
                                    },
                                    "name": "Variation",
                                    "property": "Date",
                                    "kind": 5
                                },
                                "hierarchy": "Date Hierarchy",
                                "kind": 6
                            },
                            "level": "Quarter",
                            "kind": 7
                        },
                        "index": 1,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                    "kind": 0
                                },
                                "ref": "Quarter",
                                "kind": 2
                            }
                        ]
                    },
                    {
                        "roles": {
                            "Fields": true
                        },
                        "type": {
                            "underlyingType": 131585,
                            "category": "Months",
                            "temporalType": {
                                "underlyingType": 131585,
                                "year": false,
                                "quarter": false,
                                "month": true,
                                "day": false,
                                "paddedDateTableDate": false
                            },
                            "primitiveType": 1,
                            "extendedType": 131585,
                            "categoryString": "Months",
                            "text": true,
                            "numeric": false,
                            "integer": false,
                            "bool": false,
                            "dateTime": false,
                            "duration": false,
                            "binary": false,
                            "none": false,
                            "temporal": {
                                "underlyingType": 131585,
                                "year": false,
                                "quarter": false,
                                "month": true,
                                "day": false,
                                "paddedDateTableDate": false
                            }
                        },
                        "displayName": "Month",
                        "queryName": "DataSet3.Date.Variation.Date Hierarchy.Month",
                        "expr": {
                            "_kind": 7,
                            "arg": {
                                "_kind": 6,
                                "arg": {
                                    "_kind": 5,
                                    "arg": {
                                        "_kind": 0,
                                        "entity": "DataSet3",
                                        "variable": "d",
                                        "kind": 0
                                    },
                                    "name": "Variation",
                                    "property": "Date",
                                    "kind": 5
                                },
                                "hierarchy": "Date Hierarchy",
                                "kind": 6
                            },
                            "level": "Month",
                            "kind": 7
                        },
                        "index": 2,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                    "kind": 0
                                },
                                "ref": "Month",
                                "kind": 2
                            }
                        ]
                    },
                    {
                        "roles": {
                            "Fields": true
                        },
                        "type": {
                            "underlyingType": 328452,
                            "category": "DayOfMonth",
                            "temporalType": {
                                "underlyingType": 328452,
                                "year": false,
                                "quarter": false,
                                "month": false,
                                "day": true,
                                "paddedDateTableDate": false
                            },
                            "primitiveType": 4,
                            "extendedType": 328452,
                            "categoryString": "DayOfMonth",
                            "text": false,
                            "numeric": true,
                            "integer": true,
                            "bool": false,
                            "dateTime": false,
                            "duration": false,
                            "binary": false,
                            "none": false,
                            "temporal": {
                                "underlyingType": 328452,
                                "year": false,
                                "quarter": false,
                                "month": false,
                                "day": true,
                                "paddedDateTableDate": false
                            }
                        },
                        "displayName": "Day",
                        "queryName": "DataSet3.Date.Variation.Date Hierarchy.Day",
                        "expr": {
                            "_kind": 7,
                            "arg": {
                                "_kind": 6,
                                "arg": {
                                    "_kind": 5,
                                    "arg": {
                                        "_kind": 0,
                                        "entity": "DataSet3",
                                        "variable": "d",
                                        "kind": 0
                                    },
                                    "name": "Variation",
                                    "property": "Date",
                                    "kind": 5
                                },
                                "hierarchy": "Date Hierarchy",
                                "kind": 6
                            },
                            "level": "Day",
                            "kind": 7
                        },
                        "index": 3,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "LocalDateTable_09d97ff9-82ce-45c8-9a6e-e0b90550824e",
                                    "kind": 0
                                },
                                "ref": "Day",
                                "kind": 2
                            }
                        ]
                    }
                ]
            }
        }
        `);
    }
}
