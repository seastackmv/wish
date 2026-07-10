<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import TopEntryCard from '$lib/components/TopEntryCard.svelte';

	let { data }: { data: PageData } = $props();

	let tab = $state<'wish' | 'pain'>('wish');
	let dropdownOpen = $state(false);
	let archiveBtn: HTMLButtonElement | undefined = $state();

	function selectMonth(value: string) {
		dropdownOpen = false;

		goto(`?m=${value}`);
	}

	const entries = $derived(tab === 'wish' ? data.topWishes : data.topPains);
</script>

<svelte:head>
	<title>Monthly priorities · wish</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
	<header class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<span class="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent">
				Monthly priorities
			</span>
			<h1 class="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
				{data.monthLabel}
			</h1>
			<p class="mt-2 max-w-md text-[15px] text-muted">
				The most-supported wishes and problems this month - a shortlist for parliament, councils,
				and builders to act on.
			</p>
		</div>

		<div class="month-dropdown relative">
			<button
				bind:this={archiveBtn}
				onclick={() => (dropdownOpen = !dropdownOpen)}
				aria-haspopup="menu"
				aria-expanded={dropdownOpen}
				aria-label="Browse another month"
				class="inline-flex items-center gap-2 rounded-full bg-raised px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-raised-2"
			>
				Archive
				<svg aria-hidden="true" class="h-4 w-4 transition-transform {dropdownOpen ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
			</button>
			{#if dropdownOpen}
				<div role="menu" class="absolute right-0 top-full z-30 mt-2 max-h-72 w-56 overflow-y-auto rounded-2xl bg-surface p-2">
					{#each data.months as m}
						<button
							onclick={() => selectMonth(m.value)}
							class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors {m.value === data.month
								? 'bg-accent/15 text-accent'
								: 'text-ink hover:bg-raised'}"
						>
							{m.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</header>

	<div role="group" aria-label="Choose leaderboard" class="mb-6 inline-flex gap-1 rounded-full bg-raised p-1">
		<button
			onclick={() => (tab = 'wish')}
			aria-pressed={tab === 'wish'}
			class="rounded-full px-5 py-2 text-sm font-bold transition-colors {tab === 'wish'
				? 'bg-surface text-accent-ink'
				: 'text-muted hover:text-ink'}"
		>
			Top wishes
		</button>
		<button
			onclick={() => (tab = 'pain')}
			aria-pressed={tab === 'pain'}
			class="rounded-full px-5 py-2 text-sm font-bold transition-colors {tab === 'pain'
				? 'bg-surface text-accent2-ink'
				: 'text-muted hover:text-ink'}"
		>
			Top problems
		</button>
	</div>

	{#if entries.length === 0}
		<div class="rounded-3xl bg-surface px-6 py-20 text-center">
			<p class="font-display text-xl font-bold text-ink">No entries for this month yet</p>
			<a href="/" class="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition-all hover:brightness-110">
				Post something
			</a>
		</div>
	{:else}
		<div class="space-y-4">
			{#each entries as entry, i (entry.id)}
				<TopEntryCard {entry} rank={i + 1} />
			{/each}
		</div>
	{/if}

	<div class="mt-10 rounded-3xl bg-ink p-8 text-center sm:p-10">
		<h2 class="font-display text-2xl font-extrabold text-bg sm:text-3xl">Your voice shapes the list</h2>
		<p class="mx-auto mt-2 max-w-md text-sm text-bg/70">
			Every vote pushes a problem or idea up the priority list that decision-makers can see.
		</p>
		<a href="/" class="mt-6 inline-flex rounded-full bg-bg px-6 py-3 font-display text-sm font-bold text-ink transition-transform hover:scale-105">
			Add your wish
		</a>
	</div>
</section>

<svelte:window
	onclick={(e) => { if (dropdownOpen && !(e.target as Element).closest('.month-dropdown')) { dropdownOpen = false; archiveBtn?.focus(); } }}
	onkeydown={(e) => { if (dropdownOpen && e.key === 'Escape') { dropdownOpen = false; archiveBtn?.focus(); } }}
/>
