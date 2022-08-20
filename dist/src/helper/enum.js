"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.ReservationStatus = exports.Datasource = exports.Operator = exports.Evaluation = exports.StatusCode = exports.ErrorCode = exports.ApiMethod = void 0;
var ApiMethod;
(function (ApiMethod) {
    ApiMethod["POST"] = "POST";
    ApiMethod["PUT"] = "PUT";
    ApiMethod["DELETE"] = "DELETE";
    ApiMethod["GET"] = "GET";
})(ApiMethod = exports.ApiMethod || (exports.ApiMethod = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["none"] = "none";
    ErrorCode["missingFeature"] = "missingFeature";
    ErrorCode["missingField"] = "missingField";
    ErrorCode["invalidData"] = "invalidData";
    ErrorCode["forbidden"] = "forbidden";
    ErrorCode["unauthorized"] = "unauthorized";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["ok"] = 200] = "ok";
    StatusCode[StatusCode["badRequest"] = 400] = "badRequest";
    StatusCode[StatusCode["unauthorized"] = 401] = "unauthorized";
    StatusCode[StatusCode["notFound"] = 404] = "notFound";
    StatusCode[StatusCode["internalServerError"] = 500] = "internalServerError";
    StatusCode[StatusCode["forbidden"] = 403] = "forbidden";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
var Evaluation;
(function (Evaluation) {
    Evaluation["and"] = "and";
    Evaluation["or"] = "or";
    Evaluation["custom"] = "custom";
})(Evaluation = exports.Evaluation || (exports.Evaluation = {}));
var Operator;
(function (Operator) {
    Operator["equals"] = "=";
    Operator["notEquals"] = "!=";
    Operator["greaterThan"] = ">";
    Operator["lessThan"] = "<";
    Operator["greaterOrEqual"] = ">=";
    Operator["lessOrEqual"] = "<=";
    Operator["in"] = "in";
    Operator["contains"] = "contains";
    Operator["notIn"] = "notIn";
    Operator["startsWith"] = "starts with";
    Operator["endsWith"] = "ends with";
    Operator["match"] = "match";
    Operator["boolean"] = "boolean";
})(Operator = exports.Operator || (exports.Operator = {}));
var Datasource;
(function (Datasource) {
    Datasource["salesforce"] = "salesforce";
    Datasource["azure"] = "azure";
})(Datasource = exports.Datasource || (exports.Datasource = {}));
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["current"] = "current";
    ReservationStatus["history"] = "history";
    ReservationStatus["Request"] = "Request";
    ReservationStatus["Active"] = "Active";
})(ReservationStatus = exports.ReservationStatus || (exports.ReservationStatus = {}));
var Event;
(function (Event) {
    Event["insert"] = "insert";
    Event["update"] = "update";
})(Event = exports.Event || (exports.Event = {}));
