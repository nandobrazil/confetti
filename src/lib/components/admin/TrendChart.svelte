<script lang="ts">
	/**
	 * Single-series SVG line chart: cumulative expected attendees per day.
	 * Series color #8b5cf6 validated against the dark surface (dataviz checks).
	 */
	let { data }: { data: { day: string; total: number }[] } = $props();

	const W = 640;
	const H = 220;
	const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

	const maxY = $derived(Math.max(4, ...data.map((d) => d.total)));
	const xAt = (i: number) =>
		data.length === 1
			? W / 2
			: PAD.left + (i * (W - PAD.left - PAD.right)) / (data.length - 1);
	const yAt = (v: number) => H - PAD.bottom - (v / maxY) * (H - PAD.top - PAD.bottom);

	const linePath = $derived(
		data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(d.total)}`).join(' ')
	);
	const areaPath = $derived(
		data.length > 0
			? `${linePath} L${xAt(data.length - 1)},${H - PAD.bottom} L${xAt(0)},${H - PAD.bottom} Z`
			: ''
	);

	const yTicks = $derived([0, Math.round(maxY / 2), maxY]);

	let hover = $state<number | null>(null);

	function formatDay(day: string): string {
		const [, month, date] = day.split('-');
		return `${date}/${month}`;
	}

	function onMove(e: MouseEvent) {
		if (data.length === 0) return;
		const svg = e.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * W;
		let nearest = 0;
		let best = Infinity;
		for (let i = 0; i < data.length; i++) {
			const d = Math.abs(xAt(i) - x);
			if (d < best) {
				best = d;
				nearest = i;
			}
		}
		hover = nearest;
	}
</script>

{#if data.length === 0}
	<div class="flex h-52 items-center justify-center text-sm text-white/35">
		O gráfico aparece com a primeira confirmação. Divulgue o link! 📣
	</div>
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<svg
		viewBox="0 0 {W} {H}"
		class="w-full"
		role="img"
		aria-label="Confirmações acumuladas por dia"
		onmousemove={onMove}
		onmouseleave={() => (hover = null)}
	>
		<defs>
			<linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.28" />
				<stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
			</linearGradient>
		</defs>

		{#each yTicks as tick (tick)}
			<line
				x1={PAD.left}
				x2={W - PAD.right}
				y1={yAt(tick)}
				y2={yAt(tick)}
				stroke="rgba(255,255,255,0.06)"
				stroke-width="1"
			/>
			<text
				x={PAD.left - 8}
				y={yAt(tick) + 4}
				text-anchor="end"
				class="fill-white/35 text-[11px] tabular-nums"
			>
				{tick}
			</text>
		{/each}

		{#each data as d, i (d.day)}
			{#if i === 0 || i === data.length - 1 || data.length <= 8}
				<text
					x={xAt(i)}
					y={H - 8}
					text-anchor="middle"
					class="fill-white/35 text-[11px] tabular-nums"
				>
					{formatDay(d.day)}
				</text>
			{/if}
		{/each}

		<path d={areaPath} fill="url(#trend-fill)" />
		<path d={linePath} fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

		{#if hover !== null}
			<line
				x1={xAt(hover)}
				x2={xAt(hover)}
				y1={PAD.top}
				y2={H - PAD.bottom}
				stroke="rgba(255,255,255,0.15)"
				stroke-width="1"
			/>
			<circle cx={xAt(hover)} cy={yAt(data[hover].total)} r="5" fill="#8b5cf6" stroke="#14121d" stroke-width="2" />
		{/if}

		{#each data as d, i (d.day)}
			<circle
				cx={xAt(i)}
				cy={yAt(d.total)}
				r={data.length <= 14 ? 3.5 : 0}
				fill="#8b5cf6"
				stroke="#14121d"
				stroke-width="2"
			/>
		{/each}
	</svg>

	{#if hover !== null}
		<p class="mt-1 text-center text-sm text-white/70">
			<span class="font-semibold tabular-nums">{formatDay(data[hover].day)}</span>
			· {data[hover].total}
			{data[hover].total === 1 ? 'pessoa esperada' : 'pessoas esperadas'}
		</p>
	{:else}
		<p class="mt-1 text-center text-sm text-white/30">Passe o mouse para ver os valores por dia</p>
	{/if}

	<table class="sr-only">
		<caption>Confirmações acumuladas por dia</caption>
		<thead>
			<tr><th>Dia</th><th>Total esperado</th></tr>
		</thead>
		<tbody>
			{#each data as d (d.day)}
				<tr><td>{d.day}</td><td>{d.total}</td></tr>
			{/each}
		</tbody>
	</table>
{/if}
