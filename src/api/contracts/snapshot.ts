export type SnapshotProduct = {
	id: string;
	name: string;
	categoryId: string;
	order: number;
	price: number;
	shortDescription: string;
	visible: boolean;
	imageId: string | null;
	createdAt?: string;
	updatedAt?: string;
};

export type SnapshotCategory = {
	id: string;
	name: string;
	order: number;
	visible: boolean;
};

export type SnapshotImage = {
	id: string;
	name: string;
	createdAt: string;
	url?: string;
	thumbnailUrl?: string;
};

export type SnapshotSettings = {
	name: string;
	logoImageId: string | null;
	phone: string;
	address: string;
	hours: string;
	socialInstagram: string;
	socialFacebook: string;
	socialTwitter: string;
};

export type Snapshot = {
	products: SnapshotProduct[];
	categories: SnapshotCategory[];
	images: SnapshotImage[];
	settings: SnapshotSettings;
	lastModified: string;
};
