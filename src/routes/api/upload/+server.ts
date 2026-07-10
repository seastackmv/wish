import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assertSameOrigin, getPepper } from '$lib/server/security';
import { verifyTurnstile } from '$lib/server/turnstile';
import { checkRateLimit } from '$lib/server/ratelimit';
import { sha256 } from '$lib/utils';

const MAX_BYTES = 5 * 1024 * 1024;
const EXT_CONTENT_TYPE: Record<string, string> = {
	jpg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	gif: 'image/gif'
};

function sniffImageExt(b: Uint8Array): string | null {
	if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
	if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
	if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif';
	if (
		b.length >= 12 &&
		b[0] === 0x52 &&
		b[1] === 0x49 &&
		b[2] === 0x46 &&
		b[3] === 0x46 &&
		b[8] === 0x57 &&
		b[9] === 0x45 &&
		b[10] === 0x42 &&
		b[11] === 0x50
	)
		return 'webp';
	return null;
}

export const POST: RequestHandler = async ({ request, url, platform }) => {
	assertSameOrigin(request, url);

	const bucket = platform?.env?.BUCKET;
	if (!bucket) throw error(503, 'Image uploads are not configured.');

	const form = await request.formData().catch(() => null);
	const file = form?.get('file');
	if (!(file instanceof File)) throw error(400, 'No file provided.');
	if (file.size === 0) throw error(400, 'The file is empty.');
	if (file.size > MAX_BYTES) throw error(413, 'Image must be 5 MB or smaller.');

	const ip = request.headers.get('cf-connecting-ip') ?? '';
	const db = platform?.env?.DB;
	if (db && ip) {
		const ipHash = await sha256(`${ip}|${getPepper(platform)}`);
		if (!(await checkRateLimit(db, 'upload', ipHash, 12, 60))) {
			throw error(429, 'Too many uploads. Please wait a minute and try again.');
		}
	}

	if (!(await verifyTurnstile(platform, String(form?.get('turnstile_token') ?? ''), ip || undefined, url.hostname))) {
		throw error(403, 'Please complete the verification challenge and try again.');
	}

	const buffer = await file.arrayBuffer();
	const ext = sniffImageExt(new Uint8Array(buffer.slice(0, 12)));
	if (!ext) throw error(415, 'Only JPEG, PNG, WebP or GIF images are allowed.');

	const key = `${crypto.randomUUID()}.${ext}`;
	await bucket.put(key, buffer, { httpMetadata: { contentType: EXT_CONTENT_TYPE[ext] } });

	return json({ key }, { status: 201 });
};
