import { eq } from 'drizzle-orm';
import { db } from './db';
import { event, type EventConfig } from './db/schema';

export const DEFAULT_EVENT: Omit<EventConfig, 'id'> = {
	celebrantName: 'Conde',
	celebrantAge: null,
	startsAt: '2026-08-22T12:00',
	venueName: 'Casa do aniversariante',
	address: 'Rua dos Bons Momentos, 123 — São Paulo, SP',
	mapsUrl: 'https://maps.google.com/?q=Av.+Paulista,+São+Paulo',
	notes: 'Traga sua melhor história pra contar. Bebidas e comidas por nossa conta.',
	dressCode: 'Venha como quiser — de pijama a smoking, o importante é vir.',
	heroTagline: 'Você foi oficialmente convocado para um sábado memorável — do meio-dia até a última história.',
	successMessage: 'Presença registrada com sucesso. A festa acaba de ficar melhor.',
	maxCompanions: 3,
	rsvpOpen: true
};

export async function getEvent(): Promise<EventConfig> {
	const rows = await db.select().from(event).where(eq(event.id, 1));
	const existing = rows.at(0);
	if (existing) return existing;

	await db
		.insert(event)
		.values({ id: 1, ...DEFAULT_EVENT })
		.onConflictDoNothing();
	return { id: 1, ...DEFAULT_EVENT };
}
