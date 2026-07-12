import type { TagRef } from './tags';

export type EntryType = 'wish' | 'pain';

export type Category =
	| 'governance'
	| 'health'
	| 'transport'
	| 'education'
	| 'housing'
	| 'economy'
	| 'environment'
	| 'digital'
	| 'cost'
	| 'safety'
	| 'other';

export interface Entry {
	id: string;
	type: EntryType;
	text: string;
	category: Category;
	votes: number;
	month_year: string;
	created_at: number;

	author_name?: string | null;

	user_id?: string | null;

	image_key?: string | null;

	comment_count?: number;

	user_voted?: boolean;

	hidden?: number;

	tags?: TagRef[];
}

export interface Comment {
	id: string;
	entry_id: string;
	user_id?: string | null;
	author_name: string;
	body: string;
	created_at: number;
	hidden?: number;
}

export interface SessionUser {
	id: string;
	username: string;
	display_name: string;
	avatar_url?: string | null;
	is_admin?: boolean;
}

export interface CategoryMeta {
	value: Category;
	label: string;

	short: string;

	color: string;
}

export const CATEGORIES: CategoryMeta[] = [
	{ value: 'governance',  label: 'Governance & Corruption', short: 'Governance',  color: '#f4714e' },
	{ value: 'health',      label: 'Healthcare',              short: 'Health',      color: '#12b76a' },
	{ value: 'transport',   label: 'Transport & Ferries',     short: 'Transport',   color: '#4d8bf6' },
	{ value: 'education',   label: 'Education',               short: 'Education',   color: '#8b5cf6' },
	{ value: 'housing',     label: 'Housing & Land',          short: 'Housing',     color: '#f59e0b' },
	{ value: 'economy',     label: 'Economy & Jobs',          short: 'Economy',     color: '#0ea5e9' },
	{ value: 'environment', label: 'Environment',             short: 'Environment', color: '#10b981' },
	{ value: 'digital',     label: 'Digital & Gov Services',  short: 'Digital',     color: '#6d5efc' },
	{ value: 'cost',        label: 'Cost of Living',          short: 'Cost',        color: '#ef4444' },
	{ value: 'safety',      label: 'Safety & Justice',        short: 'Safety',      color: '#e11d76' },
	{ value: 'other',       label: 'Other',                   short: 'Other',       color: '#64748b' }
];

export const CATEGORY_VALUES: Category[] = CATEGORIES.map((c) => c.value);

export function categoryMeta(value: string): CategoryMeta {
	return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}
