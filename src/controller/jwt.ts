import { Result } from './result';
const jwt = require('jsonwebtoken');
import { ErrorCode, StatusCode } from '../helper/enum';
require('dotenv').config();

export class JWT {

	public static encrypt(userInfo: any = {}): Promise<Result>  {
		if (userInfo.Email_id__c === '' || !userInfo.Email_id__c) {
			return Result.error('Please provide the username!.');
		}
		if (userInfo.tokenExpires) {
			const result: string = jwt.sign(userInfo, process.env.JWT_PRIVATEKEY, { 'expiresIn': process.env.REG_LINK_EXPIRY_TIME });
			return Result.success(result);
		} else {
			const result: string = jwt.sign(userInfo, process.env.JWT_PRIVATEKEY);
			return Result.success(result);
		}
	}

	public static decrypt(jwtToken: string): Promise<Result>  {
		try {
			const decryptrdToken = jwt.verify(jwtToken, process.env.JWT_PRIVATEKEY);
			return Result.success(decryptrdToken);
		} catch (err) {
			return Result.error('Token has expired', ErrorCode.invalidData, undefined, StatusCode.unauthorized);
		}
	}
}
