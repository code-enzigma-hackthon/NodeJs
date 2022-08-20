"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const result_1 = require("../../controller/result");
const employee_1 = require("../../controller/employee");
exports.router = express_1.default.Router();
exports.default = exports.router;
exports.router.post('/', async function (req, res, next) {
    try {
        const result = await employee_1.Employee.login(req.body);
        if (result && result.success) {
            result.message = ('Employee logged in successfully.');
        }
        res.status(result.statusCode);
        return res.json(result);
    }
    catch (error) {
        return res.json(result_1.Result.error(error));
    }
});
