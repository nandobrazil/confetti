import { asc } from 'drizzle-orm';
import { db } from './db';
import { companions, guests } from './db/schema';

export type ExportRow = {
	name: string;
	status: string;
	companionCount: number;
	companionNames: string;
	comments: string;
	respondedAt: string;
};

export const EXPORT_HEADERS: { key: keyof ExportRow; label: string }[] = [
	{ key: 'name', label: 'Nome' },
	{ key: 'status', label: 'Status' },
	{ key: 'companionCount', label: 'Acompanhantes' },
	{ key: 'companionNames', label: 'Nomes dos acompanhantes' },
	{ key: 'comments', label: 'Comentários' },
	{ key: 'respondedAt', label: 'Respondido em' }
];

export async function fetchExportRows(): Promise<ExportRow[]> {
	const [allGuests, allCompanions] = await Promise.all([
		db.select().from(guests).orderBy(asc(guests.createdAt)),
		db.select().from(companions)
	]);

	return allGuests.map((guest) => {
		const names = allCompanions.filter((c) => c.guestId === guest.id).map((c) => c.name);
		return {
			name: guest.name,
			status: guest.attending ? 'Confirmado' : 'Não vai',
			companionCount: names.length,
			companionNames: names.join(', '),
			comments: guest.comments ?? '',
			respondedAt: guest.createdAt
		};
	});
}
