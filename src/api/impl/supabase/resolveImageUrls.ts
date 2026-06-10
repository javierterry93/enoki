import type { SnapshotImage } from '../../contracts/snapshot.ts';

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

export function resolveSnapshotImages(
	imageIds: string[],
	supabaseUrl: string,
): SnapshotImage[] {
	const bucket = readStorageBucket();

	return imageIds.map((imageId) => ({
		id: imageId,
		name: imageId,
		createdAt: '',
		url: buildStoragePublicUrl(supabaseUrl, bucket, imageId),
		thumbnailUrl: buildStoragePublicUrl(supabaseUrl, bucket, `${imageId}/thumb`),
	}));
}
