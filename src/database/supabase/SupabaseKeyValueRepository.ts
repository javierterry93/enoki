import type { SupabaseClient } from '@supabase/supabase-js';
import type { KeyValueRepository } from '../KeyValueRepository.ts';
import { wrapDatabaseError } from '../DatabaseError.ts';
import type { SupabaseDatabase } from './types.ts';
import { SUPABASE_TABLES } from './types.ts';

export class SupabaseKeyValueRepository implements KeyValueRepository {
	private readonly client: SupabaseClient<SupabaseDatabase>;

	constructor(client: SupabaseClient<SupabaseDatabase>) {
		this.client = client;
	}

	getClient(): SupabaseClient<SupabaseDatabase> {
		return this.client;
	}

	async ping(): Promise<boolean> {
		const { error } = await this.client
			.from(SUPABASE_TABLES.kvStore)
			.select('key')
			.limit(1)
			.maybeSingle();

		if (error) {
			throw wrapDatabaseError('No se pudo verificar la conexión', error);
		}

		return true;
	}

	async get(key: string): Promise<string | null> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.kvStore)
			.select('value')
			.eq('key', key)
			.maybeSingle();

		if (error) {
			throw wrapDatabaseError(`No se pudo leer la clave "${key}"`, error);
		}

		return data?.value ?? null;
	}

	async set(key: string, value: string): Promise<void> {
		const { error } = await this.client.from(SUPABASE_TABLES.kvStore).upsert({
			key,
			value,
		});

		if (error) {
			throw wrapDatabaseError(`No se pudo guardar la clave "${key}"`, error);
		}
	}

	async remove(key: string): Promise<void> {
		const { error } = await this.client
			.from(SUPABASE_TABLES.kvStore)
			.delete()
			.eq('key', key);

		if (error) {
			throw wrapDatabaseError(`No se pudo eliminar la clave "${key}"`, error);
		}
	}

	async listKeys(): Promise<string[]> {
		const { data, error } = await this.client
			.from(SUPABASE_TABLES.kvStore)
			.select('key');

		if (error) {
			throw wrapDatabaseError('No se pudo listar las claves', error);
		}

		return (data ?? []).map((row) => row.key);
	}
}
