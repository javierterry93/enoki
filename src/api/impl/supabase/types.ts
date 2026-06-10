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

export type BusinessRow = {
	id: string;
	name: string;
	logo_image_id: string | null;
	phone: string;
	address: string;
	hours: string;
	social_instagram: string;
	social_facebook: string;
	social_twitter: string;
	last_modified: string;
};

export type ImageRow = {
	id: string;
	name: string;
	url: string | null;
	thumbnail_url: string | null;
	created_at: string;
};

export const SUPABASE_TABLES = {
	businesses: 'businesses',
	images: 'images',
} as const;

export type SupabaseDatabase = {
	public: {
		Tables: {
			businesses: {
				Row: BusinessRow;
				Insert: never;
				Update: never;
				Relationships: [];
			};
			images: {
				Row: ImageRow;
				Insert: never;
				Update: never;
				Relationships: [];
			};
		};
		Views: {
			snapshot_data: {
				Row: SnapshotDataRow;
				Relationships: [];
			};
		};
	};
};
