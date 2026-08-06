<script lang="ts">
	import { slide } from 'svelte/transition';

	let { question, answer }: { question: string; answer: string } = $props();
	let open = $state(false);
</script>

<div class="card-glass overflow-hidden transition-colors duration-300 hover:border-white/15">
	<button
		type="button"
		class="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
		onclick={() => (open = !open)}
		aria-expanded={open}
	>
		<span class="font-display text-base font-semibold sm:text-lg">{question}</span>
		<svg
			class="h-5 w-5 shrink-0 text-white/40 transition-transform duration-300 {open ? 'rotate-45' : ''}"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
		>
			<path d="M12 5v14M5 12h14" />
		</svg>
	</button>
	{#if open}
		<p class="px-6 pb-6 text-sm leading-relaxed text-white/60 sm:text-base" transition:slide={{ duration: 300 }}>
			{answer}
		</p>
	{/if}
</div>
