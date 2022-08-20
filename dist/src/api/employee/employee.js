"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const result_1 = require("../../controller/result");
const employee_1 = require("../../controller/employee");
const authenticate_1 = require("../../controller/authenticate");
exports.router = express_1.default.Router();
exports.default = exports.router;
exports.router.get('/', async function (req, res, next) {
    try {
        let result = await authenticate_1.Authenticate.authenticateRequest(req);
        if (!result.success) {
            res.status(result.statusCode);
            return res.json(result);
        }
        const context = result.data;
        result = await employee_1.Employee.getInfo(context);
        res.status(result.statusCode);
        return res.json(result);
    }
    catch (error) {
        return res.json(result_1.Result.error(error.message));
    }
});
