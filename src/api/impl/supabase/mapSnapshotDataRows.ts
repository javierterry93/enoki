import type {
	Snapshot,
	SnapshotCategory,
	SnapshotImage,
	SnapshotProduct,
	SnapshotSettings,
} from '../../contracts/snapshot.ts';
import type { BusinessRow, SnapshotDataRow } from './types.ts';

const DEFAULT_SETTINGS: SnapshotSettings = {
	name: 'Mi Restaurante',
	logoImageId: null,
	phone: '',
	address: '',
	hours: 'Lun–Dom: 12:00–23:00',
	socialInstagram: '',
	socialFacebook: '',
	socialTwitter: '',
};

function mapBusinessSettings(business: BusinessRow): SnapshotSettings {
	return {
		name: business.name,
		logoImageId: business.logo_image_id,
		phone: business.phone,
		address: business.address,
		hours: business.hours,
		socialInstagram: business.social_instagram,
		socialFacebook: business.social_facebook,
		socialTwitter: business.social_twitter,
	};
}

export function mapSnapshotDataRows(
	rows: SnapshotDataRow[],
	business: BusinessRow | null,
	images: SnapshotImage[],
): Snapshot {
	if (rows.length === 0) {
		return {
			products: [],
			categories: [],
			images,
			settings: business ? mapBusinessSettings(business) : DEFAULT_SETTINGS,
			lastModified: business?.last_modified ?? new Date().toISOString(),
		};
	}

	const categoryMap = new Map<string, SnapshotCategory>();
	const products: SnapshotProduct[] = [];

	for (const row of rows) {
		if (!categoryMap.has(row.category_id)) {
			categoryMap.set(row.category_id, {
				id: row.category_id,
				name: row.category_name,
				order: row.category_order,
				visible: true,
			});
		}

		products.push({
			id: row.product_id,
			name: row.product_name,
			categoryId: row.category_id,
			order: row.product_order,
			price: Number(row.price),
			shortDescription: row.short_description,
			visible: true,
			imageId: row.image_id,
		});
	}

	const categories = [...categoryMap.values()].sort((a, b) => a.order - b.order);
	products.sort((a, b) => a.order - b.order);

	return {
		categories,
		products,
		images,
		settings: business ? mapBusinessSettings(business) : DEFAULT_SETTINGS,
		lastModified: business?.last_modified ?? new Date().toISOString(),
	};
}
