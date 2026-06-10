import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseDatabase } from './types.ts';

function readEnv(
	key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_SUPABASE_PUBLISHABLE_KEY',
): string {
	const value = import.meta.env[key];
	return typeof value === 'string' ? value.trim() : '';
}

let cachedClient: SupabaseClient<SupabaseDatabase> | null = null;
let cachedUrl = '';
let cachedApiKey = '';

function loadCredentials(): { url: string; apiKey: string } {
	const url = readEnv('VITE_SUPABASE_URL');
	const apiKey = readEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || readEnv('VITE_SUPABASE_ANON_KEY');
	return { url, apiKey };
}

export function getSupabaseUrl(): string {
	const { url } = loadCredentials();
	return url;
}

export function getSupabaseClient(): SupabaseClient<SupabaseDatabase> {
	const { url, apiKey } = loadCredentials();

	if (!url || !apiKey) {
		throw new Error(
			'VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY (o VITE_SUPABASE_ANON_KEY) son obligatorios',
		);
	}

	if (cachedClient && cachedUrl === url && cachedApiKey === apiKey) {
		return cachedClient;
	}

	cachedClient = createClient<SupabaseDatabase>(url, apiKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false,
		},
	});
	cachedUrl = url;
	cachedApiKey = apiKey;
	return cachedClient;
}

/** Solo para tests o sustitución en runtime. */
export function resetSupabaseClient(): void {
	cachedClient = null;
	cachedUrl = '';
	cachedApiKey = '';
}
