import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const IMAGE_KEY_RE = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i;

export const GET: RequestHandler = async ({ params, platform }) => {
	const bucket = platform?.env?.BUCKET;
	if (!bucket) throw error(404, 'Not found');
	if (!IMAGE_KEY_RE.test(params.key)) throw error(404, 'Not found');

	const object = await bucket.get(params.key);
	if (!object) throw error(404, 'Not found');

	const headers = new Headers();
	const contentType = object.httpMetadata?.contentType;
	if (contentType) headers.set('content-type', contentType);
	headers.set('etag', object.httpEtag);

	headers.set('cache-control', 'public, max-age=31536000, immutable');
	headers.set('x-content-type-options', 'nosniff');

	return new Response(object.body as unknown as BodyInit, { headers });
};
