import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseConnection } from '../DatabaseConnection.ts';
import { wrapDatabaseError } from '../DatabaseError.ts';
import type { KeyValueRepository } from '../KeyValueRepository.ts';
import { SupabaseKeyValueRepository } from './SupabaseKeyValueRepository.ts';
import type { SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';

export function createSupabaseConnection(
	client: SupabaseClient<SupabaseDatabase>,
): DatabaseConnection {
	return new SupabaseConnection(client);
}

class SupabaseConnection implements DatabaseConnection {
	private connected = false;
	private readonly repository: SupabaseKeyValueRepository;

	constructor(client: SupabaseClient<SupabaseDatabase>) {
		this.repository = new SupabaseKeyValueRepository(client);
	}

	async connect(): Promise<void> {
		if (this.connected) return;

		const { error } = await this.repository
			.getClient()
			.from(SUPABASE_TABLES.kvStore)
			.select('key')
			.limit(1)
			.maybeSingle();

		if (error) {
			throw wrapDatabaseError('No se pudo conectar con la base de datos', error);
		}

		this.connected = true;
	}

	disconnect(): Promise<void> {
		this.connected = false;
		return Promise.resolve();
	}

	isConnected(): boolean {
		return this.connected;
	}

	getKeyValueRepository(): KeyValueRepository {
		return this.repository;
	}
}
