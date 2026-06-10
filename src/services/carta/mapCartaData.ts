import { slugify } from './slugify.ts';
import type { Category, Data, Product } from './types.ts';
import type { Snapshot, SnapshotImage } from './snapshot.ts';

function resolveImageUrls(
	imageId: string | null,
	images: SnapshotImage[],
): { imageUrl: string | null; imageFullUrl: string | null } {
	if (!imageId) return { imageUrl: null, imageFullUrl: null };

	const image = images.find((entry) => entry.id === imageId);
	if (!image) return { imageUrl: null, imageFullUrl: null };

	return {
		imageUrl: image.thumbnailUrl ?? image.url ?? null,
		imageFullUrl: image.url ?? image.thumbnailUrl ?? null,
	};
}

function mapProduct(
	product: Snapshot['products'][number],
	images: SnapshotImage[],
): Product {
	const { imageUrl, imageFullUrl } = resolveImageUrls(
		product.imageId,
		images,
	);

	return {
		id: product.id,
		name: product.name,
		description: product.shortDescription || null,
		price: product.price,
		imageUrl,
		imageFullUrl,
		featured: false,
		tags: [],
	};
}

export function mapCartaData(snapshot: Snapshot): Data {
	const categoryById = new Map(
		snapshot.categories.map((category) => [category.id, category]),
	);

	const visibleCategories = snapshot.categories
		.filter((category) => category.visible !== false)
		.sort((a, b) => a.order - b.order);

	const visibleProducts = snapshot.products
		.filter((product) => product.visible !== false)
		.sort((a, b) => a.order - b.order);

	const productsByCategory = new Map<string, Product[]>();

	for (const product of visibleProducts) {
		const mapped = mapProduct(product, snapshot.images);
		const list = productsByCategory.get(product.categoryId) ?? [];
		list.push(mapped);
		productsByCategory.set(product.categoryId, list);
	}

	const categories: Category[] = visibleCategories
		.map((category) => ({
			id: category.id,
			name: category.name,
			slug: slugify(category.name),
			description: null,
			products: productsByCategory.get(category.id) ?? [],
		}))
		.filter((category) => category.products.length > 0);

	const assignedProductIds = new Set(
		categories.flatMap((category) => category.products.map((product) => product.id)),
	);

	for (const product of visibleProducts) {
		if (assignedProductIds.has(product.id)) continue;

		const mapped = mapProduct(product, snapshot.images);
		const existingCategory = categories.find(
			(category) => category.id === product.categoryId,
		);

		if (existingCategory) {
			existingCategory.products.push(mapped);
			assignedProductIds.add(product.id);
			continue;
		}

		const sourceCategory = categoryById.get(product.categoryId);
		if (sourceCategory && sourceCategory.visible !== false) {
			categories.push({
				id: sourceCategory.id,
				name: sourceCategory.name,
				slug: slugify(sourceCategory.name),
				description: null,
				products: [mapped],
			});
			assignedProductIds.add(product.id);
		}
	}

	return {
		categories,
		settings: {
			name: snapshot.settings.name,
			phone: snapshot.settings.phone,
			address: snapshot.settings.address,
			hours: snapshot.settings.hours,
		},
	};
}
