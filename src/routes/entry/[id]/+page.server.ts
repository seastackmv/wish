import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Entry, Comment } from '$lib/types';
import { verifyTurnstile } from '$lib/server/turnstile';
import { voterHashFromCookie } from '$lib/server/security';
import { requireAdmin, setEntryHidden, setCommentHidden } from '$lib/server/moderation';

export const load: PageServerLoad = async ({ params, platform, cookies, locals }) => {
	const db = platform?.env?.DB;
	if (!db) throw error(503, 'Database unavailable');

	const isAdmin = !!locals.user?.is_admin;
	const cookieId = cookies.get('vid');
	const voterHash = cookieId ? await voterHashFromCookie(platform, cookieId) : '';

	const entry = await db
		.prepare(
			`SELECT e.id, e.type, e.text, e.category, e.votes, e.comment_count,
			        e.author_name, e.image_key, e.hidden, e.month_year, e.created_at,
			        EXISTS(SELECT 1 FROM votes v WHERE v.entry_id = e.id AND v.voter_hash = ?) AS user_voted
			 FROM entries e WHERE e.id = ?`
		)
		.bind(voterHash, params.id)
		.first<Omit<Entry, 'user_voted'> & { user_voted: number }>();

	if (!entry) throw error(404, 'That entry does not exist.');
	if (entry.hidden && !isAdmin) throw error(404, 'That entry does not exist.');

	const commentRows = await db
		.prepare(
			`SELECT id, entry_id, author_name, body, hidden, created_at FROM comments
			 WHERE entry_id = ?${isAdmin ? '' : ' AND hidden = 0'} ORDER BY created_at ASC LIMIT 500`
		)
		.bind(params.id)
		.all<Comment>();

	return {
		entry: { ...entry, user_voted: !!entry.user_voted } as Entry,
		comments: commentRows.results ?? [],
		isAdmin
	};
};

export const actions: Actions = {
	comment: async ({ request, url, params, platform, locals }) => {
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Discussion is unavailable right now.' });

		const form = await request.formData();
		const body = String(form.get('body') ?? '').trim();
		const anonymous = form.get('anonymous') === 'on';

		if (body.length < 2) return fail(400, { error: 'Write at least a couple of words.', body });
		if (body.length > 1000) return fail(400, { error: 'Comment is too long (max 1000).', body });

		const ip = request.headers.get('cf-connecting-ip') ?? undefined;
		if (!(await verifyTurnstile(platform, String(form.get('turnstile_token') ?? ''), ip, url.hostname))) {
			return fail(403, { error: 'Please complete the verification challenge and try again.', body });
		}

		const entry = await db.prepare('SELECT id FROM entries WHERE id = ?').bind(params.id).first();
		if (!entry) return fail(404, { error: 'That entry no longer exists.' });

		const userId = locals.user && !anonymous ? locals.user.id : null;
		const authorName = locals.user && !anonymous ? locals.user.display_name : 'Anonymous';

		await db.batch([
			db
				.prepare(
					'INSERT INTO comments (id, entry_id, user_id, author_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?)'
				)
				.bind(crypto.randomUUID(), params.id, userId, authorName, body.slice(0, 1000), Date.now()),
			db.prepare('UPDATE entries SET comment_count = comment_count + 1 WHERE id = ?').bind(params.id)
		]);

		return { success: true };
	},

	hideEntry: async ({ platform, params, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		await setEntryHidden(db, params.id, true);
		return { moderated: true };
	},

	unhideEntry: async ({ platform, params, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		await setEntryHidden(db, params.id, false);
		return { moderated: true };
	},

	hideComment: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = String((await request.formData()).get('id') ?? '');
		if (id) await setCommentHidden(db, id, true);
		return { moderated: true };
	},

	unhideComment: async ({ request, platform, locals }) => {
		requireAdmin(locals.user);
		const db = platform?.env?.DB;
		if (!db) return fail(503, { error: 'Database unavailable.' });
		const id = String((await request.formData()).get('id') ?? '');
		if (id) await setCommentHidden(db, id, false);
		return { moderated: true };
	}
};
