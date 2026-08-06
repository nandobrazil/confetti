import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { getEvent } from '$lib/server/event';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.admin) error(404, 'Não encontrado');
	return { event: await getEvent() };
};

const settingsSchema = z.object({
	celebrantName: z.string().trim().min(1).max(80),
	celebrantAge: z.coerce.number().int().min(1).max(150).optional().or(z.literal('')),
	startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data/hora inválida'),
	venueName: z.string().trim().min(1).max(160),
	address: z.string().trim().min(1).max(300),
	mapsUrl: z.url('Link do Google Maps inválido').max(500),
	notes: z.string().trim().max(500),
	dressCode: z.string().trim().max(200),
	heroTagline: z.string().trim().min(1).max(200),
	successMessage: z.string().trim().min(1).max(300),
	maxCompanions: z.coerce.number().int().min(0).max(20),
	rsvpOpen: z.enum(['yes', 'no'])
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.admin) error(404, 'Não encontrado');

		const form = await request.formData();
		const parsed = settingsSchema.safeParse(Object.fromEntries(form));

		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' });
		}

		const data = parsed.data;
		await getEvent(); // guarantees the singleton row exists
		await db
			.update(event)
			.set({
				celebrantName: data.celebrantName,
				celebrantAge: data.celebrantAge === '' || data.celebrantAge === undefined ? null : data.celebrantAge,
				startsAt: data.startsAt,
				venueName: data.venueName,
				address: data.address,
				mapsUrl: data.mapsUrl,
				notes: data.notes || null,
				dressCode: data.dressCode || null,
				heroTagline: data.heroTagline,
				successMessage: data.successMessage,
				maxCompanions: data.maxCompanions,
				rsvpOpen: data.rsvpOpen === 'yes'
			})
			.where(eq(event.id, 1));

		return { saved: true };
	}
};
