import type { Admin, Session } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Locals {
			admin: Admin | null;
			session: Session | null;
		}
	}
}

export {};
