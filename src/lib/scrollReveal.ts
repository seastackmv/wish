export function scrollReveal(onProgress: (progress: number) => void): () => void {
	let mounted = true;
	let cleanup = () => {};

	const onScroll = () => {
		const h = document.documentElement;
		const max = h.scrollHeight - h.clientHeight;
		onProgress(max > 0 ? (window.scrollY || h.scrollTop) / max : 0);
	};
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!reduce) {
		(async () => {
			const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
				import('lenis'),
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);
			if (!mounted) return;
			gsap.registerPlugin(ScrollTrigger);

			const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
			items.forEach((el) => {
				gsap.fromTo(
					el,
					{ opacity: 0, y: 32 },
					{
						opacity: 1,
						y: 0,
						duration: 0.9,
						ease: 'power3.out',
						delay: Number(el.dataset.reveal) || 0,
						scrollTrigger: { trigger: el, start: 'top 88%', once: true }
					}
				);
			});

			const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
			lenis.on('scroll', () => {
				ScrollTrigger.update();
				onScroll();
			});
			const rafFn = (time: number) => lenis.raf(time * 1000);
			gsap.ticker.add(rafFn);
			gsap.ticker.lagSmoothing(0);

			ScrollTrigger.refresh();
			cleanup = () => {
				ScrollTrigger.getAll().forEach((t) => t.kill());
				gsap.ticker.remove(rafFn);
				lenis.destroy();
			};
		})();
	}

	return () => {
		mounted = false;
		window.removeEventListener('scroll', onScroll);
		cleanup();
	};
}
