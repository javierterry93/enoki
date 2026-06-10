import { getSnapshot } from '../../api/getSnapshot.ts';
import type { Data } from './types.ts';
import { mapCartaData } from './mapCartaData.ts';

export async function getCarta(): Promise<Data> {
	const snapshot = await getSnapshot();
	return mapCartaData(snapshot);
}
