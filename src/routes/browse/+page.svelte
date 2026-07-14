<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import VirtualItem from '$lib/components/VirtualItem.svelte';
	import CardDeck from '$lib/components/CardDeck.svelte';
	import TagChip from '$lib/components/TagChip.svelte';

	let { data }: { data: PageData } = $props();

	const wishes = $derived(data.wishes ?? []);
	const pains = $derived(data.pains ?? []);
	const allTags = $derived(data.tags ?? []);

	let view = $state<'grid' | 'cards'>('grid');
	let tab = $state<'all' | 'wish' | 'pain'>('all');
	let sort = $state<'popular' | 'latest'>('popular');
	let query = $state('');

	// active tag comes from the ?tag= query param, so tag chips everywhere link into this
	const activeTag = $derived(page.url.searchParams.get('tag'));
	const activeTagMeta = $derived(allTags.find((t) => t.id === activeTag));

	const tabbed = $derived(tab === 'wish' ? wishes : tab === 'pain' ? pains : [...wishes, ...pains]);

	const byTag = $derived(
		activeTag ? tabbed.filter((e) => e.tags?.some((t) => t.id === activeTag)) : tabbed
	);

	const sorted = $derived(
		[...byTag].sort(
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

	// popular tags for the discovery row, narrowed by the search box when present
	const shownTags = $derived(
		(query.trim()
			? allTags.filter((t) => t.label.toLowerCase().includes(query.trim().toLowerCase()))
			: allTags
		).slice(0, 20)
	);

	// remount the deck (resetting to the first card) whenever the working set changes
	const deckKey = $derived(`${tab}|${sort}|${query}|${activeTag ?? ''}`);

	const tabs = $derived([
		{ value: 'all' as const, label: 'All', count: wishes.length + pains.length },
		{ value: 'wish' as const, label: 'Wishes', count: wishes.length },
		{ value: 'pain' as const, label: 'Problems', count: pains.length }
	]);
</script>

<svelte:head>
	<title>Browse · wish</title>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:py-10">
	<header class="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:items-end sm:gap-4">
		<div class="min-w-0">
			<h1 class="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">The feed</h1>
			<p class="mt-1 hidden text-sm text-muted sm:mt-2 sm:block sm:text-[15px]">
				Everything citizens are wishing for and struggling with.
			</p>
		</div>

		<div role="group" aria-label="Choose view" class="inline-flex shrink-0 gap-1 rounded-full bg-raised p-1">
			<button
				onclick={() => (view = 'grid')}
				aria-pressed={view === 'grid'}
				class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors sm:px-3.5 sm:py-2 {view === 'grid'
					? 'bg-surface text-ink shadow-sm'
					: 'text-muted hover:text-ink'}"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
				Grid
			</button>
			<button
				onclick={() => (view = 'cards')}
				aria-pressed={view === 'cards'}
				class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors sm:px-3.5 sm:py-2 {view === 'cards'
					? 'bg-surface text-ink shadow-sm'
					: 'text-muted hover:text-ink'}"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M8 19v2M16 19v2"/></svg>
				Cards
			</button>
		</div>
	</header>

	<div class="mb-4 space-y-2.5 sm:mb-6 sm:space-y-4">
		<div class="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
			<div class="relative order-first sm:order-last sm:ml-auto sm:min-w-[200px] sm:max-w-xs sm:flex-1">
				<svg aria-hidden="true" class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input
					bind:value={query}
					type="search"
					aria-label="Search entries or tags"
					placeholder="Search entries or tags…"
					class="w-full rounded-full bg-raised py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:bg-raised-2"
				/>
			</div>

			<!-- desktop inline filters; on mobile these live in the fixed bottom bar -->
			<div class="hidden items-center gap-3 sm:flex">
				<div role="group" aria-label="Filter entries" class="inline-flex shrink-0 gap-1 rounded-full bg-raised p-1">
					{#each tabs as t}
						<button
							onclick={() => (tab = t.value)}
							aria-pressed={tab === t.value}
							class="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors {tab === t.value
								? 'bg-surface text-ink'
								: 'text-muted hover:text-ink'}"
						>
							{t.label}
							<span class="ml-1 tabular-nums text-faint">{t.count}</span>
						</button>
					{/each}
				</div>

				<div role="group" aria-label="Sort entries" class="inline-flex shrink-0 gap-1 rounded-full bg-raised p-1">
					{#each [{ value: 'popular', label: 'Popular' }, { value: 'latest', label: 'Latest' }] as const as s}
						<button
							onclick={() => (sort = s.value)}
							aria-pressed={sort === s.value}
							class="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors {sort === s.value
								? 'bg-surface text-ink'
								: 'text-muted hover:text-ink'}"
						>
							{s.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		{#if allTags.length}
			<div class="space-y-2.5 sm:space-y-3">
				{#if activeTag}
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-accent/10 px-3 py-2.5 sm:px-4 sm:py-3">
						<span class="text-sm text-muted">Filtering by</span>
						<span class="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-bold text-on-accent">
							<span class="opacity-60">#</span>{activeTagMeta?.label ?? activeTag}
						</span>
						<span class="text-sm text-faint">{entries.length} {entries.length === 1 ? 'result' : 'results'}</span>
						<a href="/browse" class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-raised">
							<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
							Clear
						</a>
					</div>
				{/if}

				<div class="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
					<span class="mr-0.5 shrink-0 text-xs font-bold uppercase tracking-wide text-faint sm:mr-1">Tags</span>
					{#each shownTags as t (t.id)}
						<TagChip id={t.id} label={t.label} count={t.count} active={t.id === activeTag} />
					{:else}
						<span class="text-xs text-faint">No tags match your search.</span>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	{#if view === 'cards'}
		<div class="pt-2">
			{#key deckKey}
				<CardDeck {entries} />
			{/key}
		</div>
	{:else if entries.length === 0}
		<div class="rounded-3xl bg-surface px-6 py-20 text-center">
			<p class="font-display text-xl font-bold text-ink">Nothing here yet</p>
			<p class="mt-2 text-sm text-muted">
				{query
					? 'Nothing matches your search.'
					: activeTag
						? 'No entries have this tag yet.'
						: 'Be the first to post.'}
			</p>
			{#if activeTag}
				<a href="/browse" class="mt-6 inline-flex rounded-full bg-raised px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-raised-2">
					Clear tag filter
				</a>
			{:else}
				<a href="/" class="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition-all hover:brightness-110">
					Post something
				</a>
			{/if}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2">
			{#each entries as entry (entry.id)}
				<VirtualItem>
					<EntryCard {entry} />
				</VirtualItem>
			{/each}
		</div>
	{/if}

	<!-- mobile-only bottom filter bar: type + sort within thumb's reach -->
	{#if wishes.length + pains.length > 0}
		<div
			class="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-bg/90 backdrop-blur-xl sm:hidden"
			style="padding-bottom: env(safe-area-inset-bottom);"
		>
			<div class="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5">
				<div role="group" aria-label="Filter entries" class="flex flex-1 gap-1 rounded-full bg-raised p-1">
					{#each tabs as t}
						<button
							onclick={() => (tab = t.value)}
							aria-pressed={tab === t.value}
							class="flex-1 whitespace-nowrap rounded-full px-2 py-2 text-[13px] font-bold transition-colors {tab === t.value
								? 'bg-surface text-ink shadow-sm'
								: 'text-muted'}"
						>
							{t.label}
						</button>
					{/each}
				</div>

				<button
					onclick={() => (sort = sort === 'popular' ? 'latest' : 'popular')}
					aria-label={sort === 'popular'
						? 'Sorted by most popular. Tap to sort by latest.'
						: 'Sorted by latest. Tap to sort by most popular.'}
					class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-raised px-3.5 py-2.5 text-[13px] font-bold text-ink transition-transform active:scale-95"
				>
					<svg class="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5-5 5 5M7 14l5 5 5-5"/></svg>
					{sort === 'popular' ? 'Popular' : 'Latest'}
				</button>
			</div>
		</div>
	{/if}
</section>
