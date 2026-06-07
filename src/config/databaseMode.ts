export type DatabaseApiMode = 'supabase' | 'remote';

export function resolveDatabaseApiMode(): DatabaseApiMode {
	const raw = import.meta.env.VITE_DATABASE_API ?? 'supabase';

	switch (raw) {
		case 'remote':
			return 'remote';
		case 'supabase':
		case 'database':
			return 'supabase';
		default:
			throw new Error(`VITE_DATABASE_API no soportado: ${raw}`);
	}
}
