<script lang="ts">
	let {
		id,
		label,
		count = null,
		active = false
	}: { id: string; label: string; count?: number | null; active?: boolean } = $props();
</script>

<a
	href={`/browse?tag=${encodeURIComponent(id)}`}
	aria-label={`Browse the ${label} tag`}
	class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors {active
		? 'bg-accent text-on-accent hover:brightness-110'
		: 'bg-raised text-muted hover:bg-raised-2 hover:text-ink'}"
>
	<span class="opacity-55">#</span>{label}{#if count != null}<span class="tabular-nums opacity-70">{count}</span>{/if}
</a>
