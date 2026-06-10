import {
	createSupabaseClient,
	resolveSupabaseClientConfigFromEnv,
	resetSupabaseClient as resetSupabaseClientCache,
	type SupabaseClientConfig,
} from './supabaseConfig.ts';

function readViteEnv(
	key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_SUPABASE_PUBLISHABLE_KEY',
): string {
	const value = import.meta.env[key];
	return typeof value === 'string' ? value.trim() : '';
}

let cachedConfig: SupabaseClientConfig | null = null;

export function resolveSupabaseClientConfig(): SupabaseClientConfig {
	if (!cachedConfig) {
		cachedConfig = resolveSupabaseClientConfigFromEnv({
			VITE_SUPABASE_URL: readViteEnv('VITE_SUPABASE_URL'),
			VITE_SUPABASE_ANON_KEY: readViteEnv('VITE_SUPABASE_ANON_KEY'),
			VITE_SUPABASE_PUBLISHABLE_KEY: readViteEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
		});
	}

	return cachedConfig;
}

export function getSupabaseUrl(): string {
	return resolveSupabaseClientConfig().url;
}

export {
	createSupabaseClient,
	type SupabaseClientConfig,
} from './supabaseConfig.ts';

export function getSupabaseClient() {
	return createSupabaseClient(resolveSupabaseClientConfig());
}

/** Solo para tests o sustitución en runtime. */
export function resetSupabaseClient(): void {
	cachedConfig = null;
	resetSupabaseClientCache();
}
