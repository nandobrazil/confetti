import { error } from '@sveltejs/kit';
import { EXPORT_HEADERS, fetchExportRows } from '$lib/server/export';
import type { RequestHandler } from './$types';

function csvEscape(value: string | number): string {
	const str = String(value);
	return /[",;\n]/.test(str) ? `"${str.replaceAll('"', '""')}"` : str;
}

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.admin) error(404, 'Não encontrado');

	const rows = await fetchExportRows();
	const lines = [
		EXPORT_HEADERS.map((h) => h.label).join(';'),
		...rows.map((row) => EXPORT_HEADERS.map((h) => csvEscape(row[h.key])).join(';'))
	];

	// UTF-8 BOM + semicolons so Excel pt-BR opens it correctly out of the box.
	return new Response('﻿' + lines.join('\r\n'), {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="convidados.csv"'
		}
	});
};
