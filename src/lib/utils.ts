export async function sha256(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const buf = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export function monthYear(date = new Date()): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthYear(my: string): string {
	const [y, m] = my.split('-');
	return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Length-aware type scale so an entry reads comfortably whether it's a
 * six-word wish or a dense paragraph. Short text gets big and punchy; long
 * text steps down in size and opens up its leading so it stays readable.
 *
 * `variant: 'deck'` is tuned for the full-bleed swipe card (larger ceiling);
 * `variant: 'card'` is tuned for the compact grid card.
 */
export function fitTextClass(text: string, variant: 'deck' | 'card' = 'card'): string {
	const len = (text ?? '').trim().length;

	if (variant === 'deck') {
		if (len <= 55) return 'text-[1.85rem] leading-[1.22] sm:text-[2.6rem]';
		if (len <= 110) return 'text-[1.6rem] leading-[1.25] sm:text-4xl';
		if (len <= 200) return 'text-2xl leading-snug sm:text-[1.9rem]';
		if (len <= 340) return 'text-xl leading-snug sm:text-2xl';
		if (len <= 560) return 'text-lg leading-relaxed sm:text-xl';
		return 'text-[15px] leading-relaxed sm:text-lg';
	}

	// compact card
	if (len <= 70) return 'text-xl leading-snug sm:text-2xl';
	if (len <= 160) return 'text-lg leading-normal sm:text-xl';
	if (len <= 280) return 'text-[17px] leading-normal sm:text-lg';
	return 'text-[15px] leading-relaxed sm:text-base';
}

export function timeAgo(ts: number): string {
	const diff = Date.now() - ts;
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return 'just now';
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	const days = Math.floor(hrs / 24);
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	return `${months}mo ago`;
}
