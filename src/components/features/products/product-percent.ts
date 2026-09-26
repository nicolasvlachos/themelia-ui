/** A bar cannot show 140%, and a NaN would render as an empty track. */
export function clampProductPercent(value: number): number {
	if (!Number.isFinite(value)) return 0
	return Math.min(100, Math.max(0, Math.round(value)))
}
