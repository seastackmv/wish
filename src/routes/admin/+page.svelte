<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { timeAgo } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let view = $state<'entries' | 'comments'>('entries');
	let confirmDelete = $state<string | null>(null);

	const entries = $derived(data.entries ?? []);
	const comments = $derived(data.comments ?? []);
</script>

<svelte:head>
	<title>Moderation · wish</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
	<header class="mb-6">
		<h1 class="font-display text-3xl font-extrabold tracking-tight text-ink">Moderation</h1>
		<p class="mt-2 text-[15px] text-muted">
			Hide content to remove it from the public feed (reversible), or delete it permanently.
		</p>
	</header>

	<div role="group" aria-label="Choose list" class="mb-6 inline-flex gap-1 rounded-full bg-raised p-1">
		<button
			onclick={() => (view = 'entries')}
			aria-pressed={view === 'entries'}
			class="rounded-full px-4 py-2 text-sm font-semibold transition-colors {view === 'entries' ? 'bg-surface text-ink' : 'text-muted hover:text-ink'}"
		>
			Entries <span class="ml-1 tabular-nums text-faint">{entries.length}</span>
		</button>
		<button
			onclick={() => (view = 'comments')}
			aria-pressed={view === 'comments'}
			class="rounded-full px-4 py-2 text-sm font-semibold transition-colors {view === 'comments' ? 'bg-surface text-ink' : 'text-muted hover:text-ink'}"
		>
			Comments <span class="ml-1 tabular-nums text-faint">{comments.length}</span>
		</button>
	</div>

	{#if view === 'entries'}
		<div class="space-y-3">
			{#each entries as e (e.id)}
				<div class="rounded-2xl bg-surface p-5 {e.hidden ? 'opacity-60' : ''}">
					<div class="mb-2 flex items-center gap-2 text-xs text-faint">
						<span class="font-semibold uppercase tracking-wide {e.type === 'wish' ? 'text-accent-ink' : 'text-accent2-ink'}">
							{e.type === 'wish' ? 'Wish' : 'Problem'}
						</span>
						<span>· {e.votes} votes · {e.comment_count} comments · {timeAgo(e.created_at)}</span>
						{#if e.hidden}<span class="font-semibold text-accent2-ink">· hidden</span>{/if}
						<span class="ml-auto max-w-[40%] truncate">{e.author_name ?? 'Anonymous'}</span>
					</div>
					<a href={`/entry/${e.id}`} class="line-clamp-3 text-[15px] font-medium text-ink hover:underline">{e.text}</a>
					<div class="mt-3 flex flex-wrap items-center gap-2">
						<form method="POST" action={e.hidden ? '?/unhideEntry' : '?/hideEntry'} use:enhance>
							<input type="hidden" name="id" value={e.id} />
							<button class="rounded-full bg-raised px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-raised-2">
								{e.hidden ? 'Unhide' : 'Hide'}
							</button>
						</form>
						{#if confirmDelete === e.id}
							<form method="POST" action="?/deleteEntry" use:enhance={() => { confirmDelete = null; return async ({ update }) => update(); }}>
								<input type="hidden" name="id" value={e.id} />
								<button class="rounded-full bg-accent2 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">
									Confirm delete
								</button>
							</form>
							<button onclick={() => (confirmDelete = null)} class="text-xs font-semibold text-muted hover:text-ink">Cancel</button>
						{:else}
							<button onclick={() => (confirmDelete = e.id)} class="rounded-full px-3 py-1.5 text-xs font-semibold text-accent2-ink transition-colors hover:bg-raised">
								Delete
							</button>
						{/if}
					</div>
				</div>
			{:else}
				<p class="rounded-2xl bg-surface px-5 py-10 text-center text-sm text-faint">No entries yet.</p>
			{/each}
		</div>
	{:else}
		<div class="space-y-3">
			{#each comments as c (c.id)}
				<div class="rounded-2xl bg-surface p-5 {c.hidden ? 'opacity-60' : ''}">
					<div class="mb-1.5 flex items-center gap-2 text-xs text-faint">
						<span class="font-semibold text-ink">{c.author_name}</span>
						<span>· {timeAgo(c.created_at)}</span>
						{#if c.hidden}<span class="font-semibold text-accent2-ink">· hidden</span>{/if}
					</div>
					<p class="whitespace-pre-wrap text-[15px] leading-relaxed text-muted">{c.body}</p>
					<a href={`/entry/${c.entry_id}`} class="mt-2 line-clamp-1 text-xs text-faint hover:underline">on: {c.entry_text}</a>
					<div class="mt-3 flex flex-wrap items-center gap-2">
						<form method="POST" action={c.hidden ? '?/unhideComment' : '?/hideComment'} use:enhance>
							<input type="hidden" name="id" value={c.id} />
							<button class="rounded-full bg-raised px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-raised-2">
								{c.hidden ? 'Unhide' : 'Hide'}
							</button>
						</form>
						{#if confirmDelete === c.id}
							<form method="POST" action="?/deleteComment" use:enhance={() => { confirmDelete = null; return async ({ update }) => update(); }}>
								<input type="hidden" name="id" value={c.id} />
								<button class="rounded-full bg-accent2 px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90">
									Confirm delete
								</button>
							</form>
							<button onclick={() => (confirmDelete = null)} class="text-xs font-semibold text-muted hover:text-ink">Cancel</button>
						{:else}
							<button onclick={() => (confirmDelete = c.id)} class="rounded-full px-3 py-1.5 text-xs font-semibold text-accent2-ink transition-colors hover:bg-raised">
								Delete
							</button>
						{/if}
					</div>
				</div>
			{:else}
				<p class="rounded-2xl bg-surface px-5 py-10 text-center text-sm text-faint">No comments yet.</p>
			{/each}
		</div>
	{/if}
</section>
