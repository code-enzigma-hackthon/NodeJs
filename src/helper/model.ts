import { Evaluation, Operator } from './enum';
export class Query {
	constructor(
		public objType: string | undefined,
		public fields?: string[] | undefined,
		public criteria?: Criteria | undefined,
		public orderBy?: { [key: string]: boolean } | undefined,
		public limit?: number | undefined,
		public offset?: number | undefined,
		public innerQuerys?: any | undefined,
		public idIn?: any | undefined
	) { }
}

export class Criteria {
	constructor(
		public conditions: Condition[],
		public evaluationCriteria?: Evaluation,
		public evaluation?: string) { }
}

export class Condition {
	constructor(
		public fieldName: string,
		public operator: Operator,
		public value: string,
	) { }
}

