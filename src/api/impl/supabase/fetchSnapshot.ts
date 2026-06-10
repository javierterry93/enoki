import type { SupabaseClient } from '@supabase/supabase-js';
import { wrapApiError } from '../../errors.ts';
import type { Snapshot } from '../../contracts/snapshot.ts';
import { mapSnapshotDataRows } from './mapSnapshotDataRows.ts';
import { resolveSnapshotImages } from './resolveImageUrls.ts';
import {
	SUPABASE_TABLES,
	type BusinessRow,
	type ImageRow,
	type SnapshotDataRow,
	type SupabaseDatabase,
} from './types.ts';
import { resolveSupabaseClientConfig } from './client.ts';

function collectImageIds(
	rows: { image_id: string | null }[],
	logoImageId: string | null,
): string[] {
	const ids = new Set<string>();

	for (const row of rows) {
		if (row.image_id) ids.add(row.image_id);
	}

	if (logoImageId) ids.add(logoImageId);

	return [...ids];
}

export async function fetchSnapshotFromSupabase(
	client: SupabaseClient<SupabaseDatabase>,
): Promise<Snapshot> {
	try {
		const { data: rows, error: snapshotError } = await client
			.from('snapshot_data')
			.select('*')
			.order('category_order', { ascending: true })
			.order('product_order', { ascending: true });

		if (snapshotError) {
			throw snapshotError;
		}

		const snapshotRows = (rows ?? []) as SnapshotDataRow[];
		const businessId = snapshotRows[0]?.business_id ?? null;

		let business: BusinessRow | null = null;

		if (businessId) {
			const { data, error } = await client
				.from(SUPABASE_TABLES.businesses)
				.select(
					'id, name, logo_image_id, phone, address, hours, social_instagram, social_facebook, social_twitter, last_modified',
				)
				.eq('id', businessId)
				.maybeSingle();

			if (!error) {
				business = data as BusinessRow | null;
			}
		}

		const imageIds = collectImageIds(snapshotRows, business?.logo_image_id ?? null);

		let imageRows: ImageRow[] | null = null;

		if (businessId && imageIds.length > 0) {
			const { data, error } = await client
				.from(SUPABASE_TABLES.images)
				.select('id, name, url, thumbnail_url, created_at')
				.eq('business_id', businessId)
				.in('id', imageIds);

			if (!error) {
				imageRows = data as ImageRow[] | null;
			}
		}

		const { url: supabaseUrl } = resolveSupabaseClientConfig();
		const images = resolveSnapshotImages(imageIds, imageRows, supabaseUrl);

		return mapSnapshotDataRows(snapshotRows, business, images);
	} catch (error) {
		throw wrapApiError('No se pudo cargar la carta desde Supabase', error);
	}
}
