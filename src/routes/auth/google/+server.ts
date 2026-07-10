import { redirect } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';
import {
	GOOGLE_REDIRECT_COOKIE,
	GOOGLE_STATE_COOKIE,
	GOOGLE_VERIFIER_COOKIE,
	createGoogle,
	safeRedirectTarget,
	tempOAuthCookieOptions
} from '$lib/server/oauth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies, platform }) => {
	const google = createGoogle(platform, url.origin);

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const redirectTo = safeRedirectTarget(url.searchParams.get('redirectTo'));

	const authURL = google.createAuthorizationURL(state, codeVerifier, [
		'openid',
		'profile',
		'email'
	]);

	const options = tempOAuthCookieOptions();
	cookies.set(GOOGLE_STATE_COOKIE, state, options);
	cookies.set(GOOGLE_VERIFIER_COOKIE, codeVerifier, options);
	if (redirectTo) {
		cookies.set(GOOGLE_REDIRECT_COOKIE, redirectTo, options);
	} else {
		cookies.delete(GOOGLE_REDIRECT_COOKIE, { path: '/' });
	}

	throw redirect(302, authURL.toString());
};
