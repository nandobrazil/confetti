<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, fly, scale } from 'svelte/transition';
	import Confetti from '$lib/components/Confetti.svelte';

	let { data, form } = $props();
	const event = $derived(data.event);

	let attending = $state<'yes' | 'no' | null>(null);
	let companionCount = $state(0);
	let submitting = $state(false);

	const maxCompanions = $derived(event.maxCompanions);
	const success = $derived(form?.success === true);

	function setCompanions(delta: number) {
		companionCount = Math.min(maxCompanions, Math.max(0, companionCount + delta));
	}
</script>

<svelte:head>
	<title>Confirmar presença — aniversário de {event.celebrantName}</title>
</svelte:head>

<main class="relative flex min-h-svh flex-col items-center px-6 py-14 sm:py-20">
	<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
		<div class="animate-float absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[130px]"></div>
	</div>

	{#if success}
		<Confetti />
		<div
			class="relative flex min-h-[70svh] max-w-xl flex-col items-center justify-center text-center"
			in:scale={{ duration: 500, start: 0.9 }}
		>
			{#if form?.attending}
				<span class="text-7xl" aria-hidden="true">🎉</span>
				<h1 class="font-display mt-8 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
					Presença confirmada, <span class="text-gradient">{form?.guestName}</span>!
				</h1>
				<p class="mt-6 text-lg leading-relaxed text-white/60">{event.successMessage}</p>
				<p class="mt-2 text-white/40">
					A festa acabou de ficar estatisticamente 87% mais épica. Isso é ciência.
				</p>
			{:else}
				<span class="text-7xl" aria-hidden="true">🥲</span>
				<h1 class="font-display mt-8 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
					Vamos sentir sua falta, {form?.guestName}.
				</h1>
				<p class="mt-6 text-lg leading-relaxed text-white/60">
					Resposta registrada. Se mudar de ideia, a porta (e o formulário) continuam abertos.
				</p>
			{/if}
			<a
				href="/"
				class="card-glass font-display mt-10 rounded-full px-8 py-4 font-semibold transition-all duration-300 hover:scale-[1.03] hover:border-white/20"
			>
				Voltar ao convite
			</a>
		</div>
	{:else}
		<a
			href="/"
			class="relative mb-10 inline-flex items-center gap-2 self-start text-sm text-white/40 transition-colors hover:text-white/70"
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M19 12H5M11 18l-6-6 6-6" />
			</svg>
			Voltar ao convite
		</a>

		<div class="relative w-full max-w-xl" in:fade={{ duration: 400 }}>
			<h1 class="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
				Chegou a hora da <span class="text-gradient">decisão</span>.
			</h1>
			<p class="mt-4 text-white/55">
				Sem pressão. Mas saiba que uma resposta positiva melhora o dia de {event.celebrantName} em
				níveis mensuráveis.
			</p>

			{#if !event.rsvpOpen}
				<div class="card-glass mt-10 border-amber-300/30 p-8 text-center">
					<span class="text-4xl" aria-hidden="true">🔒</span>
					<p class="font-display mt-4 text-xl font-semibold">Confirmações encerradas</p>
					<p class="mt-2 text-white/55">
						A lista fechou! Se você ficou de fora, fala direto com {event.celebrantName} — jeitinho
						sempre existe.
					</p>
				</div>
			{:else}
				<form
					method="POST"
					class="mt-10 flex flex-col gap-8"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							submitting = false;
							await update();
							window.scrollTo({ top: 0, behavior: 'smooth' });
						};
					}}
				>
					{#if form?.formError}
						<div
							class="card-glass border-rose-400/40 bg-rose-400/10 px-5 py-4 text-sm text-rose-200"
							transition:fly={{ y: -8, duration: 250 }}
							role="alert"
						>
							{form.formError}
						</div>
					{/if}

					<label class="flex flex-col gap-2.5">
						<span class="font-display text-sm font-semibold tracking-wide">Seu nome</span>
						<input
							type="text"
							name="name"
							required
							minlength="2"
							maxlength="120"
							placeholder="Como você é conhecido por aí"
							class="card-glass rounded-2xl px-5 py-4 text-base placeholder-white/25 transition-colors duration-300 outline-none focus:border-violet-400/60"
						/>
					</label>

					<fieldset class="flex flex-col gap-2.5">
						<legend class="font-display mb-2.5 text-sm font-semibold tracking-wide">
							Você vai comparecer?
						</legend>
						<div class="grid grid-cols-2 gap-3">
							<label
								class="card-glass cursor-pointer p-5 text-center transition-all duration-300 hover:border-white/20 has-checked:border-mint-400/60 has-checked:bg-mint-400/10"
							>
								<input
									type="radio"
									name="attending"
									value="yes"
									required
									class="sr-only"
									onchange={() => (attending = 'yes')}
								/>
								<span class="text-3xl" aria-hidden="true">🕺</span>
								<span class="font-display mt-2 block font-semibold">Óbvio que sim</span>
								<span class="mt-1 block text-xs text-white/40">decisão correta</span>
							</label>
							<label
								class="card-glass cursor-pointer p-5 text-center transition-all duration-300 hover:border-white/20 has-checked:border-rose-400/60 has-checked:bg-rose-400/10"
							>
								<input
									type="radio"
									name="attending"
									value="no"
									class="sr-only"
									onchange={() => (attending = 'no')}
								/>
								<span class="text-3xl" aria-hidden="true">💔</span>
								<span class="font-display mt-2 block font-semibold">Não vou conseguir</span>
								<span class="mt-1 block text-xs text-white/40">vamos superar (talvez)</span>
							</label>
						</div>
					</fieldset>

					{#if attending === 'yes'}
						<div class="flex flex-col gap-8" transition:fly={{ y: 12, duration: 350 }}>
							<div class="flex flex-col gap-2.5">
								<span class="font-display text-sm font-semibold tracking-wide">
									Vai levar acompanhantes?
								</span>
								<div class="card-glass flex items-center justify-between px-5 py-4">
									<p class="text-sm text-white/50">
										{#if companionCount === 0}
											Indo solo — respeitável.
										{:else if companionCount === 1}
											1 acompanhante
										{:else}
											{companionCount} acompanhantes
										{/if}
										<span class="block text-xs text-white/30">máximo de {maxCompanions}</span>
									</p>
									<div class="flex items-center gap-3">
										<button
											type="button"
											onclick={() => setCompanions(-1)}
											disabled={companionCount === 0}
											aria-label="Remover acompanhante"
											class="card-glass flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl transition-all duration-200 hover:border-white/25 disabled:cursor-default disabled:opacity-30"
										>
											−
										</button>
										<span class="font-display w-6 text-center text-xl font-bold tabular-nums">
											{companionCount}
										</span>
										<button
											type="button"
											onclick={() => setCompanions(1)}
											disabled={companionCount >= maxCompanions}
											aria-label="Adicionar acompanhante"
											class="card-glass flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl transition-all duration-200 hover:border-white/25 disabled:cursor-default disabled:opacity-30"
										>
											+
										</button>
									</div>
								</div>
							</div>

							{#each Array(companionCount) as _unused, i (i)}
								<label class="flex flex-col gap-2.5" transition:fly={{ y: 10, duration: 280 }}>
									<span class="font-display text-sm font-semibold tracking-wide">
										Nome do acompanhante {companionCount > 1 ? i + 1 : ''}
									</span>
									<input
										type="text"
										name="companionName"
										required
										minlength="2"
										maxlength="120"
										placeholder="Quem vem com você?"
										class="card-glass rounded-2xl px-5 py-4 text-base placeholder-white/25 transition-colors duration-300 outline-none focus:border-violet-400/60"
									/>
								</label>
							{/each}

							<label class="flex flex-col gap-2.5">
								<span class="font-display text-sm font-semibold tracking-wide">
									Restrições alimentares
									<span class="ml-1 font-normal text-white/35">(opcional)</span>
								</span>
								<input
									type="text"
									name="dietaryRestrictions"
									maxlength="500"
									placeholder="Vegetariano, sem glúten, alergia a decepção…"
									class="card-glass rounded-2xl px-5 py-4 text-base placeholder-white/25 transition-colors duration-300 outline-none focus:border-violet-400/60"
								/>
							</label>
						</div>
					{/if}

					{#if attending !== null}
						<label class="flex flex-col gap-2.5" transition:fly={{ y: 12, duration: 350 }}>
							<span class="font-display text-sm font-semibold tracking-wide">
								Quer deixar um recado?
								<span class="ml-1 font-normal text-white/35">(opcional)</span>
							</span>
							<textarea
								name="comments"
								rows="3"
								maxlength="1000"
								placeholder="Um pedido de música, uma ameaça carinhosa, um poema…"
								class="card-glass resize-none rounded-2xl px-5 py-4 text-base placeholder-white/25 transition-colors duration-300 outline-none focus:border-violet-400/60"
							></textarea>
						</label>
					{/if}

					<button
						type="submit"
						disabled={submitting || attending === null}
						class="group font-display relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 px-10 py-5 text-lg font-bold text-white shadow-[0_8px_40px_-8px_rgba(217,70,239,0.55)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_56px_-8px_rgba(217,70,239,0.75)] active:scale-[0.98] disabled:cursor-default disabled:opacity-40 disabled:hover:scale-100"
					>
						{#if submitting}
							<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
								<path d="M12 3a9 9 0 1 0 9 9" />
							</svg>
							Registrando…
						{:else if attending === 'no'}
							Enviar resposta mesmo assim
						{:else}
							Confirmar presença 🎉
						{/if}
					</button>
				</form>
			{/if}
		</div>
	{/if}
</main>
