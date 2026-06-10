export type Tag = {
	id: string;
	name: string;
	slug: string;
};

export type Product = {
	id: string;
	name: string;
	description: string | null;
	price: number;
	imageUrl: string | null;
	imageFullUrl: string | null;
	featured: boolean;
	tags: Tag[];
};

export type Category = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	products: Product[];
};

export type Settings = {
	name: string;
	phone: string;
	address: string;
	hours: string;
};

export type Data = {
	categories: Category[];
	settings?: Settings;
};
