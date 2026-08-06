import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const url = process.env.DATABASE_URL ?? './data/confetti.db';
mkdirSync(dirname(url), { recursive: true });

const sqlite = new Database(url);
sqlite.pragma('journal_mode = WAL');

migrate(drizzle(sqlite), { migrationsFolder: './drizzle' });
console.log('Migrations applied.');
sqlite.close();
