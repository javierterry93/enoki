import { getSnapshot } from '../../api/getSnapshot.ts';
import type { CartaData } from './types.ts';
import { mapCartaData } from './mapCartaData.ts';

export async function getCarta(): Promise<CartaData> {
	const snapshot = await getSnapshot();
	return mapCartaData(snapshot);
}
