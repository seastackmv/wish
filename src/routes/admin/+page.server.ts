import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {
	requireAdmin,
	setEntryHidden,
	setCommentHidden,
	deleteEntry,
	deleteComment
} from '$lib/server/moderation';

export const load: PageServerLoad = async ({ platform, locals }) => {
	requireAdmin(locals.user);

	const db = platform?.env?.DB;
	if (!db) throw error(503, 'Database unavailable');

	const entries = await db
		.prepare(
			`SELECT id, type, text, category, votes, comment_count, author_name, image_key, hidden, created_at
			 FROM entries ORDER BY created_at DESC LIMIT 200`
		)
		.all<{
			id: string;
			type: string;
			text: string;
			category: string;
			votes: number;
			comment_count: number;
			author_name: string | null;
			image_key: string | null;
			hidden: number;
			created_at: number;
		}>();

	const comments = await db
		.prepare(
			`SELECT c.id, c.entry_id, c.author_name, c.body, c.hidden, c.created_at, e.text AS entry_text
			 FROM comments c JOIN entries e ON e.id = c.entry_id
			 ORDER BY c.created_at DESC LIMIT 200`
		)
		.all<{
			id: string;
			entry_id: string;
			author_name: string;
			body: string;
			hidden: number;
			created_at: number;
			entry_text: string;
		}>();

	return {
		entries: entries.results ?? [],
		comments: comments.results ?? []
	};
};

function formId(fd: FormData): string {
	return String(fd.get('id') ?? '');
}

export const actions: Actions = {
	hideEntry: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = formId(await request.formData());
		if (id) await setEntryHidden(db, id, true);
		return { ok: true };
	},
	unhideEntry: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = formId(await request.formData());
		if (id) await setEntryHidden(db, id, false);
		return { ok: true };
	},
	deleteEntry: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = formId(await request.formData());
		if (id) await deleteEntry(db, id);
		return { ok: true };
	},
	hideComment: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = formId(await request.formData());
		if (id) await setCommentHidden(db, id, true);
		return { ok: true };
	},
	unhideComment: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = formId(await request.formData());
		if (id) await setCommentHidden(db, id, false);
		return { ok: true };
	},
	deleteComment: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = formId(await request.formData());
		if (id) await deleteComment(db, id);
		return { ok: true };
	}
};
