import { resolveDatabaseApiMode, type DatabaseApiMode } from '../config/databaseMode.ts';
import { connectDatabaseSync } from './connectDatabase.ts';
import type { DatabaseConnection } from './DatabaseConnection.ts';
import type { KeyValueRepository } from './KeyValueRepository.ts';

let connection: DatabaseConnection | null = null;

export function getDatabaseApiMode(): DatabaseApiMode {
	return resolveDatabaseApiMode();
}

export function getDatabaseConnection(): DatabaseConnection {
	if (!connection) {
		connection = connectDatabaseSync();
	}
	return connection;
}

export function getKeyValueRepository(): KeyValueRepository {
	return getDatabaseConnection().getKeyValueRepository();
}

/** Solo para tests o sustitución en runtime. */
export function setDatabaseConnection(next: DatabaseConnection | null): void {
	connection = next;
}
