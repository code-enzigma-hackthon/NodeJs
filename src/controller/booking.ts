import { Result } from './result';
import { ErrorCode, StatusCode } from '../helper/enum';
import Salesforce from './salesforce'
import { JWT } from './jwt';
require('dotenv').config();


export class Booking {

    public static async book(record: any): Promise<Result> {
        if (!record) {
            return Result.error('Record is missing.', ErrorCode.missingField);
        }
        record['objType'] = 'BookingConfirmation__c'
        const recordUpdated = await Salesforce.save(record);
        if (!recordUpdated.success) {
            return Result.error(recordUpdated.message);
        }
        return recordUpdated;
    }
}