import { getEvent } from '$lib/server/event';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { event: await getEvent() };
};
