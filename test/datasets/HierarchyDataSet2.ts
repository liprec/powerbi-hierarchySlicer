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

// Hierarchy based of two columns with renamed fields

// powerbi
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

// powerbi.models
import { PrimitiveValueType } from "powerbi-models";

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

import { HierarchyData, ExpandTest, SelectTest, SearchTest } from "../visualData";

export class HierarchyDataSet2 extends HierarchyData {
    public get DataSetName(): string {
        return "HierarchyDataSet2";
    }
    public tableName: string = "DataSet2";
    public columnNames: string[] = ["Level 1", "Level 2"];
    public columnLabels: string[] = ["Level1", "Level2"];
    public columnRoles: string[] = ["Fields", "Fields"];
    public tableValues = [
        ["L_2", "L12"],
        ["L1", null],
        ["L1", "L11"],
        ["L1", "L12"],
        ["L1", "L13"],
    ]; // tslint:disable-line: prettier
    public columnTypes = [ValueType.fromDescriptor({ text: true }), ValueType.fromDescriptor({ text: true })];
    public columnFormat = [undefined, undefined];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~L_2~|"],
                count: 3,
                hideMembersOffset: [0, 0, 0],
            },
            {
                expanded: ["|~L_2~|", "|~L1~|"],
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
                selectedDataPoints: [0, 1],
                partialDataPoints: [],
            },
            {
                description: `'${this.getValue(0, 0)}' and '${this.getValue(1, 0)}'`,
                clickedDataPoints: [0, 2],
                target: [
                    {
                        column: this.columnNames[0],
                        table: this.tableName,
                    },
                ],
                values: [
                    [{ value: this.getRawValue(0, 0) }],
                    [{ value: this.getRawValue(1, 0) }],
                ], // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [0, 1, 2, 3, 4, 5, 6],
                partialDataPoints: [],
            },
            {
                description: `'${this.getValue(0, 1)}' and '${this.getValue(3, 1)}' with ragged hierarchy`,
                clickedDataPoints: [1, 4],
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
                    [
                        { value: this.getRawValue(3, 0) },
                        { value: this.getRawValue(3, 1) },
                    ], // tslint:disable-line: prettier
                ],
                singleSelect: false,
                selectedDataPoints: [0, 1, 4],
                partialDataPoints: [2],
                hideMember: 1,
                hideMemberOffset: 1,
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [
            <SearchTest>{
                searchString: "L_2",
                results: 2,
                selectedDataPoints: [0],
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

    public getOwnIds(): string[][] {
        return [
            ["L_2"],
            ["L_2", "L12"],
            ["L1"],
            ["L1", ""],
            ["L1", "L11"],
            ["L1", "L12"],
            ["L1", "L13"],
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
                                    "displayName": "Level1",
                                    "queryName": "DataSet2.Level 1",
                                    "expr": {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet2",
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
                                                "entity": "DataSet2",
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
                                    "displayName": "Level2",
                                    "queryName": "DataSet2.Level 2",
                                    "expr": {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet2",
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
                                                "entity": "DataSet2",
                                                "kind": 0
                                            },
                                            "ref": "Level 2",
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
                                    "entity": "DataSet2",
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
                                        "value": "L_2",
                                        "levelSourceIndex": 0
                                    }
                                ],
                                "value": "L_2",
                                "identity": {
                                    "kind": 1,
                                    "_expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "DataSet2",
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
                                            "value": "L_2",
                                            "valueEncoded": "'L_2'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "_key": {
                                        "factoryMethod": {},
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L_2\\"}}}}"
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
                                                "entity": "DataSet2",
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
                                            "value": "L_2",
                                            "typeEncodedValue": "'L_2'",
                                            "valueEncoded": "'L_2'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L_2\\"}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet2",
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
                                                        "entity": "DataSet2",
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
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L12\\"}}}}"
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
                                                        "entity": "DataSet2",
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
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L12\\"}}}}"
                                        }
                                    }
                                ]
                            },
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
                                                "entity": "DataSet2",
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
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L1\\"}}}}"
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
                                                "entity": "DataSet2",
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
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L1\\"}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "DataSet2",
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
                                                        "entity": "DataSet2",
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
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
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
                                                        "entity": "DataSet2",
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
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"\\"}}}}"
                                        }
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
                                                        "entity": "DataSet2",
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
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L11\\"}}}}"
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
                                                        "entity": "DataSet2",
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
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L11\\"}}}}"
                                        }
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
                                                        "entity": "DataSet2",
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
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L12\\"}}}}"
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
                                                        "entity": "DataSet2",
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
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L12\\"}}}}"
                                        }
                                    },
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "L13",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "L13",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 13,
                                                "comparison": 0,
                                                "left": {
                                                    "_kind": 2,
                                                    "source": {
                                                        "_kind": 0,
                                                        "entity": "DataSet2",
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
                                                    "value": "L13",
                                                    "valueEncoded": "'L13'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L13\\"}}}}"
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
                                                        "entity": "DataSet2",
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
                                                    "value": "L13",
                                                    "typeEncodedValue": "'L13'",
                                                    "valueEncoded": "'L13'",
                                                    "kind": 17
                                                },
                                                "kind": 13
                                            },
                                            "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"DataSet2\\"},\\"r\\":\\"Level 2\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"L13\\"}}}}"
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
                        "displayName": "Level1",
                        "queryName": "DataSet2.Level 1",
                        "expr": {
                            "_kind": 2,
                            "source": {
                                "_kind": 0,
                                "entity": "DataSet2",
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
                                    "entity": "DataSet2",
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
                        "displayName": "Level2",
                        "queryName": "DataSet2.Level 2",
                        "expr": {
                            "_kind": 2,
                            "source": {
                                "_kind": 0,
                                "entity": "DataSet2",
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
                                    "entity": "DataSet2",
                                    "kind": 0
                                },
                                "ref": "Level 2",
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
