import type { PageServerLoad } from './$types';
import type { Entry } from '$lib/types';
import { voterHashFromCookie } from '$lib/server/security';

export const load: PageServerLoad = async ({ platform, cookies }) => {
	const db = platform?.env?.DB;
	if (!db) return { wishes: [] as Entry[], pains: [] as Entry[] };

	const cookieId = cookies.get('vid');
	const voterHash = cookieId ? await voterHashFromCookie(platform, cookieId) : '';

	const query = `
		SELECT
			e.id, e.type, e.text, e.category, e.votes, e.comment_count,
			e.author_name, e.image_key, e.month_year, e.created_at,
			EXISTS(SELECT 1 FROM votes v WHERE v.entry_id = e.id AND v.voter_hash = ?) as user_voted
		FROM entries e
		WHERE e.type = ? AND e.hidden = 0
		ORDER BY e.votes DESC, e.created_at DESC
		LIMIT 1000
	`;

	const [wishRows, painRows] = await Promise.all([
		db.prepare(query).bind(voterHash, 'wish').all<Entry>(),
		db.prepare(query).bind(voterHash, 'pain').all<Entry>()
	]);

	return {
		wishes: (wishRows.results ?? []).map((r) => ({ ...r, user_voted: !!r.user_voted })),
		pains: (painRows.results ?? []).map((r) => ({ ...r, user_voted: !!r.user_voted }))
	};
};
