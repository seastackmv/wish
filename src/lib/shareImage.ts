import type { Entry } from './types';
import { categoryMeta } from './types';
import { formatMonthYear } from './utils';

export type ShareFormat = 'story' | 'square';

/**
 * Renders an entry as a social-ready PNG entirely on the client — a dark,
 * brand-colored card tuned for Instagram Stories (1080×1920) or square
 * feed/status posts (1080×1080). No server round-trip, no extra deps.
 */

const DISPLAY = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const SANS = "'Inter', system-ui, sans-serif";

const C = {
	bg: '#0b0d12',
	card: '#161a21',
	ink: '#eef0f4',
	muted: '#9aa3b2',
	faint: '#68727f',
	vote: '#34d987',
	wish: '#8577ff',
	pain: '#ff8362'
};

function rgba(hex: string, alpha: number): string {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
	const out: string[] = [];
	for (const para of text.split('\n')) {
		const words = para.split(/\s+/).filter(Boolean);
		if (!words.length) continue;
		let line = '';
		for (const word of words) {
			const test = line ? `${line} ${word}` : word;
			if (!line || ctx.measureText(test).width <= maxWidth) line = test;
			else {
				out.push(line);
				line = word;
			}
		}
		out.push(line);
	}
	return out;
}

/** Steps the type size down until the whole entry fits; ellipsizes as a last resort. */
function fitText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxHeight: number,
	maxSize: number
): { size: number; lineHeight: number; lines: string[] } {
	const sizes = [92, 82, 72, 64, 56, 50, 44, 40, 36].filter((s) => s <= maxSize);
	for (const size of sizes) {
		ctx.font = `700 ${size}px ${DISPLAY}`;
		const lines = wrapLines(ctx, text, maxWidth);
		const lineHeight = Math.round(size * 1.24);
		if (lines.length * lineHeight <= maxHeight) return { size, lineHeight, lines };
	}
	const size = sizes[sizes.length - 1] ?? 36;
	ctx.font = `700 ${size}px ${DISPLAY}`;
	const lineHeight = Math.round(size * 1.24);
	let lines = wrapLines(ctx, text, maxWidth);
	const max = Math.max(1, Math.floor(maxHeight / lineHeight));
	if (lines.length > max) {
		lines = lines.slice(0, max);
		lines[max - 1] = lines[max - 1].replace(/\s*\S*$/, '') + '…';
	}
	return { size, lineHeight, lines };
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
	if (ctx.measureText(text).width <= maxWidth) return text;
	let t = text;
	while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
	return t + '…';
}

function formatVotes(n: number): string {
	return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

function loadEntryImage(key: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = `/api/image/${key}`;
	});
}

async function ensureFonts(): Promise<void> {
	try {
		await Promise.all([
			document.fonts.load(`700 80px ${DISPLAY}`),
			document.fonts.load(`800 56px ${DISPLAY}`),
			document.fonts.load(`500 28px ${SANS}`),
			document.fonts.load(`600 30px ${SANS}`),
			document.fonts.load(`700 34px ${SANS}`)
		]);
	} catch {
		// draw with fallback fonts rather than failing the share
	}
}

export async function renderShareImage(entry: Entry, format: ShareFormat): Promise<Blob> {
	await ensureFonts();

	const W = 1080;
	const H = format === 'story' ? 1920 : 1080;
	const isWish = entry.type === 'wish';
	const accent = isWish ? C.wish : C.pain;
	const cat = categoryMeta(entry.category);

	const canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas unavailable');
	if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';

	// ---- background: deep ink with type-colored glows -------------------
	ctx.fillStyle = C.bg;
	ctx.fillRect(0, 0, W, H);

	const glow = (x: number, y: number, r: number, color: string, a: number) => {
		const g = ctx.createRadialGradient(x, y, 0, x, y, r);
		g.addColorStop(0, rgba(color, a));
		g.addColorStop(1, rgba(color, 0));
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
	};
	glow(W * 0.12, H * 0.08, H * 0.62, accent, 0.34);
	glow(W * 0.95, H * 0.96, H * 0.5, accent, 0.16);

	// faint decorative rings
	ctx.strokeStyle = 'rgba(255,255,255,0.045)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(W * 0.94, H * 0.1, 220, 0, Math.PI * 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(W * 0.04, H * 0.92, 300, 0, Math.PI * 2);
	ctx.stroke();

	// ---- geometry --------------------------------------------------------
	const story = format === 'story';
	const marginX = story ? 84 : 64;
	const cardW = W - marginX * 2;
	const pad = story ? 72 : 60;
	const innerW = cardW - pad * 2;

	const regionTop = story ? 220 : 88;
	const regionBottom = story ? H - 320 : H - 168;

	const img = entry.image_key ? await loadEntryImage(entry.image_key) : null;
	const imgH = img ? (story ? 400 : 280) : 0;

	// fixed block heights inside the card
	const badgeH = 58;
	const gapAfterBadge = story ? 48 : 40;
	const gapAfterImage = img ? (story ? 48 : 40) : 0;
	const gapBeforeDivider = story ? 52 : 42;
	const dividerGap = story ? 44 : 36;
	const votesH = 64;
	const tags = (entry.tags ?? []).slice(0, 3);
	const tagsH = tags.length ? (story ? 66 : 58) : 0;

	const fixedH =
		pad + badgeH + gapAfterBadge + imgH + gapAfterImage + gapBeforeDivider + 2 + dividerGap + votesH + tagsH + pad;

	const text = entry.text.trim().replace(/\n{3,}/g, '\n\n');
	const maxTextH = regionBottom - regionTop - fixedH;
	const fitted = fitText(ctx, text, innerW, Math.max(160, maxTextH), story ? 92 : 64);
	const textH = fitted.lines.length * fitted.lineHeight;

	const cardH = fixedH + textH;
	const cardX = marginX;
	const cardY = regionTop + Math.max(0, (regionBottom - regionTop - cardH) / 2);
	const radius = 56;

	// ---- card ------------------------------------------------------------
	ctx.save();
	ctx.shadowColor = 'rgba(0,0,0,0.55)';
	ctx.shadowBlur = 90;
	ctx.shadowOffsetY = 34;
	ctx.fillStyle = C.card;
	ctx.beginPath();
	ctx.roundRect(cardX, cardY, cardW, cardH, radius);
	ctx.fill();
	ctx.restore();

	ctx.strokeStyle = 'rgba(255,255,255,0.08)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.roundRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2, radius - 1);
	ctx.stroke();

	// accent rail across the card top (matches the swipe deck)
	ctx.save();
	ctx.beginPath();
	ctx.roundRect(cardX, cardY, cardW, cardH, radius);
	ctx.clip();
	const rail = ctx.createLinearGradient(cardX, 0, cardX + cardW, 0);
	rail.addColorStop(0, accent);
	rail.addColorStop(1, rgba(accent, 0.35));
	ctx.fillStyle = rail;
	ctx.fillRect(cardX, cardY, cardW, 12);
	ctx.restore();

	// ---- card content ----------------------------------------------------
	let y = cardY + pad;
	ctx.textBaseline = 'middle';

	// type badge + category on one row
	const badgeLabel = isWish ? '✦ WISH' : '△ PROBLEM';
	ctx.font = `700 28px ${SANS}`;
	const badgeTextW = ctx.measureText(badgeLabel).width;
	const badgeW = badgeTextW + 56;
	ctx.fillStyle = rgba(accent, 0.17);
	ctx.beginPath();
	ctx.roundRect(cardX + pad, y, badgeW, badgeH, badgeH / 2);
	ctx.fill();
	ctx.fillStyle = accent;
	ctx.fillText(badgeLabel, cardX + pad + 28, y + badgeH / 2 + 2);

	ctx.font = `600 27px ${SANS}`;
	const catW = ctx.measureText(cat.short).width;
	const catRight = cardX + cardW - pad;
	ctx.fillStyle = cat.color;
	ctx.beginPath();
	ctx.arc(catRight - catW - 26, y + badgeH / 2, 8, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = C.muted;
	ctx.fillText(cat.short, catRight - catW, y + badgeH / 2 + 2);
	y += badgeH + gapAfterBadge;

	// attached photo, cover-cropped into a rounded frame
	if (img) {
		ctx.save();
		ctx.beginPath();
		ctx.roundRect(cardX + pad, y, innerW, imgH, 28);
		ctx.clip();
		const scale = Math.max(innerW / img.width, imgH / img.height);
		const dw = img.width * scale;
		const dh = img.height * scale;
		ctx.drawImage(img, cardX + pad + (innerW - dw) / 2, y + (imgH - dh) / 2, dw, dh);
		ctx.restore();
		y += imgH + gapAfterImage;
	}

	// the wish / problem itself
	ctx.font = `700 ${fitted.size}px ${DISPLAY}`;
	if ('letterSpacing' in ctx)
		(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-1px';
	ctx.fillStyle = C.ink;
	ctx.textBaseline = 'alphabetic';
	let ty = y + fitted.size;
	for (const line of fitted.lines) {
		ctx.fillText(line, cardX + pad, ty);
		ty += fitted.lineHeight;
	}
	if ('letterSpacing' in ctx)
		(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
	y += textH + gapBeforeDivider;
	ctx.textBaseline = 'middle';

	// divider
	ctx.fillStyle = 'rgba(255,255,255,0.07)';
	ctx.fillRect(cardX + pad, y, innerW, 2);
	y += 2 + dividerGap;

	// votes pill + supporting copy + author
	const voteCount = formatVotes(entry.votes);
	ctx.font = `700 34px ${SANS}`;
	const countW = ctx.measureText(voteCount).width;
	const pillW = 34 + 30 + 12 + countW + 30;
	ctx.fillStyle = 'rgba(255,255,255,0.07)';
	ctx.beginPath();
	ctx.roundRect(cardX + pad, y, pillW, votesH, votesH / 2);
	ctx.fill();

	// up arrow
	ctx.strokeStyle = C.vote;
	ctx.lineWidth = 5;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	const ax = cardX + pad + 30 + 15;
	const ay = y + votesH / 2;
	ctx.beginPath();
	ctx.moveTo(ax, ay + 13);
	ctx.lineTo(ax, ay - 13);
	ctx.moveTo(ax - 12, ay - 2);
	ctx.lineTo(ax, ay - 14);
	ctx.lineTo(ax + 12, ay - 2);
	ctx.stroke();

	ctx.fillStyle = C.ink;
	ctx.font = `700 34px ${SANS}`;
	ctx.fillText(voteCount, ax + 27, ay + 2);

	ctx.font = `500 29px ${SANS}`;
	ctx.fillStyle = C.muted;
	const supportCopy =
		entry.votes === 1 ? 'person supports this' : entry.votes === 0 ? 'add your support' : 'people support this';
	ctx.fillText(supportCopy, cardX + pad + pillW + 24, ay + 2);

	const author = `— ${entry.author_name ?? 'Anonymous'}`;
	ctx.font = `500 27px ${SANS}`;
	const authorMax = innerW - pillW - 24 - ctx.measureText(supportCopy).width - 40;
	if (authorMax > 120) {
		const a = ellipsize(ctx, author, authorMax);
		ctx.fillStyle = C.faint;
		ctx.fillText(a, catRight - ctx.measureText(a).width, ay + 2);
	}
	y += votesH;

	// hashtags
	if (tags.length) {
		y += tagsH - 30;
		ctx.font = `600 28px ${SANS}`;
		ctx.fillStyle = rgba(accent, 0.85);
		const line = tags.map((t) => '#' + t.label.replace(/\s+/g, '').toLowerCase()).join('  ');
		ctx.fillText(ellipsize(ctx, line, innerW), cardX + pad, y);
	}

	// ---- chrome outside the card ----------------------------------------
	ctx.textBaseline = 'alphabetic';
	if (story) {
		// wordmark top-left, month top-right
		ctx.font = `800 52px ${DISPLAY}`;
		ctx.fillStyle = C.ink;
		ctx.fillText('Wish', marginX, 150);
		ctx.fillStyle = accent;
		ctx.fillText('.', marginX + ctx.measureText('Wish').width, 150);

		ctx.font = `500 28px ${SANS}`;
		ctx.fillStyle = C.faint;
		const month = formatMonthYear(entry.month_year);
		ctx.fillText(month, W - marginX - ctx.measureText(month).width, 142);
	}

	// bottom brand line: url in white, tagline in muted
	const urlText = 'wish.seastack.mv';
	const tagline = story ? 'Add your voice · Vote anonymously' : '· Add your voice';
	if (story) {
		ctx.font = `700 40px ${SANS}`;
		ctx.fillStyle = C.ink;
		ctx.fillText(urlText, (W - ctx.measureText(urlText).width) / 2, H - 176);
		ctx.font = `500 29px ${SANS}`;
		ctx.fillStyle = C.muted;
		ctx.fillText(tagline, (W - ctx.measureText(tagline).width) / 2, H - 118);
	} else {
		ctx.font = `700 34px ${SANS}`;
		const urlW = ctx.measureText(urlText).width;
		ctx.font = `500 30px ${SANS}`;
		const tagW = ctx.measureText(' ' + tagline).width;
		let bx = (W - urlW - tagW) / 2;
		ctx.font = `700 34px ${SANS}`;
		ctx.fillStyle = C.ink;
		ctx.fillText(urlText, bx, H - 62);
		bx += urlW;
		ctx.font = `500 30px ${SANS}`;
		ctx.fillStyle = C.muted;
		ctx.fillText(' ' + tagline, bx, H - 62);
	}

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not render image'))), 'image/png');
	});
}
