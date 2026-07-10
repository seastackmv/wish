import type { Handle } from '@sveltejs/kit';
import { getSessionUser, parseAdminEmails, SESSION_COOKIE } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const db = event.platform?.env?.DB;
	const token = event.cookies.get(SESSION_COOKIE);
	const adminEmails = parseAdminEmails(event.platform?.env?.ADMIN_EMAILS);
	event.locals.user = db ? await getSessionUser(db, token, adminEmails) : null;

	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	return response;
};
