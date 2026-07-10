const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
	platform: App.Platform | undefined,
	token: string | undefined,
	remoteIp?: string,
	expectedHostname?: string
): Promise<boolean> {
	const secret = platform?.env?.TURNSTILE_SECRET;
	if (!secret) return true;
	if (!token) return false;

	const form = new URLSearchParams();
	form.set('secret', secret);
	form.set('response', token);
	if (remoteIp) form.set('remoteip', remoteIp);

	try {
		const res = await fetch(VERIFY_URL, { method: 'POST', body: form });
		if (!res.ok) return false;
		const data = (await res.json()) as { success?: boolean; hostname?: string };
		if (data.success !== true) return false;
		if (expectedHostname && data.hostname && data.hostname !== expectedHostname) return false;
		return true;
	} catch {
		return false;
	}
}
