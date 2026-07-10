<script lang="ts">

	let {
		id,
		votes,
		voted,
		size = 'md'
	}: { id: string; votes: number; voted: boolean; size?: 'sm' | 'md' | 'lg' } = $props();

	// svelte-ignore state_referenced_locally
	let localVoted = $state(voted);
	let busy = $state(false);

	$effect(() => {
		localVoted = voted;
	});

	const count = $derived(votes + ((localVoted ? 1 : 0) - (voted ? 1 : 0)));

	const pad = { sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2', lg: 'px-5 py-2.5 text-base gap-2.5' };
	const icon = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-[18px] w-[18px]' };

	async function toggle(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (busy) return;
		busy = true;
		localVoted = !localVoted;
		try {
			const res = await fetch(`/api/vote/${id}`, { method: 'POST' });
			if (res.ok) {
				const d = await res.json();
				localVoted = !!d.voted;
			} else {
				localVoted = voted;
			}
		} catch {
			localVoted = voted;
		} finally {
			busy = false;
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	disabled={busy}
	aria-pressed={localVoted}
	aria-label={localVoted ? 'Remove your support' : 'Support this'}
	class="inline-flex items-center rounded-full font-display font-bold transition-all active:scale-95 disabled:opacity-70 {pad[
		size
	]} {localVoted
		? 'bg-vote/15 text-vote-ink'
		: 'bg-raised text-ink hover:bg-vote/15 hover:text-vote-ink'}"
>
	<svg
		class={icon[size]}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M12 19V5M5 12l7-7 7 7" />
	</svg>
	<span class="tabular-nums">{count}</span>
</button>
