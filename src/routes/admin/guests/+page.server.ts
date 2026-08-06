import { error, fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { companions, guests } from '$lib/server/db/schema';
import { getEvent } from '$lib/server/event';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.admin) error(404, 'Não encontrado');

	const [allGuests, allCompanions, event] = await Promise.all([
		db.select().from(guests).orderBy(desc(guests.createdAt)),
		db.select().from(companions),
		getEvent()
	]);

	return {
		guests: allGuests.map((guest) => ({
			...guest,
			companions: allCompanions.filter((c) => c.guestId === guest.id)
		})),
		maxCompanions: event.maxCompanions
	};
};

const updateSchema = z.object({
	id: z.coerce.number().int().positive(),
	name: z.string().trim().min(2).max(120),
	attending: z.enum(['yes', 'no']),
	companionNames: z.array(z.string().trim().min(1).max(120)),
	comments: z.string().trim().max(1000)
});

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.admin) error(404, 'Não encontrado');

		const form = await request.formData();
		const parsed = updateSchema.safeParse({
			id: form.get('id'),
			name: form.get('name'),
			attending: form.get('attending'),
			companionNames: form
				.getAll('companionName')
				.map(String)
				.filter((n) => n.trim().length > 0),
			comments: String(form.get('comments') ?? '')
		});

		if (!parsed.success) {
			return fail(400, { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' });
		}

		const { id, name, attending, companionNames, comments } = parsed.data;

		await db
			.update(guests)
			.set({
				name,
				attending: attending === 'yes',
				comments: comments || null,
				updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
			})
			.where(eq(guests.id, id));

		await db.delete(companions).where(eq(companions.guestId, id));
		if (attending === 'yes' && companionNames.length > 0) {
			await db
				.insert(companions)
				.values(companionNames.map((companionName) => ({ guestId: id, name: companionName })));
		}

		return { updated: true };
	},

	delete: async ({ request, locals }) => {
		if (!locals.admin) error(404, 'Não encontrado');

		const form = await request.formData();
		const id = z.coerce.number().int().positive().safeParse(form.get('id'));
		if (!id.success) return fail(400, { error: 'ID inválido' });

		await db.delete(guests).where(eq(guests.id, id.data));
		return { deleted: true };
	}
};
