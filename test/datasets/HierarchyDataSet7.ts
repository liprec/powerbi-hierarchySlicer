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

export class HierarchyDataSet7 extends HierarchyData {
    public get DataSetName(): string {
        return "HierarchyDataSet7";
    }
    public tableName: string = "Geography";
    public hierarchyName: string = "Geography";
    public columnNames: string[] = ["Country", "State-Province", "City"];
    public columnLabels: string[] = ["Country", "State-Province", "City"];
    public columnRoles: string[] = ["Fields", "Fields", "Fields"];
    public tableValues = [
        ["Germany", "Bayern", "Augsburg"],
        ["Germany", "Bayern", "Erlangen"],
        ["Germany", "Hamburg", "Ascheim"],
        ["Germany", "Hamburg", "Augsburg"],
    ]; // tslint:disable-line: prettier
    public columnTypes = [
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
        ValueType.fromDescriptor({ text: true }),
    ];
    public columnFormat = [undefined, undefined, undefined];

    public getExpandedTests(): ExpandTest[] {
        return [
            {
                expanded: ["|~Germany~|"],
                count: 3,
                hideMembersOffset: [0, 0, 0],
            },
            {
                expanded: ["|~Germany~|", "|~Germany~|~Bayern~|", "|~Germany~|~Hamburg~|"],
                count: 7,
                hideMembersOffset: [0, 0, 0],
            },
        ];
    }

    public getSelectedTests(): SelectTest[] {
        return [
            {
                description: `'${this.getValue(0, 0)}'`,
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
                whereCondition: JSON.parse(`[{"condition":{"_kind":10,"args":[{"_kind":2,"source":{"_kind":0,"entity":"Geography","variable":"g","kind":0},"ref":"Country","kind":2}],"values":[[{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"Germany","typeEncodedValue":"'Germany'","valueEncoded":"'Germany'","kind":17}]],"kind":10}}]`), // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [0, 1, 2, 3, 4, 5, 6],
                partialDataPoints: [],
            },
            {
                description: `('${this.getValue(3, 0)}', '${this.getValue(3, 1)}', '${this.getValue(3, 2)}')`, // tslint:disable-line: prettier
                clickedDataPoints: [6],
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
                ],
                values: [
                    [
                        { value: this.getRawValue(3, 0) },
                        { value: this.getRawValue(3, 1) },
                        { value: this.getRawValue(3, 2) },
                    ], // tslint:disable-line: prettier
                ],
                whereCondition: JSON.parse(`[{"condition":{"_kind":10,"args":[{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"Geography","variable":"g","kind":0},"hierarchy":"Geography","kind":6},"level":"Country","kind":7},{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"Geography","variable":"g","kind":0},"hierarchy":"Geography","kind":6},"level":"State-Province","kind":7},{"_kind":7,"arg":{"_kind":6,"arg":{"_kind":0,"entity":"Geography","variable":"g","kind":0},"hierarchy":"Geography","kind":6},"level":"City","kind":7}],"values":[[{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"Germany","typeEncodedValue":"'Germany'","valueEncoded":"'Germany'","kind":17},{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"Hamburg","typeEncodedValue":"'Hamburg'","valueEncoded":"'Hamburg'","kind":17},{"_kind":17,"type":{"underlyingType":1,"category":null,"primitiveType":1,"extendedType":1,"categoryString":null,"text":true,"numeric":false,"integer":false,"bool":false,"dateTime":false,"duration":false,"binary":false,"none":false},"value":"Augsburg","typeEncodedValue":"'Augsburg'","valueEncoded":"'Augsburg'","kind":17}]],"kind":10}}]`), // tslint:disable-line: prettier
                singleSelect: false,
                selectedDataPoints: [6],
                partialDataPoints: [0, 4],
            },
        ];
    }

    public getSearchTests(): SearchTest[] {
        return [];
    }

    public getOwnIds(): string[][] {
        return [
            ["Germany"],
            ["Germany", "Bayern"],
            ["Germany", "Bayern", "Augsburg"],
            ["Germany", "Bayern", "Erlangen"],
            ["Germany", "Hamburg"],
            ["Germany", "Hamburg", "Ascheim"],
            ["Germany", "Hamburg", "Augsburg"],
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
                                        "underlyingType": 6751233,
                                        "category": "Country",
                                        "geographyType": {
                                            "underlyingType": 6751233,
                                            "address": false,
                                            "city": false,
                                            "continent": false,
                                            "country": true,
                                            "county": false,
                                            "region": false,
                                            "postalCode": false,
                                            "stateOrProvince": false,
                                            "place": false,
                                            "latitude": false,
                                            "longitude": false
                                        },
                                        "primitiveType": 1,
                                        "extendedType": 6751233,
                                        "categoryString": "Country",
                                        "text": true,
                                        "numeric": false,
                                        "integer": false,
                                        "bool": false,
                                        "dateTime": false,
                                        "duration": false,
                                        "binary": false,
                                        "none": false,
                                        "geography": {
                                            "underlyingType": 6751233,
                                            "address": false,
                                            "city": false,
                                            "continent": false,
                                            "country": true,
                                            "county": false,
                                            "region": false,
                                            "postalCode": false,
                                            "stateOrProvince": false,
                                            "place": false,
                                            "latitude": false,
                                            "longitude": false
                                        }
                                    },
                                    "displayName": "Country",
                                    "queryName": "Geography.Geography.Country",
                                    "expr": {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "variable": "g",
                                                "kind": 0
                                            },
                                            "hierarchy": "Geography",
                                            "kind": 6
                                        },
                                        "level": "Country",
                                        "kind": 7
                                    },
                                    "index": 0,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "kind": 0
                                            },
                                            "ref": "Country.Key0",
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
                                        "underlyingType": 7013377,
                                        "category": "StateOrProvince",
                                        "geographyType": {
                                            "underlyingType": 7013377,
                                            "address": false,
                                            "city": false,
                                            "continent": false,
                                            "country": false,
                                            "county": false,
                                            "region": false,
                                            "postalCode": false,
                                            "stateOrProvince": true,
                                            "place": false,
                                            "latitude": false,
                                            "longitude": false
                                        },
                                        "primitiveType": 1,
                                        "extendedType": 7013377,
                                        "categoryString": "StateOrProvince",
                                        "text": true,
                                        "numeric": false,
                                        "integer": false,
                                        "bool": false,
                                        "dateTime": false,
                                        "duration": false,
                                        "binary": false,
                                        "none": false,
                                        "geography": {
                                            "underlyingType": 7013377,
                                            "address": false,
                                            "city": false,
                                            "continent": false,
                                            "country": false,
                                            "county": false,
                                            "region": false,
                                            "postalCode": false,
                                            "stateOrProvince": true,
                                            "place": false,
                                            "latitude": false,
                                            "longitude": false
                                        }
                                    },
                                    "displayName": "State-Province",
                                    "queryName": "Geography.Geography.State-Province",
                                    "expr": {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "variable": "g",
                                                "kind": 0
                                            },
                                            "hierarchy": "Geography",
                                            "kind": 6
                                        },
                                        "level": "State-Province",
                                        "kind": 7
                                    },
                                    "index": 1,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "kind": 0
                                            },
                                            "ref": "State-Province.Key0",
                                            "kind": 2
                                        },
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "kind": 0
                                            },
                                            "ref": "State-Province.Key1",
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
                                        "underlyingType": 6620161,
                                        "category": "City",
                                        "geographyType": {
                                            "underlyingType": 6620161,
                                            "address": false,
                                            "city": true,
                                            "continent": false,
                                            "country": false,
                                            "county": false,
                                            "region": false,
                                            "postalCode": false,
                                            "stateOrProvince": false,
                                            "place": false,
                                            "latitude": false,
                                            "longitude": false
                                        },
                                        "primitiveType": 1,
                                        "extendedType": 6620161,
                                        "categoryString": "City",
                                        "text": true,
                                        "numeric": false,
                                        "integer": false,
                                        "bool": false,
                                        "dateTime": false,
                                        "duration": false,
                                        "binary": false,
                                        "none": false,
                                        "geography": {
                                            "underlyingType": 6620161,
                                            "address": false,
                                            "city": true,
                                            "continent": false,
                                            "country": false,
                                            "county": false,
                                            "region": false,
                                            "postalCode": false,
                                            "stateOrProvince": false,
                                            "place": false,
                                            "latitude": false,
                                            "longitude": false
                                        }
                                    },
                                    "displayName": "City",
                                    "queryName": "Geography.Geography.City",
                                    "expr": {
                                        "_kind": 7,
                                        "arg": {
                                            "_kind": 6,
                                            "arg": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "variable": "g",
                                                "kind": 0
                                            },
                                            "hierarchy": "Geography",
                                            "kind": 6
                                        },
                                        "level": "City",
                                        "kind": 7
                                    },
                                    "index": 2,
                                    "identityExprs": [
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "kind": 0
                                            },
                                            "ref": "City.Key0",
                                            "kind": 2
                                        },
                                        {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "kind": 0
                                            },
                                            "ref": "City.Key1",
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
                                    "entity": "Geography",
                                    "kind": 0
                                },
                                "ref": "Country.Key0",
                                "kind": 2
                            }
                        ],
                        "children": [
                            {
                                "level": 0,
                                "levelValues": [
                                    {
                                        "value": "Germany",
                                        "levelSourceIndex": 0
                                    }
                                ],
                                "value": "Germany",
                                "identity": {
                                    "kind": 1,
                                    "_expr": {
                                        "_kind": 13,
                                        "comparison": 0,
                                        "left": {
                                            "_kind": 2,
                                            "source": {
                                                "_kind": 0,
                                                "entity": "Geography",
                                                "kind": 0
                                            },
                                            "ref": "Country.Key0",
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
                                            "value": "Germany",
                                            "valueEncoded": "'Germany'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "_key": {
                                        "factoryMethod": {},
                                        "value": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"Country.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Germany\\"}}}}"
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
                                                "entity": "Geography",
                                                "kind": 0
                                            },
                                            "ref": "Country.Key0",
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
                                            "value": "Germany",
                                            "typeEncodedValue": "'Germany'",
                                            "valueEncoded": "'Germany'",
                                            "kind": 17
                                        },
                                        "kind": 13
                                    },
                                    "key": "{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"Country.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Germany\\"}}}}"
                                },
                                "childIdentityFields": [
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "Geography",
                                            "kind": 0
                                        },
                                        "ref": "State-Province.Key0",
                                        "kind": 2
                                    },
                                    {
                                        "_kind": 2,
                                        "source": {
                                            "_kind": 0,
                                            "entity": "Geography",
                                            "kind": 0
                                        },
                                        "ref": "State-Province.Key1",
                                        "kind": 2
                                    }
                                ],
                                "children": [
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "Bayern",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "Bayern",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 8,
                                                "left": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key0",
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
                                                        "value": "BY",
                                                        "valueEncoded": "'BY'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "right": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key1",
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
                                                        "value": "DE",
                                                        "valueEncoded": "'DE'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "kind": 8
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"BY\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"DE\\"}}}}}}"
                                            },
                                            "opaqueIdentity": {
                                                "identityIndex": 1
                                            },
                                            "expr": {
                                                "_kind": 8,
                                                "left": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key0",
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
                                                        "value": "BY",
                                                        "typeEncodedValue": "'BY'",
                                                        "valueEncoded": "'BY'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "right": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key1",
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
                                                        "value": "DE",
                                                        "typeEncodedValue": "'DE'",
                                                        "valueEncoded": "'DE'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "kind": 8
                                            },
                                            "key": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"BY\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"DE\\"}}}}}}"
                                        },
                                        "childIdentityFields": [
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "Geography",
                                                    "kind": 0
                                                },
                                                "ref": "City.Key0",
                                                "kind": 2
                                            },
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "Geography",
                                                    "kind": 0
                                                },
                                                "ref": "City.Key1",
                                                "kind": 2
                                            }
                                        ],
                                        "children": [
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "Augsburg",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "Augsburg",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Augsburg",
                                                                "typeEncodedValue": "'Augsburg'",
                                                                "valueEncoded": "'Augsburg'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "BY",
                                                                "valueEncoded": "'BY'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Augsburg\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"BY\\"}}}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 2
                                                    },
                                                    "expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Augsburg",
                                                                "typeEncodedValue": "'Augsburg'",
                                                                "valueEncoded": "'Augsburg'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "BY",
                                                                "typeEncodedValue": "'BY'",
                                                                "valueEncoded": "'BY'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "key": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Augsburg\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"BY\\"}}}}}}"
                                                }
                                            },
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "Erlangen",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "Erlangen",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Erlangen",
                                                                "typeEncodedValue": "'Erlangen'",
                                                                "valueEncoded": "'Erlangen'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "BY",
                                                                "typeEncodedValue": "'BY'",
                                                                "valueEncoded": "'BY'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Erlangen\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"BY\\"}}}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 3
                                                    },
                                                    "expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Erlangen",
                                                                "typeEncodedValue": "'Erlangen'",
                                                                "valueEncoded": "'Erlangen'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "BY",
                                                                "typeEncodedValue": "'BY'",
                                                                "valueEncoded": "'BY'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "key": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Erlangen\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"BY\\"}}}}}}"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "level": 1,
                                        "levelValues": [
                                            {
                                                "value": "Hamburg",
                                                "levelSourceIndex": 0
                                            }
                                        ],
                                        "value": "Hamburg",
                                        "identity": {
                                            "kind": 1,
                                            "_expr": {
                                                "_kind": 8,
                                                "left": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key0",
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
                                                        "value": "HH",
                                                        "valueEncoded": "'HH'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "right": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key1",
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
                                                        "value": "DE",
                                                        "typeEncodedValue": "'DE'",
                                                        "valueEncoded": "'DE'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "kind": 8
                                            },
                                            "_key": {
                                                "factoryMethod": {},
                                                "value": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"HH\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"DE\\"}}}}}}"
                                            },
                                            "opaqueIdentity": {
                                                "identityIndex": 4
                                            },
                                            "expr": {
                                                "_kind": 8,
                                                "left": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key0",
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
                                                        "value": "HH",
                                                        "typeEncodedValue": "'HH'",
                                                        "valueEncoded": "'HH'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "right": {
                                                    "_kind": 13,
                                                    "comparison": 0,
                                                    "left": {
                                                        "_kind": 2,
                                                        "source": {
                                                            "_kind": 0,
                                                            "entity": "Geography",
                                                            "kind": 0
                                                        },
                                                        "ref": "State-Province.Key1",
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
                                                        "value": "DE",
                                                        "typeEncodedValue": "'DE'",
                                                        "valueEncoded": "'DE'",
                                                        "kind": 17
                                                    },
                                                    "kind": 13
                                                },
                                                "kind": 8
                                            },
                                            "key": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"HH\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"State-Province.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"DE\\"}}}}}}"
                                        },
                                        "childIdentityFields": [
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "Geography",
                                                    "kind": 0
                                                },
                                                "ref": "City.Key0",
                                                "kind": 2
                                            },
                                            {
                                                "_kind": 2,
                                                "source": {
                                                    "_kind": 0,
                                                    "entity": "Geography",
                                                    "kind": 0
                                                },
                                                "ref": "City.Key1",
                                                "kind": 2
                                            }
                                        ],
                                        "children": [
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "Ascheim",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "Ascheim",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Ascheim",
                                                                "typeEncodedValue": "'Ascheim'",
                                                                "valueEncoded": "'Ascheim'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "HH",
                                                                "valueEncoded": "'HH'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Ascheim\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"HH\\"}}}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 5
                                                    },
                                                    "expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Ascheim",
                                                                "typeEncodedValue": "'Ascheim'",
                                                                "valueEncoded": "'Ascheim'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "HH",
                                                                "typeEncodedValue": "'HH'",
                                                                "valueEncoded": "'HH'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "key": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Ascheim\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"HH\\"}}}}}}"
                                                }
                                            },
                                            {
                                                "level": 2,
                                                "levelValues": [
                                                    {
                                                        "value": "Augsburg",
                                                        "levelSourceIndex": 0
                                                    }
                                                ],
                                                "value": "Augsburg",
                                                "identity": {
                                                    "kind": 1,
                                                    "_expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Augsburg",
                                                                "typeEncodedValue": "'Augsburg'",
                                                                "valueEncoded": "'Augsburg'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "HH",
                                                                "typeEncodedValue": "'HH'",
                                                                "valueEncoded": "'HH'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "_key": {
                                                        "factoryMethod": {},
                                                        "value": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Augsburg\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"HH\\"}}}}}}"
                                                    },
                                                    "opaqueIdentity": {
                                                        "identityIndex": 6
                                                    },
                                                    "expr": {
                                                        "_kind": 8,
                                                        "left": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key0",
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
                                                                "value": "Augsburg",
                                                                "typeEncodedValue": "'Augsburg'",
                                                                "valueEncoded": "'Augsburg'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "right": {
                                                            "_kind": 13,
                                                            "comparison": 0,
                                                            "left": {
                                                                "_kind": 2,
                                                                "source": {
                                                                    "_kind": 0,
                                                                    "entity": "Geography",
                                                                    "kind": 0
                                                                },
                                                                "ref": "City.Key1",
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
                                                                "value": "HH",
                                                                "typeEncodedValue": "'HH'",
                                                                "valueEncoded": "'HH'",
                                                                "kind": 17
                                                            },
                                                            "kind": 13
                                                        },
                                                        "kind": 8
                                                    },
                                                    "key": "{\\"and\\":{\\"l\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key0\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"Augsburg\\"}}}},\\"r\\":{\\"comp\\":{\\"k\\":0,\\"l\\":{\\"col\\":{\\"s\\":{\\"e\\":\\"Geography\\"},\\"r\\":\\"City.Key1\\"}},\\"r\\":{\\"const\\":{\\"t\\":1,\\"v\\":\\"HH\\"}}}}}}"
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
            "metadata": {
                "columns": [
                    {
                        "roles": {
                            "Fields": true
                        },
                        "type": {
                            "underlyingType": 6751233,
                            "category": "Country",
                            "geographyType": {
                                "underlyingType": 6751233,
                                "address": false,
                                "city": false,
                                "continent": false,
                                "country": true,
                                "county": false,
                                "region": false,
                                "postalCode": false,
                                "stateOrProvince": false,
                                "place": false,
                                "latitude": false,
                                "longitude": false
                            },
                            "primitiveType": 1,
                            "extendedType": 6751233,
                            "categoryString": "Country",
                            "text": true,
                            "numeric": false,
                            "integer": false,
                            "bool": false,
                            "dateTime": false,
                            "duration": false,
                            "binary": false,
                            "none": false,
                            "geography": {
                                "underlyingType": 6751233,
                                "address": false,
                                "city": false,
                                "continent": false,
                                "country": true,
                                "county": false,
                                "region": false,
                                "postalCode": false,
                                "stateOrProvince": false,
                                "place": false,
                                "latitude": false,
                                "longitude": false
                            }
                        },
                        "displayName": "Country",
                        "queryName": "Geography.Geography.Country",
                        "expr": {
                            "_kind": 7,
                            "arg": {
                                "_kind": 6,
                                "arg": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "variable": "g",
                                    "kind": 0
                                },
                                "hierarchy": "Geography",
                                "kind": 6
                            },
                            "level": "Country",
                            "kind": 7
                        },
                        "index": 0,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "kind": 0
                                },
                                "ref": "Country.Key0",
                                "kind": 2
                            }
                        ]
                    },
                    {
                        "roles": {
                            "Fields": true
                        },
                        "type": {
                            "underlyingType": 7013377,
                            "category": "StateOrProvince",
                            "geographyType": {
                                "underlyingType": 7013377,
                                "address": false,
                                "city": false,
                                "continent": false,
                                "country": false,
                                "county": false,
                                "region": false,
                                "postalCode": false,
                                "stateOrProvince": true,
                                "place": false,
                                "latitude": false,
                                "longitude": false
                            },
                            "primitiveType": 1,
                            "extendedType": 7013377,
                            "categoryString": "StateOrProvince",
                            "text": true,
                            "numeric": false,
                            "integer": false,
                            "bool": false,
                            "dateTime": false,
                            "duration": false,
                            "binary": false,
                            "none": false,
                            "geography": {
                                "underlyingType": 7013377,
                                "address": false,
                                "city": false,
                                "continent": false,
                                "country": false,
                                "county": false,
                                "region": false,
                                "postalCode": false,
                                "stateOrProvince": true,
                                "place": false,
                                "latitude": false,
                                "longitude": false
                            }
                        },
                        "displayName": "State-Province",
                        "queryName": "Geography.Geography.State-Province",
                        "expr": {
                            "_kind": 7,
                            "arg": {
                                "_kind": 6,
                                "arg": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "variable": "g",
                                    "kind": 0
                                },
                                "hierarchy": "Geography",
                                "kind": 6
                            },
                            "level": "State-Province",
                            "kind": 7
                        },
                        "index": 1,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "kind": 0
                                },
                                "ref": "State-Province.Key0",
                                "kind": 2
                            },
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "kind": 0
                                },
                                "ref": "State-Province.Key1",
                                "kind": 2
                            }
                        ]
                    },
                    {
                        "roles": {
                            "Fields": true
                        },
                        "type": {
                            "underlyingType": 6620161,
                            "category": "City",
                            "geographyType": {
                                "underlyingType": 6620161,
                                "address": false,
                                "city": true,
                                "continent": false,
                                "country": false,
                                "county": false,
                                "region": false,
                                "postalCode": false,
                                "stateOrProvince": false,
                                "place": false,
                                "latitude": false,
                                "longitude": false
                            },
                            "primitiveType": 1,
                            "extendedType": 6620161,
                            "categoryString": "City",
                            "text": true,
                            "numeric": false,
                            "integer": false,
                            "bool": false,
                            "dateTime": false,
                            "duration": false,
                            "binary": false,
                            "none": false,
                            "geography": {
                                "underlyingType": 6620161,
                                "address": false,
                                "city": true,
                                "continent": false,
                                "country": false,
                                "county": false,
                                "region": false,
                                "postalCode": false,
                                "stateOrProvince": false,
                                "place": false,
                                "latitude": false,
                                "longitude": false
                            }
                        },
                        "displayName": "City",
                        "queryName": "Geography.Geography.City",
                        "expr": {
                            "_kind": 7,
                            "arg": {
                                "_kind": 6,
                                "arg": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "variable": "g",
                                    "kind": 0
                                },
                                "hierarchy": "Geography",
                                "kind": 6
                            },
                            "level": "City",
                            "kind": 7
                        },
                        "index": 2,
                        "identityExprs": [
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "kind": 0
                                },
                                "ref": "City.Key0",
                                "kind": 2
                            },
                            {
                                "_kind": 2,
                                "source": {
                                    "_kind": 0,
                                    "entity": "Geography",
                                    "kind": 0
                                },
                                "ref": "City.Key1",
                                "kind": 2
                            }
                        ]
                    }
                ]
            }
        }`);
    }
}
