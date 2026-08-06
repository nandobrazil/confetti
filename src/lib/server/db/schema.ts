import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Singleton row (id = 1) holding everything the party host can configure. */
export const event = sqliteTable('event', {
	id: integer('id').primaryKey(),
	celebrantName: text('celebrant_name').notNull(),
	/** Age being celebrated, shown as a big number on the hero. Optional. */
	celebrantAge: integer('celebrant_age'),
	/** ISO 8601 local datetime, e.g. "2026-09-19T20:00". */
	startsAt: text('starts_at').notNull(),
	venueName: text('venue_name').notNull(),
	address: text('address').notNull(),
	mapsUrl: text('maps_url').notNull(),
	notes: text('notes'),
	dressCode: text('dress_code'),
	heroTagline: text('hero_tagline').notNull(),
	successMessage: text('success_message').notNull(),
	maxCompanions: integer('max_companions').notNull().default(3),
	rsvpOpen: integer('rsvp_open', { mode: 'boolean' }).notNull().default(true)
});

export const guests = sqliteTable('guests', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	attending: integer('attending', { mode: 'boolean' }).notNull(),
	comments: text('comments'),
	dietaryRestrictions: text('dietary_restrictions'),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(datetime('now'))`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(datetime('now'))`)
});

export const companions = sqliteTable('companions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	guestId: integer('guest_id')
		.notNull()
		.references(() => guests.id, { onDelete: 'cascade' }),
	name: text('name').notNull()
});

export const admins = sqliteTable('admins', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const sessions = sqliteTable('sessions', {
	/** SHA-256 hash of the session token — raw tokens never touch the DB. */
	id: text('id').primaryKey(),
	adminId: integer('admin_id')
		.notNull()
		.references(() => admins.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type EventConfig = typeof event.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type Companion = typeof companions.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Session = typeof sessions.$inferSelect;
