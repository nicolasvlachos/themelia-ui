/**
 * useKanban: the move without the drag. Exposed so a keyboard board, a "move to column"
 * menu or a test can move items without simulating a pointer.
 */
import { useCallback, useMemo } from "react"

import type { KanbanItemMoveEvent, KanbanValue } from "./kanban.types"

export interface UseKanbanOptions<T> {
	value: KanbanValue<T>
	onValueChange: (next: KanbanValue<T>) => void
	getItemValue: (item: T) => string
	onItemMove?: (event: KanbanItemMoveEvent<T>) => void
}

export interface UseKanbanResult<T> {
	findItem: (id: string) => { columnId: string; index: number; item: T } | undefined
	/** Idempotent: a move that changes nothing does nothing, including no callback. */
	move: (input: { itemId: string; toColumnId: string; toIndex?: number }) => void
}

export function useKanban<T>({
	value,
	onValueChange,
	getItemValue,
	onItemMove,
}: UseKanbanOptions<T>): UseKanbanResult<T> {
	const findItem = useCallback(
		(id: string) => {
			for (const [columnId, items] of Object.entries(value)) {
				const index = items.findIndex((item) => getItemValue(item) === id)
				if (index >= 0) return { columnId, index, item: items[index]! }
			}
			return undefined
		},
		[getItemValue, value],
	)

	const move = useCallback(
		({ itemId, toColumnId, toIndex }: { itemId: string; toColumnId: string; toIndex?: number }) => {
			const found = findItem(itemId)
			if (!found) return
			// An unknown column is not a destination; ignored silently (a drop over nothing is normal).
			if (!Object.prototype.hasOwnProperty.call(value, toColumnId)) return

			const { columnId: fromColumnId, index: fromIndex, item } = found
			const target = value[toColumnId]!

			// No index appends, as a drop on the column itself does.
			const requested =
				toIndex === undefined ? target.length : Math.max(0, Math.min(toIndex, target.length))

			const next: KanbanValue<T> = { ...value }
			const source = [...next[fromColumnId]!]
			source.splice(fromIndex, 1)
			next[fromColumnId] = source

			const destination = [...(fromColumnId === toColumnId ? source : next[toColumnId]!)]

			// `toIndex` is the final index; clamp it after removal so an append still lands last.
			const landing = Math.min(requested, destination.length)
			if (fromColumnId === toColumnId && fromIndex === landing) return

			destination.splice(landing, 0, item)
			next[toColumnId] = destination

			onValueChange(next)
			onItemMove?.({
				item,
				itemId,
				from: { columnId: fromColumnId, index: fromIndex },
				to: { columnId: toColumnId, index: landing },
			})
		},
		[findItem, onItemMove, onValueChange, value],
	)

	return useMemo(() => ({ findItem, move }), [findItem, move])
}
