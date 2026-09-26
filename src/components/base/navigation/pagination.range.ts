/** Page numbers to render, with `null` marking a gap. Always includes the first and last page. */
export function paginationRange(page: number, total: number, siblings = 1): (number | null)[] {
	const window = siblings * 2 + 5
	if (total <= window) return Array.from({ length: total }, (_, i) => i + 1)

	const left = Math.max(page - siblings, 1)
	const right = Math.min(page + siblings, total)
	const showLeftGap = left > 2
	const showRightGap = right < total - 1

	const pages: (number | null)[] = [1]
	if (showLeftGap) pages.push(null)
	for (let i = Math.max(left, 2); i <= Math.min(right, total - 1); i++) pages.push(i)
	if (showRightGap) pages.push(null)
	pages.push(total)
	return pages
}
