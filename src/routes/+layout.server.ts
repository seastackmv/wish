import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	return {
		user: locals.user,
		turnstileSiteKey: platform?.env?.TURNSTILE_SITE_KEY ?? null
	};
};
