import type { D1Database } from '@cloudflare/workers-types';
import { error } from '@sveltejs/kit';
import type { SessionUser } from '$lib/types';

export function requireAdmin(user: SessionUser | null): SessionUser {
	if (!user?.is_admin) throw error(404, 'Not found');
	return user;
}

export async function setEntryHidden(db: D1Database, id: string, hidden: boolean): Promise<void> {
	await db.prepare('UPDATE entries SET hidden = ? WHERE id = ?').bind(hidden ? 1 : 0, id).run();
}

export async function setCommentHidden(db: D1Database, id: string, hidden: boolean): Promise<void> {
	await db.prepare('UPDATE comments SET hidden = ? WHERE id = ?').bind(hidden ? 1 : 0, id).run();
}

export async function deleteEntry(db: D1Database, id: string): Promise<void> {
	await db.batch([
		db.prepare('DELETE FROM votes WHERE entry_id = ?').bind(id),
		db.prepare('DELETE FROM comments WHERE entry_id = ?').bind(id),
		db.prepare('DELETE FROM entries WHERE id = ?').bind(id)
	]);
}

export async function deleteComment(db: D1Database, id: string): Promise<void> {
	const row = await db
		.prepare('SELECT entry_id FROM comments WHERE id = ?')
		.bind(id)
		.first<{ entry_id: string }>();
	if (!row) return;
	await db.batch([
		db.prepare('DELETE FROM comments WHERE id = ?').bind(id),
		db
			.prepare('UPDATE entries SET comment_count = MAX(0, comment_count - 1) WHERE id = ?')
			.bind(row.entry_id)
	]);
}
