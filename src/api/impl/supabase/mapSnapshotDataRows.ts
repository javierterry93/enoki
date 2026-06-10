import type {
	Snapshot,
	SnapshotCategory,
	SnapshotImage,
	SnapshotProduct,
	SnapshotSettings,
} from '../../contracts/snapshot.ts';
import type { SnapshotDataRow } from './types.ts';

const DEFAULT_SETTINGS: SnapshotSettings = {
	name: 'Carta',
	logoImageId: null,
	phone: '',
	address: '',
	hours: '',
	socialInstagram: '',
	socialFacebook: '',
	socialTwitter: '',
};

export function mapSnapshotDataRows(
	rows: SnapshotDataRow[],
	images: SnapshotImage[],
): Snapshot {
	if (rows.length === 0) {
		return {
			products: [],
			categories: [],
			images,
			settings: DEFAULT_SETTINGS,
			lastModified: new Date().toISOString(),
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
		settings: DEFAULT_SETTINGS,
		lastModified: new Date().toISOString(),
	};
}
