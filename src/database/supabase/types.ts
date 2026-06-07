export const SUPABASE_TABLES = {
	kvStore: 'kv_store',
} as const;

export type KvStoreRow = {
	key: string;
	value: string;
};

export type SupabaseDatabase = {
	public: {
		Tables: {
			kv_store: {
				Row: KvStoreRow;
				Insert: KvStoreRow;
				Update: Partial<KvStoreRow>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
