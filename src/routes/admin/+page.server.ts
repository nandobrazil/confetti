import { error } from '@sveltejs/kit';
import { asc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { companions, guests } from '$lib/server/db/schema';
import { getEvent } from '$lib/server/event';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.admin) error(404, 'Não encontrado');

	const [allGuests, allCompanions, event] = await Promise.all([
		db.select().from(guests).orderBy(asc(guests.createdAt)),
		db.select().from(companions),
		getEvent()
	]);

	const companionsByGuest = new Map<number, number>();
	for (const companion of allCompanions) {
		companionsByGuest.set(companion.guestId, (companionsByGuest.get(companion.guestId) ?? 0) + 1);
	}

	const confirmed = allGuests.filter((g) => g.attending);
	const declined = allGuests.filter((g) => !g.attending);
	const totalCompanions = confirmed.reduce(
		(sum, g) => sum + (companionsByGuest.get(g.id) ?? 0),
		0
	);

	// Cumulative expected attendees (guest + companions) per response day.
	const byDay = new Map<string, number>();
	for (const guest of confirmed) {
		const day = guest.createdAt.slice(0, 10);
		byDay.set(day, (byDay.get(day) ?? 0) + 1 + (companionsByGuest.get(guest.id) ?? 0));
	}
	let running = 0;
	const trend = [...byDay.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([day, count]) => {
			running += count;
			return { day, total: running };
		});

	return {
		stats: {
			responses: allGuests.length,
			confirmed: confirmed.length,
			declined: declined.length,
			companions: totalCompanions,
			expected: confirmed.length + totalCompanions
		},
		trend,
		rsvpOpen: event.rsvpOpen
	};
};
