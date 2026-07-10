<script lang="ts">
	import type { Entry } from '$lib/types';

	let { entry, rank }: { entry: Entry; rank: number } = $props();

	const tint = ['#b8860b', '#6b7280', '#a0522d'];
	const color = $derived(tint[rank - 1] ?? '#9aa4b2');
</script>

<a
	href={`/entry/${entry.id}`}
	class="relative flex items-start gap-4 rounded-3xl bg-surface p-5 transition-colors hover:bg-raised/50 sm:gap-5 sm:p-6"
>
	<span
		class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold sm:h-12 sm:w-12"
		style="background-color: color-mix(in srgb, {color} 20%, transparent); color: {color};"
	>
		{rank}
	</span>

	<div class="min-w-0 flex-1">
		<div class="mb-2 flex items-center">
			<span class="inline-flex items-center gap-1.5 text-sm font-bold text-vote">
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
				{entry.votes} votes
			</span>
		</div>
		<p class="font-display text-lg font-bold leading-snug tracking-tight text-ink sm:text-xl">
			{entry.text}
		</p>
		<p class="mt-2 text-xs text-faint">by {entry.author_name ?? 'Anonymous'}</p>
	</div>
</a>
