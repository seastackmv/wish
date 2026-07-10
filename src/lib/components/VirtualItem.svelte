<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let node: HTMLElement | undefined = $state();
	let visible = $state(true);
	let height = $state<number | null>(null);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					visible = true;
				} else {
					if (node && node.offsetHeight) {
						height = node.offsetHeight;
					}
					visible = false;
				}
			},
			{ rootMargin: '1000px 0px' }
		);

		if (node) {
			observer.observe(node);
		}

		return () => {
			if (node) observer.unobserve(node);
		};
	});
</script>

<div bind:this={node} style:height={height && !visible ? `${height}px` : 'auto'} class="w-full">
	{#if visible}
		{@render children()}
	{/if}
</div>
