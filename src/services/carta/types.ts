export type CartaTag = {
	id: string;
	name: string;
	slug: string;
};

export type CartaProduct = {
	id: string;
	name: string;
	description: string | null;
	price: number;
	imageUrl: string | null;
	featured: boolean;
	tags: CartaTag[];
};

export type CartaCategory = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	products: CartaProduct[];
};

export type BusinessSettings = {
	name: string;
	phone: string;
	address: string;
	hours: string;
};

export type CartaData = {
	categories: CartaCategory[];
	settings?: BusinessSettings;
};
