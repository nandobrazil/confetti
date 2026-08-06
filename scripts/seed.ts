/**
 * Idempotent seed: creates the admin user from env vars if it doesn't exist.
 * Runs on every boot (see the `start` script), so a fresh volume always ends
 * up with a working login.
 */
import { hash } from '@node-rs/argon2';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const url = process.env.DATABASE_URL ?? './data/confetti.db';
mkdirSync(dirname(url), { recursive: true });

const username = process.env.ADMIN_USERNAME ?? 'admin';
const password = process.env.ADMIN_PASSWORD;

if (!password) {
	console.log('ADMIN_PASSWORD not set — skipping admin seed.');
	process.exit(0);
}

const sqlite = new Database(url);
const exists = sqlite.prepare('SELECT id FROM admins WHERE username = ?').get(username);

if (exists) {
	console.log(`Admin "${username}" already exists — nothing to do.`);
} else {
	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	sqlite
		.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')
		.run(username, passwordHash);
	console.log(`Admin "${username}" created.`);
}

sqlite.close();
