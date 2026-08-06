import { error, type Handle } from '@sveltejs/kit';
import {
	SESSION_COOKIE,
	deleteSessionCookie,
	setSessionCookie,
	validateSessionToken
} from '$lib/server/auth';
import { rateLimit } from '$lib/server/rate-limit';

/**
 * Central gate for the whole /admin surface. Responds 404 so the area's
 * existence isn't revealed to non-admins. The login page is the only
 * exception. Individual admin loads keep their own checks as defense in depth.
 */
function assertAdminAccess(pathname: string, admin: App.Locals['admin']) {
	const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');
	const isLogin = pathname === '/admin/login';
	if (isAdminArea && !isLogin && !admin) error(404, 'Não encontrado');
}

export const handle: Handle = async ({ event, resolve }) => {
	if (event.request.method === 'POST') {
		const ip = event.getClientAddress();
		const isLogin = event.url.pathname === '/admin/login';
		const limit = isLogin ? 10 : 30;
		if (!rateLimit(`${isLogin ? 'login' : 'post'}:${ip}`, limit, 10 * 60 * 1000)) {
			error(429, 'Calma! Muitas tentativas — espere alguns minutos.');
		}
	}

	const token = event.cookies.get(SESSION_COOKIE);

	if (!token) {
		event.locals.admin = null;
		event.locals.session = null;
		assertAdminAccess(event.url.pathname, null);
		return resolve(event);
	}

	const { session, admin } = await validateSessionToken(token);

	if (session) {
		setSessionCookie(event, token, session.expiresAt);
	} else {
		deleteSessionCookie(event);
	}

	event.locals.admin = admin;
	event.locals.session = session;
	assertAdminAccess(event.url.pathname, admin);
	return resolve(event);
};
