import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { SESSION_COOKIE, deleteSession } from '$lib/server/auth';

export const load: PageServerLoad = async () => {

	throw redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ platform, cookies }) => {
		const db = platform?.env?.DB;
		const token = cookies.get(SESSION_COOKIE);
		if (db) await deleteSession(db, token);
		cookies.delete(SESSION_COOKIE, { path: '/' });
		throw redirect(303, '/');
	}
};
