import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import type { SessionUser } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user: SessionUser | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
				BUCKET?: R2Bucket;
				PEPPER: string;
				TURNSTILE_SECRET?: string;
				TURNSTILE_SITE_KEY?: string;
				IP_VOTE_CAP?: string;
				GOOGLE_CLIENT_ID: string;
				GOOGLE_CLIENT_SECRET: string;
				ADMIN_EMAILS?: string;
			};
			cf?: {
				asn?: number;
				country?: string;
			};
		}
	}
}

export {};
