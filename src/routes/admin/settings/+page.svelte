<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';

	let { data, form } = $props();
	const event = $derived(data.event);
	let saved = $state(false);
</script>

<svelte:head>
	<title>Evento — painel</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<h1 class="font-display text-3xl font-bold">Dados do evento</h1>
	<p class="mt-1 text-sm text-white/45">Tudo que aparece no convite é editável aqui.</p>

	{#if form?.error}
		<p class="mt-6 rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
			{form.error}
		</p>
	{/if}
	{#if saved}
		<p
			class="mt-6 rounded-xl border border-mint-400/40 bg-mint-400/10 px-4 py-3 text-sm text-mint-400"
			transition:fade={{ duration: 200 }}
			role="status"
		>
			Salvo! O convite já está atualizado. ✨
		</p>
	{/if}

	<form
		method="POST"
		class="mt-8 flex flex-col gap-6"
		use:enhance={() => {
			return async ({ update, result }) => {
				await update({ reset: false });
				if (result.type === 'success') {
					saved = true;
					setTimeout(() => (saved = false), 3500);
				}
			};
		}}
	>
		<div class="card-glass flex flex-col gap-5 p-6">
			<h2 class="font-display font-semibold text-white/80">O aniversariante</h2>
			<div class="grid gap-4 sm:grid-cols-[1fr_8rem]">
				<label class="flex flex-col gap-2">
					<span class="text-sm font-medium text-white/70">Nome</span>
					<input type="text" name="celebrantName" value={event.celebrantName} required class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60" />
				</label>
				<label class="flex flex-col gap-2">
					<span class="text-sm font-medium text-white/70">Idade <span class="text-white/35">(opcional)</span></span>
					<input type="number" name="celebrantAge" value={event.celebrantAge ?? ''} min="1" max="150" class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60" />
				</label>
			</div>
		</div>

		<div class="card-glass flex flex-col gap-5 p-6">
			<h2 class="font-display font-semibold text-white/80">Quando e onde</h2>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Data e hora</span>
				<input type="datetime-local" name="startsAt" value={event.startsAt} required class="card-glass rounded-xl px-4 py-3 outline-none transition-colors [color-scheme:dark] focus:border-violet-400/60" />
			</label>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Nome do local</span>
				<input type="text" name="venueName" value={event.venueName} required class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60" />
			</label>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Endereço</span>
				<input type="text" name="address" value={event.address} required class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60" />
			</label>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Link do Google Maps</span>
				<input type="url" name="mapsUrl" value={event.mapsUrl} required class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60" />
			</label>
		</div>

		<div class="card-glass flex flex-col gap-5 p-6">
			<h2 class="font-display font-semibold text-white/80">Detalhes</h2>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Dress code <span class="text-white/35">(opcional)</span></span>
				<input type="text" name="dressCode" value={event.dressCode ?? ''} class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60" />
			</label>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Observações <span class="text-white/35">(opcional)</span></span>
				<textarea name="notes" rows="2" class="card-glass resize-none rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60">{event.notes ?? ''}</textarea>
			</label>
		</div>

		<div class="card-glass flex flex-col gap-5 p-6">
			<h2 class="font-display font-semibold text-white/80">Mensagens</h2>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Frase de destaque (hero)</span>
				<textarea name="heroTagline" rows="2" required class="card-glass resize-none rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60">{event.heroTagline}</textarea>
			</label>
			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Mensagem de sucesso (após confirmar)</span>
				<textarea name="successMessage" rows="2" required class="card-glass resize-none rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60">{event.successMessage}</textarea>
			</label>
		</div>

		<div class="card-glass flex flex-col gap-5 p-6">
			<h2 class="font-display font-semibold text-white/80">Regras do RSVP</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="flex flex-col gap-2">
					<span class="text-sm font-medium text-white/70">Máximo de acompanhantes</span>
					<input type="number" name="maxCompanions" value={event.maxCompanions} min="0" max="20" required class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60" />
				</label>
				<fieldset class="flex flex-col gap-2">
					<legend class="mb-2 text-sm font-medium text-white/70">Confirmações</legend>
					<div class="grid grid-cols-2 gap-2">
						<label class="card-glass cursor-pointer px-4 py-3 text-center text-sm font-medium transition-all has-checked:border-mint-400/60 has-checked:bg-mint-400/10">
							<input type="radio" name="rsvpOpen" value="yes" checked={event.rsvpOpen} class="sr-only" />
							Abertas
						</label>
						<label class="card-glass cursor-pointer px-4 py-3 text-center text-sm font-medium transition-all has-checked:border-amber-300/60 has-checked:bg-amber-400/10">
							<input type="radio" name="rsvpOpen" value="no" checked={!event.rsvpOpen} class="sr-only" />
							Encerradas
						</label>
					</div>
				</fieldset>
			</div>
		</div>

		<button
			type="submit"
			class="font-display rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 font-bold transition-all hover:brightness-110 active:scale-[0.98]"
		>
			Salvar alterações
		</button>
	</form>
</div>
