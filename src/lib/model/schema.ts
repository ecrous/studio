export type FieldKind =
	| "text"
	| "email"
	| "integer"
	| "decimal"
	| "currency"
	| "boolean"
	| "date"
	| "datetime"
	| "select"
	| "lifecycle";

export interface FieldDef {
	type: FieldKind;
	required?: boolean;
	options?: string[];
	min?: number;
	max?: number;
	maxLength?: number;
	lifecycle?: string;
}

export interface StateDef {
	name: string;
}

export interface TransitionDef {
	from: string;
	to: string;
	guard?: ConditionDef;
}

export interface LifecycleDef {
	initial: string;
	states: string[];
	transitions: TransitionDef[];
}

export interface ConditionDef {
	field: string;
	op:
		| "eq"
		| "neq"
		| "gt"
		| "gte"
		| "lt"
		| "lte"
		| "in"
		| "not_in"
		| "is_set"
		| "is_null";
	value?: unknown;
}

export type RelationshipKind = "belongs_to" | "has_one" | "has_many";

export interface RelationshipDef {
	kind: RelationshipKind;
	target: string;
	foreignKey?: string;
}

export type ActionKind = "create" | "read" | "update" | "delete";

export interface PermissionsDef {
	create?: string[];
	read?: string[];
	update?: string[];
	delete?: string[];
}

export interface InvariantDef {
	name: string;
	condition: ConditionDef;
}

export interface EntityDef {
	fields: Record<string, FieldDef>;
	lifecycles?: Record<string, LifecycleDef>;
	relationships?: Record<string, RelationshipDef>;
	permissions?: PermissionsDef;
	invariants?: InvariantDef[];
}

export interface SystemConfig {
	name: string;
	database: "postgres";
	auth: boolean;
	roles: string[];
	tenancy: {
		enabled: boolean;
	};
}

export interface Model {
	version: number;
	system: SystemConfig;
	entities: Record<string, EntityDef>;
}
