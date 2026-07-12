import type { PageServerLoad } from './$types';
import type { Entry } from '$lib/types';
import type { TagSummary } from '$lib/tags';
import { parseTagsJson } from '$lib/tags';
import { voterHashFromCookie } from '$lib/server/security';
import { TAGS_SELECT, loadTagDirectory } from '$lib/server/tags';

type Row = Omit<Entry, 'user_voted' | 'tags'> & { user_voted: number; tags_json: string };

export const load: PageServerLoad = async ({ platform, cookies }) => {
	const db = platform?.env?.DB;
	if (!db) return { wishes: [] as Entry[], pains: [] as Entry[], tags: [] as TagSummary[] };

	const cookieId = cookies.get('vid');
	const voterHash = cookieId ? await voterHashFromCookie(platform, cookieId) : '';

	const query = `
		SELECT
			e.id, e.type, e.text, e.category, e.votes, e.comment_count,
			e.author_name, e.image_key, e.month_year, e.created_at,
			EXISTS(SELECT 1 FROM votes v WHERE v.entry_id = e.id AND v.voter_hash = ?) as user_voted,
			${TAGS_SELECT}
		FROM entries e
		WHERE e.type = ? AND e.hidden = 0
		ORDER BY e.votes DESC, e.created_at DESC
		LIMIT 1000
	`;

	const [wishRows, painRows, tags] = await Promise.all([
		db.prepare(query).bind(voterHash, 'wish').all<Row>(),
		db.prepare(query).bind(voterHash, 'pain').all<Row>(),
		loadTagDirectory(db, 200)
	]);

	const shape = ({ tags_json, user_voted, ...r }: Row): Entry => ({
		...r,
		user_voted: !!user_voted,
		tags: parseTagsJson(tags_json)
	});

	return {
		wishes: (wishRows.results ?? []).map(shape),
		pains: (painRows.results ?? []).map(shape),
		tags
	};
};
