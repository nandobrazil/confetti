import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { companions, guests } from '$lib/server/db/schema';
import { getEvent } from '$lib/server/event';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { event: await getEvent() };
};

function buildSchema(maxCompanions: number) {
	return z
		.object({
			name: z.string().trim().min(2, 'Conta pra gente seu nome!').max(120),
			attending: z.enum(['yes', 'no']),
			companionNames: z
				.array(z.string().trim().min(2, 'Nome do acompanhante muito curto').max(120))
				.max(maxCompanions, `Máximo de ${maxCompanions} acompanhantes`),
			comments: z.string().trim().max(1000).optional()
		})
		.transform((data) => ({
			...data,
			// Declining? Companions make no sense — drop them.
			companionNames: data.attending === 'yes' ? data.companionNames : []
		}));
}

export const actions: Actions = {
	default: async ({ request }) => {
		const event = await getEvent();
		if (!event.rsvpOpen) {
			return fail(403, { formError: 'As confirmações foram encerradas. Fala direto com o aniversariante!' });
		}

		const form = await request.formData();
		const raw = {
			name: String(form.get('name') ?? ''),
			attending: String(form.get('attending') ?? ''),
			companionNames: form
				.getAll('companionName')
				.map(String)
				.filter((n) => n.trim().length > 0),
			comments: String(form.get('comments') ?? '') || undefined
		};

		const parsed = buildSchema(event.maxCompanions).safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				formError: parsed.error.issues[0]?.message ?? 'Dados inválidos',
				values: raw
			});
		}

		const { name, attending, companionNames, comments } = parsed.data;

		const [guest] = await db
			.insert(guests)
			.values({
				name,
				attending: attending === 'yes',
				comments: comments ?? null
			})
			.returning();

		if (companionNames.length > 0) {
			await db
				.insert(companions)
				.values(companionNames.map((companionName) => ({ guestId: guest.id, name: companionName })));
		}

		return { success: true, attending: attending === 'yes', guestName: name };
	}
};
