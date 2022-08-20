"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const result_1 = require("../../src/controller/result");
const enum_1 = require("../helper/enum");
class Util {
    static rootDir() {
        return path_1.default.resolve(__dirname + './../../');
    }
    /**
        * @author          -         Priyanka Shinde
        * @description     -        Method will  validate the password according to password policy.
        * @Date            -        08 Sep 2020
        * @JIRA			   -		RESERVE-1843
        * @param           -        type of password string
        * @static          -        it will indicate
        */
    // public static validatePassword(password: string): Result {
    // 	if (!config.passwordPolicy.regex.test(password)) {
    // 		// tslint:disable-next-line:max-line-length
    // 		return Result.error( ('util.validatePassword:Password does not meet the password policy requirements. Check the minimum and maximun password length and password complexity'), ErrorCode.invalidData);
    // 	}
    // 	return Result.success();
    // }
    /**
        * @author          -        Arifa Shaikh
        * @description     -        Method will  validate arrival and departure date of reservation.
        * @Date            -        08 Sep 2020
        * @JIRA			   -		RESERVE-1843
        * @param           -        type of arrivalDate Date & departureDate Date
        * @static          -        it will indicate
        */
    static validateDate(arrivalDate, departureDate) {
        const date = this.formatDate(new Date(new Date().setHours(0, 0, 0, 0)), 'yyyy-mm-dd');
        let formatDate = date.split('-');
        formatDate = formatDate.reverse();
        const todaysDate = formatDate.join('/');
        if ((new Date(this.formDateNew(departureDate)).setHours(0, 0, 0, 0)) <= (new Date(this.formDateNew(arrivalDate)).setHours(0, 0, 0, 0))) {
            return result_1.Result.error(('util.validateDate.departureDate: Departure Date must be greater than Arrival date.'), enum_1.ErrorCode.invalidData);
        }
        return result_1.Result.success(null, 'date validations done');
    }
    /**
        * @author          -        Arifa Shaikh
        * @description     -        Method will format date  .
        * @Date            -        08 Sep 2020
        * @JIRA			   -		RESERVE-1843
        * @param           -        type of date any
        * @static          -        it will indicate
        */
    static formDate(date) {
        const splitString = date.split('/');
        const reverseArray = splitString.reverse();
        const joinArray = reverseArray.join('-');
        return joinArray;
    }
    static formDateNew(date) {
        const splitString = date.split('/');
        const reverseArray = splitString.reverse();
        const joinArray = reverseArray.join('/');
        return joinArray;
    }
    static changeDateFormat(date) {
        const splitString = date.split('-');
        const joinArray = splitString.join('/');
        return joinArray;
    }
    /**
        * @author          -        Baban Shinde
        * @description     -        Method will format date according to given format.
        * @Date            -        17 Nov 2020
        * @JIRA			   -
        * @param           -        Type of date and format is date and string respectively.
        * @static          -        it will indicate
        */
    static formatDate(date, format) {
        date.setHours(0, 0, 0, 0);
        let month = '' + (date.getMonth() + 1);
        let day = '' + date.getDate();
        const year = date.getFullYear();
        let formatedDate;
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        switch (format) {
            case 'yyyy-mm-dd': {
                formatedDate = year + '-' + month + '-' + day;
                break;
            }
            case 'dd/mm/yyyy': {
                formatedDate = day + '/' + month + '/' + year;
                break;
            }
            case 'yyyy/dd/mm': {
                formatedDate = year + '/' + day + '/' + month;
                break;
            }
            default:
                formatedDate = month + '/' + day + '/' + year;
        }
        return formatedDate;
    }
    /**
    * @author 							Arifa Shaikh
    * @description 					This method will calculate number of days between todays date and given date
    * @Date							10/11/2020
    * @JIRA							RESERVE-1901
    * @static
    * @modifiedby
    * @modifiedon
    * @modifiedDescription
     */
    static async caluclateNumberOfDays(arrivalDate) {
        const todayDate = await this.formatDate(new Date(), 'yyyy-mm-dd');
        const arrivalDateOfReservation = new Date(arrivalDate);
        const todaysDate = new Date(todayDate);
        const result = Math.abs(arrivalDateOfReservation - todaysDate) / 1000;
        const noOfDays = Math.floor(result / 86400);
        return noOfDays;
    }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for days difference.
        * @Date            -        17 Nov 2020
        * @JIRA			   -
        * @param           -        type of date any
        * @static          -        it will indicate
        */
    static daysDiffernce(arrivalDate, departureDate) {
        const ArrivalDate = new Date(this.formDateNew(arrivalDate));
        const DepartureDate = new Date(this.formDateNew(departureDate));
        let diff = (DepartureDate.getTime() - ArrivalDate.getTime()) / 1000;
        diff = diff /= (60 * 60 * 24);
        const daysDiff = Math.abs(Math.round(diff));
        return daysDiff;
    }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for round up value.
        * @Date            -        17 Nov 2020
        * @JIRA			   -
        * @param           -        type of number any
        * @static          -        it will indicate
        */
    static round(number) {
        if (number < 0) {
            return -(Math.round(-number * 100) / 100);
        }
        else {
            return Math.round(number * 100) / 100;
        }
    }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for to check arrival Date is max 3 days greater than today.
        * @Date            -        01 Dec 2020
        * @JIRA			   -
        * @param           -        type of date any
        * @static          -        it will indicate
        */
    static checkArrivalDate(arrivalDate) {
        const afterDate = new Date();
        const ArrivalDate = new Date(this.formDateNew(arrivalDate));
        if (!(ArrivalDate.setHours(0, 0, 0, 0) >= afterDate.setHours(0, 0, 0, 0))) {
            return result_1.Result.error(('util.checkArrivalDate.arrivalDate: Arrival date must be greater than 3 days from today.'), enum_1.ErrorCode.invalidData);
        }
        return result_1.Result.success(null, 'Arrival Date validations done');
    }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for geneate unique Id
        * @Date            -        17 March 2021
        * @JIRA			   -
        * @param           -        type of String
        * @static          -        it will indicate
        */
    static generateId(prefix) {
        const temp = Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
        return prefix + temp.substr(0, 18 - prefix.length);
    }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for convert XML To JSON
        * @Date            -        04 August 2021
        * @JIRA			   -        RESERVE-2019
        * @param           -        Object
        * @static          -        it will indicate
        */
    // public static jsonToXML(jsonObject: any = {}) {
    // 	const formatedObj = this.formatJson(jsonObject);
    // 	const convertKeyObj = this.convertKeys(formatedObj);
    // 	const xmlToJsBuilder = new xml2js.Builder();
    // 	const xmlResponse = xmlToJsBuilder.buildObject(convertKeyObj);
    // 	return xmlResponse;
    // }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for convert JSON key to uppercase
        * @Date            -        5 August 2021
        * @JIRA			   -        RESERVE-2019
        * @param           -        Object
        * @static          -        it will indicate
        */
    static convertKeys(jsonObj = {}) {
        let newObj = {};
        if (Array.isArray(jsonObj)) {
            const newArray = [];
            for (const key in jsonObj) {
                if (jsonObj[key] !== null && typeof (jsonObj[key]) === 'object') {
                    newArray.push(this.convertKeys(jsonObj[key]));
                }
                else {
                    newArray.push(jsonObj[key]);
                }
            }
            newObj = newArray;
        }
        else {
            // tslint:disable-next-line: forin
            for (const key in jsonObj) {
                const newKey = key.toUpperCase();
                if (jsonObj[key] !== null && typeof (jsonObj[key]) === 'object') {
                    newObj[newKey] = this.convertKeys(jsonObj[key]);
                }
                else {
                    newObj[newKey] = jsonObj[key];
                }
            }
        }
        return newObj;
    }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for convert JSON response into USG format response
        * @Date            -        5 August 2021
        * @JIRA			   -        RESERVE-2019
        * @param           -        Object
        * @static          -        it will indicate
        */
    static formatJson(jsonObj = {}) {
        const responseObj = { 'USG': {} };
        let data = {};
        if (jsonObj.hasOwnProperty('data') && (jsonObj['data'] !== undefined) && Object.keys(jsonObj['data']).length > 0) {
            data = jsonObj['data'];
            responseObj['USG'] = Object.assign(responseObj['USG'], data);
        }
        delete jsonObj['data'];
        delete jsonObj['errorCode'];
        delete jsonObj['message'];
        delete jsonObj['success'];
        delete jsonObj['statusCode'];
        responseObj['USG'] = Object.assign(responseObj['USG'], jsonObj);
        return responseObj;
    }
    /**
        * @author          -        Priyanka Shinde
        * @description     -        Method for convert XML response into JSON format
        * @Date            -        20 August 2021
        * @JIRA			   -        RESERVE-2019
        * @param           -        XML String
        * @static          -        it will indicate
        */
    // public static xmlToJson(xml: string = '') {
    // 	let jsonResponse: any = {};
    // 	xml2js.parseString(xml, (error, result) => {
    // 		if (error) {
    // 			throw error;
    // 		}
    // 		jsonResponse = result;
    // 	});
    // 	return jsonResponse;
    // }
    /**
    * @author          -        vivek ranjan
    * @description     -        Method for Trim the unwanted error message.
    * @JIRA			   -        RESERVE-2119
    * @param           -
    * @static          -        it will indicate
    */
    static filterValidationError(message) {
        if (message.includes(':')) {
            message = message.split(":").join(' ');
        }
        if (message.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION')) {
            message = message.split('FIELD_CUSTOM_VALIDATION_EXCEPTION,')[1];
        }
        if (message.includes('[]')) {
            message = message.replace("[]", '');
        }
        return message;
    }
}
exports.default = Util;
Util._rootDir = '';
