import { redirect } from '@sveltejs/kit';
import { deleteSessionCookie, invalidateSession } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.session) await invalidateSession(event.locals.session.id);
		deleteSessionCookie(event);
		redirect(302, '/admin/login');
	}
};
