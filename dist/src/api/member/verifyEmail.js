"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const result_1 = require("../../controller/result");
const express_1 = __importDefault(require("express"));
const Employee_1 = require("../../controller/Employee");
exports.router = express_1.default.Router();
exports.default = exports.router;
/**
 * @author          -       Baban Shinde
 * @description     -       API will verify the user in salesforce and update the JWT token.
 * @Date            -       09 Sep 2020
 * @JIRA            -       RESERVE-1859
 * @param           -       type of req any, res any & next any
 * @static          -       it will indicate
 */
exports.router.put('/', async function (req, res, next) {
    try {
        const result = await Employee_1.Employee.verifyEmail(req.body.PersonEmail);
        if (result && result.success) {
            result.message = ('Employee registration link have been sent to your registered email ID successfully.');
        }
        res.status(result.statusCode);
        return res.json(result);
    }
    catch (error) {
        return res.json(result_1.Result.error((error)));
    }
});
