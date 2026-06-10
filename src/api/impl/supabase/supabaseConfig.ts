import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseDatabase } from './types.ts';

export type SupabaseClientConfig = {
	url: string;
	apiKey: string;
};

/** Cliente de solo lectura: sin sesión ni refresh en localStorage. */
const READ_ONLY_CLIENT_OPTIONS = {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false,
	},
} as const;

function readEnvRecord(env: Record<string, string>, key: string): string {
	return env[key]?.trim() ?? '';
}

export function isLocalSupabaseUrl(url: string): boolean {
	try {
		const { hostname } = new URL(url);
		return hostname === 'localhost' || hostname === '127.0.0.1';
	} catch {
		return false;
	}
}

function resolveApiKey(url: string, anonKey: string, publishableKey: string): string {
	if (isLocalSupabaseUrl(url)) {
		return anonKey || publishableKey;
	}

	return publishableKey || anonKey;
}

export function resolveSupabaseClientConfigFromEnv(
	env: Record<string, string>,
): SupabaseClientConfig {
	const url = readEnvRecord(env, 'VITE_SUPABASE_URL');
	const anonKey = readEnvRecord(env, 'VITE_SUPABASE_ANON_KEY');
	const publishableKey = readEnvRecord(env, 'VITE_SUPABASE_PUBLISHABLE_KEY');

	return {
		url,
		apiKey: resolveApiKey(url, anonKey, publishableKey),
	};
}

let cachedClient: SupabaseClient<SupabaseDatabase> | null = null;
let cachedConfigKey: string | null = null;

function configCacheKey(config: SupabaseClientConfig): string {
	return `${config.url}::${config.apiKey}`;
}

export function createSupabaseClient(
	config: SupabaseClientConfig,
): SupabaseClient<SupabaseDatabase> {
	if (!config.url || !config.apiKey) {
		const local = isLocalSupabaseUrl(config.url);
		throw new Error(
			local
				? 'VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (o VITE_SUPABASE_PUBLISHABLE_KEY) son obligatorios (Supabase local)'
				: 'VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY (o VITE_SUPABASE_ANON_KEY) son obligatorios',
		);
	}

	const configKey = configCacheKey(config);
	if (cachedClient && cachedConfigKey === configKey) {
		return cachedClient;
	}

	cachedClient = createClient<SupabaseDatabase>(
		config.url,
		config.apiKey,
		READ_ONLY_CLIENT_OPTIONS,
	);
	cachedConfigKey = configKey;
	return cachedClient;
}

/** Solo para tests o sustitución en runtime. */
export function resetSupabaseClient(): void {
	cachedClient = null;
	cachedConfigKey = null;
}
