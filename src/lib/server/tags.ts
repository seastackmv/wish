import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import type { TagRef, TagSummary } from '$lib/tags';

/**
 * SQL fragment that aggregates an entry's tags into a JSON array. The outer
 * query MUST alias the entries table as `e`. Pair with parseTagsJson() when
 * reading the `tags_json` column back.
 */
export const TAGS_SELECT = `COALESCE((
	SELECT json_group_array(json_object('id', t.id, 'label', t.label))
	FROM entry_tags et JOIN tags t ON t.id = et.tag_id
	WHERE et.entry_id = e.id
), '[]') AS tags_json`;

/**
 * Build the statements that persist an entry's tags: upsert each tag into the
 * canonical table (first label wins) and link it to the entry. Meant to be
 * spread into the same db.batch() that inserts the entry.
 */
export function tagWriteStatements(
	db: D1Database,
	entryId: string,
	tags: TagRef[],
	now: number
): D1PreparedStatement[] {
	const stmts: D1PreparedStatement[] = [];
	for (const t of tags) {
		stmts.push(
			db
				.prepare('INSERT INTO tags (id, label, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING')
				.bind(t.id, t.label, now)
		);
		stmts.push(
			db
				.prepare('INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)')
				.bind(entryId, t.id)
		);
	}
	return stmts;
}

/** Live tag directory with usage counts (visible entries only), most-used first. */
export async function loadTagDirectory(db: D1Database, limit = 100): Promise<TagSummary[]> {
	const rows = await db
		.prepare(
			`SELECT t.id, t.label, COUNT(*) AS count
			 FROM entry_tags et
			 JOIN entries e ON e.id = et.entry_id AND e.hidden = 0
			 JOIN tags t ON t.id = et.tag_id
			 GROUP BY t.id, t.label
			 ORDER BY count DESC, t.label ASC
			 LIMIT ?`
		)
		.bind(limit)
		.all<{ id: string; label: string; count: number }>();

	return (rows.results ?? []).map((r) => ({ id: r.id, label: r.label, count: Number(r.count) }));
}
