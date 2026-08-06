import { fail, redirect } from '@sveltejs/kit';
import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { admins } from '$lib/server/db/schema';
import { createSession, generateSessionToken, setSessionCookie } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.admin) redirect(302, '/admin');
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { error: 'Preencha usuário e senha.' });
		}

		const admin = (await db.select().from(admins).where(eq(admins.username, username))).at(0);
		// Verify against a dummy hash when the user doesn't exist so response
		// timing doesn't reveal valid usernames.
		const hash =
			admin?.passwordHash ??
			'$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
		const valid = await verify(hash, password).catch(() => false);

		if (!admin || !valid) {
			return fail(400, { error: 'Usuário ou senha incorretos.' });
		}

		const token = generateSessionToken();
		const session = await createSession(token, admin.id);
		setSessionCookie(event, token, session.expiresAt);
		redirect(302, '/admin');
	}
};
