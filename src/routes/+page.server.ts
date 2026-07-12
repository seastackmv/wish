import type { PageServerLoad } from './$types';
import type { TagSummary } from '$lib/tags';
import { loadTagDirectory } from '$lib/server/tags';

export const load: PageServerLoad = async ({ platform }) => {
	const db = platform?.env?.DB;
	if (!db) return { popularTags: [] as TagSummary[] };

	return { popularTags: await loadTagDirectory(db, 12) };
};
