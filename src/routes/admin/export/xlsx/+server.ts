import { error } from '@sveltejs/kit';
import ExcelJS from 'exceljs';
import { EXPORT_HEADERS, fetchExportRows } from '$lib/server/export';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.admin) error(404, 'Não encontrado');

	const rows = await fetchExportRows();

	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet('Convidados');

	sheet.columns = EXPORT_HEADERS.map((h) => ({
		header: h.label,
		key: h.key,
		width: h.key === 'name' || h.key === 'companionNames' || h.key === 'comments' ? 32 : 18
	}));
	sheet.getRow(1).font = { bold: true };
	sheet.addRows(rows);

	const buffer = await workbook.xlsx.writeBuffer();

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename="convidados.xlsx"'
		}
	});
};
