<script lang="ts">
	import { goto } from '$app/navigation';
	import type { EntryType } from '$lib/types';
	import type { PageData } from './$types';
	import Turnstile from '$lib/components/Turnstile.svelte';

	let { data }: { data: PageData } = $props();

	let type = $state<EntryType>('wish');
	let text = $state('');
	let anonymous = $state(false);

	let submitting = $state(false);
	let error = $state('');

	let imageKey = $state<string | null>(null);
	let previewUrl = $state<string | null>(null);
	let uploading = $state(false);
	let fileInput = $state<HTMLInputElement>();

	let turnstileToken = $state('');
	let captchaKey = $state(0);

	const maxWords = $derived(data.user ? 2000 : 500);
	const wordCount = $derived(text.trim() ? text.trim().split(/\s+/).length : 0);
	const overLimit = $derived(wordCount > maxWords);
	const needsCaptcha = $derived(!!data.turnstileSiteKey);
	const canPost = $derived(
		text.trim().length >= 10 && !overLimit && !uploading && !submitting && (!needsCaptcha || !!turnstileToken)
	);

	const placeholders: Record<EntryType, string> = {
		wish: 'I wish there was a single app showing live ferry times for every island…',
		pain: 'Getting a basic government document means queuing for hours because…'
	};

	function autoResize(node: HTMLTextAreaElement) {
		const resize = () => {
			node.style.height = 'auto';
			node.style.height = Math.max(node.scrollHeight, 220) + 'px';
		};
		node.addEventListener('input', resize);
		queueMicrotask(resize);
		return { destroy: () => node.removeEventListener('input', resize) };
	}

	async function onFileChange(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		error = '';
		if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(f.type)) {
			error = 'Images must be JPEG, PNG, WebP or GIF.';
			return;
		}
		if (f.size > 5 * 1024 * 1024) {
			error = 'Image must be 5 MB or smaller.';
			return;
		}
		if (needsCaptcha && !turnstileToken) {
			error = 'Please complete the verification below, then add your image.';
			return;
		}
		removeImage();
		previewUrl = URL.createObjectURL(f);
		uploading = true;
		const fd = new FormData();
		fd.append('file', f);
		if (turnstileToken) fd.append('turnstile_token', turnstileToken);
		try {
			const res = await fetch('/api/upload', { method: 'POST', body: fd });
			if (res.ok) {
				imageKey = (await res.json()).key;
			} else {
				const err = await res.json().catch(() => ({}));
				error = err.message ?? 'Image upload failed.';
				removeImage();
			}
		} catch {
			error = 'Image upload failed.';
			removeImage();
		} finally {
			uploading = false;
			if (needsCaptcha) {
				turnstileToken = '';
				captchaKey++;
			}
		}
	}

	function removeImage() {
		imageKey = null;
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
		if (fileInput) fileInput.value = '';
	}

	async function submit() {
		const t = text.trim();
		if (t.length < 10) {
			error = 'Please write at least 10 characters.';
			return;
		}
		if (overLimit) {
			error = `That's over the ${maxWords.toLocaleString()}-word limit.`;
			return;
		}
		if (uploading) {
			error = 'Please wait for the image to finish uploading.';
			return;
		}
		submitting = true;
		error = '';
		try {
			const res = await fetch('/api/entries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type, text: t, image_key: imageKey, anonymous, turnstile_token: turnstileToken })
			});
			if (!res.ok) {
				const e = await res.json().catch(() => ({}));
				error = e.message ?? 'Something went wrong.';
				turnstileToken = '';
				captchaKey++;
				return;
			}
			const created = await res.json();
			goto(`/entry/${created.id}`);
		} catch {
			error = 'Something went wrong. Please try again.';
			turnstileToken = '';
			captchaKey++;
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>wish · surface what matters</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-16">

	<div class="mb-8 text-center sm:mb-12">
		<h1 class="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
			What do you wish was better?
		</h1>
		<p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
			Post a problem you face every day, or an idea for a better future. The most-supported ones
			become challenges for parliament, councils, and builders to solve.
		</p>
	</div>

	<div class="rounded-[2rem] bg-surface p-5 sm:p-8">

		<div role="group" aria-label="Choose post type" class="grid grid-cols-2 gap-1 rounded-full bg-raised p-1">
			<button
				type="button"
				onclick={() => (type = 'wish')}
				aria-pressed={type === 'wish'}
				class="rounded-full py-3 text-sm font-bold transition-colors sm:text-base {type === 'wish'
					? 'bg-surface text-accent-ink'
					: 'text-muted hover:text-ink'}"
			>
				💡 A wish / idea
			</button>
			<button
				type="button"
				onclick={() => (type = 'pain')}
				aria-pressed={type === 'pain'}
				class="rounded-full py-3 text-sm font-bold transition-colors sm:text-base {type === 'pain'
					? 'bg-surface text-accent2-ink'
					: 'text-muted hover:text-ink'}"
			>
				⚠️ A problem
			</button>
		</div>

		<textarea
			bind:value={text}
			use:autoResize
			placeholder={placeholders[type]}
			aria-label={type === 'wish' ? 'Describe your wish or idea' : 'Describe the problem'}
			class="mt-5 w-full resize-none rounded-3xl bg-raised px-5 py-5 text-2xl font-medium leading-relaxed tracking-tight text-ink outline-none transition-colors placeholder:font-normal placeholder:text-faint focus:bg-raised-2 sm:px-6 sm:py-6 sm:text-3xl"
		></textarea>

		{#if previewUrl}
			<div class="relative mt-4 overflow-hidden rounded-3xl">
				<img src={previewUrl} alt="Preview" class="max-h-96 w-full object-cover" />
				{#if uploading}
					<div aria-live="polite" class="absolute inset-0 grid place-items-center bg-black/40 text-sm font-semibold text-white">
						Uploading…
					</div>
				{/if}
				<button
					type="button"
					onclick={removeImage}
					class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
					aria-label="Remove image"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
				</button>
			</div>
		{/if}

		{#if error}
			<p role="alert" class="mt-5 rounded-2xl bg-accent2/10 px-4 py-3 text-sm font-medium text-accent2-ink">{error}</p>
		{/if}

		{#if data.turnstileSiteKey}
			<div class="mt-5">
				{#key captchaKey}
					<Turnstile sitekey={data.turnstileSiteKey} bind:token={turnstileToken} />
				{/key}
			</div>
		{/if}

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<input
				bind:this={fileInput}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				onchange={onFileChange}
				class="hidden"
			/>
			<button
				type="button"
				onclick={() => fileInput?.click()}
				class="inline-flex items-center gap-2 rounded-full bg-raised px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-raised-2"
			>
				<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20"/></svg>
				{previewUrl ? 'Change image' : 'Add image'}
			</button>

			{#if data.user}
				<label class="flex cursor-pointer items-center gap-2 text-sm text-muted">
					<input type="checkbox" bind:checked={anonymous} class="rounded" />
					Anonymously
				</label>
			{/if}

			<div class="ml-auto flex items-center gap-4">
				<span class="text-sm tabular-nums {overLimit ? 'font-semibold text-accent2' : 'text-faint'}">
					{wordCount.toLocaleString()} / {maxWords.toLocaleString()} words
				</span>
				<button
					type="button"
					onclick={submit}
					disabled={!canPost}
					class="rounded-full bg-accent px-7 py-3 font-display text-base font-bold text-on-accent transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{submitting ? 'Posting…' : 'Post'}
				</button>
			</div>
		</div>
	</div>

	<p class="mt-5 text-center text-sm text-faint">
		{#if data.user}
			Posting as <span class="font-semibold text-muted">{anonymous ? 'Anonymous' : data.user.display_name}</span>
			· up to {maxWords.toLocaleString()} words
		{:else}
			Posting anonymously ({maxWords.toLocaleString()}-word limit).
			<a href="/login" class="font-semibold text-accent hover:underline">Sign in</a> for more room and your name.
		{/if}
	</p>

	<div class="mt-10 flex justify-center">
		<a
			href="/browse"
			class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
		>
			Or browse what others wish for
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
		</a>
	</div>
</section>
