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
		if (!req.body.User_Password__c || req.body.User_Password__c === '') {
			return Result.error('Please provide the password.', ErrorCode.missingField);
		}
		const query :any = { objType: 'Account', fields: ['name', 'Id', 'Email_id__c'], criteria: { conditions: [{ fieldName: 'Email_id__c', value: req.body.Email_id__c.toLowerCase(), operator: 'equals' }] } };
		const sfQueryResult = await Salesforce.query(query);
		if (!sfQueryResult.success || !sfQueryResult.data.length) {
			return Result.error('Authentication Failed', ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
	
		const record = {
			Id: sfQueryResult.data[0].Id,
			objType: 'Account',
			Conference_Portal_Status__c: 'Registered',
			Employee_Id__c: req.body.Employee_Id__c,
			User_Password__c : req.body.User_Password__c
		};
		const recordUpdated = await Salesforce.save(record);
		if (!recordUpdated.success) {
			return Result.error(recordUpdated.message);
		}
		const Employee = {
			Email_id__c: req.body.Email_id__c.toLowerCase(),
			User_Password__c: req.body.User_Password__c
		};
		const loginToken: Result = await this.login(Employee);
		return loginToken;
	}

	public static async login(employee: any = {}): Promise<Result> {
		if (!employee.Email_id__c || employee.Email_id__c === '') {
			return Result.error( ('Please enter your username.'), ErrorCode.missingField);
		}
		if (!employee.User_Password__c || employee.User_Password__c === '') {
			return Result.error( ('Please enter your Password.'), ErrorCode.missingField);
		}
		const verifyResult :any = await Employee.verifyEmail(employee.Email_id__c, employee.User_Password__c);
		if (!verifyResult.success || !verifyResult.data.length) {
			return verifyResult;
		}
		return Result.success(verifyResult.data);
	}

	public static async getInfo(): Promise<Result> {
		let query: any;

		query = {
			objType: 'Floor__c', fields: ['Id', 'Name'],
			innerQuerys : [
				{
					objType: 'Conference_rooms__r',
					fields: ['Id', 'Status__c', 'Charges__c', 'Name', 'No_Of_Seats__c', 'Type__c']
				},
			]
		}; 
		const result = await Salesforce.query(query);
		if (!result.success || !result.data.length) {
			return Result.error( ('Floor not found.'), ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
		result.data = result.data;
		result.message = ('Sucessfully retrieved Floor information.');
		return result;
	}

	public static async verifyEmail(Email_id__c: string , User_Password__c: string): Promise<Result> {
		let query: any;
		if (!Email_id__c || Email_id__c === '') {
			return Result.error('Please enter your username.', ErrorCode.missingField);
		}
		query = { objType: 'Account', fields: ['Id', 'Email_id__c'], criteria: { conditions: [{ fieldName: 'Email_id__c', value: Email_id__c.toLowerCase(), operator: 'equals' }] } };
		const sfQueryResult = await Salesforce.query(query);
		if (!sfQueryResult.success || !sfQueryResult.data.length) {
			return Result.error('Authentication Failed', ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
		if(sfQueryResult.data[0].User_Password__c === User_Password__c) {
			return Result.error('Password not matched.', ErrorCode.invalidData, undefined, StatusCode.notFound);
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
