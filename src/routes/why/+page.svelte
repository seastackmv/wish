<script lang="ts">
	import { onMount } from 'svelte';
	import ScrollText from '$lib/components/ScrollText.svelte';
	import { scrollReveal } from '$lib/scrollReveal';

	let scrollProgress = $state(0);

	onMount(() => scrollReveal((p) => (scrollProgress = p)));

	const flow = [
		{ n: '01', title: 'Share your idea', body: 'Tell us about a problem you face every day or an idea to make things better. It is anonymous and only takes a minute.' },
		{ n: '02', title: 'See who agrees', body: 'Other people who feel the same way will upvote your idea. You will see you are not alone.' },
		{ n: '03', title: 'Your voice grows', body: 'Ideas with the most votes move to the top of our list for everyone to see.' },
		{ n: '04', title: 'Leaders take notice', body: 'Government leaders, councils, and businesses can clearly see what everyday citizens actually care about.' },
		{ n: '05', title: 'Real change happens', body: 'A new service, a quick fix, or a new law gets made. It all starts with your single idea.' }
	];

	const benefits = [
		{ title: 'Turn complaints into action', body: 'One complaint is easy to ignore. Thousands of voices together create real proof that cannot be ignored.' },
		{ title: 'Make leaders listen', body: 'Decision-makers take action when they see that many people care deeply about a specific problem.' },
		{ title: 'Problems become solutions', body: 'Every shared problem is a chance for a student, a local business, or a creator to build something to fix it.' },
		{ title: 'Keep issues alive', body: 'Important problems do not just disappear from the news. They stay here until they are finally fixed.' },
		{ title: 'Safe and secure', body: 'You do not need to share your name. Feel safe to speak freely about what needs to change without fear.' },
		{ title: 'Find your community', body: 'See thousands of others who face the exact same problems. Together, we can make a difference.' }
	];
</script>

<svelte:head>
	<title>Why wish · a better Maldives starts with your voice</title>
</svelte:head>

<div class="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-accent" style="transform:scaleX({scrollProgress})"></div>

<div class="why overflow-clip">

	<section class="relative flex min-h-[94vh] flex-col items-center justify-center px-5 text-center">
		<div class="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
			<svg aria-hidden="true" viewBox="0 0 600 600" class="h-[130vmin] w-[130vmin] max-w-none opacity-70">
				<defs>
					<radialGradient id="g1" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stop-color="var(--c-accent)" stop-opacity="0.28" />
						<stop offset="100%" stop-color="var(--c-accent)" stop-opacity="0" />
					</radialGradient>
				</defs>
				<circle cx="300" cy="300" r="290" fill="url(#g1)" />
				<circle class="rip" cx="300" cy="300" r="70" fill="none" stroke="var(--c-accent)" stroke-width="1.5" opacity="0.5" />
				<circle class="rip rip2" cx="300" cy="300" r="70" fill="none" stroke="var(--c-accent)" stroke-width="1.5" opacity="0.5" />
				<circle class="rip rip3" cx="300" cy="300" r="70" fill="none" stroke="var(--c-accent)" stroke-width="1.5" opacity="0.5" />
				<circle cx="300" cy="300" r="9" fill="var(--c-accent)" />
			</svg>
		</div>

		<p class="mb-6 text-base font-bold uppercase tracking-[0.35em] text-accent">Why wish</p>
		<h1 class="mx-auto max-w-5xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-7xl sm:leading-[0.92] lg:text-[130px]">
			Real change starts with your <span class="grad">voice</span>.
		</h1>
		<p class="mx-auto mt-9 max-w-2xl text-xl leading-relaxed text-muted sm:text-2xl">
			Real change doesn't happen by waiting for promises. It happens when everyday people like you share their ideas and say,
			<em class="text-ink not-italic">“someone should really fix this.”</em>
		</p>
		<div class="mt-14 animate-bounce text-faint">
			<svg aria-hidden="true" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-5 py-[18vh]">
		<p class="mb-9 text-base font-bold uppercase tracking-[0.3em] text-accent2-ink">The honest question</p>
		<ScrollText
			class="font-display text-5xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-7xl"
			text="Why should I speak up when nothing ever changes?"
		/>
		<p class="mt-12 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
			It is a fair question. Many of us feel this way. Let's answer it honestly, because your doubts are valid.
		</p>
	</section>

	<section class="relative py-[16vh]">
		<div class="mx-auto max-w-5xl px-5">
			<ScrollText
				class="font-display text-5xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-6xl sm:leading-[1.04] lg:text-[88px]"
				text="Maybe things didn't change before because our voices were not united."
			/>
			<div class="mt-14 grid gap-8 sm:grid-cols-2">
				<p class="text-xl leading-relaxed text-muted">
					Complaining to a friend is easily forgotten. It cannot be measured and nobody else can see it.
					That is why it changes nothing.
				</p>
				<p class="text-xl leading-relaxed text-muted">
					But a problem <span class="font-semibold text-ink">shared online, seen by everyone, and supported by thousands</span>
					is powerful. It becomes undeniable proof of what people want.
				</p>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-5 py-[14vh]">
		<div data-reveal class="mb-16 max-w-3xl">
			<p class="mb-5 text-base font-bold uppercase tracking-[0.3em] text-accent">How your idea creates change</p>
			<h2 class="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
				It only takes one simple idea to start something big.
			</h2>
		</div>

		<div class="relative flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-3">
			{#each flow as step, i}
				<div data-reveal={i * 0.09} class="relative flex-1">
					<div class="flex h-full flex-col gap-3 rounded-[1.5rem] bg-surface p-6">
						<span class="font-display text-base font-extrabold text-accent">{step.n}</span>
						<h3 class="font-display text-2xl font-bold text-ink">{step.title}</h3>
						<p class="text-base leading-relaxed text-muted">{step.body}</p>
					</div>
					{#if i < flow.length - 1}
						<div class="hidden lg:block absolute right-[-10px] top-1/2 z-10 -translate-y-1/2 text-faint">
							<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>

	<section class="relative py-[12vh]">
		<div data-reveal class="mx-auto max-w-5xl px-5">
			<div class="overflow-hidden rounded-[2rem] bg-gradient-to-b from-accent/10 to-transparent p-8 sm:p-14">
				<p class="mb-4 text-base font-bold uppercase tracking-[0.3em] text-accent">You are not the only one</p>
				<h2 class="max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
					You are never alone in your struggles.
				</h2>

				<div class="mt-10">
					<svg viewBox="0 0 800 460" class="mx-auto w-full max-w-3xl" role="img" aria-label="Thousands of separate voices converging into one powerful shared voice">
						<defs>
							<radialGradient id="ivGlow" cx="50%" cy="50%" r="50%">
								<stop offset="0%" stop-color="var(--c-accent)" stop-opacity="0.5" />
								<stop offset="55%" stop-color="var(--c-accent)" stop-opacity="0.12" />
								<stop offset="100%" stop-color="var(--c-accent)" stop-opacity="0" />
							</radialGradient>
							<radialGradient id="ivOrb" cx="38%" cy="32%" r="72%">
								<stop offset="0%" stop-color="#d8d2ff" />
								<stop offset="45%" stop-color="var(--c-accent)" />
								<stop offset="100%" stop-color="#3a2ca8" />
							</radialGradient>
							<linearGradient id="ivRing" x1="0" y1="0" x2="1" y2="1">
								<stop offset="0%" stop-color="var(--c-accent)" />
								<stop offset="100%" stop-color="#12b76a" />
							</linearGradient>
							<filter id="ivSoft" x="-60%" y="-60%" width="220%" height="220%">
								<feGaussianBlur stdDeviation="7" />
							</filter>
							<filter id="ivBloom" x="-80%" y="-80%" width="260%" height="260%">
								<feGaussianBlur stdDeviation="3.5" result="b" />
								<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
							</filter>
						</defs>

						<ellipse cx="400" cy="230" rx="300" ry="200" fill="url(#ivGlow)" />

						<ellipse class="iv-orbit" cx="400" cy="230" rx="214" ry="136" fill="none" stroke="var(--c-accent)" stroke-width="1.25" stroke-dasharray="2 13" opacity="0.4" />
						<ellipse class="iv-orbit iv-orbit-rev" cx="400" cy="230" rx="150" ry="96" fill="none" stroke="#12b76a" stroke-width="1.25" stroke-dasharray="2 11" opacity="0.3" />

						<circle class="rip" cx="400" cy="230" r="52" fill="none" stroke="url(#ivRing)" stroke-width="2" opacity="0.5" />
						<circle class="rip rip2" cx="400" cy="230" r="52" fill="none" stroke="url(#ivRing)" stroke-width="2" opacity="0.5" />
						<circle class="rip rip3" cx="400" cy="230" r="52" fill="none" stroke="url(#ivRing)" stroke-width="2" opacity="0.5" />

						{#each Array(15) as _, i}
							{@const ang = i * 2.3999632}
							{@const t = i / 14}
							{@const R = 128 + t * 116}
							{@const px = 400 + Math.cos(ang) * R * 1.42}
							{@const py = 230 + Math.sin(ang) * R * 0.9}
							{@const teal = i % 3 === 0}
							{@const sz = 3.5 + (i % 4) * 1.4}
							<line class="iv-flow" x1={px} y1={py} x2="400" y2="230" stroke="var(--c-accent)" stroke-width="1.5" stroke-dasharray="3 11" opacity="0.3" style="animation-delay:{(i % 5) * 0.25}s" />
							<circle cx={px} cy={py} r={sz} fill={teal ? '#12b76a' : 'var(--c-accent)'} opacity={0.55 + (i % 3) * 0.15} filter="url(#ivBloom)" />
						{/each}

						<g class="iv-core">
							<circle cx="400" cy="230" r="62" fill="url(#ivOrb)" opacity="0.55" filter="url(#ivSoft)" />
							<circle cx="400" cy="230" r="46" fill="url(#ivOrb)" />
							<circle cx="400" cy="230" r="46" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="1.5" />
							<circle cx="386" cy="216" r="13" fill="#ffffff" opacity="0.92" filter="url(#ivBloom)" />
						</g>
					</svg>

					<div class="mt-5 flex justify-center">
						<span class="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink">
							<span class="h-2 w-2 rounded-full bg-accent"></span>
							one shared voice
						</span>
					</div>
				</div>

				<p class="mx-auto mt-8 max-w-3xl text-center text-xl leading-relaxed text-muted sm:text-2xl">
					From a slow ferry to a broken public service, many people across the country face the exact same problems.
					One small complaint is easy to ignore, but when we bring them all together, our united voice becomes powerful and impossible to ignore.
				</p>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-5 py-[14vh]">
		<div data-reveal class="mb-16 max-w-3xl">
			<p class="mb-5 text-base font-bold uppercase tracking-[0.3em] text-accent">Why you should use this platform</p>
			<h2 class="font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
				A small action that brings big results.
			</h2>
		</div>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each benefits as b, i}
				<div data-reveal={(i % 3) * 0.08} class="rounded-[1.5rem] bg-surface p-8">
					<h3 class="font-display text-2xl font-bold text-ink">{b.title}</h3>
					<p class="mt-3 text-lg leading-relaxed text-muted">{b.body}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-5 py-[16vh]">
		<ScrollText
			class="font-display text-5xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-7xl"
			text="One voice is easy to ignore. Ten thousand voices demand action."
		/>

		<div data-reveal class="mt-16 rounded-[2rem] bg-surface p-8 sm:p-12">
			<div class="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1.5">
				{#each Array(200) as _, i}
					<span
						class="aspect-square rounded-full"
						style="background-color: color-mix(in srgb, var(--c-accent) {i < 1 ? 100 : 78}%, transparent); opacity: {i < 1 ? 1 : 0.15 + (i / 200) * 0.85}"
					></span>
				{/each}
			</div>
			<div class="mt-6 flex flex-wrap items-baseline justify-between gap-2">
				<p class="text-lg text-muted"><span class="font-bold text-ink">It starts with you.</span> One glowing dot represents one brave person sharing their idea.</p>
				<p class="font-display text-sm font-bold text-accent">every other dot is someone who agrees with you</p>
			</div>
		</div>

		<p class="mt-14 text-xl leading-relaxed text-muted sm:text-2xl">
			Real change happens when everyday citizens make a problem <span class="font-semibold text-ink">impossible to ignore</span>.
			When leaders see that thousands of people care about an issue, they have to act. By listing our top priorities here,
			we give power back to the people.
		</p>
	</section>

	<section class="relative py-[18vh]">
		<div class="mx-auto max-w-5xl px-5 text-center">
			<ScrollText
				class="mx-auto font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-7xl lg:text-[104px]"
				text="You have the power to make things better."
			/>
			<p class="mx-auto mt-12 max-w-3xl text-xl leading-relaxed text-muted sm:text-2xl">
				You don't need to be an expert to know what is broken in your community. You just need to be brave enough
				to speak up. Thousands of others are waiting for someone like you to take the first step.
			</p>
		</div>
	</section>

	<section class="mx-auto max-w-3xl px-5 pb-[16vh]">
		<div data-reveal class="rounded-[2rem] bg-ink p-10 text-center sm:p-16">
			<h2 class="font-display text-5xl font-extrabold leading-tight text-bg sm:text-7xl">
				Take the first step.<br />Share your idea today.
			</h2>
			<p class="mx-auto mt-6 max-w-md text-lg text-bg/70 sm:text-xl">
				It takes just one minute and you don't even need an account. A better Maldives starts with your simple idea.
			</p>
			<a
				href="/"
				class="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg font-bold text-on-accent transition-transform hover:scale-105"
			>
				Post your wish
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
			</a>
			<p class="mt-6 text-sm text-bg/50">
				or <a href="/browse" class="font-semibold text-bg/80 underline-offset-4 hover:underline">read what others already wished for</a>
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

	.iv-flow {
		animation: iv-flowmove 1.6s linear infinite;
	}
	@keyframes iv-flowmove {
		to {
			stroke-dashoffset: -28;
		}
	}

	.iv-orbit {
		animation: iv-orbitdash 9s linear infinite;
	}
	.iv-orbit-rev {
		animation-direction: reverse;
		animation-duration: 13s;
	}
	@keyframes iv-orbitdash {
		to {
			stroke-dashoffset: -120;
		}
	}

	.iv-core {
		transform-box: fill-box;
		transform-origin: center;
		animation: iv-breathe 4.5s ease-in-out infinite;
	}
	@keyframes iv-breathe {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}
</style>
