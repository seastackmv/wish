<script lang="ts">
	import { onMount } from 'svelte';

	let { sitekey, token = $bindable('') }: { sitekey: string; token?: string } = $props();

	type TurnstileApi = {
		render(el: HTMLElement, opts: Record<string, unknown>): string;
		remove(id: string): void;
	};
	const turnstile = (): TurnstileApi | undefined =>
		(window as unknown as { turnstile?: TurnstileApi }).turnstile;

	const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

	let el: HTMLDivElement | undefined = $state();

	onMount(() => {
		let widgetId: string | undefined;
		let cancelled = false;

		const render = () => {
			const ts = turnstile();
			if (cancelled || !el || !ts || widgetId !== undefined) return;
			widgetId = ts.render(el, {
				sitekey,
				callback: (t: string) => (token = t),
				'expired-callback': () => (token = ''),
				'error-callback': () => (token = '')
			});
		};

		if (turnstile()) {
			render();
		} else {
			let s = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
			if (!s) {
				s = document.createElement('script');
				s.src = SRC;
				s.async = true;
				s.defer = true;
				document.head.appendChild(s);
			}
			s.addEventListener('load', render);
		}

		return () => {
			cancelled = true;
			const ts = turnstile();
			try {
				if (widgetId && ts) ts.remove(widgetId);
			} catch {
				widgetId = undefined;
			}
		};
	});
</script>

<div bind:this={el}></div>
