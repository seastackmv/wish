<script lang="ts">
	import { shareSheet, closeShareSheet } from '$lib/shareState.svelte';
	import { renderShareImage, type ShareFormat } from '$lib/shareImage';

	let format = $state<ShareFormat>('story');
	let previewUrl = $state('');
	let generating = $state(false);
	let failed = $state(false);
	let copied = $state(false);
	let canNativeShare = $state(false);
	let blob: Blob | null = null;
	let genId = 0;

	const entry = $derived(shareSheet.entry);
	const link = $derived(entry ? `https://wish.seastack.mv/entry/${entry.id}` : '');

	function fileFor(b: Blob): File {
		return new File([b], `wish-${entry?.id.slice(0, 8) ?? 'share'}-${format}.png`, {
			type: 'image/png'
		});
	}

	$effect(() => {
		const e = shareSheet.entry;
		const f = format;
		if (!e) return;

		const id = ++genId;
		generating = true;
		failed = false;
		renderShareImage(e, f)
			.then((b) => {
				if (id !== genId) return;
				blob = b;
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				previewUrl = URL.createObjectURL(b);
				generating = false;
				try {
					canNativeShare = !!navigator.canShare?.({ files: [fileFor(b)] });
				} catch {
					canNativeShare = false;
				}
			})
			.catch(() => {
				if (id !== genId) return;
				generating = false;
				failed = true;
			});
	});

	// lock page scroll while the sheet is open
	$effect(() => {
		if (!shareSheet.entry) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	function close() {
		genId++;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = '';
		blob = null;
		copied = false;
		closeShareSheet();
	}

	async function shareNative() {
		if (!blob || !entry) return;
		try {
			await navigator.share({ files: [fileFor(blob)], title: 'Wish.', text: link });
		} catch {
			// user dismissed the share sheet — nothing to do
		}
	}

	function download() {
		if (!previewUrl || !entry) return;
		const a = document.createElement('a');
		a.href = previewUrl;
		a.download = `wish-${entry.id.slice(0, 8)}-${format}.png`;
		a.click();
	}

	function copyLink() {
		navigator.clipboard?.writeText(link).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1800);
		});
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && shareSheet.entry) close();
	}}
/>

{#if entry}
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
	<div
		class="share-overlay fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Share this entry"
			class="share-panel flex max-h-[92dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-3xl bg-surface p-5 sm:rounded-3xl"
		>
			<div class="flex items-center gap-3">
				<h2 class="font-display text-lg font-bold text-ink">Share</h2>
				<div class="ml-auto flex rounded-full bg-raised p-1">
					<button
						type="button"
						onclick={() => (format = 'story')}
						aria-pressed={format === 'story'}
						class="rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors {format === 'story'
							? 'bg-surface text-ink shadow-sm'
							: 'text-muted hover:text-ink'}"
					>
						Story 9:16
					</button>
					<button
						type="button"
						onclick={() => (format = 'square')}
						aria-pressed={format === 'square'}
						class="rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors {format === 'square'
							? 'bg-surface text-ink shadow-sm'
							: 'text-muted hover:text-ink'}"
					>
						Post 1:1
					</button>
				</div>
				<button
					type="button"
					onclick={close}
					aria-label="Close"
					class="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
				>
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
				</button>
			</div>

			<div
				class="relative mx-auto w-full overflow-hidden rounded-2xl bg-raised {format === 'story'
					? 'max-w-[15rem] sm:max-w-[16rem]'
					: 'max-w-[19rem]'}"
				style="aspect-ratio: {format === 'story' ? '9 / 16' : '1 / 1'};"
			>
				{#if previewUrl}
					<img src={previewUrl} alt="Shareable card preview" class="h-full w-full object-cover" />
				{/if}
				{#if generating}
					<div class="absolute inset-0 grid place-items-center bg-raised/60">
						<div class="h-8 w-8 animate-spin rounded-full border-[3px] border-accent border-t-transparent"></div>
					</div>
				{:else if failed}
					<div class="absolute inset-0 grid place-items-center px-6 text-center text-sm font-medium text-muted">
						Couldn't generate the image. Try again in a moment.
					</div>
				{/if}
			</div>

			<p class="text-center text-xs text-faint">
				Sized for Instagram Stories, WhatsApp Status &amp; more.
			</p>

			<div class="flex flex-col gap-2">
				{#if canNativeShare}
					<button
						type="button"
						onclick={shareNative}
						disabled={generating || !previewUrl}
						class="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-display text-sm font-bold text-on-accent transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
					>
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/></svg>
						Share image
					</button>
				{/if}
				<div class="flex gap-2">
					<button
						type="button"
						onclick={download}
						disabled={generating || !previewUrl}
						class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-raised px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-raised-2 disabled:opacity-60"
					>
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
						Download
					</button>
					<button
						type="button"
						onclick={copyLink}
						aria-live="polite"
						class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-raised px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-raised-2"
					>
						{#if copied}
							Copied ✓
						{:else}
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
							Copy link
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.share-overlay {
		animation: share-fade 160ms ease;
	}
	.share-panel {
		animation: share-rise 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
	}
	@keyframes share-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes share-rise {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
