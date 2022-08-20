"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
const enum_1 = require("../helper/enum");
class Result {
    constructor(data, message = '', statusCode, errorCode, success = false) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.success = success;
    }
    static success(data, message, statusCode = enum_1.StatusCode.ok) {
        return new Result(data, message, statusCode, undefined, true);
    }
    static error(message, errorCode = enum_1.ErrorCode.none, data, statusCode = enum_1.StatusCode.ok) {
        return new Result(data, message, statusCode, errorCode, false);
    }
}
exports.Result = Result;
exports.default = Result;
