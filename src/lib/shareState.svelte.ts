import type { Entry } from './types';

/**
 * Global share-sheet state so any card (deck, grid, detail page) can open
 * the sheet for its entry. The sheet itself is mounted once in the layout.
 */
export const shareSheet = $state<{ entry: Entry | null }>({ entry: null });

export function openShareSheet(entry: Entry): void {
	shareSheet.entry = entry;
}

export function closeShareSheet(): void {
	shareSheet.entry = null;
}
