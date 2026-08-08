import { getEvent } from '$lib/server/event';
import { EVENT_TIMEZONE, calendarTimes } from '$lib/utils/calendar';
import type { RequestHandler } from './$types';

function icsEscape(value: string): string {
	return value
		.replaceAll('\\', '\\\\')
		.replaceAll(';', '\\;')
		.replaceAll(',', '\\,')
		.replaceAll('\n', '\\n');
}

/** RFC 5545 line folding: continuation lines start with a space. */
function fold(line: string): string {
	const chunks: string[] = [];
	for (let i = 0; i < line.length; i += 74) chunks.push(line.slice(i, i + 74));
	return chunks.join('\r\n ');
}

export const GET: RequestHandler = async ({ url }) => {
	const event = await getEvent();
	const { start, end } = calendarTimes(event.startsAt);
	const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//confetti//festa//PT',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VTIMEZONE',
		`TZID:${EVENT_TIMEZONE}`,
		'BEGIN:STANDARD',
		'DTSTART:19700101T000000',
		'TZOFFSETFROM:-0300',
		'TZOFFSETTO:-0300',
		'TZNAME:-03',
		'END:STANDARD',
		'END:VTIMEZONE',
		'BEGIN:VEVENT',
		`UID:confetti-event-${event.id}@${url.hostname}`,
		`DTSTAMP:${stamp}`,
		`DTSTART;TZID=${EVENT_TIMEZONE}:${start}`,
		`DTEND;TZID=${EVENT_TIMEZONE}:${end}`,
		fold(`SUMMARY:${icsEscape(`Aniversário do ${event.celebrantName} 🎉`)}`),
		fold(`LOCATION:${icsEscape(`${event.venueName} — ${event.address}`)}`),
		fold(`DESCRIPTION:${icsEscape(`${event.heroTagline}\n\nConvite: ${url.origin}`)}`),
		`URL:${url.origin}`,
		'END:VEVENT',
		'END:VCALENDAR'
	];

	return new Response(lines.join('\r\n') + '\r\n', {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="aniversario.ics"',
			'Cache-Control': 'no-cache'
		}
	});
};
