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

// Hierarchy based of four columns

// powerbi
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

// powerbi.models
import { PrimitiveValueType } from "powerbi-models";

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

import { HierarchyData, ExpandTest, SelectTest, SearchTest } from "../visualData";

export class HierarchyDataSet1 extends HierarchyData {
    public get DataSetName(): string {
        return "HierarchyDataSet1";
    }
    public tableName: string = "DataSet1";
    public columnNames: string[] = ["Level 1", "Level 2", "Level 3", "Value"];
    public columnLabels: string[] = ["Level 1", "Level 2", "Level 3", "Value"];
    public columnRoles: string[] = ["Fields", "Fields", "Fields", "Values"];
    public tableValues = [
        ["L1", null, null, 1],
        ["L1", "L11", "L111", 2],
        ["L1", "L11", "L112", 3],
        ["L1", "L12", null, 4],
        ["L1", "L12", "L123", 5],
    ]; // tslint:disable-line: prettier
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
                expanded: ["|~L1~|"],
                count: 4,
                hideMembersOffset: [0, -1, 0],
            },
            {
                expanded: ["|~L1~|", "|~L1~|~~|", "|~L1~|~L11~|"],
                count: 7,
                hideMembersOffset: [0, -2, -1],
            },
            {
                expanded: ["|~L1~|", "|~L1~|~L11~|"],
                count: 6,
                hideMembersOffset: [0, -1, 0],
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
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getRawValue(0, 0) }
                    ]
                ], // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                partialDataPoints: [],
            },
            {
                description: `${this.getValue(0, 1)}`,
                clickedDataPoints: [1],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getRawValue(0, 0) },
                        { value: this.getRawValue(0, 1) },
                    ], // tslint:disable-line: prettier
                ],
                singleSelect: false,
                selectedDataPoints: [1, 2],
                partialDataPoints: [0],
            },
            {
                description: `${this.getValue(1, 2)}`,
                clickedDataPoints: [4],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[1],
                        table: this.tableName,
                    },
                    {
                        column: this.columnNames[2],
                        table: this.tableName,
                    },
                ],
                values: [
                    [
                        { value: this.getRawValue(1, 0) },
                        { value: this.getRawValue(1, 1) },
                        { value: this.getRawValue(1, 2) },
                    ],
                ],
                singleSelect: false,
                selectedDataPoints: [4],
                partialDataPoints: [0, 3],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "L11",
                results: 4,
                selectedDataPoints: [1, 2, 3],
                partialDataPoints: [0],
            },
            <SearchTest>{
                searchString: "L123",
                results: 3,
                selectedDataPoints: [2],
                partialDataPoints: [0, 1],
            },
        ];
    }

    public getOwnIds(): string[][] {
        return [
            ["L1"],
            ["L1", ""],
            ["L1", "", ""],
            ["L1", "L11"],
            ["L1", "L11", "L111"],
            ["L1", "L11", "L112"],
            ["L1", "L12"],
            ["L1", "L12", ""],
            ["L1", "L12", "L123"],
        ]; // tslint:disable-line: prettier
    }

    // tslint:disable-next-line: max-func-body-length
    public getDataView(): DataView {
        return <DataView>JSON.parse(`
        {
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
                        "displayName": "Level 1",
                        "queryName": "DataSet1.Level 1",
                        "expr": {
                            "_kind": 2,
                            "source": {
                                "_kind": 0,
                                "entity": "DataSet1",
                                "variable": "d",
                                "kind": 0
                            },
                            "ref": "Level 1",
                            "kind": 2
                        },
                        "index": 0,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "DataSet1",
                                    "kind": 0
                                },
                                "ref": "Level 1",
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
                        "displayName": "Level 2",
                        "queryName": "DataSet1.Level 2",
                        "expr": {
                            "_kind": 2,
                            "source": {
                                "_kind": 0,
                                "entity": "DataSet1",
                                "variable": "d",
                                "kind": 0
                            },
                            "ref": "Level 2",
                            "kind": 2
                        },
                        "index": 1,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "DataSet1",
                                    "kind": 0
                                },
                                "ref": "Level 2",
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
                        "displayName": "Level 3",
                        "queryName": "DataSet1.Level 3",
                        "expr": {
                            "_kind": 2,
                            "source": {
                                "_kind": 0,
                                "entity": "DataSet1",
                                "variable": "d",
                                "kind": 0
                            },
                            "ref": "Level 3",
                            "kind": 2
                        },
                        "index": 2,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "DataSet1",
                                    "kind": 0
                                },
                                "ref": "Level 3",
                                "kind": 2
                            }
                        ]
                    }
                ]
            },
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
                                    "displayName": "Level 1",
                                    "queryName": "DataSet1.Level 1",
                                    "expr": {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet1",
                                            "variable": "d",
                                            "kind": 0
                                        },
                                        "ref": "Level 1",
                                        "kind": 2
                                    },
                                    "index": 0,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet1",
                                                "kind": 0
                                            },
                                            "ref": "Level 1",
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
                                    "displayName": "Level 2",
                                    "queryName": "DataSet1.Level 2",
                                    "expr": {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet1",
                                            "variable": "d",
                                            "kind": 0
                                        },
                                        "ref": "Level 2",
                                        "kind": 2
                                    },
                                    "index": 1,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet1",
                                                "kind": 0
                                            },
                                            "ref": "Level 2",
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
                                    "displayName": "Level 3",
                                    "queryName": "DataSet1.Level 3",
                                    "expr": {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet1",
                                            "variable": "d",
                                            "kind": 0
                                        },
                                        "ref": "Level 3",
                                        "kind": 2
                                    },
                                    "index": 2,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet1",
                                                "kind": 0
                                            },
                                            "ref": "Level 3",
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
                                    "entity": "DataSet1",
                                    "kind": 0
                                },
                                "ref": "Level 1",
                                "kind": 2
                            }
                        ],
                        "children": [
                            {
                                "level": 0,
                                "levelValues": [
                                    {
                                        "value": "L1",
                                        "levelSourceIndex": 0
                                    }
                                ],
                                "value": "L1",
                                "identity": {
                                    "kind": 1,
                                    "_expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet1",
                                                "kind": 0
                                            },
                                            "ref": "Level 1",
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
                                            "value": "L1",
                                            "valueEncoded": "'L1'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "_key": {
                                        "factoryMethod": {},
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L1\\"}}}}"
                                    },
                                    "opaqueIdentity": {
                                        "identityIndex": 0
                                    },
                                    "expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet1",
                                                "kind": 0
                                            },
                                            "ref": "Level 1",
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
                                            "value": "L1",
                                            "typeEncodedValue": "'L1'",
                                            "valueEncoded": "'L1'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L1\\"}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet1",
                                            "kind": 0
                                        },
                                        "ref": "Level 2",
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
                                                        "entity": "DataSet1",
                                                        "kind": 0
                                                    },
                                                    "ref": "Level 2",
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
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                            },
                                            "opaqueIdentity": {
                                                "identityIndex": 1
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet1",
                                                        "kind": 0
                                                    },
                                                    "ref": "Level 2",
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
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                        },
                                        "childIdentityFields": [
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "DataSet1",
                                                    "kind": 0
                                                },
                                                "ref": "Level 3",
                                                "kind": 2
                                            }
                                        ],
                                        "children": [
                                            {
                                                "level": 2,
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
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 2
                                                    },
                                                    "expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "L11",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "L11",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet1",
                                                        "kind": 0
                                                    },
                                                    "ref": "Level 2",
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
                                                    "value": "L11",
                                                    "valueEncoded": "'L11'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L11\\"}}}}"
                                            },
                                            "opaqueIdentity": {
                                                "identityIndex": 3
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet1",
                                                        "kind": 0
                                                    },
                                                    "ref": "Level 2",
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
                                                    "value": "L11",
                                                    "typeEncodedValue": "'L11'",
                                                    "valueEncoded": "'L11'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L11\\"}}}}"
                                        },
                                        "childIdentityFields": [
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "DataSet1",
                                                    "kind": 0
                                                },
                                                "ref": "Level 3",
                                                "kind": 2
                                            }
                                        ],
                                        "children": [
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "L111",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "L111",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                            "value": "L111",
                                                            "valueEncoded": "'L111'",
                                                            "kind": 17
                                                        },
                                                        "kind": 13
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L111\\"}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 4
                                                    },
                                                    "expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                            "value": "L111",
                                                            "typeEncodedValue": "'L111'",
                                                            "valueEncoded": "'L111'",
                                                            "kind": 17
                                                        },
                                                        "kind": 13
                                                    },
                                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L111\\"}}}}"
                                                }
                                            },
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "L112",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "L112",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                            "value": "L112",
                                                            "valueEncoded": "'L112'",
                                                            "kind": 17
                                                        },
                                                        "kind": 13
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L112\\"}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 5
                                                    },
                                                    "expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                            "value": "L112",
                                                            "typeEncodedValue": "'L112'",
                                                            "valueEncoded": "'L112'",
                                                            "kind": 17
                                                        },
                                                        "kind": 13
                                                    },
                                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L112\\"}}}}"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "L12",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "L12",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet1",
                                                        "kind": 0
                                                    },
                                                    "ref": "Level 2",
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
                                                    "value": "L12",
                                                    "valueEncoded": "'L12'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L12\\"}}}}"
                                            },
                                            "opaqueIdentity": {
                                                "identityIndex": 6
                                            },
                                            "expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet1",
                                                        "kind": 0
                                                    },
                                                    "ref": "Level 2",
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
                                                    "value": "L12",
                                                    "typeEncodedValue": "'L12'",
                                                    "valueEncoded": "'L12'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L12\\"}}}}"
                                        },
                                        "childIdentityFields": [
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "DataSet1",
                                                    "kind": 0
                                                },
                                                "ref": "Level 3",
                                                "kind": 2
                                            }
                                        ],
                                        "children": [
                                            {
                                                "level": 2,
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
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 7
                                                    },
                                                    "expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                                }
                                            },
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "L123",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "L123",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                            "value": "L123",
                                                            "valueEncoded": "'L123'",
                                                            "kind": 17
                                                        },
                                                        "kind": 13
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L123\\"}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 8
                                                    },
                                                    "expr": {
                                                        "_kind": 13,
                                                        "comparison": 0,
                                                        "left": {
                                                            "_kind": 2,
                                                            "source": {
                                                                "_kind": 0,
                                                                "entity": "DataSet1",
                                                                "kind": 0
                                                            },
                                                            "ref": "Level 3",
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
                                                            "value": "L123",
                                                            "typeEncodedValue": "'L123'",
                                                            "valueEncoded": "'L123'",
                                                            "kind": 17
                                                        },
                                                        "kind": 13
                                                    },
                                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet1\\"},\\"r\\":\\"Level 3\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L123\\"}}}}"
                                                }
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
            "categorical": {},
            "table": {},
            "tree": {},
            "single": {}
        }
        `);
    }
}
