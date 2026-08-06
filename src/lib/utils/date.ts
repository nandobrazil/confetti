export function parseEventDate(startsAt: string): Date {
	return new Date(startsAt);
}

export function formatLongDate(startsAt: string): string {
	const formatted = new Intl.DateTimeFormat('pt-BR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(parseEventDate(startsAt));
	return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(startsAt: string): string {
	return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
		parseEventDate(startsAt)
	);
}
