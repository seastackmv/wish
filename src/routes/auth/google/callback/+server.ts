import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, createSession, findOrCreateGoogleUser, sessionCookieOptions } from '$lib/server/auth';
import {
	GOOGLE_REDIRECT_COOKIE,
	GOOGLE_STATE_COOKIE,
	GOOGLE_VERIFIER_COOKIE,
	createGoogle,
	safeRedirectTarget
} from '$lib/server/oauth';
import type { RequestHandler } from './$types';

interface GoogleUserInfo {
	sub: string;
	email?: string;
	name?: string;
	picture?: string;
}

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get(GOOGLE_STATE_COOKIE);
	const codeVerifier = cookies.get(GOOGLE_VERIFIER_COOKIE);
	const redirectTo = safeRedirectTarget(cookies.get(GOOGLE_REDIRECT_COOKIE)) ?? '/';

	cookies.delete(GOOGLE_STATE_COOKIE, { path: '/' });
	cookies.delete(GOOGLE_VERIFIER_COOKIE, { path: '/' });
	cookies.delete(GOOGLE_REDIRECT_COOKIE, { path: '/' });

	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		throw redirect(303, '/login?error=state');
	}

	const db = platform?.env?.DB;
	if (!db) throw redirect(303, '/login?error=oauth');

	try {
		const google = createGoogle(platform, url.origin);
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: { Authorization: `Bearer ${tokens.accessToken()}` }
		});
		if (!userInfoRes.ok) {
			throw new Error(`Google userinfo request failed with ${userInfoRes.status}`);
		}
		const profile = (await userInfoRes.json()) as GoogleUserInfo;
		if (!profile.sub) throw new Error('Google userinfo response is missing "sub"');

		const userId = await findOrCreateGoogleUser(db, {
			googleId: profile.sub,
			email: profile.email ?? null,
			name: profile.name ?? null,
			picture: profile.picture ?? null
		});

		const { token, maxAge } = await createSession(db, userId);
		cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
	} catch (err) {
		console.error('Google OAuth callback failed:', err);
		throw redirect(303, '/login?error=oauth');
	}

	throw redirect(303, redirectTo);
};
