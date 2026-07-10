<script lang="ts">
	import { onMount } from 'svelte';

	let { text, class: cls = '' }: { text: string; class?: string } = $props();

	const words = $derived(text.split(/\s+/));
	let el: HTMLParagraphElement | undefined = $state();
	let progress = $state(0);
	let reduce = $state(false);

	function update() {
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const start = vh * 0.9;
		const end = vh * 0.35;
		const span = rect.height + (start - end);
		progress = Math.max(0, Math.min(1, (start - rect.top) / span));
	}

	onMount(() => {

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			reduce = true;
			return;
		}

		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				update();
				ticking = false;
			});
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	const lit = $derived(progress * (words.length + 4));
	const opacity = (i: number) => (reduce ? 1 : Math.max(0.45, Math.min(1, lit - i)));
</script>

<p bind:this={el} class={cls}>
	{#each words as w, i}<span style="opacity:{opacity(i)}">{w}{' '}</span>{/each}
</p>
