<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, fly } from 'svelte/transition';

	let { data, form } = $props();

	type GuestRow = (typeof data.guests)[number];

	let search = $state('');
	let filter = $state<'all' | 'confirmed' | 'declined'>('all');
	let sortBy = $state<'recent' | 'name'>('recent');
	let editing = $state<GuestRow | null>(null);
	let confirmingDelete = $state<GuestRow | null>(null);
	let editCompanions = $state<string[]>([]);
	let editAttending = $state<'yes' | 'no'>('yes');

	const filtered = $derived(
		data.guests
			.filter((g) => {
				if (filter === 'confirmed' && !g.attending) return false;
				if (filter === 'declined' && g.attending) return false;
				const q = search.trim().toLowerCase();
				if (!q) return true;
				return (
					g.name.toLowerCase().includes(q) ||
					g.companions.some((c) => c.name.toLowerCase().includes(q))
				);
			})
			.toSorted((a, b) =>
				sortBy === 'name' ? a.name.localeCompare(b.name, 'pt-BR') : b.createdAt.localeCompare(a.createdAt)
			)
	);

	function openEdit(guest: GuestRow) {
		editing = guest;
		editAttending = guest.attending ? 'yes' : 'no';
		editCompanions = guest.companions.map((c) => c.name);
	}

	function formatDate(iso: string): string {
		return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(
			new Date(iso.replace(' ', 'T') + 'Z')
		);
	}
</script>

<svelte:head>
	<title>Convidados — painel</title>
</svelte:head>

<div class="flex flex-wrap items-end justify-between gap-4">
	<div>
		<h1 class="font-display text-3xl font-bold">Convidados</h1>
		<p class="mt-1 text-sm text-white/45">
			{data.guests.length}
			{data.guests.length === 1 ? 'resposta' : 'respostas'} até agora
		</p>
	</div>
	<div class="flex gap-2">
		<a
			href="/admin/export/csv"
			data-sveltekit-preload-data="off"
			class="card-glass rounded-full px-4 py-2 text-sm font-medium transition-all hover:border-white/20"
		>
			CSV
		</a>
		<a
			href="/admin/export/xlsx"
			data-sveltekit-preload-data="off"
			class="card-glass rounded-full px-4 py-2 text-sm font-medium transition-all hover:border-white/20"
		>
			Excel
		</a>
	</div>
</div>

<div class="mt-6 flex flex-wrap items-center gap-3">
	<div class="card-glass flex flex-1 items-center gap-2 rounded-full px-4 py-2.5 sm:max-w-xs">
		<svg class="h-4 w-4 shrink-0 text-white/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
			<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
		</svg>
		<input
			type="search"
			bind:value={search}
			placeholder="Buscar por nome…"
			class="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
		/>
	</div>

	<div class="card-glass flex rounded-full p-1">
		{#each [['all', 'Todos'], ['confirmed', 'Confirmados'], ['declined', 'Recusaram']] as [value, label] (value)}
			<button
				type="button"
				onclick={() => (filter = value as typeof filter)}
				class="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors {filter === value
					? 'bg-white/10 text-white'
					: 'text-white/45 hover:text-white/75'}"
			>
				{label}
			</button>
		{/each}
	</div>

	<button
		type="button"
		onclick={() => (sortBy = sortBy === 'recent' ? 'name' : 'recent')}
		class="card-glass cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-white/20"
	>
		{sortBy === 'recent' ? 'Mais recentes ↓' : 'Nome A–Z ↓'}
	</button>
</div>

{#if form?.error}
	<p class="mt-4 rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
		{form.error}
	</p>
{/if}

{#if filtered.length === 0}
	<div class="card-glass mt-6 p-12 text-center text-white/40">
		{search || filter !== 'all' ? 'Nenhum resultado com esses filtros.' : 'Nenhuma resposta ainda. Divulgue o link! 📣'}
	</div>
{:else}
	<div class="mt-6 flex flex-col gap-3">
		{#each filtered as guest (guest.id)}
			<div class="card-glass p-5 transition-colors hover:border-white/15" transition:fade={{ duration: 150 }}>
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-2.5">
							<span class="font-display font-semibold">{guest.name}</span>
							{#if guest.attending}
								<span class="rounded-full bg-mint-400/10 px-2.5 py-0.5 text-xs font-medium text-mint-400">
									Confirmado
								</span>
							{:else}
								<span class="rounded-full bg-rose-400/10 px-2.5 py-0.5 text-xs font-medium text-rose-400">
									Não vai
								</span>
							{/if}
							{#if guest.companions.length > 0}
								<span class="rounded-full bg-fuchsia-400/10 px-2.5 py-0.5 text-xs font-medium text-fuchsia-400">
									+{guest.companions.length}
								</span>
							{/if}
						</div>
						{#if guest.companions.length > 0}
							<p class="mt-1.5 text-sm text-white/45">
								Com: {guest.companions.map((c) => c.name).join(', ')}
							</p>
						{/if}
						{#if guest.dietaryRestrictions}
							<p class="mt-1.5 text-sm text-amber-300/80">🥗 {guest.dietaryRestrictions}</p>
						{/if}
						{#if guest.comments}
							<p class="mt-1.5 text-sm text-white/55 italic">“{guest.comments}”</p>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						<span class="mr-2 text-xs text-white/30 tabular-nums">{formatDate(guest.createdAt)}</span>
						<button
							type="button"
							onclick={() => openEdit(guest)}
							class="card-glass cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-white/25 hover:text-white"
						>
							Editar
						</button>
						<button
							type="button"
							onclick={() => (confirmingDelete = guest)}
							class="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
						>
							Excluir
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if editing}
	<div
		class="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
		transition:fade={{ duration: 150 }}
		onclick={(e) => e.target === e.currentTarget && (editing = null)}
		onkeydown={(e) => e.key === 'Escape' && (editing = null)}
		role="presentation"
	>
		<div
			class="card-glass max-h-[90svh] w-full max-w-lg overflow-y-auto !rounded-b-none bg-ink-800/95 p-7 sm:!rounded-3xl"
			transition:fly={{ y: 40, duration: 250 }}
			role="dialog"
			aria-modal="true"
			aria-label="Editar resposta"
		>
			<h2 class="font-display text-xl font-bold">Editar resposta</h2>

			<form
				method="POST"
				action="?/update"
				class="mt-6 flex flex-col gap-5"
				use:enhance={() => {
					return async ({ update }) => {
						editing = null;
						await update();
					};
				}}
			>
				<input type="hidden" name="id" value={editing.id} />

				<label class="flex flex-col gap-2">
					<span class="text-sm font-medium text-white/70">Nome</span>
					<input
						type="text"
						name="name"
						value={editing.name}
						required
						minlength="2"
						class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60"
					/>
				</label>

				<div class="grid grid-cols-2 gap-3">
					<label class="card-glass cursor-pointer p-3.5 text-center text-sm font-medium transition-all has-checked:border-mint-400/60 has-checked:bg-mint-400/10">
						<input
							type="radio"
							name="attending"
							value="yes"
							checked={editing.attending}
							onchange={() => (editAttending = 'yes')}
							class="sr-only"
						/>
						Confirmado
					</label>
					<label class="card-glass cursor-pointer p-3.5 text-center text-sm font-medium transition-all has-checked:border-rose-400/60 has-checked:bg-rose-400/10">
						<input
							type="radio"
							name="attending"
							value="no"
							checked={!editing.attending}
							onchange={() => (editAttending = 'no')}
							class="sr-only"
						/>
						Não vai
					</label>
				</div>

				{#if editAttending === 'yes'}
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-white/70">Acompanhantes</span>
							<button
								type="button"
								onclick={() => (editCompanions = [...editCompanions, ''])}
								disabled={editCompanions.length >= data.maxCompanions}
								class="cursor-pointer text-sm font-medium text-violet-400 transition-colors hover:text-violet-300 disabled:opacity-30"
							>
								+ adicionar
							</button>
						</div>
						{#each editCompanions as _companion, i (i)}
							<div class="flex gap-2">
								<input
									type="text"
									name="companionName"
									bind:value={editCompanions[i]}
									placeholder="Nome do acompanhante"
									class="card-glass flex-1 rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60"
								/>
								<button
									type="button"
									onclick={() => (editCompanions = editCompanions.filter((_, j) => j !== i))}
									aria-label="Remover acompanhante"
									class="card-glass cursor-pointer rounded-xl px-4 text-white/40 transition-colors hover:text-rose-300"
								>
									✕
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<label class="flex flex-col gap-2">
					<span class="text-sm font-medium text-white/70">Restrições alimentares</span>
					<input
						type="text"
						name="dietaryRestrictions"
						value={editing.dietaryRestrictions ?? ''}
						class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60"
					/>
				</label>

				<label class="flex flex-col gap-2">
					<span class="text-sm font-medium text-white/70">Comentários</span>
					<textarea
						name="comments"
						rows="2"
						class="card-glass resize-none rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60"
						>{editing.comments ?? ''}</textarea
					>
				</label>

				<div class="mt-2 flex gap-3">
					<button
						type="submit"
						class="font-display flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 font-bold transition-all hover:brightness-110 active:scale-[0.98]"
					>
						Salvar
					</button>
					<button
						type="button"
						onclick={() => (editing = null)}
						class="card-glass cursor-pointer rounded-xl px-6 py-3 font-medium text-white/60 transition-all hover:border-white/20"
					>
						Cancelar
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if confirmingDelete}
	<div
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
		onclick={(e) => e.target === e.currentTarget && (confirmingDelete = null)}
		onkeydown={(e) => e.key === 'Escape' && (confirmingDelete = null)}
		role="presentation"
	>
		<div
			class="card-glass w-full max-w-sm bg-ink-800/95 p-7 text-center"
			transition:fly={{ y: 20, duration: 200 }}
			role="dialog"
			aria-modal="true"
			aria-label="Confirmar exclusão"
		>
			<p class="font-display text-lg font-bold">Excluir a resposta de {confirmingDelete.name}?</p>
			<p class="mt-2 text-sm text-white/50">Essa ação não pode ser desfeita.</p>
			<form
				method="POST"
				action="?/delete"
				class="mt-6 flex gap-3"
				use:enhance={() => {
					return async ({ update }) => {
						confirmingDelete = null;
						await update();
					};
				}}
			>
				<input type="hidden" name="id" value={confirmingDelete.id} />
				<button
					type="submit"
					class="font-display flex-1 cursor-pointer rounded-xl bg-rose-500/80 px-6 py-3 font-bold transition-all hover:bg-rose-500 active:scale-[0.98]"
				>
					Excluir
				</button>
				<button
					type="button"
					onclick={() => (confirmingDelete = null)}
					class="card-glass flex-1 cursor-pointer rounded-xl px-6 py-3 font-medium text-white/60 transition-all hover:border-white/20"
				>
					Cancelar
				</button>
			</form>
		</div>
	</div>
{/if}
