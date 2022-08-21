import { JWT } from './jwt';
import { Result } from './result';
import { ErrorCode, StatusCode } from '../helper/enum';
import Salesforce from './salesforce';

export class Authenticate {
	public static async authenticateRequest(request: any): Promise<Result> {
		let query: any;
		const authHeader = request.headers['authorization'];
		const verificationToken = authHeader && authHeader.split(' ')[1];

		if ( verificationToken === '' || !verificationToken ) {
			return Result.error('JWT token is required.', ErrorCode.missingField);
		}

		const result = await JWT.decrypt(verificationToken);
		if (!result.success) {
			return result;
		}

		query = { objType: 'Account', fields: ['name', 'Id', 'JWT_Token__c'], criteria: { conditions: [{ fieldName: 'Email_id__c', value: result.data.Email_id__c.toLowerCase(), operator: 'equals' }] } };
		const sfQueryResult = await Salesforce.query(query);
		if (!sfQueryResult.success || !sfQueryResult.data.length) {
			return Result.error(('Invalid username.' ), ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
		if (sfQueryResult.data[0].JWT_Token__c !== verificationToken) {
			return Result.error('Token not matches with request token.', ErrorCode.invalidData, undefined, StatusCode.notFound);
		}
		const context = {
			token: sfQueryResult.data[0].JWT_Token__c,
			Id: sfQueryResult.data[0].Id,
			objType: sfQueryResult.data[0].objType
		};
		return Result.success(context);
	}
}
