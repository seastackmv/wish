<script lang="ts">
	import type { PageData } from './$types';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import VirtualItem from '$lib/components/VirtualItem.svelte';

	let { data }: { data: PageData } = $props();

	const wishes = $derived(data.wishes ?? []);
	const pains = $derived(data.pains ?? []);

	let tab = $state<'all' | 'wish' | 'pain'>('all');
	let sort = $state<'popular' | 'latest'>('popular');
	let query = $state('');

	const tabbed = $derived(tab === 'wish' ? wishes : tab === 'pain' ? pains : [...wishes, ...pains]);

	const sorted = $derived(
		[...tabbed].sort(
			sort === 'latest'
				? (a, b) => b.created_at - a.created_at
				: (a, b) => b.votes - a.votes || b.created_at - a.created_at
		)
	);

	const entries = $derived(
		query.trim()
			? sorted.filter((e) => e.text.toLowerCase().includes(query.trim().toLowerCase()))
			: sorted
	);

	const tabs = $derived([
		{ value: 'all' as const, label: 'All', count: wishes.length + pains.length },
		{ value: 'wish' as const, label: 'Wishes', count: wishes.length },
		{ value: 'pain' as const, label: 'Problems', count: pains.length }
	]);
</script>

<svelte:head>
	<title>Browse · wish</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
	<header class="mb-6">
		<h1 class="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">The feed</h1>
		<p class="mt-2 text-[15px] text-muted">
			Everything citizens are wishing for and struggling with.
		</p>
	</header>

	<div class="mb-6 space-y-4">
		<div class="flex flex-wrap items-center gap-3">
			<div role="group" aria-label="Filter entries" class="inline-flex gap-1 rounded-full bg-raised p-1">
				{#each tabs as t}
					<button
						onclick={() => (tab = t.value)}
						aria-pressed={tab === t.value}
						class="rounded-full px-4 py-2 text-sm font-semibold transition-colors {tab === t.value
							? 'bg-surface text-ink'
							: 'text-muted hover:text-ink'}"
					>
						{t.label}
						<span class="ml-1 tabular-nums text-faint">{t.count}</span>
					</button>
				{/each}
			</div>

			<div role="group" aria-label="Sort entries" class="inline-flex gap-1 rounded-full bg-raised p-1">
				{#each [{ value: 'popular', label: 'Popular' }, { value: 'latest', label: 'Latest' }] as const as s}
					<button
						onclick={() => (sort = s.value)}
						aria-pressed={sort === s.value}
						class="rounded-full px-4 py-2 text-sm font-semibold transition-colors {sort === s.value
							? 'bg-surface text-ink'
							: 'text-muted hover:text-ink'}"
					>
						{s.label}
					</button>
				{/each}
			</div>

			<div class="relative ml-auto min-w-[180px] flex-1 sm:max-w-xs">
				<svg aria-hidden="true" class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input
					bind:value={query}
					type="search"
					aria-label="Search entries"
					placeholder="Search…"
					class="w-full rounded-full bg-raised py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:bg-raised-2"
				/>
			</div>
		</div>
	</div>

	{#if entries.length === 0}
		<div class="rounded-3xl bg-surface px-6 py-20 text-center">
			<p class="font-display text-xl font-bold text-ink">Nothing here yet</p>
			<p class="mt-2 text-sm text-muted">
				{query ? 'Nothing matches your search.' : 'Be the first to post.'}
			</p>
			<a href="/" class="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition-all hover:brightness-110">
				Post something
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
			{#each entries as entry (entry.id)}
				<VirtualItem>
					<EntryCard {entry} />
				</VirtualItem>
			{/each}
		</div>
	{/if}
</section>
