/**
 * Which tile layer draws, given what is registered and what was asked for. A pure rule:
 * a selection counts only while it names a registered layer, else the default, else the
 * first registered layer.
 */
export interface TileLayerChoice {
	/** What the reader picked, or the initial value. */
	selected: string
	/** What the caller asked for. May name nothing. */
	defaultTileLayer?: string
	/** The layers that have registered themselves so far. */
	available: ReadonlyArray<{ name: string }>
}

export function resolveTileLayer({ selected, defaultTileLayer, available }: TileLayerChoice): string {
	const has = (name: string | undefined) =>
		name !== undefined && name !== "" && available.some((one) => one.name === name)

	if (has(selected)) return selected
	if (has(defaultTileLayer)) return defaultTileLayer as string
	/* Nothing registered yet: no layer draws. */
	return available[0]?.name ?? ""
}

/** Whether `defaultTileLayer` was asked for and matches nothing — worth telling the caller. */
export function defaultTileLayerIsUnknown({ defaultTileLayer, available }: TileLayerChoice): boolean {
	if (!defaultTileLayer || available.length === 0) return false
	return !available.some((one) => one.name === defaultTileLayer)
}
