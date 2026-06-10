import { createSnapshotApi } from './createSnapshotApi.ts';
import type { Snapshot } from './contracts/snapshot.ts';

export async function getSnapshot(): Promise<Snapshot> {
	return createSnapshotApi().getSnapshot();
}
