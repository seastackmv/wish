<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Entry } from '$lib/types';
	import SwipeCard from './SwipeCard.svelte';

	let { entries }: { entries: Entry[] } = $props();

	let i = $state(0);
	let animating = $state(false);
	let reduce = $state(false);

	// vote overrides - count is derived so a server correction self-heals (see displayVotes)
	let votedMap = $state<Record<string, boolean>>({});

	// burst / feedback
	let burstSeq = $state(0);
	let burstOn = $state(false);
	let burstTimer: ReturnType<typeof setTimeout> | undefined;
	let bounce = $state<0 | -1 | 1>(0);

	function fireBurst() {
		burstSeq++;
		burstOn = true;
		clearTimeout(burstTimer);
		burstTimer = setTimeout(() => (burstOn = false), 950);
	}

	// live drag state (for hint overlays)
	let dragDX = $state(0);
	let dragging = $state(false);

	let cardEl: HTMLDivElement | undefined = $state();

	const total = $derived(entries.length);
	const current = $derived(entries[i]);
	const atStart = $derived(i <= 0);
	const atEnd = $derived(i >= total - 1);

	const DURATION = $derived(reduce ? 1 : 320);

	function isVoted(e: Entry): boolean {
		return votedMap[e.id] ?? !!e.user_voted;
	}
	function displayVotes(e: Entry): number {
		return e.votes + ((isVoted(e) ? 1 : 0) - (e.user_voted ? 1 : 0));
	}

	onMount(() => {
		reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		// clamp if the list shrank underneath us
		if (i > total - 1) i = Math.max(0, total - 1);
		return () => clearTimeout(burstTimer);
	});

	// ---- card transform helpers (imperative for buttery, transition-controlled motion) ----
	function setTransform(x: number, rot: number, y = 0, withTransition = false) {
		if (!cardEl) return;
		cardEl.style.transition = withTransition
			? `transform ${DURATION}ms cubic-bezier(.22,.61,.36,1), opacity ${DURATION}ms ease`
			: 'none';
		cardEl.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
	}
	function setTransformPct(xPct: number, rot: number, opacity: number, withTransition = false) {
		if (!cardEl) return;
		cardEl.style.transition = withTransition
			? `transform ${DURATION}ms cubic-bezier(.22,.61,.36,1), opacity ${DURATION}ms ease`
			: 'none';
		cardEl.style.transform = `translate3d(${xPct}%, 0, 0) rotate(${rot}deg)`;
		cardEl.style.opacity = String(opacity);
	}
	function resetTransform() {
		if (!cardEl) return;
		cardEl.style.transition = `transform ${DURATION}ms cubic-bezier(.34,1.56,.64,1), opacity ${DURATION}ms ease`;
		cardEl.style.transform = 'translate3d(0,0,0) rotate(0deg)';
		cardEl.style.opacity = '1';
	}

	// ---- navigation ----
	function go(dir: 1 | -1) {
		if (animating || !total) return;
		const target = i + dir;
		if (target < 0 || target >= total) {
			// gentle bounce at the ends
			bounce = dir === 1 ? 1 : -1;
			setTimeout(() => (bounce = 0), 260);
			return;
		}
		animating = true;
		dragging = false;
		dragDX = 0;

		// fly the current card out in the reading direction
		const outX = dir === 1 ? -130 : 130;
		const outRot = dir === 1 ? -12 : 12;
		setTransformPct(outX, outRot, 0, true);

		setTimeout(() => {
			i = target;
			// place the incoming card just off the opposite edge, then settle it in
			setTransformPct(dir === 1 ? 45 : -45, dir === 1 ? 6 : -6, 0, false);
			requestAnimationFrame(() => {
				resetTransform();
				setTimeout(() => {
					animating = false;
					if (cardEl) cardEl.style.transition = 'none';
				}, DURATION);
			});
		}, DURATION);
	}

	// ---- voting ----
	async function setVote(e: Entry, desired: boolean) {
		if (!e) return;
		const cur = isVoted(e);
		if (cur === desired) {
			if (desired) fireBurst(); // re-affirm with a little pulse
			return;
		}
		votedMap = { ...votedMap, [e.id]: desired };
		if (desired) fireBurst();
		try {
			const res = await fetch(`/api/vote/${e.id}`, { method: 'POST' });
			if (res.ok) {
				const d = await res.json();
				votedMap = { ...votedMap, [e.id]: !!d.voted };
			} else {
				votedMap = { ...votedMap, [e.id]: cur };
			}
		} catch {
			votedMap = { ...votedMap, [e.id]: cur };
		}
	}
	function toggleVote(e: Entry) {
		setVote(e, !isVoted(e));
	}

	// ---- pointer drag ----
	let startX = 0;
	let startY = 0;
	let axis: 'x' | 'y' | null = null;
	let moved = false;
	let startT = 0;
	let pid: number | null = null;

	function onPointerDown(e: PointerEvent) {
		if (animating || !current) return;
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		startX = e.clientX;
		startY = e.clientY;
		startT = performance.now();
		axis = null;
		moved = false;
		pid = e.pointerId;
		dragging = true;
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging || pid !== e.pointerId) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!axis) {
			if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
			axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
			if (axis === 'y') {
				// vertical → let the card body scroll natively
				dragging = false;
				return;
			}
			// horizontal drag: take ownership
			cardEl?.setPointerCapture(e.pointerId);
		}

		if (axis === 'x') {
			e.preventDefault();
			moved = true;
			dragDX = dx;
			const rot = dx * 0.045;
			setTransform(dx, rot, Math.abs(dx) * 0.02, false);
		}
	}

	function endDrag(e: PointerEvent) {
		if (!dragging && !moved) {
			dragging = false;
			return;
		}
		if (pid !== null && cardEl?.hasPointerCapture?.(pid)) {
			try {
				cardEl.releasePointerCapture(pid);
			} catch {
				/* noop */
			}
		}
		dragging = false;
		pid = null;

		if (axis !== 'x' || !moved) {
			dragDX = 0;
			return;
		}

		const dx = e.clientX - startX;
		const dt = Math.max(1, performance.now() - startT);
		const vel = dx / dt; // px per ms
		const width = cardEl?.offsetWidth ?? 360;
		const threshold = Math.min(130, width * 0.28);

		dragDX = 0;

		if (dx <= -threshold || vel < -0.55) {
			go(1);
		} else if (dx >= threshold || vel > 0.55) {
			go(-1);
		} else {
			resetTransform();
		}
	}

	function onPointerCancel() {
		if (!dragging) return;
		dragging = false;
		pid = null;
		dragDX = 0;
		if (axis === 'x') resetTransform();
	}

	// ---- keyboard ----
	function onKeydown(e: KeyboardEvent) {
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		if (!current) return;

		switch (e.key) {
			case 'ArrowRight':
				e.preventDefault();
				go(1);
				break;
			case 'ArrowLeft':
				e.preventDefault();
				go(-1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setVote(current, true);
				break;
			case 'ArrowDown':
				e.preventDefault();
				setVote(current, false);
				break;
			case 'Enter':
				e.preventDefault();
				goto(`/entry/${current.id}`);
				break;
		}
	}

	// hint overlay opacity (0..1) for the direction being dragged
	const hintNext = $derived(dragDX < 0 ? Math.min(1, -dragDX / 120) : 0);
	const hintPrev = $derived(dragDX > 0 ? Math.min(1, dragDX / 120) : 0);
</script>

<svelte:window onkeydown={onKeydown} />

{#if total === 0}
	<div class="rounded-3xl bg-surface px-6 py-20 text-center ring-1 ring-hairline">
		<p class="font-display text-xl font-bold text-ink">Nothing to swipe yet</p>
		<p class="mt-2 text-sm text-muted">Be the first to post a wish or a problem.</p>
		<a
			href="/"
			class="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition-all hover:brightness-110"
		>
			Post something
		</a>
	</div>
{:else}
	<!-- progress -->
	<div class="mx-auto mb-3 flex max-w-[30rem] items-center gap-3 px-1 sm:mb-4">
		<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
			<div
				class="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
				style="width: {total ? ((i + 1) / total) * 100 : 0}%"
			></div>
		</div>
		<span class="shrink-0 text-xs font-semibold tabular-nums text-faint">
			{i + 1} / {total}
		</span>
	</div>

	<!-- deck -->
	<div
		class="relative mx-auto h-[clamp(340px,52vh,520px)] w-full max-w-[30rem] select-none sm:h-[clamp(430px,70vh,660px)]"
		class:bounce-right={bounce === 1}
		class:bounce-left={bounce === -1}
		role="group"
		aria-roledescription="card deck"
		aria-label="Swipe through entries. Left and right arrows to browse, up and down to vote."
	>
		<!-- depth ghosts -->
		{#if !atEnd}
			<div
				class="pointer-events-none absolute inset-0 rounded-[2rem] bg-surface ring-1 ring-hairline"
				style="transform: translateY(22px) scale(0.94); opacity: 0.55;"
			></div>
		{/if}
		{#if total - i > 2}
			<div
				class="pointer-events-none absolute inset-0 rounded-[2rem] bg-surface ring-1 ring-hairline"
				style="transform: translateY(44px) scale(0.88); opacity: 0.3;"
			></div>
		{/if}

		<!-- active card -->
		<div
			bind:this={cardEl}
			class="absolute inset-0 touch-pan-y {dragging ? 'cursor-grabbing' : 'cursor-grab'}"
			style="will-change: transform;"
			role="group"
			aria-label="Current entry - swipe or drag left and right to browse"
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={endDrag}
			onpointercancel={onPointerCancel}
		>
			{#key current.id}
				<div class="h-full w-full">
					<SwipeCard
						entry={current}
						votes={displayVotes(current)}
						voted={isVoted(current)}
						onvote={() => toggleVote(current)}
					/>
				</div>
			{/key}

			<!-- navigation hint chevrons -->
			<div
				class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/75 p-2.5 text-bg shadow-lg backdrop-blur"
				style="opacity: {hintPrev}; transform: translateY(-50%) scale({0.8 + hintPrev * 0.3});"
			>
				<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
			</div>
			<div
				class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/75 p-2.5 text-bg shadow-lg backdrop-blur"
				style="opacity: {hintNext}; transform: translateY(-50%) scale({0.8 + hintNext * 0.3});"
			>
				<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
			</div>

			<!-- upvote burst -->
			{#if burstOn}
				{#key burstSeq}
					<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
						{#each [0, 1, 2, 3, 4, 5] as n}
							<span
								class="burst absolute left-1/2 bottom-[22%] text-vote"
								style="--dx: {(n - 2.5) * 26}px; --delay: {n * 40}ms;"
							>
								<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
							</span>
						{/each}
					</div>
				{/key}
			{/if}
		</div>
	</div>

	<!-- controls (desktop only; on mobile swipe + the in-card vote button drive the deck,
	     leaving the bottom edge clear for the fixed filter bar) -->
	<div class="mx-auto mt-4 hidden max-w-[30rem] items-center justify-center gap-4 sm:mt-6 sm:flex">
		<button
			type="button"
			onclick={() => go(-1)}
			disabled={atStart || animating}
			aria-label="Previous entry"
			class="grid h-13 w-13 place-items-center rounded-full bg-surface text-ink shadow-sm ring-1 ring-hairline transition-all hover:bg-raised active:scale-95 disabled:opacity-35"
		>
			<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
		</button>

		<button
			type="button"
			onclick={() => current && toggleVote(current)}
			aria-pressed={current ? isVoted(current) : false}
			aria-label={current && isVoted(current) ? 'Remove your support' : 'Support this'}
			class="grid h-16 w-16 place-items-center rounded-full shadow-lg transition-all active:scale-90 {current &&
			isVoted(current)
				? 'bg-vote text-white'
				: 'bg-surface text-vote-ink ring-1 ring-hairline hover:bg-vote/10'}"
		>
			<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
		</button>

		<button
			type="button"
			onclick={() => go(1)}
			disabled={atEnd || animating}
			aria-label="Next entry"
			class="grid h-13 w-13 place-items-center rounded-full bg-surface text-ink shadow-sm ring-1 ring-hairline transition-all hover:bg-raised active:scale-95 disabled:opacity-35"
		>
			<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
		</button>
	</div>

	<!-- hints -->
	<p class="mt-5 hidden text-center text-xs text-faint sm:block">
		<kbd class="deck-kbd">←</kbd> <kbd class="deck-kbd">→</kbd> browse ·
		<kbd class="deck-kbd">↑</kbd> support · <kbd class="deck-kbd">↓</kbd> remove ·
		<kbd class="deck-kbd">↵</kbd> open
	</p>
	<p class="mt-3 text-center text-xs text-faint sm:hidden">Swipe left or right to browse · tap <span class="font-bold text-vote">↑</span> to support</p>
{/if}

<style>
	.h-13 {
		height: 3.25rem;
	}
	.w-13 {
		width: 3.25rem;
	}

	.deck-kbd {
		display: inline-block;
		min-width: 1.5rem;
		padding: 0.05rem 0.35rem;
		border-radius: 0.4rem;
		background: var(--c-raised);
		color: var(--c-muted);
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 700;
		text-align: center;
		line-height: 1.4;
	}

	.burst {
		opacity: 0;
		animation: burst-fly 720ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
		animation-delay: var(--delay);
	}
	@keyframes burst-fly {
		0% {
			transform: translate(-50%, 0) scale(0.4);
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
		100% {
			transform: translate(calc(-50% + var(--dx)), -160px) scale(1);
			opacity: 0;
		}
	}

	.bounce-right {
		animation: nudge-right 260ms ease;
	}
	.bounce-left {
		animation: nudge-left 260ms ease;
	}
	@keyframes nudge-right {
		30% {
			transform: translateX(-12px);
		}
	}
	@keyframes nudge-left {
		30% {
			transform: translateX(12px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.burst,
		.bounce-right,
		.bounce-left {
			animation: none;
		}
	}
</style>
