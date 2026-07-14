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
	let navOpen = $state(false);
	let navBtn: HTMLButtonElement | undefined = $state();

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
						class="rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 sm:px-4"
					>
						Sign in
					</a>
				{/if}

				<button
					bind:this={navBtn}
					data-mobile-nav
					onclick={(e) => { e.stopPropagation(); navOpen = !navOpen; }}
					aria-haspopup="menu"
					aria-expanded={navOpen}
					aria-label="Menu"
					class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink lg:hidden"
				>
					{#if navOpen}
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
					{:else}
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
					{/if}
				</button>
			</div>
		</div>

	</header>

	{#if navOpen}
		<!-- full-screen mobile menu with oversized typography -->
		<div
			data-mobile-nav
			class="mobile-nav fixed inset-0 z-50 flex flex-col bg-bg lg:hidden"
		>
			<div class="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
				<a href="/" onclick={() => (navOpen = false)} class="font-display text-2xl font-extrabold tracking-tight text-ink">
					Wish<span class="text-accent">.</span>
				</a>
				<button
					onclick={(e) => { e.stopPropagation(); navOpen = false; }}
					aria-label="Close menu"
					class="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
				>
					<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
				</button>
			</div>

			<nav aria-label="Primary mobile" class="flex flex-1 flex-col justify-center gap-2 overflow-y-auto px-5 pb-8 sm:px-8">
				{#each nav as item, i}
					<a
						href={item.href}
						onclick={() => (navOpen = false)}
						aria-current={isActive(item.href) ? 'page' : undefined}
						class="mobile-nav-item w-fit font-display font-extrabold leading-[1.02] tracking-tight text-[clamp(2.75rem,13vw,3.75rem)] transition-colors {isActive(item.href)
							? 'text-accent'
							: 'text-ink hover:text-accent'}"
						style="--i: {i}"
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="flex shrink-0 items-center gap-3 px-5 pb-8 pt-2 sm:px-8">
				<button
					onclick={toggleDark}
					class="inline-flex items-center gap-2 rounded-full bg-raised px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-raised-2"
					aria-pressed={isDark}
				>
					{#if isDark}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
						Light mode
					{:else}
						<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
						Dark mode
					{/if}
				</button>
				{#if !data.user}
					<a
						href="/login"
						onclick={() => (navOpen = false)}
						class="ml-auto rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
					>
						Sign in
					</a>
				{/if}
			</div>
		</div>
	{/if}

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
	onclick={(e) => {
		const el = e.target as Element;
		if (menuOpen && !el.closest('.user-menu')) { menuOpen = false; menuBtn?.focus(); }
		if (navOpen && !el.closest('[data-mobile-nav]')) { navOpen = false; }
	}}
	onkeydown={(e) => {
		if (e.key !== 'Escape') return;
		if (menuOpen) { menuOpen = false; menuBtn?.focus(); }
		if (navOpen) { navOpen = false; navBtn?.focus(); }
	}}
/>

<style>
	.mobile-nav {
		animation: nav-fade 200ms ease;
	}
	@keyframes nav-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.mobile-nav-item {
		animation: nav-item-in 340ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
		animation-delay: calc(var(--i) * 45ms + 70ms);
	}
	@keyframes nav-item-in {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
