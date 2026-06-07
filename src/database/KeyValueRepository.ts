export interface KeyValueRepository {
	ping(): Promise<boolean>;
	get(key: string): Promise<string | null>;
	set(key: string, value: string): Promise<void>;
	remove(key: string): Promise<void>;
	listKeys(): Promise<string[]>;
}
