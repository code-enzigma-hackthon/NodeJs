export enum ApiMethod {
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	GET = 'GET'
}

export enum ErrorCode {
	none = 'none',
	missingFeature = 'missingFeature',
	missingField = 'missingField',
	invalidData = 'invalidData',
	forbidden = 'forbidden',
	unauthorized = 'unauthorized'
}

export enum StatusCode {
	ok = 200,
	badRequest = 400,
	unauthorized = 401,
	notFound = 404,
	internalServerError = 500,
	forbidden = 403
}
export enum Evaluation {
	and = 'and',
	or = 'or',
	custom = 'custom'
}

export enum Operator {
	equals = '=',
	notEquals = '!=',
	greaterThan = '>',
	lessThan = '<',
	greaterOrEqual = '>=',
	lessOrEqual = '<=',
	in = 'in',
	contains = 'contains',
	notIn = 'notIn',
	startsWith = 'starts with',
	endsWith = 'ends with',
	match = 'match',
	boolean = 'boolean'
}

export enum Datasource {
	salesforce = 'salesforce',
	azure = 'azure'
}

export enum ReservationStatus {
	current = 'current',
	history = 'history',
	Request = 'Request',
	Active = 'Active'
}

export enum Event {
	insert = 'insert',
	update = 'update'
}
