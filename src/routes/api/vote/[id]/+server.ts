import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sha256 } from '$lib/utils';
import { assertSameOrigin, getPepper, voterHashFromCookie } from '$lib/server/security';
import { checkRateLimit } from '$lib/server/ratelimit';

export const POST: RequestHandler = async ({ params, request, url, platform, cookies, getClientAddress }) => {
	assertSameOrigin(request, url);

	const db = platform?.env?.DB;
	if (!db) throw error(503, 'Database unavailable');

	const { id } = params;

	const entry = await db.prepare('SELECT id FROM entries WHERE id = ?').bind(id).first();
	if (!entry) throw error(404, 'Entry not found');

	const pepper = getPepper(platform);
	const ip = request.headers.get('cf-connecting-ip') ?? getClientAddress();
	const cf = platform?.cf;
	const ipCap = Number(platform?.env?.IP_VOTE_CAP) || 8;

	let cookieId = cookies.get('vid');
	if (!cookieId) {
		cookieId = crypto.randomUUID();
		cookies.set('vid', cookieId, {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365,
			path: '/'
		});
	}

	const voterHash = await voterHashFromCookie(platform, cookieId);
	const ipHash = await sha256(`${ip}|${pepper}`);

	if (!(await checkRateLimit(db, 'vote', ipHash, 30, 60))) {
		return json({ error: 'rate-limit' }, { status: 429 });
	}

	const existingVote = await db
		.prepare('SELECT id FROM votes WHERE entry_id = ? AND voter_hash = ?')
		.bind(id, voterHash)
		.first<{ id: string }>();

	if (existingVote) {
		await db.batch([
			db.prepare('DELETE FROM votes WHERE id = ?').bind(existingVote.id),
			db.prepare('UPDATE entries SET votes = MAX(0, votes - 1) WHERE id = ?').bind(id)
		]);
		return json({ ok: true, voted: false });
	}

	const ipCount = await db
		.prepare('SELECT COUNT(*) as n FROM votes WHERE entry_id = ? AND ip_hash = ?')
		.bind(id, ipHash)
		.first<{ n: number }>();

	if ((ipCount?.n ?? 0) >= ipCap) {
		return json({ error: 'ip-cap' }, { status: 429 });
	}

	try {
		await db.batch([
			db
				.prepare(
					'INSERT INTO votes (id, entry_id, voter_hash, ip_hash, asn, country, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
				)
				.bind(crypto.randomUUID(), id, voterHash, ipHash, String(cf?.asn ?? ''), cf?.country ?? '', Date.now()),
			db.prepare('UPDATE entries SET votes = votes + 1 WHERE id = ?').bind(id)
		]);
	} catch {
		return json({ ok: true, voted: true });
	}

	return json({ ok: true, voted: true });
};
