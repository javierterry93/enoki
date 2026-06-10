import { resolveBusinessId } from '../../../config/businessConfig.ts';
import type { SnapshotApi } from '../../contracts/snapshotApi.ts';
import { getSupabaseClient } from './supabaseConfig.ts';
import { fetchSnapshotFromSupabase } from './fetchSnapshot.ts';

export function createSupabaseSnapshotApi(): SnapshotApi {
	const client = getSupabaseClient();

	return {
		getSnapshot: () => fetchSnapshotFromSupabase(client, resolveBusinessId()),
	};
}
