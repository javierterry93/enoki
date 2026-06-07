import type { DatabaseConnection } from './DatabaseConnection.ts';
import type { KeyValueRepository } from './KeyValueRepository.ts';

export async function withKeyValueRepository<T>(
	connection: DatabaseConnection,
	fn: (repository: KeyValueRepository) => Promise<T>,
): Promise<T> {
	if (!connection.isConnected()) {
		await connection.connect();
	}
	return fn(connection.getKeyValueRepository());
}
