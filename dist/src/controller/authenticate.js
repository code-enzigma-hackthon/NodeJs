"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticate = void 0;
const jwt_1 = require("./jwt");
const result_1 = require("./result");
const enum_1 = require("../helper/enum");
const salesforce_1 = __importDefault(require("./salesforce"));
class Authenticate {
    static async authenticateRequest(request) {
        let query;
        const authHeader = request.headers['authorization'];
        const verificationToken = authHeader && authHeader.split(' ')[1];
        if (verificationToken === '' || !verificationToken) {
            return result_1.Result.error(('Authenticate.authenticateRequest.tokenNotPresent:JWT token is required'), enum_1.ErrorCode.missingField);
        }
        const result = await jwt_1.JWT.decrypt(verificationToken);
        if (!result.success) {
            return result;
        }
        query = { objType: 'Account', fields: ['name', 'Id', 'JWT_Token__c', 'RecordType.Name'], criteria: { conditions: [{ fieldName: 'PersonEmail', value: result.data.username.toLowerCase(), operator: 'equals' }] } };
        const sfQueryResult = await salesforce_1.default.query(query);
        if (!sfQueryResult.success || !sfQueryResult.data.length) {
            return result_1.Result.error(('Authenticate.authenticateRequest.username:Invalid username'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        // if (sfQueryResult.data[0].RecordType.Name === 'Inactive Employee') {
        // 	return Result.error(('Authenticate.authenticateRequest.inactive:Employee is inactive'));
        // }
        // if (sfQueryResult.data[0].RecordType.Name === 'Cancelled Employee') {
        // 	return Result.error( ('Authenticate.authenticateRequest.CancelledEmployee:Employee is Cancelled'));
        // }
        // if (sfQueryResult.data[0].RecordType.Name === 'Employee Prospect') {
        // 	// tslint:disable-next-line: max-line-length
        // 	return Result.error( ('Authenticate.authenticateRequest.EmployeeProspectNew:Only Ocean Canyon Employees may have access to the Employee Portal.'), ErrorCode.invalidData, undefined, StatusCode.notFound);
        // }
        if (sfQueryResult.data[0].JWT_Token__c !== verificationToken) {
            return result_1.Result.error(('Authenticate.authenticateRequest.tokenMismatched:Token not matches with request token'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        const context = {
            token: result.data,
            Id: sfQueryResult.data[0].Id,
            objType: sfQueryResult.data[0].objType
        };
        return result_1.Result.success(context);
    }
}
exports.Authenticate = Authenticate;
