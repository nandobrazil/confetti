<script lang="ts">
	import { page } from '$app/state';
	import { reveal } from '$lib/actions/reveal';
	import Countdown from '$lib/components/Countdown.svelte';
	import FaqItem from '$lib/components/FaqItem.svelte';
	import { formatLongDate, formatTime, parseEventDate } from '$lib/utils/date';

	let { data } = $props();
	const event = $derived(data.event);

	const faqs = [
		{
			question: 'Posso levar acompanhante?',
			answer:
				'Pode, e sem burocracia! Só adiciona o nome de cada um no formulário — é assim que a gente calcula a quantidade de carne. Matemática séria.'
		},
		{
			question: 'Preciso levar alguma coisa?',
			answer:
				'Sim: a sua bebida. O churrasco é por nossa conta, o copo é responsabilidade de cada um. E se quiser trazer aquela energia de "última pessoa a ir embora", será muito bem-vinda.'
		},
		{
			question: 'O que vai ter pra comer?',
			answer: 'Churrasco. E ponto. Se essa resposta não te convenceu, a festa talvez não seja pra você (brincadeira, vem).'
		},
		{
			question: 'E se eu confirmar e não puder ir?',
			answer:
				'Acontece. Preencha o formulário de novo com o mesmo nome ou me avisa direto — prometo não guardar rancor (por mais de dois anos).'
		},
		{
			question: 'Tem estacionamento? Como eu chego?',
			answer:
				'O botão "Como chegar" abre o endereço direto no Google Maps. Aplicativo de transporte é sempre uma boa ideia se o plano for aproveitar a festa direito.'
		},
		{
			question: 'Até que horas vai?',
			answer: 'Até a última história ser contada. Historicamente, isso demora.'
		}
	];

	const stats = [
		{ value: '87%', label: 'de aumento nas chances da festa ficar épica com a sua presença' },
		{ value: '100%', label: 'de chance de churrasco no ponto e gente melhor ainda' },
		{ value: '1', label: 'única tarefa sua: trazer a bebida que você gosta' }
	];
</script>

<svelte:head>
	<title>{event.celebrantName} faz aniversário 🎉 — Confirme sua presença</title>
	<meta
		name="description"
		content="Você foi convidado para o aniversário de {event.celebrantName}. Confirme sua presença — leva menos de um minuto."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Aniversário do {event.celebrantName} 🎉" />
	<meta
		property="og:description"
		content="{formatLongDate(event.startsAt)}, a partir das {formatTime(event.startsAt)}. {event.notes ?? ''} Toque para confirmar presença!"
	/>
	<meta property="og:url" content={page.url.origin} />
	<meta property="og:image" content="{page.url.origin}/og.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="pt_BR" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Aniversário do {event.celebrantName} 🎉" />
	<meta name="twitter:image" content="{page.url.origin}/og.jpg" />
</svelte:head>

<main class="relative">
	<!-- Ambient gradient blobs -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
		<div
			class="animate-float absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-violet-500/25 blur-[130px]"
		></div>
		<div
			class="animate-float-slow absolute top-[28rem] -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-[130px]"
		></div>
		<div
			class="animate-float absolute top-[70rem] -left-40 h-[26rem] w-[26rem] rounded-full bg-amber-400/10 blur-[130px]"
		></div>
	</div>

	<!-- Hero -->
	<section class="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center">
		<p
			use:reveal
			class="card-glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/60 uppercase"
		>
			<span class="inline-block h-2 w-2 animate-pulse-glow rounded-full bg-mint-400"></span>
			Convite oficial · edição limitada
		</p>

		<h1
			use:reveal={80}
			class="font-display max-w-4xl text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-7xl lg:text-8xl"
		>
			{event.celebrantName} está ficando
			<span class="text-gradient">{event.celebrantAge ? `${event.celebrantAge} anos` : 'mais velho'}</span>
			— e isso merece uma festa.
		</h1>

		<p use:reveal={160} class="mt-8 max-w-xl text-lg leading-relaxed text-white/60 sm:text-xl">
			{event.heroTagline}
		</p>

		<div use:reveal={240} class="mt-12">
			<a
				href="/rsvp"
				class="group font-display relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 px-10 py-5 text-lg font-bold text-white shadow-[0_8px_40px_-8px_rgba(217,70,239,0.55)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_12px_56px_-8px_rgba(217,70,239,0.75)] active:scale-[0.98]"
			>
				Confirmar presença
				<svg
					class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M5 12h14M13 6l6 6-6 6" />
				</svg>
			</a>
			<p class="mt-4 text-sm text-white/35">Leva menos de um minuto. Sério.</p>
		</div>

		<div use:reveal={320} class="mt-20 w-full max-w-2xl">
			<p class="mb-5 text-xs font-medium tracking-[0.25em] text-white/40 uppercase">
				Contagem regressiva para o grande dia
			</p>
			<Countdown target={parseEventDate(event.startsAt)} />
		</div>
	</section>

	<!-- Marquee -->
	<div class="relative overflow-hidden border-y border-white/5 py-4" aria-hidden="true">
		<div class="animate-marquee flex w-max gap-8 whitespace-nowrap">
			{#each Array(2) as _unused, i (i)}
				<span class="font-display flex gap-8 text-sm font-semibold tracking-widest text-white/25 uppercase">
					<span>Missão: comer, beber, rir e criar histórias</span>
					<span class="text-fuchsia-400/60">✦</span>
					<span>Churrasco no capricho</span>
					<span class="text-amber-300/60">✦</span>
					<span>Traga sua bebida</span>
					<span class="text-violet-400/60">✦</span>
					<span>Presença > presente</span>
					<span class="text-mint-400/60">✦</span>
				</span>
			{/each}
		</div>
	</div>

	<!-- Event info -->
	<section class="relative mx-auto max-w-5xl px-6 py-28">
		<h2 use:reveal class="font-display text-3xl font-bold tracking-tight sm:text-5xl">
			O plano é simples.<br />
			<span class="text-white/40">Você aparece, a mágica acontece.</span>
		</h2>

		<div class="mt-14 grid gap-5 sm:grid-cols-2">
			<div use:reveal class="card-glass p-8 transition-colors duration-300 hover:border-violet-400/30">
				<div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
					</svg>
				</div>
				<h3 class="font-display text-lg font-semibold">Quando</h3>
				<p class="mt-2 text-white/60">{formatLongDate(event.startsAt)}</p>
				<p class="text-white/60">A partir das {formatTime(event.startsAt)}</p>
			</div>

			<div use:reveal={80} class="card-glass p-8 transition-colors duration-300 hover:border-fuchsia-400/30">
				<div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-400">
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
					</svg>
				</div>
				<h3 class="font-display text-lg font-semibold">Onde</h3>
				<p class="mt-2 text-white/60">{event.venueName}</p>
				<p class="text-white/60">{event.address}</p>
				<a
					href={event.mapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fuchsia-400 transition-colors hover:text-fuchsia-300"
				>
					Como chegar
					<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M7 17 17 7M8 7h9v9" />
					</svg>
				</a>
			</div>

			{#if event.dressCode}
				<div use:reveal class="card-glass p-8 transition-colors duration-300 hover:border-amber-300/30">
					<div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="m9 4-5 4 2.5 3L9 9.5V20h6V9.5l2.5 1.5L20 8l-5-4a3 3 0 0 1-6 0Z" />
						</svg>
					</div>
					<h3 class="font-display text-lg font-semibold">Dress code</h3>
					<p class="mt-2 text-white/60">{event.dressCode}</p>
				</div>
			{/if}

			{#if event.notes}
				<div use:reveal={80} class="card-glass p-8 transition-colors duration-300 hover:border-mint-400/30">
					<div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-mint-400/15 text-mint-400">
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /><circle cx="12" cy="12" r="4" />
						</svg>
					</div>
					<h3 class="font-display text-lg font-semibold">Bom saber</h3>
					<p class="mt-2 text-white/60">{event.notes}</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Stats / fun numbers -->
	<section class="relative mx-auto max-w-5xl px-6 pb-28">
		<div class="card-glass grid gap-10 p-10 sm:grid-cols-3 sm:gap-6 sm:p-12">
			{#each stats as stat, i (stat.label)}
				<div use:reveal={i * 90} class="text-center sm:text-left">
					<p class="font-display text-gradient text-5xl font-bold">{stat.value}</p>
					<p class="mt-3 text-sm leading-relaxed text-white/50">{stat.label}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- FAQ -->
	<section class="relative mx-auto max-w-3xl px-6 pb-28">
		<h2 use:reveal class="font-display text-3xl font-bold tracking-tight sm:text-4xl">
			Perguntas que você <span class="text-gradient">ia fazer mesmo</span>
		</h2>
		<div class="mt-10 flex flex-col gap-4">
			{#each faqs as faq, i (faq.question)}
				<div use:reveal={i * 60}>
					<FaqItem question={faq.question} answer={faq.answer} />
				</div>
			{/each}
		</div>
	</section>

	<!-- Final CTA -->
	<section class="relative mx-auto max-w-4xl px-6 pb-32 text-center">
		<div use:reveal class="card-glass relative overflow-hidden p-12 sm:p-16">
			<div
				class="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-[90px]"
				aria-hidden="true"
			></div>
			<h2 class="font-display relative text-3xl font-bold tracking-tight text-balance sm:text-5xl">
				Bora fazer história? 🥂
			</h2>
			<p class="relative mt-4 text-white/55">
				Um clique agora, uma noite inesquecível depois. Matemática simples.
			</p>
			<a
				href="/rsvp"
				class="font-display relative mt-8 inline-flex items-center gap-3 rounded-full bg-cream px-9 py-4 text-lg font-bold text-ink-900 transition-all duration-300 hover:scale-[1.04] hover:bg-white active:scale-[0.98]"
			>
				Confirmar presença
			</a>
		</div>
	</section>

	<footer class="relative border-t border-white/5 px-6 py-10 text-center">
		<p class="text-sm text-white/30">
			Feito com carinho (e um pouco de ansiedade pré-festa) por {event.celebrantName} · {new Date(
				event.startsAt
			).getFullYear()}
		</p>
	</footer>
</main>
