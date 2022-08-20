"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
class Util {
    static rootDir() {
        return path_1.default.resolve(__dirname + './../../');
    }
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
}
exports.default = Util;
Util._rootDir = '';
