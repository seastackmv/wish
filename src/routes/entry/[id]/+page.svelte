<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { timeAgo } from '$lib/utils';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import VoteButton from '$lib/components/VoteButton.svelte';
	import Turnstile from '$lib/components/Turnstile.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const entry = $derived(data.entry);
	let postAnonymously = $state(false);
	let posting = $state(false);
	let copied = $state(false);
	let commentToken = $state('');
	let captchaKey = $state(0);

	function share() {
		navigator.clipboard?.writeText(window.location.href).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1800);
		});
	}
</script>

<svelte:head>
	<title>{entry.type === 'wish' ? 'Wish' : 'Problem'} · wish</title>
</svelte:head>

<article class="mx-auto max-w-2xl px-5 py-10 sm:py-14">
	<a
		href="/browse"
		class="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
		Back to feed
	</a>

	<div class="rounded-3xl bg-surface p-6 sm:p-8">
		{#if data.isAdmin && entry.hidden}
			<p class="mb-4 rounded-2xl bg-accent2/10 px-4 py-2.5 text-sm font-semibold text-accent2-ink">
				Hidden from the public - only admins can see this.
			</p>
		{/if}
		<div class="flex flex-wrap items-center gap-2">
			<TypeBadge type={entry.type} />
			<span class="ml-auto text-xs font-medium text-faint">{timeAgo(entry.created_at)}</span>
		</div>

		<h1 class="mt-5 font-display text-2xl font-bold leading-snug tracking-tight text-ink sm:text-[28px]">
			{entry.text}
		</h1>

		{#if entry.image_key}
			<img
				src={`/api/image/${entry.image_key}`}
				alt="Attached by the author"
				loading="lazy"
				class="mt-5 w-full max-h-[32rem] aspect-[16/10] rounded-2xl object-cover"
			/>
		{/if}

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<VoteButton id={entry.id} votes={entry.votes} voted={entry.user_voted ?? false} size="lg" />
			<span class="text-sm text-muted">
				<span class="font-semibold text-ink">{entry.comment_count ?? data.comments.length}</span> in discussion
			</span>
			<button
				type="button"
				onclick={share}
				aria-live="polite"
				class="ml-auto inline-flex items-center gap-2 rounded-full bg-raised px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-raised-2"
			>
				{#if copied}
					Copied ✓
				{:else}
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
					Share
				{/if}
			</button>
		</div>

		<p class="mt-4 text-xs text-faint">
			Posted by <span class="font-semibold text-muted">{entry.author_name ?? 'Anonymous'}</span>
		</p>

		{#if data.isAdmin}
			<form
				method="POST"
				action={entry.hidden ? '?/unhideEntry' : '?/hideEntry'}
				use:enhance
				class="mt-4 border-t border-raised pt-4"
			>
				<button
					class="rounded-full bg-raised px-4 py-2 text-sm font-semibold text-accent2-ink transition-colors hover:bg-raised-2"
				>
					{entry.hidden ? 'Unhide entry' : 'Hide entry'}
				</button>
			</form>
		{/if}
	</div>

	<section class="mt-8">
		<h2 class="mb-4 px-1 font-display text-lg font-bold text-ink">
			Discussion
			<span class="ml-1 text-muted">{data.comments.length}</span>
		</h2>

		<form
			method="POST"
			action="?/comment"
			use:enhance={() => {
				posting = true;
				return async ({ update }) => {
					await update({ reset: true });
					posting = false;
					commentToken = '';
					captchaKey++;
				};
			}}
			class="rounded-3xl bg-surface p-5"
		>
			<textarea
				name="body"
				rows="3"
				required
				maxlength="1000"
				aria-label="Write a comment"
				placeholder="Add your perspective, evidence, or an idea to solve this…"
				class="w-full resize-none rounded-2xl bg-raised px-4 py-3 text-ink outline-none transition-colors placeholder:text-faint focus:bg-raised-2"
			></textarea>

			{#if form?.error}
				<p role="alert" class="mt-2 text-sm font-medium text-accent2-ink">{form.error}</p>
			{/if}

			{#if data.turnstileSiteKey}
					<input type="hidden" name="turnstile_token" value={commentToken} />
					<div class="mt-3">
						{#key captchaKey}
							<Turnstile sitekey={data.turnstileSiteKey} bind:token={commentToken} />
						{/key}
					</div>
				{/if}

				<div class="mt-3 flex items-center justify-between gap-3">
				{#if data.user}
					<label class="flex cursor-pointer items-center gap-2 text-sm text-muted">
						<input type="checkbox" name="anonymous" bind:checked={postAnonymously} class="rounded" />
						Post anonymously
					</label>
					<span class="text-xs text-faint">
						as {postAnonymously ? 'Anonymous' : data.user.display_name}
					</span>
				{:else}
					<span class="text-xs text-faint">
						Posting anonymously ·
						<a href="/login" class="font-semibold text-accent hover:underline">sign in</a>
					</span>
				{/if}
				<button
					type="submit"
					disabled={posting || (!!data.turnstileSiteKey && !commentToken)}
					class="rounded-full bg-accent px-5 py-2.5 text-sm font-display font-bold text-on-accent transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
				>
					{posting ? 'Posting…' : 'Post'}
				</button>
			</div>
		</form>

		<div class="mt-4 space-y-3">
			{#each data.comments as c (c.id)}
				<div class="rounded-2xl bg-surface p-5 {c.hidden ? 'opacity-50' : ''}">
					<div class="mb-1.5 flex items-center gap-2">
						<span class="text-sm font-semibold text-ink">{c.author_name}</span>
						<span class="text-xs text-faint">· {timeAgo(c.created_at)}</span>
						{#if c.hidden}
							<span class="text-xs font-semibold text-accent2-ink">· hidden</span>
						{/if}
						{#if data.isAdmin}
							<form
								method="POST"
								action={c.hidden ? '?/unhideComment' : '?/hideComment'}
								use:enhance
								class="ml-auto"
							>
								<input type="hidden" name="id" value={c.id} />
								<button class="text-xs font-semibold text-muted transition-colors hover:text-accent2-ink">
									{c.hidden ? 'Unhide' : 'Hide'}
								</button>
							</form>
						{/if}
					</div>
					<p class="whitespace-pre-wrap text-[15px] leading-relaxed text-muted">{c.body}</p>
				</div>
			{:else}
				<p class="rounded-2xl bg-surface px-5 py-8 text-center text-sm text-faint">
					No comments yet - start the conversation.
				</p>
			{/each}
		</div>
	</section>
</article>
