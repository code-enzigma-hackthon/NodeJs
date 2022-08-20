"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const result_1 = require("./result");
const enum_1 = require("../helper/enum");
const salesforce_1 = __importDefault(require("./salesforce"));
const jwt_1 = require("./jwt");
require('dotenv').config();
class Employee {
    static async register(req) {
        if (!req.body) {
            return result_1.Result.error('Request body is missing.', enum_1.ErrorCode.missingField);
        }
        if (!req.body.Email_id__c || req.body.Email_id__c === '') {
            return result_1.Result.error('Please provide the username.', enum_1.ErrorCode.missingField);
        }
        if (!req.body.Password__c || req.body.Password__c === '') {
            return result_1.Result.error('Please provide the password.', enum_1.ErrorCode.missingField);
        }
        const query = { objType: 'Account', fields: ['name', 'Id', 'Email_id__c', 'Block_Access_to_Employee_Portal__c'], criteria: { conditions: [{ fieldName: 'Email_id__c', value: req.body.Email_id__c.toLowerCase(), operator: 'equals' }] } };
        const sfQueryResult = await salesforce_1.default.query(query);
        if (!sfQueryResult.success || !sfQueryResult.data.length) {
            return result_1.Result.error('Enter the email ID provided while purchasing a Employeeship.', enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        if (sfQueryResult.data[0].Block_Access_to_Employee_Portal__c) {
            return result_1.Result.error('Access Denied.', enum_1.ErrorCode.unauthorized, undefined, enum_1.StatusCode.unauthorized);
        }
        const record = {
            Id: sfQueryResult.data[0].Id,
            objType: 'Account',
            Conference_Portal_Status__c: 'Registered'
        };
        const recordUpdated = await salesforce_1.default.save(record);
        if (!recordUpdated.success) {
            return result_1.Result.error(('Fail to update Employee portal status to "Registered".'));
        }
        const Employee = {
            Email_id__c: req.body.Email_id__c.toLowerCase(),
            Password__c: req.body.Password__c
        };
        const loginToken = await this.login(Employee);
        return loginToken;
    }
    static async login(Employee = {}) {
        if (!Employee.Email_id__c || Employee.Email_id__c === '') {
            return result_1.Result.error(('Please enter your username.'), enum_1.ErrorCode.missingField);
        }
        if (!Employee.Password__c || Employee.Password__c === '') {
            return result_1.Result.error(('Please enter your Password.'), enum_1.ErrorCode.missingField);
        }
        const verifyResult = await Employee.verifyEmail(Employee.Email_id__c);
        if (!verifyResult.success || !verifyResult.data.length) {
            return verifyResult;
        }
        return result_1.Result.success(verifyResult.data);
    }
    static async getInfo(context = {}) {
        let query;
        if (!context || !context.Id) {
            return result_1.Result.error(('Requird field is missing.'), enum_1.ErrorCode.missingField);
        }
        query = {
            objType: 'Account', fields: ['Id', 'Email_id__c', 'FirstName', 'LastName', 'PersonMailingState', 'PersonMailingCity', 'PersonMailingStreet', 'PersonMailingPostalCode', 'Phone', 'PersonMobilePhone'],
            criteria: { conditions: [{ fieldName: 'Id', value: context.Id, operator: 'equals' }] }
        };
        const result = await salesforce_1.default.query(query);
        if (!result.success || !result.data.length) {
            return result_1.Result.error(('Employee not found.'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        result.data = result.data[0];
        result.message = ('Sucessfully retrieved Employee information.');
        return result;
    }
    static async verifyEmail(Email_id__c) {
        let query;
        if (!Email_id__c || Email_id__c === '') {
            return result_1.Result.error('Please enter your username.', enum_1.ErrorCode.missingField);
        }
        query = { objType: 'Account', fields: ['Id', 'Email_id__c', 'Block_Access_to_Employee_Portal__c'], criteria: { conditions: [{ fieldName: 'Email_id__c', value: Email_id__c.toLowerCase(), operator: 'equals' }] } };
        const sfQueryResult = await salesforce_1.default.query(query);
        if (!sfQueryResult.success || !sfQueryResult.data.length) {
            return result_1.Result.error('Enter the email ID provided while purchasing a Employeeship.', enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        if (sfQueryResult.data[0].Block_Access_to_Employee_Portal__c) {
            return result_1.Result.error('Please call Employee Services at 1-888-567-5941.', enum_1.ErrorCode.unauthorized, undefined, enum_1.StatusCode.unauthorized);
        }
        const encryptToken = await jwt_1.JWT.encrypt({ 'Email_id__c': Email_id__c.toLowerCase(), tokenExpires: true, Id: sfQueryResult.data[0].Id });
        if (!encryptToken.success) {
            return result_1.Result.error('Error in the encryption of token.', enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.unauthorized);
        }
        const record = {
            Id: sfQueryResult.data[0].Id,
            objType: sfQueryResult.data[0].objType,
            JWT_Token__c: encryptToken.data
        };
        const result = await salesforce_1.default.save(record);
        if (!result.success) {
            return result_1.Result.error('Fail to update employee.');
        }
        result.data = encryptToken.data;
        return result;
    }
}
exports.Employee = Employee;
