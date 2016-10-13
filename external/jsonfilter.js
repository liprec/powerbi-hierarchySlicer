// -----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

/// <disable>JS2025.InsertSpaceBeforeCommentText,JS2027.PunctuateCommentsCorrectly,JS2076.IdentifierIsMiscased,JS3085.VariableDeclaredMultipleTimes, JS3116.PreviousDeclarationWasHere, JS2074.IdentifierNameIsMisspelled, JS2030.FollowKeywordsWithSpace, JS2023.UseDoubleQuotesForStringLiterals, JS2028.UseCPlusPlusStyleComments, JS2026.CapitalizeComments, JS2008.DoNotUseCookies, JS2005.UseShortFormInitializations, JS2064.SpecifyNewWhenCallingConstructor, JS2024.DoNotQuoteObjectLiteralPropertyNames, JS2043.RemoveDebugCode, JS3045.MissingInputFile</disable>
/// <dictionary target='comment'>args,aspx,autocompletion,enqueue,Firefox,Hardcoded,interdependant,Kinda,Moderncop,Nav,param,params,powerview, secweb, serializer, sharepoint, silverlight, src, stylesheet, theming, untokenized, Xmla </dictionary>

// ModernCop Rules and Settings - Disabling some non critical warnings that we currently have per:
// http://secweb01/MSEC/Tools/Lists/MSEC%20Tool%20Errors%20and%20Warnings/AllItems.aspx?FilterField1=Tool&FilterValue1=Moderncop

/// <disable>JS2085.EnableStrictMode</disable>
// Justification: The violation is that strict mode is enabled for global scope, which could lead
// to unexpected behavior if the target JS file of this project is concatenated with other JS files.
// The target JS file of this project is not concatenated with other files.

// Temporarily disabled for all projects (see: https://pbix.visualstudio.com/DefaultCollection/PaaS/_workitems/edit/12362)
//"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
var powerbi;
(function (powerbi) {
    var explore;
    (function (explore) {
        var jsonFilter;
        (function (jsonFilter) {
            var constants;
            (function (constants) {
                constants.NotIn = "NotIn";
                constants.SelectAll = "All";
                constants.operatorDictionary = {
                    "None": 0 /* None */,
                    "LessThan": 1 /* LessThan */,
                    "LessThanOrEqual": 2 /* LessThanOrEqual */,
                    "GreaterThan": 3 /* GreaterThan */,
                    "GreaterThanOrEqual": 4 /* GreaterThanOrEqual */,
                    "Contains": 5 /* Contains */,
                    "DoesNotContain": 6 /* DoesNotContain */,
                    "StartsWith": 7 /* StartWith */,
                    "DoesNotStartWith": 8 /* DoesNotStartWith */,
                    "Is": 9 /* Is */,
                    "IsNot": 10 /* IsNot */,
                    "IsBlank": 11 /* IsBlank */,
                    "IsNotBlank": 12 /* IsNotBlank */,
                };
                constants.logicalOperatorDictionary = {
                    "Or": 1 /* Or */,
                    "And": 0 /* And */
                };
                var ErrorCodes;
                (function (ErrorCodes) {
                    ErrorCodes.InvalidDataType = "InvalidDataType";
                    ErrorCodes.FieldNotFound = "FieldNotFound";
                    ErrorCodes.FilterConditionNotFound = "FilterConditionNotFound";
                    ErrorCodes.FilterValidationErrors = "FilterValidationErrors";
                    ErrorCodes.LogicalConditionNotFound = "LogicalConditionNotFound";
                    ErrorCodes.BasicFilterSerializationError = "BasicFilterSerializationError";
                    ErrorCodes.AdvancedFilterSerializationError = "AdvancedFilterSerializationError";
                    ErrorCodes.InvalidFilterType = "InvalidFilterType";
                    ErrorCodes.InvalidFilterCondition = "InvalidFilterCondition";
                    ErrorCodes.FilterNotFound = "FilterNotFound";
                    ErrorCodes.BasicFilterOperatorNotFound = "BasicFilterOperatorNotFound";
                    ErrorCodes.InvalidReportData = "InvalidReportData";
                    ErrorCodes.InvalidPageData = "InvalidPageData";
                })(ErrorCodes = constants.ErrorCodes || (constants.ErrorCodes = {}));
                var ErrorMessages;
                (function (ErrorMessages) {
                    ErrorMessages.InvalidFilterMessage = "Filter is not valid, validation errors: ";
                    ErrorMessages.InvalidTarget = "Could not serialize json filter target to SQ expression.";
                    ErrorMessages.InvalidCondition = "Advanced filter requires a filter condition (None | LessThan | LessThanOrEqual | GreaterThan | GreaterThanOrEqual | Contains | DoesNotContain | StartsWith | DoesNotStartWith | Is | IsNot | IsBlank | IsNotBlank).";
                    ErrorMessages.InvalidDataTypeMessage = "The data type of the value {0} is not supported. Only string, number and boolean are supported.";
                    ErrorMessages.FilterSerializationError = "Could not serialize filter.";
                    ErrorMessages.InvalidFilterTypeMessage = "Not supported filter type - can't serialize to json syntax.";
                    ErrorMessages.SemanticFilterInvalidCondition = "Filter with invalid condition - can't serialize to json syntax.";
                    ErrorMessages.FilterNotFoundMessage = "Invoked filter serialization function with no filter.";
                    ErrorMessages.FieldNotFoundMessage = "Invoked filter serialization function on a table that has no column/measure/hierarchy.";
                    ErrorMessages.BasicFilterOperatorNotFoundMessage = "Basic filter requires an operator (In | Not).";
                    ErrorMessages.FilterValuesNotFound = " Could not retrieve filter values.";
                    ErrorMessages.InvalidReportDataMessage = "Could not find the report.";
                    ErrorMessages.InvalidPageDataMessage = "Could not find the active page.";
                    ErrorMessages.DataPointSerializationError = "Could not serialize a data point.";
                })(ErrorMessages = constants.ErrorMessages || (constants.ErrorMessages = {}));
            })(constants = jsonFilter.constants || (jsonFilter.constants = {}));
        })(jsonFilter = explore.jsonFilter || (explore.jsonFilter = {}));
    })(explore = powerbi.explore || (powerbi.explore = {}));
})(powerbi || (powerbi = {}));
//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
var powerbi;
(function (powerbi) {
    var explore;
    (function (explore) {
        var jsonFilter;
        (function (jsonFilter) {
            var JsonFilterConstants = jsonFilter.constants;
            var SemanticFilter = powerbi.data.SemanticFilter;
            var SQExprBuilder = powerbi.data.SQExprBuilder;
            var Trace = jsCommon.Trace;
            var Utility = jsCommon.Utility;
            function createJSONFilterParser(promiseFactory) {
                return new JSONFilterParser(promiseFactory);
            }
            jsonFilter.createJSONFilterParser = createJSONFilterParser;
            var JSONFilterParser = (function () {
                function JSONFilterParser(promiseFactory) {
                    this.promiseFactory = promiseFactory;
                    this.PowerBIModels = window["powerbi-models"];
                    this.fieldVisitor = new jsonFilter.JsonFilterBuilder.SemanticFilterFieldVisitor();
                }
                JSONFilterParser.prototype.tryCreateFilterContainer = function (contract, schema, filter) {
                    try {
                        return this.constructFilterContainer(contract, schema, filter);
                    }
                    catch (e) {
                        // Catch any exception while parsing or creating the FilterContainer.
                        JsonFilterParserErrors.traceError(e);
                        return null;
                    }
                };
                JSONFilterParser.prototype.tryGetFilters = function (contract, schema) {
                    var serializedFilters = [];
                    if (!contract.filters || contract.filters.length === 0) {
                        // return empty array if there are no filters to serialize
                        return this.promiseFactory.resolve(serializedFilters);
                    }
                    try {
                        serializedFilters = contract.filters
                            .map(function (filterContainer) { return jsonFilter.JsonFilterBuilder.fromSemanticFilter(filterContainer, schema, filterContainer.filter); });
                    }
                    catch (error) {
                        // Catch any exceptions while parsing or creating filters in json syntax
                        JsonFilterParserErrors.traceError(error);
                        if (error.message !== undefined) {
                            return this.promiseFactory.reject({ message: error.message });
                        }
                        else {
                            return this.promiseFactory.reject({ message: JsonFilterConstants.ErrorMessages.FilterSerializationError });
                        }
                    }
                    return this.promiseFactory.resolve(serializedFilters);
                };
                JSONFilterParser.prototype.tryGetSelectedDataPoints = function (exploration, schema, dataPointsSelectedArgs) {
                    var _this = this;
                    var visualContainer = dataPointsSelectedArgs.visualContainer;
                    if (!visualContainer ||
                        !visualContainer.config ||
                        !visualContainer.config.singleVisual) {
                        return this.promiseFactory.reject({ message: JsonFilterConstants.ErrorMessages.DataPointSerializationError });
                    }
                    if (_.isEmpty(dataPointsSelectedArgs.dataPointsDescriptions)) {
                        return this.promiseFactory.resolve(null);
                    }
                    var selection;
                    var visualConfig = visualContainer.config.singleVisual;
                    var selectionDeferred = this.promiseFactory.defer();
                    this.tryGetFilters(dataPointsSelectedArgs.visualContainer, schema)
                        .then(function (filters) {
                            try {
                                selection = {
                                    report: _this.getReportInfo(exploration),
                                    page: _this.getActivePageInfo(exploration),
                                    visual: _this.getVisualInfo(dataPointsSelectedArgs.visualTitleText, visualConfig.visualType),
                                    dataPoints: _this.getDataPoints(dataPointsSelectedArgs.dataPointsDescriptions, schema),
                                    regions: null,
                                    filters: filters
                                };
                                selectionDeferred.resolve(selection);
                            }
                            catch (error) {
                                // Catch any exceptions while parsing or creating filters in json syntax
                                JsonFilterParserErrors.traceError(error);
                                if (error.message !== undefined) {
                                    selectionDeferred.reject({ message: error.message });
                                }
                                else {
                                    selectionDeferred.reject({ message: JsonFilterConstants.ErrorMessages.DataPointSerializationError });
                                }
                            }
                        }).catch(function (error) {
                            selectionDeferred.reject(error);
                        });
                    return selectionDeferred.promise;
                };
                JSONFilterParser.prototype.getValues = function (selectedValues, schema) {
                    var _this = this;
                    var values = [];
                    if (!selectedValues) {
                        return values;
                    }
                    return _.map(selectedValues, function (selectedValue) {
                        return {
                            target: _this.getSelectedValueTarget(selectedValue.expr, schema),
                            value: selectedValue.value,
                            formattedValue: selectedValue.formattedValue
                        };
                    });
                };
                JSONFilterParser.prototype.getSelectedValueTarget = function (expr, schema) {
                    debug.assert(expr != null, "Selected value's expression is null");
                    var targetProperties = powerbi.data.SQExprConverter.asFieldPattern(expr, schema);
                    if (!targetProperties) {
                        return null;
                    }
                    var target;
                    if (targetProperties.columnAggr || targetProperties.groupingColumnAggr) {
                        var columnAggr = targetProperties.columnAggr || targetProperties.groupingColumnAggr;
                        target = {
                            table: columnAggr.entity,
                            column: columnAggr.name,
                            aggregationFunction: powerbi.data.aggregateFunctionName(columnAggr.aggregate)
                        };
                    }
                    else if (targetProperties.hierarchyLevelAggr) {
                        var hierarchyLevelAggr = targetProperties.hierarchyLevelAggr;
                        target = {
                            table: hierarchyLevelAggr.entity,
                            hierarchy: hierarchyLevelAggr.name,
                            hierarchyLevel: hierarchyLevelAggr.level,
                            aggregationFunction: powerbi.data.aggregateFunctionName(hierarchyLevelAggr.aggregate)
                        };
                    }
                    else if (targetProperties.measure) {
                        var measure = targetProperties.measure;
                        target = {
                            table: measure.entity,
                            measure: measure.name
                        };
                    }
                    else if (targetProperties.column) {
                        var column = targetProperties.column;
                        target = {
                            table: column.entity,
                            column: column.name
                        };
                    }
                    return target;
                };
                JSONFilterParser.prototype.getDataPoints = function (dataPointsDescriptions, schema) {
                    var serializedDataPoints = [];
                    for (var _i = 0, dataPointsDescriptions_1 = dataPointsDescriptions; _i < dataPointsDescriptions_1.length; _i++) {
                        var dataPointsDescription = dataPointsDescriptions_1[_i];
                        var serializedDataPoint = {
                            identity: [],
                            values: this.getValues(dataPointsDescription.values, schema),
                        };
                        var selectorData = dataPointsDescription.selector.data;
                        // Populate serializedDataPoint.identity
                        for (var _a = 0, selectorData_1 = selectorData; _a < selectorData_1.length; _a++) {
                            var data_1 = selectorData_1[_a];
                            // for data object only consider DataViewScopeIdentity type, don't serialize DataViewScopeWildCard or DataViewRoleWildCard
                            if (data_1.expr) {
                                var dataViewScopeIdentity = data_1;
                                var comparands = powerbi.data.SQExprConverter.getAllComparands(dataViewScopeIdentity);
                                if (!comparands) {
                                    return serializedDataPoints;
                                }
                                for (var _b = 0, comparands_1 = comparands; _b < comparands_1.length; _b++) {
                                    var comparand = comparands_1[_b];
                                    debug.assert(comparand.expr != null, "comparand.expr is null");
                                    var serializedTarget = comparand.expr.accept(this.fieldVisitor);
                                    serializedDataPoint.identity.push({ target: serializedTarget, equals: comparand.value });
                                }
                            }
                        }
                        serializedDataPoints.push(serializedDataPoint);
                    }
                    return serializedDataPoints;
                };
                JSONFilterParser.prototype.getReportInfo = function (exploration) {
                    if (!exploration || exploration.activeSectionIndex == null) {
                        Utility.throwException(JsonFilterParserErrors.invalidReportData());
                    }
                    return {
                        id: exploration.report.objectId,
                        displayName: exploration.report.displayName
                    };
                };
                JSONFilterParser.prototype.getActivePageInfo = function (exploration) {
                    if (!exploration || exploration.activeSectionIndex == null) {
                        Utility.throwException(JsonFilterParserErrors.invalidPageData());
                    }
                    var activeSection = exploration.sections[exploration.activeSectionIndex];
                    return {
                        name: activeSection.name,
                        displayName: activeSection.displayName
                    };
                };
                JSONFilterParser.prototype.getVisualInfo = function (visualTitleText, type) {
                    return {
                        name: null,
                        title: visualTitleText,
                        type: type
                    };
                };
                JSONFilterParser.prototype.constructFilterContainer = function (contract, schema, filter) {
                    var filterContainer;
                    var errors = this.validateFilter(filter);
                    if (errors) {
                        Utility.throwException(JsonFilterParserErrors.filterValidationErrors(errors));
                    }
                    else {
                        var filterType = this.PowerBIModels.getFilterType(filter);
                        if (filterType === this.PowerBIModels.FilterType.Basic) {
                            filterContainer = this.buildBasicFilterContainer(contract, filter);
                        }
                        else if (filterType === this.PowerBIModels.FilterType.Advanced) {
                            filterContainer = this.buildAdvancedFilterContainer(contract, schema, filter);
                        }
                    }
                    return filterContainer;
                };
                JSONFilterParser.prototype.buildBasicFilterContainer = function (contract, basicFilter) {
                    var filterContainer;
                    var fieldExpr = this.getFieldExpr(basicFilter.target);
                    if (!fieldExpr) {
                        Utility.throwException(JsonFilterParserErrors.fieldNotFound(basicFilter.target));
                    }
                    var filter = undefined;
                    if (basicFilter.operator !== JsonFilterConstants.SelectAll) {
                        var keyColumnsFieldExprs = this.getFieldExprsForKeys(basicFilter.target);
                        var exprsForInValues = [];
                        var valueIndex = 0;
                        for (var _i = 0, _a = basicFilter.values; _i < _a.length; _i++) {
                            var value = _a[_i];
                            var exprForInValue = [];
                            // If we have key columns - each value should have an array of values that represents the value in each of the key columns
                            var keyValues = basicFilter.keyValues;
                            if (keyColumnsFieldExprs && keyValues) {
                                for (var _b = 0, _c = keyValues[valueIndex]; _b < _c.length; _b++) {
                                    var valueInKeyColumn = _c[_b];
                                    exprForInValue.push(this.buildSQConstantExpr(valueInKeyColumn));
                                }
                            }
                            else {
                                exprForInValue.push(this.buildSQConstantExpr(value));
                            }
                            exprsForInValues.push(exprForInValue);
                            valueIndex++;
                        }
                        var inExpr = SQExprBuilder.inValues(keyColumnsFieldExprs || [fieldExpr], exprsForInValues);
                        var filterExpression = void 0;
                        if (basicFilter.operator === JsonFilterConstants.NotIn) {
                            filterExpression = SQExprBuilder.not(inExpr);
                        }
                        else {
                            filterExpression = inExpr;
                        }
                        filter = SemanticFilter.fromSQExpr(filterExpression);
                    }
                    filterContainer = {
                        name: explore.FilterUtils.getNextFilterName(contract.filters),
                        expression: fieldExpr,
                        filter: filter,
                        type: powerbi.explore.contracts.FilterType.Categorical,
                    };
                    return filterContainer;
                };
                JSONFilterParser.prototype.buildAdvancedFilterContainer = function (contract, schema, advancedFilter) {
                    var filterContainer;
                    var fieldExpr = this.getFieldExpr(advancedFilter.target);
                    if (!fieldExpr) {
                        Utility.throwException(JsonFilterParserErrors.fieldNotFound(advancedFilter.target));
                    }
                    var conditions = [];
                    for (var i = 0; i < advancedFilter.conditions.length; i++) {
                        var condition = this.getCondition(advancedFilter.conditions[i]);
                        if (condition) {
                            conditions.push(condition);
                        }
                    }
                    var metadata = fieldExpr.getMetadata(schema);
                    var fieldType = metadata ? metadata.type : null;
                    var logicalOperator = JsonFilterConstants.logicalOperatorDictionary[advancedFilter.logicalOperator];
                    var filterSQExpr = explore.viewModels.FilterCardConverter.toSQExpr(fieldExpr, fieldType, conditions, logicalOperator);
                    if (filterSQExpr) {
                        filterContainer = {
                            name: explore.FilterUtils.getNextFilterName(contract.filters),
                            expression: fieldExpr,
                            filter: SemanticFilter.fromSQExpr(filterSQExpr),
                            type: powerbi.explore.contracts.FilterType.Advanced,
                        };
                    }
                    return filterContainer;
                };
                JSONFilterParser.prototype.getCondition = function (jsonCondition) {
                    if (!jsonCondition) {
                        Utility.throwException(JsonFilterParserErrors.filterConditionNotFound());
                    }
                    var operator = JsonFilterConstants.operatorDictionary[jsonCondition.operator];
                    var formattedValue;
                    // check if we have a date value
                    if (_.isString(jsonCondition.value) && jsCommon.DateExtensions.parseIsoDateFast(jsonCondition.value.substr(0, 26))) {
                        formattedValue = jsCommon.DateExtensions.parseIsoDateFast(jsonCondition.value.substr(0, 26));
                    }
                    else {
                        formattedValue = jsonCondition.value;
                    }
                    return new explore.viewModels.Condition(operator, formattedValue);
                };
                JSONFilterParser.prototype.getFieldExprsForKeys = function (target) {
                    var _this = this;
                    if (!target || !target.keys)
                        return null;
                    var keysSQExprs = _.map(target.keys, function (key) { return _this.getFieldExpr(target, key); });
                    return keysSQExprs;
                };
                JSONFilterParser.prototype.getFieldExpr = function (target, key) {
                    var fieldExpr;
                    if (key) {
                        return SQExprBuilder.fieldExpr({
                            column: {
                                schema: undefined,
                                entity: target.table,
                                name: key
                            }
                        });
                    }
                    if (this.PowerBIModels.isMeasure(target)) {
                        var measureTarget = target;
                        fieldExpr = SQExprBuilder.measureRef(SQExprBuilder.entity(undefined, measureTarget.table), measureTarget.measure);
                    }
                    else if (this.PowerBIModels.isHierarchy(target)) {
                        var hierarchyTarget = target;
                        fieldExpr = SQExprBuilder.hierarchyLevel(SQExprBuilder.hierarchy(SQExprBuilder.entity(undefined, hierarchyTarget.table), hierarchyTarget.hierarchy), hierarchyTarget.hierarchyLevel);
                    }
                    else if (this.PowerBIModels.isColumn(target)) {
                        var columnTarget = target;
                        fieldExpr = SQExprBuilder.fieldExpr({
                            column: {
                                schema: undefined,
                                entity: columnTarget.table,
                                name: columnTarget.column
                            }
                        });
                    }
                    return fieldExpr;
                };
                JSONFilterParser.prototype.buildSQConstantExpr = function (value) {
                    var sqExpr;
                    if (_.isString(value)) {
                        // check if value is a date or regular string
                        if (jsCommon.DateExtensions.parseIsoDateFast(value.substr(0, 26)) != null) {
                            var dateValue = jsCommon.DateExtensions.parseIsoDateFast(value.substr(0, 26));
                            sqExpr = SQExprBuilder.dateTime(dateValue);
                        }
                        else {
                            sqExpr = SQExprBuilder.text(value);
                        }
                    }
                    else if (_.isBoolean(value)) {
                        sqExpr = SQExprBuilder.boolean(value);
                    }
                    else if (_.isNumber(value)) {
                        // check if value is a double or integer
                        if (powerbi.Double.isInteger(value)) {
                            sqExpr = SQExprBuilder.integer(value);
                        }
                        else {
                            sqExpr = SQExprBuilder.double(value);
                        }
                    }
                    else {
                        Utility.throwException(JsonFilterParserErrors.invalidDataType(value));
                    }
                    return sqExpr;
                };
                JSONFilterParser.prototype.validateFilter = function (filter) {
                    var error = this.PowerBIModels.validateFilter(filter);
                    return error;
                };
                return JSONFilterParser;
            }());
            var JsonFilterParserErrors = (function () {
                function JsonFilterParserErrors() {
                }
                JsonFilterParserErrors.traceError = function (e) {
                    Trace.error("Throwing exception: " + JSON.stringify(e),
                    /*includeStackTrace*/ e.Stack != null ? false : true);
                };
                JsonFilterParserErrors.fieldNotFound = function (target) {
                    var columnTarget = (target ? "Target table: " + target.table : "");
                    return {
                        name: JsonFilterConstants.ErrorCodes.FieldNotFound,
                        message: JsonFilterConstants.ErrorMessages.InvalidTarget + columnTarget
                    };
                };
                JsonFilterParserErrors.filterValidationErrors = function (errors) {
                    var consolidatedErrors = errors.map(function (error) { return error.message; }).join(', ');
                    return {
                        name: JsonFilterConstants.ErrorCodes.FilterValidationErrors,
                        message: JsonFilterConstants.ErrorMessages.InvalidFilterMessage + consolidatedErrors
                    };
                };
                JsonFilterParserErrors.invalidDataType = function (value) {
                    return {
                        name: JsonFilterConstants.ErrorCodes.InvalidDataType,
                        message: jsCommon.StringExtensions.format(JsonFilterConstants.ErrorMessages.InvalidDataTypeMessage, value),
                    };
                };
                JsonFilterParserErrors.filterConditionNotFound = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.FilterConditionNotFound,
                        message: JsonFilterConstants.ErrorMessages.InvalidCondition
                    };
                };
                JsonFilterParserErrors.basicFilterSerializationError = function (message) {
                    return {
                        name: JsonFilterConstants.ErrorCodes.BasicFilterSerializationError,
                        message: JsonFilterConstants.ErrorMessages.FilterSerializationError + message
                    };
                };
                JsonFilterParserErrors.advancedFilterSerializationError = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.AdvancedFilterSerializationError,
                        message: JsonFilterConstants.ErrorMessages.FilterSerializationError
                    };
                };
                JsonFilterParserErrors.invalidFilterType = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.InvalidFilterType,
                        message: JsonFilterConstants.ErrorMessages.InvalidFilterTypeMessage
                    };
                };
                JsonFilterParserErrors.invalidFilterCondition = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.InvalidFilterCondition,
                        message: JsonFilterConstants.ErrorMessages.SemanticFilterInvalidCondition
                    };
                };
                JsonFilterParserErrors.filterNotFound = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.FilterNotFound,
                        message: JsonFilterConstants.ErrorMessages.FilterNotFoundMessage
                    };
                };
                JsonFilterParserErrors.fieldExpressionNotFound = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.FieldNotFound,
                        message: JsonFilterConstants.ErrorMessages.FieldNotFoundMessage
                    };
                };
                JsonFilterParserErrors.basicFilterOperatorNotFound = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.BasicFilterOperatorNotFound,
                        message: JsonFilterConstants.ErrorMessages.BasicFilterOperatorNotFoundMessage
                    };
                };
                JsonFilterParserErrors.invalidReportData = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.InvalidReportData,
                        message: JsonFilterConstants.ErrorMessages.InvalidReportDataMessage
                    };
                };
                JsonFilterParserErrors.invalidPageData = function () {
                    return {
                        name: JsonFilterConstants.ErrorCodes.InvalidPageData,
                        message: JsonFilterConstants.ErrorMessages.InvalidPageDataMessage
                    };
                };
                return JsonFilterParserErrors;
            }());
            jsonFilter.JsonFilterParserErrors = JsonFilterParserErrors;
        })(jsonFilter = explore.jsonFilter || (explore.jsonFilter = {}));
    })(explore = powerbi.explore || (powerbi.explore = {}));
})(powerbi || (powerbi = {}));
//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
var powerbi;
(function (powerbi) {
    var explore;
    (function (explore) {
        var jsonFilter;
        (function (jsonFilter_1) {
            var Utility = jsCommon.Utility;
            var FilterCardConverter = powerbi.explore.viewModels.FilterCardConverter;
            var JsonFilterConstants = powerbi.explore.jsonFilter.constants;
            var JsonFilterBuilder;
            (function (JsonFilterBuilder) {
                var powerbiModels = window["powerbi-models"];
                function fromSemanticFilter(contract, schema, filter) {
                    var fieldExpr = contract.expression;
                    if (!fieldExpr) {
                        Utility.throwException(jsonFilter_1.JsonFilterParserErrors.fieldExpressionNotFound());
                    }
                    var jsonFilter;
                    var fieldVisitor = new SemanticFilterFieldVisitor();
                    var advancedFilterCard;
                    if (filter) {
                        var filterConditions = void 0;
                        filterConditions = filter.conditions();
                        if (!filterConditions || _.isEmpty(filterConditions) || filterConditions.length !== 1) {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.invalidFilterCondition());
                        }
                        var condition = filterConditions[0];
                        // try to parse the condition to advanced filter card. If it succeeds we need to additionally check number of conditions, if there are more than 2 it's is a basic filter with group on keys
                        advancedFilterCard = AdvancedFilterSerializerHelper.getAdvancedFilterExpression(condition);
                    }
                    var filterType = contract.type;
                    if (filterType == null) {
                        filterType = explore.FilterUtils.getDefaultFilterType(fieldExpr, schema, advancedFilterCard ? advancedFilterCard.field : null);
                    }
                    if (advancedFilterCard && filterType === explore.contracts.FilterType.Advanced) {
                        // serialize target, logical operator and conditions
                        var serializedTarget = advancedFilterCard.field.accept(fieldVisitor);
                        var serializedLogicalOperator = AdvancedFilterSerializerHelper.getAdvancedFilterLogicalOperator(advancedFilterCard.logicalOperator);
                        var serializedConditions = advancedFilterCard.conditions.map(function (condition) { return AdvancedFilterSerializerHelper.getAdvancedFilterCondition(condition); });
                        var advancedFilter = new powerbiModels.AdvancedFilter(serializedTarget, serializedLogicalOperator, serializedConditions);
                        if (!advancedFilter) {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.advancedFilterSerializationError());
                        }
                        jsonFilter = advancedFilter.toJSON();
                    }
                    else {
                        // try to parse basic filter
                        var serializedTarget = BasicFilterSerializerHelper.getTarget(fieldExpr, fieldVisitor, schema);
                        var serializedOperator = filter ? BasicFilterSerializerHelper.getOperator(schema, filter, fieldExpr) : JsonFilterConstants.SelectAll;
                        var serializedValues = BasicFilterSerializerHelper.getValuesFromSQExpr(contract, schema, filter);
                        var basicFilter = void 0;
                        if (serializedValues.keyValues && serializedValues.keyValues.length > 0) {
                            basicFilter = new powerbiModels.BasicFilterWithKeys(serializedTarget, serializedOperator, serializedValues.displayedValues, serializedValues.keyValues);
                        }
                        else {
                            basicFilter = new powerbiModels.BasicFilter(serializedTarget, serializedOperator, serializedValues.displayedValues);
                        }
                        if (!basicFilter) {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.basicFilterSerializationError());
                        }
                        jsonFilter = basicFilter.toJSON();
                    }
                    return jsonFilter;
                }
                JsonFilterBuilder.fromSemanticFilter = fromSemanticFilter;
                var BasicFilterSerializerHelper;
                (function (BasicFilterSerializerHelper) {
                    /** Analyze filter with simple SQ expression or group on keys, get selected scopeIds from filter and retrieve values.
                     *  Use logic similar to the one in filterVisualController used for creating a restatement of a filter shown in filter card **/
                    function getValuesFromSQExpr(contract, schema, filter) {
                        var valuesForFilter = {
                            displayedValues: [],
                            keyValues: []
                        };
                        if (!filter) {
                            return valuesForFilter;
                        }
                        var selectedScopeIds;
                        var fieldExpr = contract.expression;
                        var scopeIdsContainer = getSelectedScopeIdsContainerFromFilter(schema, filter, fieldExpr);
                        if (scopeIdsContainer) {
                            selectedScopeIds = scopeIdsContainer.scopeIds;
                        }
                        if (_.isEmpty(selectedScopeIds)) {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.basicFilterSerializationError(JsonFilterConstants.ErrorMessages.FilterValuesNotFound));
                        }
                        // analyze filter for simple SQ expression and retrieve values from scopeIds
                        for (var _i = 0, selectedScopeIds_1 = selectedScopeIds; _i < selectedScopeIds_1.length; _i++) {
                            var scopeId = selectedScopeIds_1[_i];
                            if (fieldExpr.hasGroupOnKeys(schema)) {
                                var valuesAndExprForAllKeys = powerbi.data.SQExprConverter.getAllComparands(scopeId);
                                var valuesForAllKeys = valuesAndExprForAllKeys.map(function (valueAndColumn) { return convertValue(valueAndColumn.value); });
                                valuesForFilter.keyValues.push(valuesForAllKeys);
                                // analyze filter for SQ expression with group on keys and retrieve values from deserialized cached values in the contract
                                var cachedValueItems = contract.cachedValueItems;
                                if (!_.isEmpty(cachedValueItems) && cachedValueItems.length === selectedScopeIds.length) {
                                    valuesForFilter.displayedValues = cachedValueItems.map(function (value) { return getLabelForGOK(value); });
                                }
                                else {
                                    Utility.throwException(jsonFilter_1.JsonFilterParserErrors.basicFilterSerializationError(JsonFilterConstants.ErrorMessages.FilterValuesNotFound));
                                }
                            }
                            else {
                                var value = powerbi.data.SQExprConverter.getFirstComparandValue(scopeId);
                                valuesForFilter.displayedValues.push(convertValue(value));
                            }
                        }
                        return valuesForFilter;
                    }
                    BasicFilterSerializerHelper.getValuesFromSQExpr = getValuesFromSQExpr;
                    function getOperator(schema, filter, fieldExpr) {
                        var scopeIdsContainer = getSelectedScopeIdsContainerFromFilter(schema, filter, fieldExpr);
                        if (scopeIdsContainer) {
                            if (scopeIdsContainer.isNot) {
                                return "NotIn";
                            }
                            else {
                                return "In";
                            }
                        }
                        Utility.throwException(jsonFilter_1.JsonFilterParserErrors.basicFilterOperatorNotFound());
                    }
                    BasicFilterSerializerHelper.getOperator = getOperator;
                    function getTarget(expr, visitor, schema) {
                        var serializedTarget = expr.accept(visitor);
                        if (expr.hasGroupOnKeys(schema)) {
                            serializedTarget.keys = getAllKeyColumns(expr, visitor, schema);
                        }
                        return serializedTarget;
                    }
                    BasicFilterSerializerHelper.getTarget = getTarget;
                    function getAllKeyColumns(expr, visitor, schema) {
                        var keyColumns = expr.getKeyColumns(schema);
                        var keys = [];
                        if (keyColumns) {
                            keys = keyColumns.map(function (columnExpr) { return columnExpr.accept(visitor).column; });
                        }
                        return keys;
                    }
                    /** Retrieve a container of DataViewScopeIdentities - identities of a data scope in a DataView **/
                    function getSelectedScopeIdsContainerFromFilter(schema, filter, fieldExpr) {
                        // retrieve the SQExpr[] of group on columns if it has group on keys otherwise retrieve the SQExpr of the column.
                        var columnExprs = fieldExpr.getKeyColumns(schema);
                        if (!columnExprs) {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.fieldExpressionNotFound());
                        }
                        return powerbi.data.SQExprConverter.asScopeIdsContainer(filter, columnExprs);
                    }
                    function convertValue(value) {
                        if (_.isDate(value)) {
                            return value.toISOString();
                        }
                        return value;
                    }
                    function getLabelForGOK(value) {
                        var valueIdPair = value;
                        if (value === null) {
                            return null;
                        }
                        else if (typeof (value) === 'string') {
                            return value;
                        }
                        else if (valueIdPair && valueIdPair.displayName) {
                            return valueIdPair.displayName;
                        }
                        else {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.invalidDataType('Unrecognized type of value: ' + value));
                        }
                    }
                })(BasicFilterSerializerHelper || (BasicFilterSerializerHelper = {}));
                var AdvancedFilterSerializerHelper;
                (function (AdvancedFilterSerializerHelper) {
                    function getAdvancedFilterExpression(filterCondition) {
                        return FilterCardConverter.createAdvFilter(filterCondition);
                    }
                    AdvancedFilterSerializerHelper.getAdvancedFilterExpression = getAdvancedFilterExpression;
                    function getAdvancedFilterLogicalOperator(logicalOperator) {
                        switch (logicalOperator) {
                            case 0 /* And */:
                                return "And";
                            case 1 /* Or */:
                                return "Or";
                            case 2 /* Undefined */:
                                // in advanced filter logical operator can be undefined, if there's no second condition. This is still a valid advanced filter
                                return "And";
                        }
                    }
                    AdvancedFilterSerializerHelper.getAdvancedFilterLogicalOperator = getAdvancedFilterLogicalOperator;
                    function getAdvancedFilterCondition(condition) {
                        if (explore.viewModels.OperatorHelper.getValueRequired(condition.operator) &&
                            (!condition.value || !condition.value.hasValue)) {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.filterConditionNotFound());
                        }
                        var operatorAsString;
                        if (condition.operator === 9 /* Is */) {
                            operatorAsString = "Is";
                        }
                        else if (condition.operator === 10 /* IsNot */) {
                            operatorAsString = "IsNot";
                        }
                        else if (condition.operator === 3 /* GreaterThan */) {
                            operatorAsString = "GreaterThan";
                        }
                        else if (condition.operator === 4 /* GreaterThanOrEqual */) {
                            operatorAsString = "GreaterThanOrEqual";
                        }
                        else if (condition.operator === 1 /* LessThan */) {
                            operatorAsString = "LessThan";
                        }
                        else if (condition.operator === 2 /* LessThanOrEqual */) {
                            operatorAsString = "LessThanOrEqual";
                        }
                        else if (condition.operator === 5 /* Contains */) {
                            operatorAsString = "Contains";
                        }
                        else if (condition.operator === 6 /* DoesNotContain */) {
                            operatorAsString = "DoesNotContain";
                        }
                        else if (condition.operator === 7 /* StartWith */) {
                            operatorAsString = "StartsWith";
                        }
                        else if (condition.operator === 8 /* DoesNotStartWith */) {
                            operatorAsString = "DoesNotStartWith";
                        }
                        else if (condition.operator === 11 /* IsBlank */) {
                            operatorAsString = "IsBlank";
                        }
                        else if (condition.operator === 12 /* IsNotBlank */) {
                            operatorAsString = "IsNotBlank";
                        }
                        else {
                            Utility.throwException(jsonFilter_1.JsonFilterParserErrors.filterConditionNotFound());
                        }
                        var conditionValue = condition.value;
                        return {
                            operator: operatorAsString,
                            value: condition.value.isDate ? conditionValue.value.toISOString() : conditionValue.value
                        };
                    }
                    AdvancedFilterSerializerHelper.getAdvancedFilterCondition = getAdvancedFilterCondition;
                })(AdvancedFilterSerializerHelper || (AdvancedFilterSerializerHelper = {}));
                var SemanticFilterFieldVisitor = (function (_super) {
                    __extends(SemanticFilterFieldVisitor, _super);
                    function SemanticFilterFieldVisitor() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    SemanticFilterFieldVisitor.prototype.visitEntity = function (expr) {
                        debug.assertValue(expr, 'expr');
                        return { table: expr.entity, column: null };
                    };
                    SemanticFilterFieldVisitor.prototype.visitHierarchy = function (expr) {
                        var baseFilterTarget = expr.arg.accept(this);
                        if (!baseFilterTarget) {
                            return null;
                        }
                        return {
                            table: baseFilterTarget.table,
                            hierarchy: expr.hierarchy,
                            hierarchyLevel: null
                        };
                    };
                    SemanticFilterFieldVisitor.prototype.visitColumnRef = function (expr) {
                        var baseFilterTarget = expr.source.accept(this);
                        if (!baseFilterTarget) {
                            return null;
                        }
                        return {
                            table: baseFilterTarget.table,
                            column: expr.ref
                        };
                    };
                    SemanticFilterFieldVisitor.prototype.visitMeasureRef = function (expr) {
                        var baseFilterTarget = expr.source.accept(this);
                        if (!baseFilterTarget) {
                            return null;
                        }
                        return {
                            table: baseFilterTarget.table,
                            measure: expr.ref
                        };
                    };
                    SemanticFilterFieldVisitor.prototype.visitHierarchyLevel = function (expr) {
                        var hierarchyTarget = expr.arg.accept(this);
                        if (!hierarchyTarget) {
                            return null;
                        }
                        return {
                            table: hierarchyTarget.table,
                            hierarchy: hierarchyTarget.hierarchy,
                            hierarchyLevel: expr.level
                        };
                    };
                    return SemanticFilterFieldVisitor;
                }(powerbi.data.DefaultSQExprVisitor));
                JsonFilterBuilder.SemanticFilterFieldVisitor = SemanticFilterFieldVisitor;
            })(JsonFilterBuilder = jsonFilter_1.JsonFilterBuilder || (jsonFilter_1.JsonFilterBuilder = {}));
        })(jsonFilter = explore.jsonFilter || (explore.jsonFilter = {}));
    })(explore = powerbi.explore || (powerbi.explore = {}));
})(powerbi || (powerbi = {}));
//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
//-----------------------------------------------------------------------
define("JSONFilter/services/jsonFilterParserMin", ["require", "exports"], function (require, exports) {
    "use strict";
    var pbi = powerbi;
    var explore = pbi.explore;
    function create(promiseFactory, moduleLoader) {
        return __awaiter(this, void 0, pbi.Promise, function () {
            var powerBIModels;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        powerBIModels = window['powerbi-models'];
                        if (!!powerBIModels) return [3 /*break*/, 2];
                        return [4 /*yield*/, moduleLoader.require({
                            javascript: 'powerbi-models'
                        })];
                    case 1:
                        powerBIModels = _a.sent();
                        // jsonFilterParserService expects window['powerbi-models'] to be defined.
                        // TODO: load powerbi-models as a module in jsonFilterParserService.
                        // Defect #10085975
                        window["powerbi-models"] = powerBIModels;
                        _a.label = 2;
                    case 2: return [2 /*return*/, new JSONFilterParserMin(promiseFactory)];
                }
            });
        });
    }
    exports.create = create;
    var JSONFilterParserMin = (function () {
        function JSONFilterParserMin(promiseFactory) {
            this.parser = explore.jsonFilter.createJSONFilterParser(promiseFactory);
        }
        JSONFilterParserMin.prototype.tryCreateSemanticFilter = function (name, schema, filter) {
            var contract = [{ name: name }];
            var filterContainer = this.parser.tryCreateFilterContainer(contract, schema, filter);
            if (filterContainer) {
                return filterContainer.filter;
            }
        };
        return JSONFilterParserMin;
    }());
});
