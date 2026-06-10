import {
	createSupabaseClient,
	resolveSupabaseClientConfigFromEnv,
	type SupabaseClientConfig,
} from './supabaseConfig.ts';

function readViteEnv(
	key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_SUPABASE_PUBLISHABLE_KEY',
): string {
	const value = import.meta.env[key];
	return typeof value === 'string' ? value.trim() : '';
}

export function resolveSupabaseClientConfig(): SupabaseClientConfig {
	return resolveSupabaseClientConfigFromEnv({
		VITE_SUPABASE_URL: readViteEnv('VITE_SUPABASE_URL'),
		VITE_SUPABASE_ANON_KEY: readViteEnv('VITE_SUPABASE_ANON_KEY'),
		VITE_SUPABASE_PUBLISHABLE_KEY: readViteEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
	});
}

export {
	createSupabaseClient,
	resetSupabaseClient,
	type SupabaseClientConfig,
} from './supabaseConfig.ts';

export function getSupabaseClient() {
	return createSupabaseClient(resolveSupabaseClientConfig());
}
