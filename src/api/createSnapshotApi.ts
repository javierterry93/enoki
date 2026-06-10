import type { SnapshotApi } from './contracts/snapshotApi.ts';
import { createSupabaseSnapshotApi } from './impl/supabase/createSupabaseSnapshotApi.ts';

export function createSnapshotApi(): SnapshotApi {
	return createSupabaseSnapshotApi();
}
