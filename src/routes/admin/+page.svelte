<script lang="ts">
	import TrendChart from '$lib/components/admin/TrendChart.svelte';

	let { data } = $props();

	const tiles = $derived([
		{ label: 'Respostas', value: data.stats.responses, accent: 'text-white' },
		{ label: 'Confirmados', value: data.stats.confirmed, accent: 'text-mint-400' },
		{ label: 'Recusaram', value: data.stats.declined, accent: 'text-rose-400' },
		{ label: 'Acompanhantes', value: data.stats.companions, accent: 'text-fuchsia-400' },
		{ label: 'Total esperado', value: data.stats.expected, accent: 'text-gradient' }
	]);
</script>

<svelte:head>
	<title>Dashboard — painel</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<div>
		<h1 class="font-display text-3xl font-bold">Dashboard</h1>
		<p class="mt-1 text-sm text-white/45">O placar da festa, em tempo real.</p>
	</div>
	<span
		class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium {data.rsvpOpen
			? 'bg-mint-400/10 text-mint-400'
			: 'bg-amber-400/10 text-amber-300'}"
	>
		<span class="h-2 w-2 rounded-full {data.rsvpOpen ? 'bg-mint-400' : 'bg-amber-300'}"></span>
		{data.rsvpOpen ? 'Confirmações abertas' : 'Confirmações encerradas'}
	</span>
</div>

<div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
	{#each tiles as tile (tile.label)}
		<div class="card-glass p-5">
			<p class="text-xs font-medium tracking-wider text-white/40 uppercase">{tile.label}</p>
			<p class="font-display mt-2 text-4xl font-bold tabular-nums {tile.accent}">{tile.value}</p>
		</div>
	{/each}
</div>

<div class="card-glass mt-6 p-6 sm:p-8">
	<h2 class="font-display text-lg font-semibold">Confirmações acumuladas</h2>
	<p class="mb-6 text-sm text-white/40">Pessoas esperadas (convidados + acompanhantes) por dia de resposta</p>
	<TrendChart data={data.trend} />
</div>

<div class="mt-6 flex flex-wrap gap-3">
	<a
		href="/admin/guests"
		class="card-glass font-display rounded-full px-6 py-3 text-sm font-semibold transition-all hover:border-white/20"
	>
		Ver lista de convidados →
	</a>
	<a
		href="/admin/export/csv"
		data-sveltekit-preload-data="off"
		class="card-glass font-display rounded-full px-6 py-3 text-sm font-semibold transition-all hover:border-white/20"
	>
		Exportar CSV
	</a>
	<a
		href="/admin/export/xlsx"
		data-sveltekit-preload-data="off"
		class="card-glass font-display rounded-full px-6 py-3 text-sm font-semibold transition-all hover:border-white/20"
	>
		Exportar Excel
	</a>
</div>
