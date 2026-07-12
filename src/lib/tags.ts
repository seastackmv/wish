// Isomorphic tag helpers - safe to import on both client and server.

export interface TagRef {
	id: string; // url-safe slug, used as the tag's primary key and in ?tag= links
	label: string; // human display label
}

export interface TagSummary extends TagRef {
	count: number;
}

export const MAX_TAGS = 5;
export const MAX_TAG_LEN = 30;

/**
 * Turn a free-typed tag into a url-safe slug. Unicode letters/numbers are
 * kept (so Dhivehi/other scripts still produce a usable slug); everything
 * else collapses to a single hyphen.
 */
export function slugifyTag(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFKC')
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, MAX_TAG_LEN);
}

/** Trim + collapse whitespace and cap length for the display label. */
export function cleanTagLabel(input: string): string {
	return input.replace(/\s+/g, ' ').trim().slice(0, MAX_TAG_LEN);
}

/**
 * Normalize an arbitrary list of raw tag strings into unique, valid TagRefs,
 * preserving input order and capping at MAX_TAGS. Anything that slugifies to
 * empty (e.g. only punctuation) is dropped.
 */
export function normalizeTags(raw: unknown): TagRef[] {
	if (!Array.isArray(raw)) return [];
	const seen = new Set<string>();
	const out: TagRef[] = [];
	for (const item of raw) {
		if (typeof item !== 'string') continue;
		const label = cleanTagLabel(item);
		const id = slugifyTag(label);
		if (!id || seen.has(id)) continue;
		seen.add(id);
		out.push({ id, label });
		if (out.length >= MAX_TAGS) break;
	}
	return out;
}

/** Safely parse the JSON tag array produced by json_group_array in SQL. */
export function parseTagsJson(json: unknown): TagRef[] {
	if (typeof json !== 'string' || !json) return [];
	try {
		const arr = JSON.parse(json);
		if (!Array.isArray(arr)) return [];
		return arr
			.filter((t) => t && typeof t.id === 'string' && typeof t.label === 'string')
			.map((t) => ({ id: t.id as string, label: t.label as string }));
	} catch {
		return [];
	}
}
