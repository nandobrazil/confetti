import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from './db';
import { admins, sessions, type Admin, type Session } from './db/schema';

export const SESSION_COOKIE = 'confetti_session';
const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24 * 14;

async function sha256Hex(token: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(24));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export async function createSession(token: string, adminId: number): Promise<Session> {
	const session: Session = {
		id: await sha256Hex(token),
		adminId,
		expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS)
	};
	await db.insert(sessions).values(session);
	return session;
}

export async function validateSessionToken(
	token: string
): Promise<{ session: Session | null; admin: Admin | null }> {
	const id = await sha256Hex(token);
	const rows = await db
		.select({ session: sessions, admin: admins })
		.from(sessions)
		.innerJoin(admins, eq(sessions.adminId, admins.id))
		.where(eq(sessions.id, id));

	const row = rows.at(0);
	if (!row) return { session: null, admin: null };

	if (Date.now() >= row.session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return { session: null, admin: null };
	}

	// Sliding expiration: renew when past the halfway point.
	if (Date.now() >= row.session.expiresAt.getTime() - SESSION_LIFETIME_MS / 2) {
		row.session.expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
		await db
			.update(sessions)
			.set({ expiresAt: row.session.expiresAt })
			.where(eq(sessions.id, id));
	}

	return { session: row.session, admin: row.admin };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function setSessionCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(SESSION_COOKIE, token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionCookie(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE, { path: '/' });
}
