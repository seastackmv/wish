import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { sha256 } from '$lib/utils';

export function getPepper(platform: App.Platform | undefined): string {
	const pepper = platform?.env?.PEPPER ?? (dev ? 'dev-pepper' : undefined);
	if (!pepper) throw error(503, 'Server is not configured.');
	return pepper;
}

export async function voterHashFromCookie(
	platform: App.Platform | undefined,
	cookieId: string
): Promise<string> {
	return sha256(`${cookieId}|${cookieId}|${getPepper(platform)}`);
}

export function assertSameOrigin(request: Request, url: URL): void {
	const origin = request.headers.get('origin');
	if (origin !== null) {
		if (origin !== url.origin) throw error(403, 'Cross-origin request rejected.');
		return;
	}
	const site = request.headers.get('sec-fetch-site');
	if (site) {
		if (site !== 'same-origin' && site !== 'none') {
			throw error(403, 'Cross-origin request rejected.');
		}
		return;
	}
	throw error(403, 'Cross-origin request rejected.');
}
