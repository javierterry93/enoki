export type SnapshotDataRow = {
	business_id: string;
	product_id: string;
	product_name: string;
	product_order: number;
	price: number;
	short_description: string;
	image_id: string | null;
	category_id: string;
	category_name: string;
	category_order: number;
};

export const SNAPSHOT_VIEW = 'snapshot_data' as const;

export type SupabaseDatabase = {
	public: {
		Views: {
			snapshot_data: {
				Row: SnapshotDataRow;
				Relationships: [];
			};
		};
	};
};
