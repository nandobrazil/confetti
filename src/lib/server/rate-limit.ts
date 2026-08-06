/**
 * Minimal in-memory sliding-window rate limiter. Good enough for a single
 * instance behind Traefik; state resets on restart, which is acceptable here.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
	const now = Date.now();
	const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
	if (hits.length >= limit) {
		buckets.set(key, hits);
		return false;
	}
	hits.push(now);
	buckets.set(key, hits);
	return true;
}

// Prevent unbounded growth from many distinct IPs.
setInterval(() => {
	const now = Date.now();
	for (const [key, hits] of buckets) {
		const fresh = hits.filter((t) => now - t < 60 * 60 * 1000);
		if (fresh.length === 0) buckets.delete(key);
		else buckets.set(key, fresh);
	}
}, 10 * 60 * 1000).unref?.();
