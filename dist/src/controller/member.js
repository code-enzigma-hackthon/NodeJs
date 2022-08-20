"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const result_1 = require("./result");
const enum_1 = require("../helper/enum");
const jwt_1 = require("./jwt");
const salesforce_1 = __importDefault(require("./salesforce"));
const sf = require('node-salesforce');
const saltedSha256 = require('salted-sha256');
require('dotenv').config();
class Employee {
    static async verifyEmail(PersonEmail) {
        let query;
        if (!PersonEmail || PersonEmail === '') {
            return result_1.Result.error('Employee.verifyEmail.username:Please enter your username');
        }
        // tslint:disable-next-line: max-line-length
        query = { objType: 'Account', fields: ['name', 'Id', 'RecordType.Name', 'UserName__c', 'Block_Access_to_Employee_Portal__c'], criteria: { conditions: [{ fieldName: 'PersonEmail', value: PersonEmail.toLowerCase(), operator: 'equals' }] } };
        const sfQueryResult = await salesforce_1.default.query(query);
        if (!sfQueryResult.success || !sfQueryResult.data.length) {
            return result_1.Result.error(('Employee.verifyEmail.emailNotFound:Enter the email ID provided while purchasing a Employeeship.'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        if (sfQueryResult.data[0].Block_Access_to_Employee_Portal__c) {
            return result_1.Result.error(('Employee.verifyEmail.blockIndividualAccess:Please call Employee Services at 1-888-567-5941.'), enum_1.ErrorCode.unauthorized, undefined, enum_1.StatusCode.unauthorized);
        }
        if (sfQueryResult.data[0].RecordType.Name === 'Inactive Employee') {
            return result_1.Result.error(('Employee.verifyEmail.inactiveEmployee:Employee is inactive'), enum_1.ErrorCode.invalidData);
        }
        if (sfQueryResult.data[0].RecordType.Name === 'Cancelled Employee') {
            return result_1.Result.error(('Employee.verifyEmail.CancelledEmployee:Employee is Cancelled'), enum_1.ErrorCode.invalidData);
        }
        if (sfQueryResult.data[0].RecordType.Name === 'Employee Prospect') {
            return result_1.Result.error(('Employee.verifyEmail.EmployeeProspectNew:Only Ocean Canyon Employees may have access to the Employee Portal.'), enum_1.ErrorCode.invalidData);
        }
        const encryptToken = await jwt_1.JWT.encrypt({ 'username': PersonEmail.toLowerCase(), tokenExpires: true, Id: sfQueryResult.data[0].Id });
        if (!encryptToken.success) {
            return result_1.Result.error(('Employee.verifyEmail.encrypt:Error in the encryption of token'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.unauthorized);
        }
        const record = {
            Id: sfQueryResult.data[0].Id,
            objType: sfQueryResult.data[0].objType,
            JWT_Token__c: encryptToken.data,
            Email_Temaplate__c: 'Register Employee',
            Employee_Portal_Status__c: 'Waiting on Validation'
        };
        if (!sfQueryResult.data[0].UserName__c || sfQueryResult.data[0].UserName__c === '') {
            record['UserName__c'] = PersonEmail.toLowerCase();
        }
        const result = await salesforce_1.default.save(record);
        if (!result.success) {
            return result_1.Result.error(('Employee.verifyEmail.failToUpdate.waitingForValidation:Fail to update Employee portal status to "Waiting on Validation".'));
        }
        return result;
    }
    static async register(req) {
        if (!req.body || !req.body.verificationToken || req.body.verificationToken === '') {
            return result_1.Result.error(('Employee.register.token:Token is not present'), enum_1.ErrorCode.missingField);
        }
        if (!req.body.Password__c || req.body.Password__c === '') {
            return result_1.Result.error(('Employee.register.password:Please provide the password'), enum_1.ErrorCode.missingField);
        }
        const result = await jwt_1.JWT.decrypt(req.body.verificationToken);
        if (!result.success) {
            return result_1.Result.error(('Employee.register.tokenExpired:The validation link has expired.'), enum_1.ErrorCode.invalidData);
        }
        const record = {
            Id: result.data.Id,
            objType: 'Account',
            Employee_Portal_Status__c: 'Registered'
        };
        const recordUpdated = await salesforce_1.default.save(record);
        if (!recordUpdated.success) {
            return result_1.Result.error(('Employee.register.failToUpdate.Register:Fail to update Employee portal status to "Registered".'));
        }
        const Employee = {
            UserName__c: result.data.username.toLowerCase(),
            Password__c: req.body.Password__c
        };
        const loginToken = await this.login(Employee);
        return loginToken;
    }
    static async login(Employee = {}) {
        let query;
        if (!Employee.UserName__c || Employee.UserName__c === '') {
            return result_1.Result.error(('Employee.login.username:Please enter your username'), enum_1.ErrorCode.missingField);
        }
        if (!Employee.Password__c || Employee.Password__c === '') {
            return result_1.Result.error(('Employee.login.password:Please enter your Password'), enum_1.ErrorCode.missingField);
        }
        // tslint:disable-next-line: max-line-length
        query = { objType: 'Account', fields: ['name', 'Id', 'JWT_Token__c', 'RecordType.Name', 'Block_Access_to_Employee_Portal__c'], criteria: { conditions: [{ fieldName: 'PersonEmail', value: Employee.UserName__c.toLowerCase(), operator: 'equals' }] } };
        const sfQueryResult = await salesforce_1.default.query(query);
        if (!sfQueryResult.success || !sfQueryResult.data.length) {
            return result_1.Result.error(('Employee.login.invalidUser:Invalid username'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        if (sfQueryResult.data[0].Block_Access_to_Employee_Portal__c) {
            return result_1.Result.error(('Employee.login.blockIndividualAccess:Please call Employee Services at 1-888-567-5941.'), enum_1.ErrorCode.unauthorized, undefined, enum_1.StatusCode.unauthorized);
        }
        if (sfQueryResult.data[0].RecordType.Name === 'Inactive Employee') {
            return result_1.Result.error(('Employee.login.inactiveEmployee:Employee is inactive'), enum_1.ErrorCode.invalidData);
        }
        if (sfQueryResult.data[0].RecordType.Name === 'Cancelled Employee') {
            return result_1.Result.error(('Employee.login.CancelledEmployee:Employee is Cancelled'), enum_1.ErrorCode.invalidData);
        }
        if (sfQueryResult.data[0].RecordType.Name === 'Employee Prospect') {
            return result_1.Result.error(('Employee.login.EmployeeProspectNew:Only Ocean Canyon Employees may have access to the Employee Portal.'), enum_1.ErrorCode.invalidData);
        }
        // tslint:disable-next-line: max-line-length
        return result_1.Result.success(sfQueryResult.data[0].JWT_Token__c);
    }
    static async getInfo(context = {}) {
        let query;
        if (!context || !context.Id) {
            return result_1.Result.error(('Employee.getInfo.Required: Requird field is missing '), enum_1.ErrorCode.missingField);
        }
        query = {
            // tslint:disable-next-line:max-line-length
            objType: 'Account', fields: ['Id', 'FirstName', 'LastName', 'Spouse_First_name__c', 'Spouse_Last_Name__c', 'PersonMailingState', 'PersonMailingCity', 'PersonMailingStreet', 'PersonMailingPostalCode', 'Phone', 'PersonMobilePhone', 'PersonEmail', 'Employeeship_Type__c', 'Type', 'Employee_Since__c', 'Contract_no__c', 'RV_Type__c', 'RV_Length__c', 'No_of_Slide_Outs__c', 'Vehicle_Plate__c', 'RV_Electrical__c', 'Equiant_Account_No__c', 'Dues_Annual_Amount_Billed__c', 'Dues_Current_Balance__c', 'Dues_Past_Due_Amount__c', 'Dues_Days_Delinquent__c', 'Dues_Next_Bill_Due_Date__c', 'Equiant_Loan_No__c', 'Loan_Date__c', 'Loan_Amount__c', 'Loan_Current_Balance__c', 'Loan_Regular_Payment_Amount__c', 'Loan_Next_Payment_Date__c', 'Loan_No_Paymnts_Left__c', 'Employeeship_Type__r.RV_Site_Days_Advance_Reserve__c', 'Employeeship_Type__r.Max_Days_In__c', 'Employeeship_Type__r.Name', 'State_Vehicle_Plate__c', 'Employeeship_Type__r.Can_Make_Active_Reservation_From_Portal__c', 'Employeeship_Type__r.Can_Make_Request_Reservation_From_Portal__c', 'Dues_Data_Current_as_of__c'],
            criteria: { conditions: [{ fieldName: 'Id', value: context.Id, operator: 'equals' }] }
        };
        const result = await salesforce_1.default.query(query);
        if (!result.success || !result.data.length) {
            return result_1.Result.error(('Employee.getInfo.EmployeeNotFound:Employee not found'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        query = {
            objType: 'Employee_Associate_Guest_Reciprocal__c',
            fields: ['name', 'Id'],
            criteria: {
                conditions: [
                    { fieldName: 'Employee__c', value: result.data[0].Id, operator: 'equals' },
                    { fieldName: 'Active__c', value: true, operator: 'equals' },
                    { fieldName: 'Suspend__c', value: false, operator: 'equals' }
                ],
                evaluationCriteria: 'custom', evaluation: '1 and 2 and 3'
            }
        };
        const EmployeeGuest = await salesforce_1.default.query(query);
        if (!EmployeeGuest.success) {
            return result_1.Result.error(('Employee.getInfo.EmployeeGuest:Employee Guest not found'), enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.notFound);
        }
        if (result.data && result.data.length) {
            result.data.forEach((record) => {
                if (record.Employeeship_Type__r) {
                    record.RV_Site_Days_Advance_Reserve__c = record.Employeeship_Type__r['RV_Site_Days_Advance_Reserve__c'];
                    record.Max_Days_In__c = record.Employeeship_Type__r['Max_Days_In__c'];
                    record.EmployeeshipType = record.Employeeship_Type__r['Name'];
                    record.Can_Make_Active_Reservation_From_Portal__c = record.Employeeship_Type__r['Can_Make_Active_Reservation_From_Portal__c'];
                    record.Can_Make_Request_Reservation_From_Portal__c = record.Employeeship_Type__r['Can_Make_Request_Reservation_From_Portal__c'];
                    if (!EmployeeGuest.data.length) {
                        record.Employee_Associate_Guest_Reciprocal__r = null;
                    }
                    else {
                        record.Employee_Associate_Guest_Reciprocal__r = EmployeeGuest.data;
                    }
                    delete record['Employeeship_Type__r'];
                }
            });
        }
        result.data = result.data[0];
        result.message = (('Sucessfully retrieved Employee information.'));
        return result;
    }
}
exports.Employee = Employee;
