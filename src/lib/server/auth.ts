import type { D1Database } from '@cloudflare/workers-types';
import type { SessionUser } from '$lib/types';

export const SESSION_COOKIE = 'sid';
const SESSION_TTL_MS = 60 * 60 * 24 * 30 * 1000;

function newToken(): string {
	return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '');
}

export async function createSession(
	db: D1Database,
	userId: string
): Promise<{ token: string; maxAge: number }> {
	const token = newToken();
	const now = Date.now();
	await db
		.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
		.bind(token, userId, now, now + SESSION_TTL_MS)
		.run();
	return { token, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

export async function getSessionUser(
	db: D1Database,
	token: string | undefined,
	adminEmails: string[] = []
): Promise<SessionUser | null> {
	if (!token) return null;
	const row = await db
		.prepare(
			`SELECT u.id AS id, u.username AS username, u.display_name AS display_name,
			        u.avatar_url AS avatar_url, u.email AS email, s.expires_at AS expires_at
			 FROM sessions s JOIN users u ON u.id = s.user_id
			 WHERE s.id = ?`
		)
		.bind(token)
		.first<{
			id: string;
			username: string;
			display_name: string;
			avatar_url: string | null;
			email: string | null;
			expires_at: number;
		}>();

	if (!row) return null;
	if (row.expires_at < Date.now()) {
		await db.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
		return null;
	}
	const email = row.email?.trim().toLowerCase();
	return {
		id: row.id,
		username: row.username,
		display_name: row.display_name,
		avatar_url: row.avatar_url,
		is_admin: !!email && adminEmails.includes(email)
	};
}

export function parseAdminEmails(raw: string | undefined): string[] {
	return (raw ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}

export async function deleteSession(db: D1Database, token: string | undefined): Promise<void> {
	if (token) await db.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
}

export const sessionCookieOptions = (maxAge: number) => ({
	httpOnly: true,
	secure: true,
	sameSite: 'lax' as const,
	path: '/',
	maxAge
});

export interface GoogleProfile {
	googleId: string;
	email: string | null;
	name: string | null;
	picture: string | null;
}

function slugifyUsername(raw: string): string {
	const slug = raw
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9_.]+/g, '.')
		.replace(/\.{2,}/g, '.')
		.replace(/^\.+|\.+$/g, '');
	return slug || 'member';
}

export async function findOrCreateGoogleUser(
	db: D1Database,
	profile: GoogleProfile
): Promise<string> {
	const existing = await db
		.prepare('SELECT id FROM users WHERE google_id = ?')
		.bind(profile.googleId)
		.first<{ id: string }>();
	if (existing) return existing.id;

	const id = crypto.randomUUID();
	const localPart = profile.email ? profile.email.split('@')[0] : '';
	const username = slugifyUsername(localPart || profile.name || profile.googleId);
	const displayName = profile.name?.trim() || 'Member';

	await db
		.prepare(
			`INSERT INTO users (id, google_id, email, username, display_name, avatar_url, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(id, profile.googleId, profile.email, username, displayName, profile.picture, Date.now())
		.run();

	return id;
}
