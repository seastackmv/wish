import { redirect } from '@sveltejs/kit';
import { safeRedirectTarget } from '$lib/server/oauth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectTo = safeRedirectTarget(url.searchParams.get('redirectTo'));
	if (locals.user) throw redirect(303, redirectTo ?? '/');
	return {
		redirectTo: redirectTo ?? '',
		error: url.searchParams.get('error') ?? ''
	};
};
