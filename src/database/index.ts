export type { DatabaseConnection } from './DatabaseConnection.ts';
export type { KeyValueRepository } from './KeyValueRepository.ts';
export type { DatabaseConnectorFactory } from './types.ts';

export { DatabaseError, wrapDatabaseError } from './DatabaseError.ts';
export {
	connectDatabase,
	connectDatabaseSync,
	createDatabaseConnection,
} from './connectDatabase.ts';
export {
	getDatabaseApiMode,
	getDatabaseConnection,
	getKeyValueRepository,
	setDatabaseConnection,
} from './getDatabaseConnection.ts';
export {
	hasDatabaseConnector,
	registerDatabaseConnector,
	resetDatabaseConnector,
} from './registry.ts';
export { withKeyValueRepository } from './withRepository.ts';
