import type { KeyValueRepository } from './KeyValueRepository.ts';

export interface DatabaseConnection {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
	getKeyValueRepository(): KeyValueRepository;
}
