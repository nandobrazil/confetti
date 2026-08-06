<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Login — painel</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="relative flex min-h-svh items-center justify-center px-6">
	<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
		<div class="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[120px]"></div>
	</div>

	<div class="card-glass relative w-full max-w-sm p-8 sm:p-10">
		<span class="text-3xl" aria-hidden="true">🎛️</span>
		<h1 class="font-display mt-4 text-2xl font-bold">Central de comando</h1>
		<p class="mt-1 text-sm text-white/45">Área restrita ao comitê organizador da festa.</p>

		<form
			method="POST"
			class="mt-8 flex flex-col gap-4"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
		>
			{#if form?.error}
				<p
					class="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
					transition:fly={{ y: -6, duration: 200 }}
					role="alert"
				>
					{form.error}
				</p>
			{/if}

			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Usuário</span>
				<input
					type="text"
					name="username"
					required
					autocomplete="username"
					class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60"
				/>
			</label>

			<label class="flex flex-col gap-2">
				<span class="text-sm font-medium text-white/70">Senha</span>
				<input
					type="password"
					name="password"
					required
					autocomplete="current-password"
					class="card-glass rounded-xl px-4 py-3 outline-none transition-colors focus:border-violet-400/60"
				/>
			</label>

			<button
				type="submit"
				disabled={submitting}
				class="font-display mt-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3.5 font-bold transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
			>
				{submitting ? 'Entrando…' : 'Entrar'}
			</button>
		</form>
	</div>
</main>
