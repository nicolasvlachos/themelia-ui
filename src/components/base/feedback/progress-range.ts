const DEFAULT_PROGRESS_MAX = 100

/** One finite range contract shared by every progress presentation. */
export function normalizeProgressRange(value: number, max = DEFAULT_PROGRESS_MAX) {
	const normalizedMax = Number.isFinite(max) && max > 0 ? max : DEFAULT_PROGRESS_MAX
	const normalizedValue = Number.isFinite(value)
		? Math.min(Math.max(value, 0), normalizedMax)
		: 0

	return {
		max: normalizedMax,
		value: normalizedValue,
		percent: (normalizedValue / normalizedMax) * 100,
	}
}
