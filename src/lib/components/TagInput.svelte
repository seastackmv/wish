<script lang="ts">
	import { slugifyTag, cleanTagLabel, MAX_TAGS, MAX_TAG_LEN, type TagSummary } from '$lib/tags';

	let {
		tags = $bindable([]),
		suggestions = []
	}: { tags?: string[]; suggestions?: TagSummary[] } = $props();

	let draft = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	const full = $derived(tags.length >= MAX_TAGS);
	const usedSlugs = $derived(new Set(tags.map((t) => slugifyTag(t))));
	const openSuggestions = $derived(suggestions.filter((s) => !usedSlugs.has(s.id)).slice(0, 8));

	function addTag(raw: string) {
		if (full) return;
		const label = cleanTagLabel(raw);
		const slug = slugifyTag(label);
		if (!slug || usedSlugs.has(slug)) {
			draft = '';
			return;
		}
		tags = [...tags, label];
		draft = '';
	}

	function removeTag(i: number) {
		tags = tags.filter((_, idx) => idx !== i);
		inputEl?.focus();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			if (draft.trim()) addTag(draft);
		} else if (e.key === 'Backspace' && draft === '' && tags.length) {
			removeTag(tags.length - 1);
		}
	}
</script>

<div>
	<div
		role="group"
		aria-label="Tags"
		class="flex flex-wrap items-center gap-2 rounded-2xl bg-raised px-3 py-2.5 transition-colors focus-within:bg-raised-2"
	>
		{#each tags as tag, i (tag)}
			<span class="inline-flex items-center gap-1 rounded-full bg-accent/15 py-1 pl-3 pr-1.5 text-sm font-semibold text-accent-ink">
				<span class="text-accent-ink/60">#</span>{tag}
				<button
					type="button"
					onclick={(e) => { e.stopPropagation(); removeTag(i); }}
					aria-label={`Remove tag ${tag}`}
					class="grid h-5 w-5 place-items-center rounded-full text-accent-ink/70 transition-colors hover:bg-accent/20 hover:text-accent-ink"
				>
					<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
				</button>
			</span>
		{/each}

		{#if !full}
			<input
				bind:this={inputEl}
				bind:value={draft}
				onkeydown={onKeydown}
				onblur={() => draft.trim() && addTag(draft)}
				maxlength={MAX_TAG_LEN}
				aria-label="Add a tag"
				placeholder={tags.length ? 'Add another…' : 'e.g. ferries, malé, healthcare…'}
				class="min-w-[8rem] flex-1 bg-transparent py-1 text-sm text-ink outline-none placeholder:text-faint"
			/>
		{/if}
	</div>

	<div class="mt-2 flex flex-wrap items-center gap-2">
		{#if openSuggestions.length && !full}
			<span class="text-xs font-medium text-faint">Popular:</span>
			{#each openSuggestions as s (s.id)}
				<button
					type="button"
					onclick={() => addTag(s.label)}
					class="inline-flex items-center gap-1 rounded-full bg-raised px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-raised-2 hover:text-ink"
				>
					<span class="text-faint">#</span>{s.label}
				</button>
			{/each}
		{:else}
			<span class="text-xs text-faint">
				{full ? `That's the max of ${MAX_TAGS} tags.` : `Add up to ${MAX_TAGS} tags to help others find this.`}
			</span>
		{/if}
	</div>
</div>
