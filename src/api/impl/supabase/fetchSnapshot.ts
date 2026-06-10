import type { SupabaseClient } from '@supabase/supabase-js';
import { wrapApiError } from '../../errors.ts';
import type { Snapshot } from '../../contracts/snapshot.ts';
import { mapSnapshotDataRows } from './mapSnapshotDataRows.ts';
import { resolveSnapshotImages } from './resolveImageUrls.ts';
import {
	SNAPSHOT_VIEW,
	type SnapshotDataRow,
	type SupabaseDatabase,
} from './types.ts';
import { resolveSupabaseClientConfig } from './client.ts';

function collectImageIds(rows: SnapshotDataRow[]): string[] {
	const ids = new Set<string>();

	for (const row of rows) {
		if (row.image_id) ids.add(row.image_id);
	}

	return [...ids];
}

export async function fetchSnapshotFromSupabase(
	client: SupabaseClient<SupabaseDatabase>,
	businessId: string,
): Promise<Snapshot> {
	try {
		const { data: rows, error } = await client
			.from(SNAPSHOT_VIEW)
			.select('*')
			.eq('business_id', businessId)
			.order('category_order', { ascending: true })
			.order('product_order', { ascending: true });

		if (error) {
			throw error;
		}

		const snapshotRows = (rows ?? []) as SnapshotDataRow[];
		const { url: supabaseUrl } = resolveSupabaseClientConfig();
		const images = resolveSnapshotImages(collectImageIds(snapshotRows), supabaseUrl);

		return mapSnapshotDataRows(snapshotRows, images);
	} catch (error) {
		throw wrapApiError('No se pudo cargar la carta desde Supabase', error);
	}
}
