import type { SnapshotImage } from '../../contracts/snapshot.ts';
import type { ImageRow } from './types.ts';

const DEFAULT_STORAGE_BUCKET = 'imageStore';

function readStorageBucket(): string {
	const value = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;
	return typeof value === 'string' && value.trim() ? value.trim() : DEFAULT_STORAGE_BUCKET;
}

function buildStoragePublicUrl(
	supabaseUrl: string,
	bucket: string,
	path: string,
): string {
	const base = supabaseUrl.replace(/\/$/, '');
	return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

function resolveStorageUrls(
	imageId: string,
	supabaseUrl: string,
	bucket: string,
): Pick<SnapshotImage, 'url' | 'thumbnailUrl'> {
	return {
		url: buildStoragePublicUrl(supabaseUrl, bucket, imageId),
		thumbnailUrl: buildStoragePublicUrl(supabaseUrl, bucket, `${imageId}/thumb`),
	};
}

function mapImageRow(row: ImageRow): SnapshotImage {
	return {
		id: row.id,
		name: row.name,
		createdAt: row.created_at,
		...(row.url ? { url: row.url } : {}),
		...(row.thumbnail_url ? { thumbnailUrl: row.thumbnail_url } : {}),
	};
}

export function resolveSnapshotImages(
	imageIds: string[],
	imageRows: ImageRow[] | null,
	supabaseUrl: string,
): SnapshotImage[] {
	const bucket = readStorageBucket();
	const rowById = new Map((imageRows ?? []).map((row) => [row.id, row]));
	const resolved: SnapshotImage[] = [];

	for (const imageId of imageIds) {
		const row = rowById.get(imageId);

		if (row) {
			const mapped = mapImageRow(row);
			const storageUrls = resolveStorageUrls(imageId, supabaseUrl, bucket);

			resolved.push({
				...mapped,
				url: mapped.url ?? storageUrls.url,
				thumbnailUrl: mapped.thumbnailUrl ?? storageUrls.thumbnailUrl,
			});
			continue;
		}

		const storageUrls = resolveStorageUrls(imageId, supabaseUrl, bucket);
		resolved.push({
			id: imageId,
			name: imageId,
			createdAt: '',
			url: storageUrls.url,
			thumbnailUrl: storageUrls.thumbnailUrl,
		});
	}

	return resolved;
}
