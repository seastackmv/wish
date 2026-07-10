<script lang="ts">
	let { type, size = 'md' }: { type: 'wish' | 'pain'; size?: 'sm' | 'md' } = $props();

	const isWish = $derived(type === 'wish');
	const pad = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3 py-1.5 text-xs' };
</script>

<span
	class="inline-flex items-center rounded-full font-bold uppercase tracking-wide {pad[size]} {isWish
		? 'bg-accent/15 text-accent-ink'
		: 'bg-accent2/15 text-accent2-ink'}"
>
	{isWish ? 'Wish' : 'Problem'}
</span>
