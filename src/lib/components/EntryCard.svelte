<script lang="ts">
	import type { Entry } from '$lib/types';
	import { timeAgo } from '$lib/utils';
	import TypeBadge from './TypeBadge.svelte';
	import VoteButton from './VoteButton.svelte';

	let { entry }: { entry: Entry } = $props();
</script>

<article
	class="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-surface transition-colors duration-300 hover:bg-raised/50"
>
	{#if entry.image_key}
		<img
			src={`/api/image/${entry.image_key}`}
			alt="Attached by the author"
			loading="lazy"
			decoding="async"
			class="h-48 w-full object-cover sm:h-60"
		/>
	{/if}

	<div class="flex flex-1 flex-col gap-5 p-6 sm:p-7">
		<div class="flex flex-wrap items-center gap-2">
			<TypeBadge type={entry.type} size="sm" />
			<span class="ml-auto text-xs font-medium text-faint">{timeAgo(entry.created_at)}</span>
		</div>

		<a href={`/entry/${entry.id}`} class="after:absolute after:inset-0 after:content-['']">
			<p class="line-clamp-5 font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">
				{entry.text}
			</p>
		</a>

		<div class="mt-auto flex items-center gap-4 pt-1">
			<div class="relative z-10">
				<VoteButton id={entry.id} votes={entry.votes} voted={entry.user_voted ?? false} size="md" />
			</div>
			<span class="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
				<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z"/></svg>
				{entry.comment_count ?? 0}
			</span>
			<span class="ml-auto max-w-[45%] truncate text-sm text-faint">{entry.author_name ?? 'Anonymous'}</span>
		</div>
	</div>
</article>
