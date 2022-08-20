import { Result } from './result';
import { ErrorCode, StatusCode } from '../helper/enum';
import Salesforce from './salesforce'
import { JWT } from './jwt';
require('dotenv').config();

export class Employee {

	public static async register(req: any): Promise<Result> {
		if (!req.body) {
			return Result.error('Request body is missing.', ErrorCode.missingField);
		}
		if (!req.body.Email_id__c || req.body.Email_id__c === '') {
			return Result.error('Please provide the username.', ErrorCode.missingField);
		}
		if (!req.body.Password__c || req.body.Password__c === '') {
			return Result.error('Please provide the password.', ErrorCode.missingField);
		}
		const query :any = { objType: 'Account', fields: ['name', 'Id', 'Email_id__c', 'Block_Access_to_Employee_Portal__c'], criteria: { conditions: [{ fieldName: 'Email_id__c', value: req.body.Email_id__c.toLowerCase(), operator: 'equals' }] } };
		const sfQueryResult = await Salesforce.query(query);
		if (!sfQueryResult.success || !sfQueryResult.data.length) {
			return Result.error('Enter the email ID provided while purchasing a Employeeship.', ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
		if (sfQueryResult.data[0].Block_Access_to_Employee_Portal__c) {
			return Result.error('Access Denied.', ErrorCode.unauthorized, undefined , StatusCode.unauthorized);
		}
		const record = {
			Id: sfQueryResult.data[0].Id,
			objType: 'Account',
			Conference_Portal_Status__c: 'Registered'
		};
		const recordUpdated = await Salesforce.save(record);
		if (!recordUpdated.success) {
			return Result.error( ('Fail to update Employee portal status to "Registered".'));
		}
		const Employee = {
			Email_id__c: req.body.Email_id__c.toLowerCase(),
			Password__c: req.body.Password__c
		};
		const loginToken: Result = await this.login(Employee);
		return loginToken;
	}

	public static async login(employee: any = {}): Promise<Result> {
		if (!employee.Email_id__c || employee.Email_id__c === '') {
			return Result.error( ('Please enter your username.'), ErrorCode.missingField);
		}
		if (!employee.Password__c || employee.Password__c === '') {
			return Result.error( ('Please enter your Password.'), ErrorCode.missingField);
		}
		const verifyResult :any = await Employee.verifyEmail(employee.Email_id__c);
		if (!verifyResult.success || !verifyResult.data.length) {
			return verifyResult;
		}
		return Result.success(verifyResult.data);
	}

	public static async getInfo(context: any = {}): Promise<Result> {
		let query: any;
		if (!context || !context.Id) {
			return Result.error( ('Requird field is missing.'), ErrorCode.missingField);
		}
		query = {
			objType: 'Account', fields: ['Id', 'Email_id__c', 'FirstName', 'LastName', 'PersonMailingState', 'PersonMailingCity', 'PersonMailingStreet', 'PersonMailingPostalCode', 'Phone', 'PersonMobilePhone'],
			criteria: { conditions: [{ fieldName: 'Id', value: context.Id, operator: 'equals' }] }
		};
		const result = await Salesforce.query(query);
		if (!result.success || !result.data.length) {
			return Result.error( ('Employee not found.'), ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
		result.data = result.data[0];
		result.message = ('Sucessfully retrieved Employee information.');
		return result;
	}

	public static async verifyEmail(Email_id__c: string): Promise<Result> {
		let query: any;
		if (!Email_id__c || Email_id__c === '') {
			return Result.error('Please enter your username.', ErrorCode.missingField);
		}
		query = { objType: 'Account', fields: ['Id', 'Email_id__c', 'Block_Access_to_Employee_Portal__c'], criteria: { conditions: [{ fieldName: 'Email_id__c', value: Email_id__c.toLowerCase(), operator: 'equals' }] } };
		const sfQueryResult = await Salesforce.query(query);
		if (!sfQueryResult.success || !sfQueryResult.data.length) {
			return Result.error('Enter the email ID provided while purchasing a Employeeship.', ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
		if (sfQueryResult.data[0].Block_Access_to_Employee_Portal__c) {
			return Result.error('Please call Employee Services at 1-888-567-5941.', ErrorCode.unauthorized, undefined , StatusCode.unauthorized);
		}
		const encryptToken: Result = await JWT.encrypt({ 'Email_id__c': Email_id__c.toLowerCase(), tokenExpires: true, Id: sfQueryResult.data[0].Id });
		if (!encryptToken.success) {
			return Result.error('Error in the encryption of token.', ErrorCode.invalidData, undefined, StatusCode.unauthorized);
		}
		const record: any = {
			Id: sfQueryResult.data[0].Id,
			objType: sfQueryResult.data[0].objType,
			JWT_Token__c: encryptToken.data
		};
		const result = await Salesforce.save(record);
		if (!result.success) {
			return Result.error('Fail to update employee.');
		}
		result.data = encryptToken.data;
		return result;
	}
}
