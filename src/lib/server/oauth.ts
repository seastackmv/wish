import { Google } from 'arctic';

export const GOOGLE_STATE_COOKIE = 'google_oauth_state';
export const GOOGLE_VERIFIER_COOKIE = 'google_code_verifier';
export const GOOGLE_REDIRECT_COOKIE = 'google_redirect_to';

const TEMP_COOKIE_MAX_AGE = 60 * 10;

export const tempOAuthCookieOptions = () => ({
	httpOnly: true,
	secure: true,
	sameSite: 'lax' as const,
	path: '/',
	maxAge: TEMP_COOKIE_MAX_AGE
});

export function createGoogle(platform: App.Platform | undefined, origin: string): Google {
	const clientId = platform?.env?.GOOGLE_CLIENT_ID;
	const clientSecret = platform?.env?.GOOGLE_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error(
			'Google OAuth is not configured: set the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET ' +
				'environment variables (see .dev.vars.example / README).'
		);
	}
	return new Google(clientId, clientSecret, `${origin}/auth/google/callback`);
}

export function safeRedirectTarget(target: string | null | undefined): string | null {
	if (!target || !target.startsWith('/')) return null;
	if (target.startsWith('//') || target.startsWith('/\\')) return null;
	return target;
}
