import type { D1Database } from '@cloudflare/workers-types';

export async function checkRateLimit(
	db: D1Database,
	bucket: string,
	identifier: string,
	limit: number,
	windowSeconds: number
): Promise<boolean> {
	const now = Date.now();
	const windowMs = windowSeconds * 1000;
	const windowId = Math.floor(now / windowMs);
	const key = `${bucket}:${identifier}:${windowId}`;
	const expiresAt = (windowId + 1) * windowMs;

	const row = await db
		.prepare(
			`INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)
			 ON CONFLICT(key) DO UPDATE SET count = count + 1
			 RETURNING count`
		)
		.bind(key, expiresAt)
		.first<{ count: number }>();

	if (Math.random() < 0.02) {
		await db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run();
	}

	return (row?.count ?? 1) <= limit;
}
