"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Condition = exports.Criteria = exports.Query = void 0;
class Query {
    constructor(objType, fields, criteria, orderBy, limit, offset, innerQuerys, idIn) {
        this.objType = objType;
        this.fields = fields;
        this.criteria = criteria;
        this.orderBy = orderBy;
        this.limit = limit;
        this.offset = offset;
        this.innerQuerys = innerQuerys;
        this.idIn = idIn;
    }
}
exports.Query = Query;
class Criteria {
    constructor(conditions, evaluationCriteria, evaluation) {
        this.conditions = conditions;
        this.evaluationCriteria = evaluationCriteria;
        this.evaluation = evaluation;
    }
}
exports.Criteria = Criteria;
class Condition {
    constructor(fieldName, operator, value) {
        this.fieldName = fieldName;
        this.operator = operator;
        this.value = value;
    }
}
exports.Condition = Condition;
