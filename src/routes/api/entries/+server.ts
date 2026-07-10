import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { monthYear } from '$lib/utils';
import { CATEGORY_VALUES } from '$lib/types';
import { verifyTurnstile } from '$lib/server/turnstile';
import { assertSameOrigin } from '$lib/server/security';

const IMAGE_KEY_RE = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i;
const MAX_CHARS_PER_WORD = 12;

export const GET: RequestHandler = async ({ url, platform }) => {
	const db = platform?.env?.DB;
	if (!db) throw error(503, 'Database unavailable');

	const type = url.searchParams.get('type') === 'pain' ? 'pain' : 'wish';
	const category = url.searchParams.get('category');
	const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);
	const offset = Number(url.searchParams.get('offset') ?? 0);

	const cols =
		'id, type, text, category, votes, comment_count, author_name, image_key, month_year, created_at';

	const sort = url.searchParams.get('sort') === 'latest' ? 'latest' : 'popular';
	const orderBy =
		sort === 'latest' ? 'created_at DESC' : 'votes DESC, created_at DESC';

	let rows;
	if (category && (CATEGORY_VALUES as readonly string[]).includes(category)) {
		rows = await db
			.prepare(
				`SELECT ${cols} FROM entries WHERE type = ? AND category = ? AND hidden = 0 ORDER BY ${orderBy} LIMIT ? OFFSET ?`
			)
			.bind(type, category, limit, offset)
			.all();
	} else {
		rows = await db
			.prepare(
				`SELECT ${cols} FROM entries WHERE type = ? AND hidden = 0 ORDER BY ${orderBy} LIMIT ? OFFSET ?`
			)
			.bind(type, limit, offset)
			.all();
	}

	return json({ entries: rows.results, offset, limit });
};

export const POST: RequestHandler = async ({ request, url, platform, locals }) => {
	assertSameOrigin(request, url);

	const db = platform?.env?.DB;
	if (!db) throw error(503, 'Database unavailable');

	const body = await request.json().catch(() => null);
	if (!body?.text?.trim()) throw error(400, 'text is required');
	if (!['wish', 'pain'].includes(body.type)) throw error(400, 'type must be wish or pain');

	const category = (CATEGORY_VALUES as readonly string[]).includes(body.category) ? body.category : 'other';

	const rawText = String(body.text).trim();
	if (rawText.length < 10) throw error(400, 'text must be at least 10 characters');

	const maxWords = locals.user ? 2000 : 500;
	const wordCount = rawText.split(/\s+/).filter(Boolean).length;
	if (wordCount > maxWords) throw error(400, `text must be ${maxWords} words or fewer`);

	const ip = request.headers.get('cf-connecting-ip') ?? undefined;
	if (!(await verifyTurnstile(platform, body.turnstile_token, ip, url.hostname))) {
		throw error(403, 'Please complete the verification challenge and try again.');
	}

	const text = rawText.slice(0, maxWords * MAX_CHARS_PER_WORD);

	const imageKey =
		typeof body.image_key === 'string' && IMAGE_KEY_RE.test(body.image_key) ? body.image_key : null;

	const anonymous = body.anonymous === true;
	const userId = locals.user && !anonymous ? locals.user.id : null;
	const authorName = locals.user && !anonymous ? locals.user.display_name : null;

	const id = crypto.randomUUID();
	const now = Date.now();
	const my = monthYear();

	await db
		.prepare(
			`INSERT INTO entries (id, type, text, category, votes, comment_count, user_id, author_name, image_key, month_year, created_at)
			 VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?)`
		)
		.bind(id, body.type, text, category, userId, authorName, imageKey, my, now)
		.run();

	return json(
		{
			id,
			type: body.type,
			text,
			category,
			votes: 0,
			comment_count: 0,
			author_name: authorName,
			image_key: imageKey,
			month_year: my,
			created_at: now
		},
		{ status: 201 }
	);
};
