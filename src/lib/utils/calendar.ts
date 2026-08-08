import type { EventConfig } from '$lib/server/db/schema';

export const EVENT_DURATION_HOURS = 8;
export const EVENT_TIMEZONE = 'America/Sao_Paulo';

const pad = (n: number) => String(n).padStart(2, '0');

/** Compact local datetime pair ("20260822T120000") for calendar links. */
export function calendarTimes(startsAt: string): { start: string; end: string } {
	const format = (d: Date) =>
		`${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
	const start = new Date(startsAt);
	const end = new Date(start.getTime() + EVENT_DURATION_HOURS * 3_600_000);
	return { start: format(start), end: format(end) };
}

export function googleCalendarUrl(event: EventConfig, origin: string): string {
	const { start, end } = calendarTimes(event.startsAt);
	const params = new URLSearchParams({
		action: 'TEMPLATE',
		text: `Aniversário do ${event.celebrantName} 🎉`,
		dates: `${start}/${end}`,
		ctz: EVENT_TIMEZONE,
		location: `${event.venueName} — ${event.address}`,
		details: `${event.heroTagline}\n\nConvite: ${origin}`
	});
	return `https://calendar.google.com/calendar/render?${params}`;
}
