import type { Snapshot } from './snapshot.ts';

export type SnapshotApi = {
	getSnapshot(): Promise<Snapshot>;
};
