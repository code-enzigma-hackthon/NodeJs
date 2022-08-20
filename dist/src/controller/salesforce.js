"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_1 = require("../controller/result");
const enum_1 = require("../helper/enum");
const sf = require('node-salesforce');
require('dotenv').config();
class Salesforce {
    static async connect() {
        try {
            if (!this.con) {
                this.con = await new sf.Connection({
                    loginUrl: process.env.SF_LOGINURL,
                    version: '40.0'
                });
                await this.con.login(process.env.SF_USER, process.env.SF_PASSWORD);
                return result_1.Result.success(this.con);
            }
            return result_1.Result.error(('Salesforce.connect:Connection failed from Salesforce side'));
        }
        catch (error) {
            console.error(error);
            return result_1.Result.error((error.message));
        }
    }
    static async query(query) {
        try {
            await this.connect();
            const criterias = [];
            const keysOfInnerQuery = [];
            let IdInQuery;
            if (query && query.criteria) {
                const criteriaOfQuery = await this.designCriteria(query.criteria);
                if (criteriaOfQuery) {
                    criterias.push(criteriaOfQuery);
                }
            }
            const queryFields = [];
            if (query && query.fields) {
                query.fields.forEach((field) => {
                    if (field !== '_id') {
                        queryFields.push(field);
                    }
                });
                if (!queryFields.includes('Id')) {
                    queryFields.push('Id');
                }
            }
            if (query && query.objType) {
                let preparedQuery = ('SELECT ' + queryFields.join(','));
                if (query.innerQuerys) {
                    for (let index = 0; index < query.innerQuerys.length; index++) {
                        const innerQuery = await this.prepareQuery(query.innerQuerys[index]);
                        if (!innerQuery.success) {
                            return innerQuery;
                        }
                        keysOfInnerQuery.push(query.innerQuerys[index].objType);
                        preparedQuery += ', ' + innerQuery.data;
                    }
                }
                preparedQuery += ' FROM ' + query.objType;
                if (criterias.length > 0) {
                    preparedQuery += (' WHERE ' + criterias.join(' AND '));
                }
                if (query.idIn) {
                    if (query.idIn.objType === query.objType) {
                        return result_1.Result.error(('Salesforce.query.IdIn.sameObjType : The inner and outer selects should not be on the same object type.'), enum_1.ErrorCode.invalidData);
                    }
                    if (query.idIn.fields.length !== 1) {
                        return result_1.Result.error(('Salesforce.query.IdIn.extraFields : Only one field allowed in Id In query.'), enum_1.ErrorCode.invalidData);
                    }
                    if (query.idIn.limit || query.idIn.orderBy) {
                        return result_1.Result.error(('Salesforce.query.IdIn.extraClause : ORDER BY and LIMIT allowed in Id In query.'), enum_1.ErrorCode.invalidData);
                    }
                    const idInQuery = await this.prepareQuery(query.idIn);
                    if (!idInQuery.success) {
                        return idInQuery;
                    }
                    IdInQuery = ' Id IN ' + idInQuery.data;
                    if (criterias.length > 0) {
                        if (query.idIn.outerEvaluationCriteria) {
                            if (query.idIn.outerEvaluationCriteria === enum_1.Evaluation.or) {
                                preparedQuery += ' OR ' + IdInQuery;
                            }
                            else if (query.idIn.outerEvaluationCriteria === enum_1.Evaluation.and) {
                                preparedQuery += ' AND ' + IdInQuery;
                            }
                            else {
                                return result_1.Result.error(('Salesforce.query.IdIn.invalidEvaluation : Invalid Evaluation Criteria in Id In query.'), enum_1.ErrorCode.invalidData);
                            }
                        }
                        else {
                            preparedQuery += ' AND ' + IdInQuery;
                        }
                    }
                    else {
                        preparedQuery += ' WHERE ' + IdInQuery;
                    }
                }
                if ((query.orderBy && Object.keys(query.orderBy).length > 0)) {
                    preparedQuery += this.mergeSortProperty(query.orderBy);
                }
                if (query.limit) {
                    preparedQuery += (' LIMIT ' + query.limit);
                }
                if (query.offset) {
                    preparedQuery += (' OFFSET ' + query.offset);
                }
                const result = await this.con.query(preparedQuery);
                if (query.innerQuerys) {
                    for (let j = 0; j < keysOfInnerQuery.length; j++) {
                        for (let i = 0; i < result.records.length; i++) {
                            if (result.records[i][keysOfInnerQuery[j]] && result.records[i][keysOfInnerQuery[j]].records) {
                                const childRecord = this.preparedSalesforceQueryResponse(result.records[i][keysOfInnerQuery[j]].records, keysOfInnerQuery[j]);
                                result.records[i][keysOfInnerQuery[j]] = childRecord;
                            }
                        }
                    }
                }
                return result_1.Result.success(this.preparedSalesforceQueryResponse(result.records, query.objType));
            }
            return result_1.Result.error(('Salesforce.query : Required field objType missing'), enum_1.ErrorCode.missingField);
        }
        catch (error) {
            return result_1.Result.error((error.message), enum_1.ErrorCode.invalidData);
        }
    }
    static mergeSortProperty(data = {}) {
        const arrPreparedConditions = [];
        // tslint:disable-next-line: forin
        for (const fieldName in data) {
            const value = data[fieldName];
            const preparedCondition = fieldName + ' ' + value.toUpperCase();
            arrPreparedConditions.push(preparedCondition);
        }
        return ' ORDER By ' + arrPreparedConditions.join(',');
    }
    static designCriteria(criteria) {
        if (criteria) {
            const context = this;
            // tslint:disable-next-line: prefer-const
            let user;
            const mapOperators = { 'equals': '=', 'not equals': '!=', 'less than': '<', 'greater than': '>', 'less than equal to': '<=', 'greater than equal to': '>=' };
            const arrPreparedConditions = [];
            criteria = JSON.parse(JSON.stringify(criteria));
            if (criteria.conditions && criteria.conditions.length) {
                // criteria.conditions.forEach(function (condition: any) {
                for (const condition of criteria.conditions) {
                    if (condition && condition.fieldName) {
                        let preparedCondition = '';
                        if (typeof condition.value === enum_1.Operator.boolean || Date.parse(condition.value)) {
                            preparedCondition = (condition.fieldName + ' ' + mapOperators[condition.operator] + ' ' + condition.value);
                        }
                        else if (condition.operator === enum_1.Operator.contains) {
                            preparedCondition = `(${condition.fieldName} LIKE '%${condition.value}%' )`;
                        }
                        else if (condition.operator === enum_1.Operator.startsWith) {
                            preparedCondition = `(${condition.fieldName} LIKE '${condition.value}%' )`;
                        }
                        else if (condition.operator === enum_1.Operator.endsWith) {
                            preparedCondition = `(${condition.fieldName} LIKE '%${condition.value}' )`;
                        }
                        else if (condition.operator === enum_1.Operator.match) {
                            preparedCondition = `(${condition.fieldName} LIKE '${condition.value}' )`;
                        }
                        else {
                            preparedCondition = (condition.fieldName + ' ' + mapOperators[condition.operator] + ' \'' + condition.value + '\'');
                        }
                        arrPreparedConditions.push(preparedCondition);
                    }
                }
            }
            let evaluation = '';
            if (criteria.evaluationCriteria === enum_1.Evaluation.and) {
                evaluation = arrPreparedConditions.join(' AND ');
            }
            else if (criteria.evaluationCriteria === enum_1.Evaluation.or) {
                evaluation = arrPreparedConditions.join(' OR ');
            }
            else if (criteria.evaluationCriteria === enum_1.Evaluation.custom) {
                const evalutionCriteria = criteria.evaluation;
                for (let index = 0; index < evalutionCriteria.length; index++) {
                    // tslint:disable-next-line: triple-equals
                    if (isNaN(evalutionCriteria[index]) || evalutionCriteria[index] == ' ') {
                        evaluation = evaluation + evalutionCriteria[index];
                    }
                    else {
                        // tslint:disable-next-line: radix
                        if (arrPreparedConditions[parseInt(evalutionCriteria[index]) - 1]) {
                            // tslint:disable-next-line: radix
                            evaluation = evaluation + arrPreparedConditions[parseInt(evalutionCriteria[index]) - 1];
                        }
                    }
                }
            }
            else {
                evaluation = arrPreparedConditions;
            }
            if (evaluation !== '') {
                return ('(' + evaluation + ')');
            }
        }
    }
    static async save(records) {
        try {
            await this.connect();
            const mapRecords = { 'insert': {}, 'update': {} };
            let result;
            if (!Array.isArray(records)) {
                records = [records];
            }
            records.forEach(function (record) {
                const event = record.hasOwnProperty('Id') ? 'update' : 'insert';
                if (!mapRecords[event].hasOwnProperty(record.objType)) {
                    mapRecords[event][record.objType] = [];
                }
                mapRecords[event][record.objType].push(record);
            });
            let retRecords = [];
            if (Object.keys(mapRecords.insert).length > 0) {
                result = await this.modify(mapRecords.insert, enum_1.Event.insert);
                if (result.success) {
                    retRecords = retRecords.concat(result.data);
                }
                else {
                    return result_1.Result.error((result.message), enum_1.ErrorCode.invalidData);
                }
            }
            if (Object.keys(mapRecords.update).length > 0) {
                result = await this.modify(mapRecords.update, enum_1.Event.update);
                if (result.success) {
                    retRecords.push(result.data);
                }
                else {
                    return result_1.Result.error((result.message), enum_1.ErrorCode.invalidData);
                }
            }
            return result;
        }
        catch (error) {
            return result_1.Result.error((error.message), enum_1.ErrorCode.invalidData);
        }
    }
    static async modify(mapRecords, event, datasource) {
        try {
            let result = [];
            const fields = [];
            // tslint:disable-next-line: forin
            for (const objectName in mapRecords) {
                const encryptedRecords = this.preparedSalesforceQueryRequest(mapRecords[objectName]);
                for (const field of Object.keys(encryptedRecords[0])) {
                    fields.push(field);
                }
                const objectFieldInfo = await Salesforce.describeObject(objectName, fields);
                for (const field of objectFieldInfo.data[objectName].schema) {
                    if (field.hasOwnProperty('type') && (field['type'] === 'date' || field['type'] === 'datetime') && encryptedRecords[0][field['name']] != null) {
                        const dateParts = encryptedRecords[0][field['name']].split(' ');
                        encryptedRecords[0][field['name']] = dateParts[0].split('/').reverse().join('-');
                        if (dateParts[1]) {
                            encryptedRecords[0][field['name']] = encryptedRecords[0][field['name']] + ' ' + dateParts[1] + ' ' + dateParts[2];
                        }
                        encryptedRecords[0][field['name']] = new Date(encryptedRecords[0][field['name']]);
                    }
                }
                if (encryptedRecords && encryptedRecords.length > 0) {
                    let response;
                    if (event === enum_1.Event.insert) {
                        response = await this.con.sobject(objectName).create(encryptedRecords);
                        response = this.preparedSalesforceQueryResponse(response, objectName);
                    }
                    else if (event === enum_1.Event.update) {
                        response = await this.con.sobject(objectName).update(encryptedRecords);
                        response = this.preparedSalesforceQueryResponse(response, objectName);
                    }
                    result = result.concat(response);
                }
            }
            return result_1.Result.success(result);
        }
        catch (error) {
            return result_1.Result.error((error.message));
        }
    }
    static preparedSalesforceQueryRequest(records) {
        records.forEach((record) => {
            delete record['_id'];
            delete record['objType'];
        });
        return records;
    }
    static preparedSalesforceQueryResponse(records, objectName) {
        records.forEach((record) => {
            record['objType'] = objectName;
            delete record['attributes'];
        });
        return records;
    }
    static async delete(records) {
        try {
            await this.connect();
            if (!Array.isArray(records)) {
                records = [records];
            }
            const mapRecords = {};
            records.forEach(function (record) {
                if (!mapRecords.hasOwnProperty(record.objType)) {
                    mapRecords[record.objType] = [];
                }
                mapRecords[record.objType].push(record.Id);
            });
            const result = [];
            // tslint:disable-next-line: forin
            for (const objectName in mapRecords) {
                let response;
                if (mapRecords[objectName] && mapRecords[objectName].length > 0) {
                    response = await this.con.sobject(objectName).del(mapRecords[objectName]);
                }
                response.forEach(function (resp) {
                    if (resp.success) {
                        result.push(result_1.Result.success(resp.id));
                    }
                    else {
                        result.push(result_1.Result.error((resp.message), enum_1.ErrorCode.invalidData));
                    }
                });
            }
            return result_1.Result.success(result);
        }
        catch (error) {
            return result_1.Result.error((error.message), enum_1.ErrorCode.invalidData);
        }
    }
    static async prepareQuery(innerQuery) {
        if (!innerQuery.objType) {
            return result_1.Result.error(('salesforce.prepareQuery.missingObject:Please provide inner object or relationship Name'), enum_1.ErrorCode.missingField);
        }
        if (!innerQuery.fields) {
            return result_1.Result.error(('salesforce.prepareQuery.missingFields:Please provide inner object Fields.'), enum_1.ErrorCode.missingField);
        }
        if (innerQuery.offset) {
            return result_1.Result.error(('salesforce.prepareQuery.offset:Offset not allowed in inner query.'), enum_1.ErrorCode.missingField);
        }
        const innerQueryCriterias = [];
        const innerQueryFields = [];
        let preparedQuery;
        if (innerQuery.criteria) {
            const criteriaOfInnerQuery = await this.designCriteria(innerQuery.criteria);
            if (criteriaOfInnerQuery) {
                innerQueryCriterias.push(criteriaOfInnerQuery);
            }
        }
        if (innerQuery.fields) {
            innerQuery.fields.forEach((field) => {
                if (field !== '_id') {
                    innerQueryFields.push(field);
                }
            });
        }
        preparedQuery = ('( SELECT ' + innerQueryFields.join(',') + ' FROM ' + innerQuery.objType);
        if (innerQueryCriterias.length > 0) {
            preparedQuery += (' WHERE ' + innerQueryCriterias.join(' AND '));
        }
        if (innerQuery.orderBy && Object.keys(innerQuery.orderBy).length > 0) {
            preparedQuery += this.mergeSortProperty(innerQuery.orderBy);
        }
        if (innerQuery.limit) {
            preparedQuery += (' LIMIT ' + innerQuery.limit);
        }
        preparedQuery += ')';
        return result_1.Result.success(preparedQuery);
    }
    static async describeObject(objects, fields) {
        try {
            await this.connect();
            const isArray = Array.isArray(objects);
            if (!isArray) {
                objects = [objects];
            }
            const mapFields = {};
            // tslint:disable-next-line: forin
            for (const iIndex in objects) {
                const result = await this.con.describe(objects[iIndex]);
                const constructedFields = [];
                if (fields && fields.length > 0) {
                    result.fields.forEach(function (field) {
                        if (fields.includes(field.name)) {
                            constructedFields.push(field);
                        }
                    });
                }
                else {
                    result.fields.forEach(function (field) {
                        constructedFields.push(field);
                    });
                }
                mapFields[objects[iIndex]] = { name: objects[iIndex], schema: constructedFields };
            }
            return result_1.Result.success(mapFields);
        }
        catch (error) {
            return result_1.Result.error((error.message), enum_1.ErrorCode.invalidData);
        }
    }
}
exports.default = Salesforce;
