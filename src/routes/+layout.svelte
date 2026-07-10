<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	let isDark = $state(false);
	let menuOpen = $state(false);
	let menuBtn: HTMLButtonElement | undefined = $state();

	onMount(() => {
		const stored = localStorage.getItem('theme');
		if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			isDark = true;
			document.documentElement.classList.add('dark');
		}
	});

	function toggleDark() {
		isDark = !isDark;
		document.documentElement.classList.toggle('dark', isDark);
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}

	const nav = [
		{ href: '/', label: 'Post' },
		{ href: '/browse', label: 'Browse' },
		{ href: '/monthly', label: 'Priorities' },
		{ href: '/why', label: 'Why' },
		{ href: '/anonymity', label: 'Anonymity' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="flex min-h-screen flex-col bg-bg">

	<header class="sticky top-0 z-40 bg-bg/85 backdrop-blur-xl">
		<div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
			<a href="/" class="pr-2 font-display text-2xl font-extrabold tracking-tight text-ink">
				Wish<span class="text-accent">.</span>
			</a>

			<nav aria-label="Primary" class="ml-1 hidden items-center gap-1 lg:flex">
				{#each nav as item}
					<a
						href={item.href}
						aria-current={isActive(item.href) ? 'page' : undefined}
						class="rounded-full px-4 py-2 text-sm font-semibold transition-colors {isActive(item.href)
							? 'bg-raised text-ink'
							: 'text-muted hover:bg-raised/60 hover:text-ink'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="ml-auto flex items-center gap-1.5">
				<button
					onclick={toggleDark}
					class="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
					aria-label="Toggle dark mode"
					aria-pressed={isDark}
				>
					{#if isDark}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
					{:else}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
					{/if}
				</button>

				{#if data.user}
					<div class="user-menu relative">
						<button
							bind:this={menuBtn}
							onclick={() => (menuOpen = !menuOpen)}
							aria-haspopup="menu"
							aria-expanded={menuOpen}
							aria-label="Account menu"
							class="flex items-center gap-2 rounded-full bg-raised py-1 pl-1 pr-3 transition-colors hover:bg-raised-2"
						>
							<span class="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent">
								{data.user.display_name.charAt(0).toUpperCase()}
							</span>
							<span class="hidden max-w-[9rem] truncate text-sm font-semibold text-ink sm:block">{data.user.display_name}</span>
						</button>
						{#if menuOpen}
							<div role="menu" class="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-surface p-2">
								<div class="px-3 py-2 text-xs text-faint">Signed in as <span class="font-semibold text-muted">@{data.user.username}</span></div>
								{#if data.user.is_admin}
									<a href="/admin" role="menuitem" class="block rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-raised">Moderation</a>
								{/if}
								<form method="POST" action="/logout">
									<button class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-raised">Sign out</button>
								</form>
							</div>
						{/if}
					</div>
				{:else}
					<a
						href="/login"
						class="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
					>
						Sign in
					</a>
				{/if}
			</div>
		</div>

		<nav
			aria-label="Primary mobile"
			class="-mx-1 flex items-center gap-1 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
		>
			{#each nav as item}
				<a
					href={item.href}
					aria-current={isActive(item.href) ? 'page' : undefined}
					class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors {isActive(item.href)
						? 'bg-raised text-ink'
						: 'text-muted'}"
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="mt-16 px-6 py-10">
		<div class="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
			<span class="font-display text-sm font-bold text-faint">Wish.</span>
			<p class="max-w-md text-xs leading-relaxed text-faint">
				A citizen-driven platform to surface the problems that matter and the ideas that solve them - for a better Maldives.
			</p>
		</div>
	</footer>
</div>

<svelte:window
	onclick={(e) => { if (menuOpen && !(e.target as Element).closest('.user-menu')) { menuOpen = false; menuBtn?.focus(); } }}
	onkeydown={(e) => { if (menuOpen && e.key === 'Escape') { menuOpen = false; menuBtn?.focus(); } }}
/>
