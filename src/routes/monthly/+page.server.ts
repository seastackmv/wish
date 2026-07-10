import type { PageServerLoad } from './$types';
import type { Entry } from '$lib/types';
import { monthYear, formatMonthYear } from '$lib/utils';
import { voterHashFromCookie } from '$lib/server/security';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
	const my = url.searchParams.get('m') ?? monthYear();

	const db = platform?.env?.DB;
	if (!db) {

		return {
			month: my,
			monthLabel: formatMonthYear(my),
			months: [{ value: my, label: formatMonthYear(my) }],
			topWishes: [] as Entry[],
			topPains: [] as Entry[]
		};
	}

	const cookieId = cookies.get('vid');
	const voterHash = cookieId ? await voterHashFromCookie(platform, cookieId) : '';

	const query = `
		SELECT
			e.id, e.type, e.text, e.category, e.votes, e.comment_count,
			e.author_name, e.image_key, e.month_year, e.created_at,
			EXISTS(SELECT 1 FROM votes v WHERE v.entry_id = e.id AND v.voter_hash = ?) as user_voted
		FROM entries e
		WHERE e.type = ? AND e.month_year = ? AND e.hidden = 0
		ORDER BY e.votes DESC
		LIMIT 3
	`;

	const [wishRows, painRows] = await Promise.all([
		db.prepare(query).bind(voterHash, 'wish', my).all<Entry>(),
		db.prepare(query).bind(voterHash, 'pain', my).all<Entry>()
	]);

	const monthRows = await db
		.prepare("SELECT DISTINCT month_year FROM entries ORDER BY month_year DESC LIMIT 12")
		.all<{ month_year: string }>();

	const months = (monthRows.results ?? []).map((r) => ({
		value: r.month_year,
		label: formatMonthYear(r.month_year)
	}));

	if (!months.find((m) => m.value === my)) {
		months.unshift({ value: my, label: formatMonthYear(my) });
	}

	return {
		month: my,
		monthLabel: formatMonthYear(my),
		months,
		topWishes: (wishRows.results ?? []).map(r => ({ ...r, user_voted: !!r.user_voted })),
		topPains: (painRows.results ?? []).map(r => ({ ...r, user_voted: !!r.user_voted }))
	};
};
