/**
 * Punto de ensamblado: según VITE_DATABASE_API registra un conector
 * u omite el registro (remote = HTTP).
 */
import { registerDatabaseConnector } from '../database/registry.ts';
import { createSupabaseConnection } from '../database/supabase/createSupabaseConnection.ts';
import { createSupabaseEngine } from '../database/supabase/createSupabaseEngine.ts';
import { resolveDatabaseApiMode } from './databaseMode.ts';

switch (resolveDatabaseApiMode()) {
	case 'supabase':
		registerDatabaseConnector(() =>
			createSupabaseConnection(createSupabaseEngine()),
		);
		break;
	case 'remote':
		break;
}
