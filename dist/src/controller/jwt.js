"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
const result_1 = require("./result");
const jwt = require('jsonwebtoken');
const enum_1 = require("../helper/enum");
require('dotenv').config();
class JWT {
    static encrypt(userInfo = {}) {
        if (userInfo.Email_id__c === '' || !userInfo.Email_id__c) {
            return result_1.Result.error('Please provide the username!.');
        }
        if (userInfo.tokenExpires) {
            const result = jwt.sign(userInfo, process.env.JWT_PRIVATEKEY, { 'expiresIn': process.env.REG_LINK_EXPIRY_TIME });
            return result_1.Result.success(result);
        }
        else {
            const result = jwt.sign(userInfo, process.env.JWT_PRIVATEKEY);
            return result_1.Result.success(result);
        }
    }
    static decrypt(jwtToken) {
        try {
            const decryptrdToken = jwt.verify(jwtToken, process.env.JWT_PRIVATEKEY);
            return result_1.Result.success(decryptrdToken);
        }
        catch (err) {
            return result_1.Result.error('Token has expired', enum_1.ErrorCode.invalidData, undefined, enum_1.StatusCode.unauthorized);
        }
    }
}
exports.JWT = JWT;
