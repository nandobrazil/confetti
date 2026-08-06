<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/guests', label: 'Convidados' },
		{ href: '/admin/settings', label: 'Evento' }
	];

	const isLogin = $derived(page.url.pathname === '/admin/login');
	const isActive = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);
</script>

{#if isLogin}
	{@render children()}
{:else}
	<div class="min-h-svh">
		<header class="sticky top-0 z-30 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl">
			<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
				<a href="/admin" class="font-display flex items-center gap-2 font-bold">
					<span aria-hidden="true">🎛️</span>
					<span class="hidden sm:inline">Central de comando</span>
				</a>
				<nav class="flex items-center gap-1">
					{#each links as link (link.href)}
						<a
							href={link.href}
							class="rounded-full px-4 py-2 text-sm font-medium transition-colors {isActive(link.href)
								? 'bg-white/10 text-white'
								: 'text-white/50 hover:bg-white/5 hover:text-white/80'}"
						>
							{link.label}
						</a>
					{/each}
				</nav>
				<form method="POST" action="/admin/logout">
					<button
						type="submit"
						class="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-rose-400/10 hover:text-rose-300"
					>
						Sair
					</button>
				</form>
			</div>
		</header>
		<main class="mx-auto max-w-6xl px-6 py-10">
			{@render children()}
		</main>
	</div>
{/if}
