<script lang="ts">
	let { target }: { target: Date } = $props();

	let now = $state(Date.now());

	$effect(() => {
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	const diff = $derived(Math.max(0, target.getTime() - now));
	const days = $derived(Math.floor(diff / 86_400_000));
	const hours = $derived(Math.floor(diff / 3_600_000) % 24);
	const minutes = $derived(Math.floor(diff / 60_000) % 60);
	const seconds = $derived(Math.floor(diff / 1000) % 60);

	const units = $derived([
		{ value: days, label: 'dias' },
		{ value: hours, label: 'horas' },
		{ value: minutes, label: 'min' },
		{ value: seconds, label: 'seg' }
	]);

	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<div class="flex items-center justify-center gap-2 sm:gap-4" role="timer" aria-label="Contagem regressiva para a festa">
	{#each units as unit, i (unit.label)}
		{#if i > 0}
			<span class="animate-pulse-glow pb-6 font-display text-xl text-white/25 sm:text-3xl">:</span>
		{/if}
		<div class="card-glass flex w-[4.4rem] flex-col items-center py-3 sm:w-24 sm:py-5">
			<span class="font-display text-3xl font-bold tabular-nums sm:text-5xl">
				{pad(unit.value)}
			</span>
			<span class="mt-1 text-[0.65rem] font-medium tracking-[0.2em] text-white/40 uppercase sm:text-xs">
				{unit.label}
			</span>
		</div>
	{/each}
</div>

{#if diff === 0}
	<p class="mt-6 text-center font-display text-xl text-amber-300">É hoje. É agora. 🎉</p>
{/if}
