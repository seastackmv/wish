<script lang="ts">
	import { onMount } from 'svelte';
	import ScrollText from '$lib/components/ScrollText.svelte';
	import { scrollReveal } from '$lib/scrollReveal';

	let scrollProgress = $state(0);

	onMount(() => scrollReveal((p) => (scrollProgress = p)));

	const storedFields = [
		{ col: 'text', label: 'The wish or problem', note: 'exactly what you typed' },
		{ col: 'category', label: 'Category', note: 'e.g. transport, healthcare' },
		{ col: 'type', label: 'Type', note: 'wish or problem' },
		{ col: 'votes', label: 'Vote count', note: 'how many people agree' },
		{ col: 'comment_count', label: 'Comment count', note: 'how many replies' },
		{ col: 'month_year', label: 'Month + timestamp', note: 'for sorting and the monthly list' }
	];

	const neverFields = [
		{ label: 'Your name', why: 'no name column for anonymous posts' },
		{ label: 'Your account', why: 'user_id is saved as null' },
		{ label: 'Your IP address', why: 'never read, never written' },
		{ label: 'Your device fingerprint', why: 'no such column exists' }
	];

	const steps = [
		{
			n: '01',
			title: "Don't sign in",
			body: 'Posting, voting and commenting never require an account. Skip login entirely, or if you do have one, flip the "post anonymously" toggle before you submit.'
		},
		{
			n: '02',
			title: 'Use a VPN or Tor',
			body: "Route your connection through a VPN or the Tor Browser before it reaches us. The host then only ever sees the VPN or Tor exit node's address, never your own."
		},
		{
			n: '03',
			title: 'Browse privately',
			body: 'Use a private or incognito window and clear cookies afterward. The only cookie this app sets for anonymous visitors is a random anti-double-vote token with no identity of its own.'
		},
		{
			n: '04',
			title: 'Watch the content itself',
			body: "Don't name yourself in the text. And remember: photos can carry hidden location data in their metadata, so strip it first or avoid identifiable images."
		}
	];

	const repoUrl = 'https://github.com/seastackmv/wish';
	const codeFiles = [
		'src/routes/api/entries/+server.ts',
		'src/routes/api/vote/[id]/+server.ts',
		'schema.sql'
	];
</script>

<svelte:head>
	<title>How anonymity works · wish</title>
</svelte:head>

<div class="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-accent" style="transform:scaleX({scrollProgress})"></div>

<div class="anon overflow-clip">

	<section class="relative flex min-h-[94vh] flex-col items-center justify-center px-5 text-center">
		<div class="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
			<svg aria-hidden="true" viewBox="0 0 600 600" class="h-[130vmin] w-[130vmin] max-w-none opacity-70">
				<defs>
					<radialGradient id="anGlow" cx="50%" cy="46%" r="55%">
						<stop offset="0%" stop-color="var(--c-accent)" stop-opacity="0.3" />
						<stop offset="100%" stop-color="var(--c-accent)" stop-opacity="0" />
					</radialGradient>
					<linearGradient id="anBody" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#8f85ff" />
						<stop offset="55%" stop-color="var(--c-accent)" />
						<stop offset="100%" stop-color="#2c2172" />
					</linearGradient>
					<linearGradient id="anEdge" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#12b76a" />
						<stop offset="100%" stop-color="var(--c-accent)" />
					</linearGradient>
					<filter id="anSoft" x="-60%" y="-60%" width="220%" height="220%">
						<feGaussianBlur stdDeviation="8" />
					</filter>
					<filter id="anBloom" x="-80%" y="-80%" width="260%" height="260%">
						<feGaussianBlur stdDeviation="4" result="b" />
						<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
					</filter>
				</defs>

				<ellipse cx="300" cy="290" rx="280" ry="260" fill="url(#anGlow)" />

				<ellipse class="an-orbit" cx="300" cy="300" rx="230" ry="150" fill="none" stroke="var(--c-accent)" stroke-width="1.25" stroke-dasharray="2 13" opacity="0.35" />
				<ellipse class="an-orbit an-orbit-rev" cx="300" cy="300" rx="170" ry="108" fill="none" stroke="#12b76a" stroke-width="1.25" stroke-dasharray="2 11" opacity="0.28" />

				<circle class="rip" cx="300" cy="300" r="80" fill="none" stroke="url(#anEdge)" stroke-width="1.5" opacity="0.5" />
				<circle class="rip rip2" cx="300" cy="300" r="80" fill="none" stroke="url(#anEdge)" stroke-width="1.5" opacity="0.5" />
				<circle class="rip rip3" cx="300" cy="300" r="80" fill="none" stroke="url(#anEdge)" stroke-width="1.5" opacity="0.5" />

				<g class="an-core">
					<path d="M300,110 L430,155 V295 C430,400 300,470 300,470 C300,470 170,400 170,295 V155 Z" fill="url(#anBody)" opacity="0.85" filter="url(#anSoft)" />
					<path d="M300,110 L430,155 V295 C430,400 300,470 300,470 C300,470 170,400 170,295 V155 Z" fill="url(#anBody)" />
					<path d="M300,110 L430,155 V295 C430,400 300,470 300,470 C300,470 170,400 170,295 V155 Z" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" />

					<g fill="none" stroke="#ffffff" stroke-opacity="0.92" stroke-width="7" stroke-linecap="round" filter="url(#anBloom)">
						<path d="M232,275 C232,255 262,248 278,262 C286,269 286,283 278,290 C262,304 232,297 232,275 Z" />
						<path d="M368,275 C368,255 338,248 322,262 C314,269 314,283 322,290 C338,304 368,297 368,275 Z" />
						<path d="M278,270 C288,262 312,262 322,270" />
					</g>
					<circle cx="255" cy="274" r="6" fill="#ffffff" />
					<circle cx="345" cy="274" r="6" fill="#ffffff" />
				</g>
			</svg>
		</div>

		<p class="mb-6 text-base font-bold uppercase tracking-[0.35em] text-accent">How anonymity works</p>
		<h1 class="mx-auto max-w-5xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-7xl sm:leading-[0.92] lg:text-[110px]">
			You don't have to trust us. You can <span class="grad">read the code</span>.
		</h1>
		<p class="mx-auto mt-9 max-w-2xl text-xl leading-relaxed text-muted sm:text-2xl">
			Every wish and every problem posted here is anonymous by default. And because the server that runs this
			place is public source code, that isn't a promise you have to take on faith.
		</p>
		<div class="mt-14 animate-bounce text-faint">
			<svg aria-hidden="true" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-5 py-[18vh]">
		<p class="mb-9 text-base font-bold uppercase tracking-[0.3em] text-accent2-ink">The database, honestly</p>
		<ScrollText
			class="font-display text-5xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-7xl"
			text="An anonymous post knows nothing about you."
		/>
		<p class="mt-12 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
			Every wish and problem lives in one row of one database table, called
			<code class="rounded-md bg-raised px-2 py-0.5 font-mono text-[0.85em] text-ink">entries</code>.
			Here is everything that row can hold, and everything it simply has no room for.
		</p>

		<div data-reveal class="relative mt-14 overflow-hidden rounded-[2rem] bg-surface p-8 sm:p-12">
			<svg class="pointer-events-none absolute inset-0 h-full w-full opacity-70" viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
				<defs>
					<radialGradient id="prAmbient" cx="20%" cy="15%" r="60%">
						<stop offset="0%" stop-color="var(--c-accent)" stop-opacity="0.16" />
						<stop offset="100%" stop-color="var(--c-accent)" stop-opacity="0" />
					</radialGradient>
				</defs>
				<rect x="0" y="0" width="800" height="400" fill="url(#prAmbient)" />
				<g stroke="var(--c-accent)" stroke-width="2" stroke-linecap="round" opacity="0.55" fill="none">
					<path class="pr-trace" d="M24,64 V24 H64" stroke-dasharray="16 60" />
					<path class="pr-trace" d="M736,24 H776 V64" stroke-dasharray="16 60" style="animation-delay:-2s" />
					<path class="pr-trace" d="M776,336 V376 H736" stroke-dasharray="16 60" style="animation-delay:-4s" />
					<path class="pr-trace" d="M64,376 H24 V336" stroke-dasharray="16 60" style="animation-delay:-6s" />
				</g>
			</svg>

			<div class="relative">

				<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
					<span class="inline-flex items-center gap-2.5 rounded-full bg-raised px-4 py-2 font-mono text-sm font-semibold text-ink">
						<span class="relative flex h-2 w-2" aria-hidden="true">
							<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-vote opacity-60"></span>
							<span class="relative inline-flex h-2 w-2 rounded-full bg-vote"></span>
						</span>
						entries
					</span>
					<span class="text-xs font-bold uppercase tracking-[0.28em] text-faint">one row per post</span>
				</div>

				<div class="mt-8 grid gap-x-8 gap-y-8 lg:grid-cols-2">

					<div>
						<div class="mb-4 flex items-center gap-2.5">
							<span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-vote/15 text-vote" aria-hidden="true">
								<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
							</span>
							<h3 class="font-display text-sm font-bold uppercase tracking-[0.15em] text-vote">Stored</h3>
						</div>
						<ul class="space-y-2">
							{#each storedFields as f}
								<li class="flex items-center gap-3 rounded-2xl bg-raised px-3.5 py-3">
									<code class="shrink-0 rounded-lg bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-vote">{f.col}</code>
									<span class="min-w-0">
										<span class="block text-[0.95rem] font-semibold leading-tight text-ink">{f.label}</span>
										<span class="mt-0.5 block text-sm leading-snug text-muted">{f.note}</span>
									</span>
								</li>
							{/each}
						</ul>
					</div>

					<div>
						<div class="mb-4 flex items-center gap-2.5">
							<span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent2/15 text-accent2" aria-hidden="true">
								<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
							</span>
							<h3 class="font-display text-sm font-bold uppercase tracking-[0.15em] text-accent2">Never stored</h3>
						</div>
						<ul class="space-y-2">
							{#each neverFields as f}
								<li class="flex items-center gap-3 rounded-2xl bg-raised px-3.5 py-3">
									<span class="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface text-faint" aria-hidden="true">
										<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
									</span>
									<span class="min-w-0 flex-1">
										<span class="block text-[0.95rem] font-semibold leading-tight text-faint line-through decoration-2 decoration-faint">{f.label}</span>
										<span class="mt-0.5 block text-sm leading-snug text-faint">{f.why}</span>
									</span>
									<span class="hidden shrink-0 self-start rounded-full bg-surface px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-faint sm:inline-block">no column</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</div>

		<p class="mx-auto mt-10 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
			That's not a redaction, it's an omission. The endpoint that saves a new post,
			<code class="rounded-md bg-raised px-2 py-0.5 font-mono text-[0.8em] text-ink">src/routes/api/entries/+server.ts</code>,
			never once reads a visitor's IP address, a device id, or a name. There is no column for them, and no line
			of code that asks.
		</p>
	</section>

	<section class="relative py-[14vh]">
		<div class="mx-auto max-w-5xl px-5">
			<p class="mb-5 text-base font-bold uppercase tracking-[0.3em] text-accent">Optional accounts</p>
			<h2 class="max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
				Signed in? Still anonymous when you want.
			</h2>
			<p class="mt-8 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
				The only way to sign in is with Google, so this app never stores a password of its own. And every
				time you post or comment, there is a plain toggle: <em class="text-ink not-italic">"post anonymously."</em>
				Flip it on, and the row saved to the database has its account link set to nothing.
			</p>

			<div data-reveal class="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
				<div class="flex-1 rounded-[1.5rem] bg-surface p-6 text-center sm:max-w-[220px]">
					<p class="font-display text-lg font-bold text-ink">Your account</p>
					<p class="mt-1 text-sm text-muted">Google sign-in</p>
				</div>
				<div class="flex shrink-0 items-center justify-center gap-2 px-2 text-faint">
					<span class="rounded-full bg-raised px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent">anonymous: on</span>
					<svg class="h-5 w-5 rotate-90 sm:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				</div>
				<div class="flex-1 rounded-[1.5rem] bg-surface p-6 text-center sm:max-w-[220px]">
					<p class="font-display text-lg font-bold text-ink">The saved post</p>
					<p class="mt-1 font-mono text-sm text-muted">user_id: null</p>
				</div>
			</div>

			<p class="mx-auto mt-10 max-w-3xl text-center text-lg text-muted">
				Not a name change. Not "anonymous unless someone asks." The account and the post are never linked in
				the database: not in a hidden column, not in a log, not anywhere.
			</p>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-5 py-[14vh]">
		<p class="mb-5 text-base font-bold uppercase tracking-[0.3em] text-accent2-ink">Voting without identity</p>
		<h2 class="max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
			A vote can prove you're a real person, without proving who that person is.
		</h2>
		<p class="mt-8 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
			To stop the same person voting on an idea twice,
			<code class="rounded-md bg-raised px-2 py-0.5 font-mono text-[0.8em] text-ink">src/routes/api/vote/[id]/+server.ts</code>
			needs a way to recognise "have I seen this voter before?" without ever writing down who they are.
		</p>

		<div data-reveal class="mt-12 rounded-[2rem] bg-surface p-8 sm:p-10">
			<div class="flex flex-wrap items-center justify-center gap-3">
				<span class="rounded-full bg-raised px-4 py-2 text-sm font-bold text-ink">device + cookie</span>
				<span class="text-lg font-bold text-faint">+</span>
				<span class="rounded-full bg-raised px-4 py-2 text-sm font-bold text-ink">PEPPER</span>
				<svg class="h-4 w-4 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				<span class="rounded-full bg-accent px-4 py-2 text-sm font-bold text-on-accent">SHA-256</span>
				<svg class="h-4 w-4 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				<span class="rounded-full bg-raised px-4 py-2 font-mono text-sm font-bold text-ink">voter_hash</span>
			</div>
			<div class="mt-4 flex flex-wrap items-center justify-center gap-3">
				<span class="rounded-full bg-raised px-4 py-2 text-sm font-bold text-ink">IP address</span>
				<span class="text-lg font-bold text-faint">+</span>
				<span class="rounded-full bg-raised px-4 py-2 text-sm font-bold text-ink">PEPPER</span>
				<svg class="h-4 w-4 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				<span class="rounded-full bg-accent px-4 py-2 text-sm font-bold text-on-accent">SHA-256</span>
				<svg class="h-4 w-4 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
				<span class="rounded-full bg-raised px-4 py-2 font-mono text-sm font-bold text-ink">ip_hash</span>
			</div>
			<div class="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-2xl bg-raised px-5 py-4">
				<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent" aria-hidden="true">
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
				</span>
				<p class="text-left text-base leading-relaxed text-muted">
					<span class="font-bold text-ink">One-way.</span>
					<code class="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-ink">PEPPER</code>
					is a secret that lives only on the server, never in the public code, so there is no key that turns a
					hash back into an IP address or a person.
				</p>
			</div>
		</div>

		<p class="mx-auto mt-10 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
			Both hashes live on the <span class="font-semibold text-ink">vote</span>, in a separate table from the
			post itself. Even in the unlikely case someone got direct access to the database, a vote hash cannot be
			traced back to reveal who authored anything.
		</p>
	</section>

	<section class="relative py-[16vh]">
		<div class="mx-auto max-w-5xl px-5">
			<p class="mb-9 text-base font-bold uppercase tracking-[0.3em] text-accent2-ink">The honest limit</p>
			<ScrollText
				class="font-display text-5xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-7xl"
				text="We can't see who you are. But we won't pretend the internet is magic."
			/>
			<div class="mt-12 grid gap-8 sm:grid-cols-2">
				<p class="text-xl leading-relaxed text-muted">
					This app stores nothing that identifies you, and the public code proves it. No name, no account
					link, no IP address, no device id is ever written to the database.
				</p>
				<p class="text-xl leading-relaxed text-muted">
					But like every website that has ever existed, your connection has to physically arrive somewhere.
					<span class="font-semibold text-ink">Cloudflare</span>, the host running this app, sees a source
					address for that connection, the way a postal service sees the return address on an envelope
					even if it never opens it. We don't log it. We don't store it. We don't need it. But pretending
					the network itself is invisible would be dishonest, so here it is, in the open.
				</p>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-5 py-[14vh]">
		<div data-reveal class="mb-16 max-w-3xl">
			<p class="mb-5 text-base font-bold uppercase tracking-[0.3em] text-accent">Go one step further</p>
			<h2 class="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
				Want to disappear from the network too? Here's how.
			</h2>
		</div>

		<div class="relative flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-3">
			{#each steps as step, i}
				<div data-reveal={i * 0.09} class="relative flex-1">
					<div class="flex h-full flex-col gap-3 rounded-[1.5rem] bg-surface p-6">
						<span class="font-display text-base font-extrabold text-accent">{step.n}</span>
						<h3 class="font-display text-2xl font-bold text-ink">{step.title}</h3>
						<p class="text-base leading-relaxed text-muted">{step.body}</p>
					</div>
					{#if i < steps.length - 1}
						<div class="hidden lg:block absolute right-[-10px] top-1/2 z-10 -translate-y-1/2 text-faint">
							<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div data-reveal class="mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-b from-accent/10 to-transparent p-8 sm:p-14">
			<p class="mb-4 text-base font-bold uppercase tracking-[0.3em] text-accent">The network path</p>
			<h3 class="max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
				Behind a VPN or Tor, the host only ever sees the tunnel, never you.
			</h3>

			<div class="relative mx-auto mt-12 max-w-3xl">
				<svg viewBox="0 0 960 300" class="block h-auto w-full" role="img" aria-label="Diagram: you, through a VPN or Tor, to Cloudflare, to wish. Your real IP address only ever exists on the hop between you and the VPN or Tor client. From that point on, only the VPN or Tor exit address is visible.">
					<defs>
						<linearGradient id="npVpn" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stop-color="#a99dff" />
							<stop offset="100%" stop-color="var(--c-accent)" />
						</linearGradient>
						<radialGradient id="npWish" cx="38%" cy="32%" r="72%">
							<stop offset="0%" stop-color="#d8d2ff" />
							<stop offset="45%" stop-color="var(--c-accent)" />
							<stop offset="100%" stop-color="#3a2ca8" />
						</radialGradient>
						<filter id="npSoft" x="-80%" y="-80%" width="260%" height="260%">
							<feGaussianBlur stdDeviation="7" />
						</filter>
						<filter id="npBloom" x="-80%" y="-80%" width="260%" height="260%">
							<feGaussianBlur stdDeviation="3.5" result="b" />
							<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
						</filter>
					</defs>

					<line x1="90" y1="150" x2="360" y2="150" stroke="var(--c-faint)" stroke-width="2" stroke-dasharray="3 8" opacity="0.55" />
					<line class="np-flow" x1="360" y1="150" x2="650" y2="150" stroke="#12b76a" stroke-width="2.25" stroke-dasharray="2 10" opacity="0.65" />
					<line class="np-flow" x1="650" y1="150" x2="900" y2="150" stroke="#12b76a" stroke-width="2.25" stroke-dasharray="2 10" opacity="0.65" style="animation-delay:-0.8s" />

					<circle cx="90" cy="150" r="32" fill="var(--c-raised)" />
					<circle cx="90" cy="140" r="8" fill="var(--c-faint)" />
					<ellipse cx="90" cy="168" rx="16" ry="12" fill="var(--c-faint)" />

					<g class="np-core">
						<circle cx="360" cy="150" r="42" fill="url(#npVpn)" opacity="0.45" filter="url(#npSoft)" />
						<circle cx="360" cy="150" r="34" fill="url(#npVpn)" />
						<circle cx="360" cy="150" r="34" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5" />
						<circle cx="360" cy="150" r="22" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5" />
						<circle cx="360" cy="150" r="11" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.5" />
					</g>

					<circle cx="650" cy="150" r="34" fill="var(--c-raised)" />
					<circle cx="636" cy="153" r="9" fill="#12b76a" opacity="0.85" />
					<circle cx="650" cy="144" r="12" fill="#12b76a" opacity="0.85" />
					<circle cx="664" cy="153" r="9" fill="#12b76a" opacity="0.85" />
					<rect x="630" y="150" width="40" height="13" rx="6.5" fill="#12b76a" opacity="0.85" />

					<g class="np-core" style="animation-delay:-2s">
						<circle cx="900" cy="150" r="30" fill="url(#npWish)" opacity="0.5" filter="url(#npSoft)" />
						<circle cx="900" cy="150" r="21" fill="url(#npWish)" />
						<circle cx="893" cy="143" r="5.5" fill="#ffffff" opacity="0.9" filter="url(#npBloom)" />
					</g>
				</svg>

				<div class="pointer-events-none absolute inset-0" aria-hidden="true">
					<span class="absolute -translate-x-1/2 text-xs font-semibold text-faint" style="left:23.4%;top:34%">your real IP, only this hop</span>
					<span class="absolute -translate-x-1/2 text-xs font-semibold text-vote" style="left:65.6%;top:34%">VPN / Tor exit address only, from here on</span>
					<span class="absolute -translate-x-1/2 text-sm font-bold text-muted" style="left:9.4%;top:66%">You</span>
					<span class="absolute -translate-x-1/2 text-sm font-bold text-muted" style="left:37.5%;top:69%">VPN / Tor</span>
					<span class="absolute -translate-x-1/2 text-sm font-bold text-muted" style="left:67.7%;top:66%">Cloudflare</span>
					<span class="absolute -translate-x-1/2 text-sm font-bold text-muted" style="left:93.7%;top:70%">wish</span>
				</div>
			</div>

			<p class="mx-auto mt-10 max-w-3xl text-center text-lg leading-relaxed text-muted sm:text-xl">
				Without a VPN or Tor, the address the host sees is your own. Put a VPN or Tor between you and us, and
				the address the host sees belongs to the tunnel, not to you.
			</p>
		</div>
	</section>

	<section class="relative py-[16vh]">
		<div class="mx-auto max-w-5xl px-5">
			<p class="mb-9 text-base font-bold uppercase tracking-[0.3em] text-accent2-ink">Verify it yourself</p>
			<ScrollText
				class="font-display text-5xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-7xl"
				text="A privacy promise you can't check is just a promise."
			/>
			<p class="mt-12 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
				So we're not asking you to trust a paragraph on this page. The server that saves a post, casts a
				vote, and defines the database is public source code. Anyone can open these files right now and read
				exactly what happens to their words before they click submit.
			</p>

			<div data-reveal class="mt-10 flex flex-wrap gap-3">
				{#each codeFiles as file}
					<a
						href={`${repoUrl}/blob/main/${file}`}
						target="_blank"
						rel="noopener"
						class="rounded-full bg-raised px-4 py-2 font-mono text-sm text-ink transition-colors hover:bg-raised-2 hover:text-accent"
					>{file}</a>
				{/each}
			</div>

			<div data-reveal class="mt-10">
				<a
					href={repoUrl}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg font-bold text-on-accent transition-transform hover:scale-105"
				>
					Read the source
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>
				</a>
			</div>
		</div>
	</section>

	<section class="relative py-[16vh]">
		<div class="mx-auto max-w-5xl px-5 text-center">
			<ScrollText
				class="mx-auto font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-7xl lg:text-[100px]"
				text="Nothing to leak. Nothing to trace."
			/>
			<p class="mx-auto mt-12 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
				You don't need a burner account or a new identity to speak honestly here. Say what's true, vote for
				what matters, and let the words stand on their own.
			</p>
		</div>
	</section>

	<section class="mx-auto max-w-3xl px-5 pb-[16vh]">
		<div data-reveal class="rounded-[2rem] bg-ink p-10 text-center sm:p-16">
			<h2 class="font-display text-5xl font-extrabold leading-tight text-bg sm:text-7xl">
				Speak freely.<br />No name required.
			</h2>
			<p class="mx-auto mt-6 max-w-md text-lg text-bg/70 sm:text-xl">
				Post a wish or a problem in under a minute. No account, no name, no tracking: just your honest voice.
			</p>
			<a
				href="/"
				class="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg font-bold text-on-accent transition-transform hover:scale-105"
			>
				Post anonymously
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
			</a>
			<p class="mt-6 text-sm text-bg/50">
				or <a href="/browse" class="font-semibold text-bg/80 underline-offset-4 hover:underline">see what others have already spoken up about</a>
			</p>
		</div>
	</section>
</div>

<style>
	.grad {
		background: linear-gradient(120deg, var(--c-accent), #12b76a);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	[data-reveal] {
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-reveal] {
			opacity: 1;
		}
	}

	.rip {
		transform-box: fill-box;
		transform-origin: center;
		animation: ripple 4s ease-out infinite;
	}
	.rip2 {
		animation-delay: 1.33s;
	}
	.rip3 {
		animation-delay: 2.66s;
	}
	@keyframes ripple {
		0% {
			transform: scale(0.25);
			opacity: 0.55;
		}
		100% {
			transform: scale(3.6);
			opacity: 0;
		}
	}

	.an-orbit {
		animation: an-orbitdash 9s linear infinite;
	}
	.an-orbit-rev {
		animation-direction: reverse;
		animation-duration: 13s;
	}
	@keyframes an-orbitdash {
		to {
			stroke-dashoffset: -120;
		}
	}
	.an-core {
		transform-box: fill-box;
		transform-origin: center;
		animation: an-breathe 4.5s ease-in-out infinite;
	}
	@keyframes an-breathe {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.045);
		}
	}

	.pr-trace {
		animation: pr-tracedash 6s linear infinite;
	}
	@keyframes pr-tracedash {
		to {
			stroke-dashoffset: -152;
		}
	}

	.np-flow {
		animation: np-flowmove 1.8s linear infinite;
	}
	@keyframes np-flowmove {
		to {
			stroke-dashoffset: -24;
		}
	}
	.np-core {
		transform-box: fill-box;
		transform-origin: center;
		animation: np-breathe 4.2s ease-in-out infinite;
	}
	@keyframes np-breathe {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.06);
		}
	}
</style>
