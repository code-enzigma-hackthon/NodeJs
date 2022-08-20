import { ErrorCode, StatusCode } from '../helper/enum';

export class Result {
	constructor(
		public data?: any,
		public message: string = '',
		public statusCode?: StatusCode,
		public errorCode?: ErrorCode,
		public success: boolean = false
	) { }

	public static success(data?: any, message?: string, statusCode: StatusCode = StatusCode.ok): any {
		return new Result(data, message, statusCode, undefined, true);
	}

	public static error(message: string, errorCode: ErrorCode = ErrorCode.none, data?: any, statusCode: StatusCode = StatusCode.ok): any {
		return new Result(data, message, statusCode, errorCode, false);
	}
}
export default Result;
