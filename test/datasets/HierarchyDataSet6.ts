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

// Hierarchy of string columns

// powerbi
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

// powerbi.models
import { PrimitiveValueType } from "powerbi-models";

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

import { HierarchyData, ExpandTest, SelectTest, SearchTest } from "../visualData";

export class HierarchyDataSet6 extends HierarchyData {
    public get DataSetName(): string {
        return "HierarchyDataSet6";
    }
    public tableName: string = "DataSet6";
    public hierarchyName: string = "Hierarchy";
    public columnNames: string[] = ["Parent", "Child"];
    public columnLabels: string[] = ["Parent", "Child"];
    public columnRoles: string[] = ["Fields", "Fields"];
    public tableValues = [
        ["", "2"],
        ["", "6"],
        ["1", "1"],
        ["1", "5"],
        ["2", ""],
        ["2", "3"],
    ]; // tslint:disable-line: prettier
    public columnTypes = [ValueType.fromDescriptor({ text: true }), ValueType.fromDescriptor({ text: true })];
    public columnFormat = [undefined, undefined];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~~|"],
                count: 5,
                hideMembersOffset: [0, -3, 0],
            },
            {
                expanded: ["|~1~|"],
                count: 5,
                hideMembersOffset: [0, -1, -1],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: "''",
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
                whereCondition: JSON.parse(`[{"condition":{"_kind":10,"args":[{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"DataSet6","variable":"d","kind":0},"hierarchy":"Hierarchy","kind":6},"level":"Parent","kind":7}],"values":[[{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"","typeEncodedValue":"''","valueEncoded":"''","kind":17}]],"kind":10}}]`), // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [0, 1, 2],
                partialDataPoints: [],
            },
            {
                description: `('${this.getValue(1, 0)}', '${this.getValue(1, 1)}') and ('${this.getValue(2, 0)}', '${this.getValue(2, 1)}')`, // tslint:disable-line: prettier
                clickedDataPoints: [2, 4],
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
                ],
                values: [
                    [
                        { value: this.getRawValue(1, 0) },
                        { value: this.getRawValue(1, 1) },
                    ], // tslint:disable-line: prettier
                    [
                        { value: this.getRawValue(2, 0) },
                        { value: this.getRawValue(2, 1) },
                    ], // tslint:disable-line: prettier
                ],
                whereCondition: JSON.parse(`[{"condition":{"_kind":10,"args":[{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"DataSet6","variable":"d","kind":0},"hierarchy":"Hierarchy","kind":6},"level":"Parent","kind":7},{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"DataSet6","variable":"d","kind":0},"hierarchy":"Hierarchy","kind":6},"level":"Child","kind":7}],"values":[[{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"","typeEncodedValue":"''","valueEncoded":"''","kind":17},{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"6","typeEncodedValue":"'6'","valueEncoded":"'6'","kind":17}],[{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"1","typeEncodedValue":"'1'","valueEncoded":"'1'","kind":17},{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"1","typeEncodedValue":"'1'","valueEncoded":"'1'","kind":17}]],"kind":10}}]`), // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [2, 4],
                partialDataPoints: [0, 3],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }

    public getOwnIds(): string[][] {
        return [
            [""],
            ["", "2"],
            ["", "6"],
            ["1"],
            ["1", "1"],
            ["1", "5"],
            ["2"],
            ["2", ""],
            ["2", "3"],
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
                                    "displayName": "Parent",
                                    "queryName": "DataSet6.Hierarchy.Parent",
                                    "expr": {
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
                                    "index": 0,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Parent",
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
                                    "displayName": "Child",
                                    "queryName": "DataSet6.Hierarchy.Child",
                                    "expr": {
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
                                    },
                                    "index": 1,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Child",
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
                                    "entity": "DataSet6",
                                    "kind": 0
                                },
                                "ref": "Parent",
                                "kind": 2
                            }
                        ],
                        "children": [
                            {
                                "level": 0,
                                "levelValues": [
                                    {
                                        "value": "",
                                        "levelSourceIndex": 0
                                    }
                                ],
                                "value": "",
                                "identity": {
                                    "kind": 1,
                                    "_expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Parent",
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
                                            "value": "",
                                            "typeEncodedValue": "''",
                                            "valueEncoded": "''",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "_key": {
                                        "factoryMethod": {},
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Parent\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                    },
                                    "expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Parent",
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
                                            "value": "",
                                            "typeEncodedValue": "''",
                                            "valueEncoded": "''",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Parent\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet6",
                                            "kind": 0
                                        },
                                        "ref": "Child",
                                        "kind": 2
                                    }
                                ],
                                "children": [
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "2",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "2",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "2",
                                                    "typeEncodedValue": "'2'",
                                                    "valueEncoded": "'2'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"2\\"}}}}"
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "2",
                                                    "typeEncodedValue": "'2'",
                                                    "valueEncoded": "'2'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"2\\"}}}}"
                                        }
                                    },
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "6",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "6",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "6",
                                                    "typeEncodedValue": "'6'",
                                                    "valueEncoded": "'6'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"6\\"}}}}"
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "6",
                                                    "typeEncodedValue": "'6'",
                                                    "valueEncoded": "'6'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"6\\"}}}}"
                                        }
                                    }
                                ]
                            },
                            {
                                "level": 0,
                                "levelValues": [
                                    {
                                        "value": "1",
                                        "levelSourceIndex": 0
                                    }
                                ],
                                "value": "1",
                                "identity": {
                                    "kind": 1,
                                    "_expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Parent",
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
                                            "value": "1",
                                            "typeEncodedValue": "'1'",
                                            "valueEncoded": "'1'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "_key": {
                                        "factoryMethod": {},
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Parent\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"1\\"}}}}"
                                    },
                                    "expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Parent",
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
                                            "value": "1",
                                            "typeEncodedValue": "'1'",
                                            "valueEncoded": "'1'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Parent\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"1\\"}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet6",
                                            "kind": 0
                                        },
                                        "ref": "Child",
                                        "kind": 2
                                    }
                                ],
                                "children": [
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "1",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "1",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "1",
                                                    "typeEncodedValue": "'1'",
                                                    "valueEncoded": "'1'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"1\\"}}}}"
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "1",
                                                    "typeEncodedValue": "'1'",
                                                    "valueEncoded": "'1'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"1\\"}}}}"
                                        }
                                    },
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "5",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "5",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "5",
                                                    "typeEncodedValue": "'5'",
                                                    "valueEncoded": "'5'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"5\\"}}}}"
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "5",
                                                    "typeEncodedValue": "'5'",
                                                    "valueEncoded": "'5'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"5\\"}}}}"
                                        }
                                    }
                                ]
                            },
                            {
                                "level": 0,
                                "levelValues": [
                                    {
                                        "value": "2",
                                        "levelSourceIndex": 0
                                    }
                                ],
                                "value": "2",
                                "identity": {
                                    "kind": 1,
                                    "_expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Parent",
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
                                            "value": "2",
                                            "typeEncodedValue": "'2'",
                                            "valueEncoded": "'2'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "_key": {
                                        "factoryMethod": {},
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Parent\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"2\\"}}}}"
                                    },
                                    "expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet6",
                                                "kind": 0
                                            },
                                            "ref": "Parent",
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
                                            "value": "2",
                                            "typeEncodedValue": "'2'",
                                            "valueEncoded": "'2'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Parent\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"2\\"}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet6",
                                            "kind": 0
                                        },
                                        "ref": "Child",
                                        "kind": 2
                                    }
                                ],
                                "children": [
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "",
                                                    "valueEncoded": "''",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "",
                                                    "typeEncodedValue": "''",
                                                    "valueEncoded": "''",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                        }
                                    },
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "3",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "3",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "3",
                                                    "valueEncoded": "'3'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"3\\"}}}}"
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet6",
                                                        "kind": 0
                                                    },
                                                    "ref": "Child",
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
                                                    "value": "3",
                                                    "typeEncodedValue": "'3'",
                                                    "valueEncoded": "'3'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet6\\"},\\"r\\":\\"Child\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"3\\"}}}}"
                                        }
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
            "metadata": {
                "columns": [
                    {
                        "roles": {
                            "Fields": true
                        },
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
                        "displayName": "Parent",
                        "queryName": "DataSet6.Hierarchy.Parent",
                        "expr": {
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
                        "index": 0,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "DataSet6",
                                    "kind": 0
                                },
                                "ref": "Parent",
                                "kind": 2
                            }
                        ]
                    },
                    {
                        "roles": {
                            "Fields": true
                        },
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
                        "displayName": "Child",
                        "queryName": "DataSet6.Hierarchy.Child",
                        "expr": {
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
                        },
                        "index": 1,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "DataSet6",
                                    "kind": 0
                                },
                                "ref": "Child",
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
