<script lang="ts">
	import type { Entry } from '$lib/types';
	import { categoryMeta } from '$lib/types';
	import { fitTextClass, timeAgo } from '$lib/utils';
	import TagChip from './TagChip.svelte';

	let {
		entry,
		votes,
		voted,
		onvote,
		interactive = true
	}: {
		entry: Entry;
		votes: number;
		voted: boolean;
		onvote?: () => void;
		interactive?: boolean;
	} = $props();

	const textClass = $derived(fitTextClass(entry.text, 'deck'));
	const cat = $derived(categoryMeta(entry.category));
	const isWish = $derived(entry.type === 'wish');
</script>

<div
	class="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_50px_-12px_rgba(0,0,0,0.22)] ring-1 ring-hairline dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_24px_60px_-12px_rgba(0,0,0,0.6)]"
>
	<!-- accent rail keyed to entry type -->
	<div
		class="h-1.5 w-full shrink-0"
		style="background: linear-gradient(90deg, {isWish
			? 'var(--c-accent), color-mix(in srgb, var(--c-accent) 55%, #ffffff)'
			: 'var(--c-accent-2), color-mix(in srgb, var(--c-accent-2) 55%, #ffffff)'});"
	></div>

	{#if entry.image_key}
		<img
			src={`/api/image/${entry.image_key}`}
			alt="Attached by the author"
			loading="lazy"
			decoding="async"
			draggable="false"
			class="h-40 w-full shrink-0 object-cover sm:h-48"
		/>
	{/if}

	<!-- meta row -->
	<div class="flex shrink-0 flex-wrap items-center gap-2 px-5 pt-4 sm:px-8 sm:pt-5">
		<span
			class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
			style="background-color: color-mix(in srgb, {isWish
				? 'var(--c-accent)'
				: 'var(--c-accent-2)'} 15%, transparent); color: {isWish
				? 'var(--c-accent-ink)'
				: 'var(--c-accent-2-ink)'};"
		>
			{isWish ? '✦ Wish' : '△ Problem'}
		</span>
		<span
			class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
			style="background-color: color-mix(in srgb, {cat.color} 14%, transparent); color: color-mix(in srgb, {cat.color} 78%, var(--c-text));"
		>
			<span class="h-2 w-2 rounded-full" style="background-color: {cat.color};"></span>
			{cat.short}
		</span>
		<span class="ml-auto text-xs font-medium text-faint">{timeAgo(entry.created_at)}</span>
	</div>

	<!-- body: auto-fits and stays readable at any length -->
	<div class="deck-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
		<p
			class="m-auto w-full whitespace-pre-line text-pretty font-display font-semibold tracking-[-0.01em] text-ink {textClass}"
		>
			{entry.text}
		</p>
	</div>

	{#if entry.tags?.length}
		<div class="flex shrink-0 flex-wrap gap-1.5 px-5 pb-1 sm:px-8">
			{#each entry.tags as tag (tag.id)}
				<TagChip id={tag.id} label={tag.label} />
			{/each}
		</div>
	{/if}

	<!-- footer / actions -->
	<div
		class="flex shrink-0 items-center gap-3 border-t border-hairline px-5 py-3.5 sm:px-8 sm:py-4"
	>
		<button
			type="button"
			onclick={onvote}
			disabled={!interactive}
			aria-pressed={voted}
			aria-label={voted ? 'Remove your support' : 'Support this'}
			class="vote-btn group inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-display text-base font-bold transition-all active:scale-95 disabled:cursor-default {voted
				? 'bg-vote/15 text-vote-ink'
				: 'bg-raised text-ink hover:bg-vote/15 hover:text-vote-ink'}"
		>
			<svg
				class="h-5 w-5 transition-transform group-active:-translate-y-0.5 {voted ? '-translate-y-0' : ''}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M12 19V5M5 12l7-7 7 7" />
			</svg>
			<span class="tabular-nums">{votes}</span>
		</button>

		<span class="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
			<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z"/></svg>
			{entry.comment_count ?? 0}
		</span>

		<a
			href={`/entry/${entry.id}`}
			class="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors hover:text-ink"
			tabindex={interactive ? 0 : -1}
		>
			Open
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
		</a>
	</div>
</div>

<style>
	/* keep the fade subtle so no text is ever clipped, only hinted */
	.deck-scroll {
		scrollbar-width: none;
	}
	.deck-scroll::-webkit-scrollbar {
		display: none;
	}
</style>
