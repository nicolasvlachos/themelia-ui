/**
 * Kanban: the board value is `Record<columnId, T[]>`, a trivially serialisable controlled
 * contract. Column metadata (titles, colours, limits) and rendering are the consumer's;
 * only item order lives here.
 */
import type { CSSProperties, ReactNode } from "react"

import type { ContextAction } from "@/components/base/action-menu"

import type { KanbanStrings } from "./kanban.strings"

export type KanbanValue<T = unknown> = Record<string, T[]>

/** A card action: the kit's `ContextAction`, bound to the item. */
export interface KanbanItemAction<T = unknown> extends ContextAction<T> {
	id: string
	label: string
	onClick: (item: T) => void
}

/** A fixed list, or a function of the item (e.g. "Reopen" only on cards in Done). */
export type KanbanItemActions<T = unknown> =
	| ReadonlyArray<KanbanItemAction<T>>
	| ((item: T) => ReadonlyArray<KanbanItemAction<T>>)

export interface KanbanItemMoveEvent<T = unknown> {
	item: T
	itemId: string
	from: { columnId: string; index: number }
	to: { columnId: string; index: number }
}

export interface KanbanContextValue<T = unknown> {
	value: KanbanValue<T>
	onValueChange: (next: KanbanValue<T>) => void
	getItemValue: (item: T) => string
	/** The id being dragged, or `null`. */
	activeId: string | null
	activeItem: T | null
	findItem: (id: string) => { columnId: string; index: number; item: T } | undefined
	itemActions?: KanbanItemActions<T>
	onItemClick?: (item: T) => void
	strings: KanbanStrings
}

export interface KanbanProps<T = unknown> {
	value: KanbanValue<T>
	onValueChange: (next: KanbanValue<T>) => void
	/** A stable id per item. Everything else is keyed off this. */
	getItemValue: (item: T) => string
	/** Fires after a move lands, with both ends of it, for persistence or analytics. */
	onItemMove?: (event: KanbanItemMoveEvent<T>) => void
	itemActions?: KanbanItemActions<T>
	/** Fires on a card click that was not the handle or the menu. */
	onItemClick?: (item: T) => void
	strings?: Partial<KanbanStrings>
	className?: string
	children?: ReactNode
}

export interface KanbanBoardProps {
	className?: string
	style?: CSSProperties
	children?: ReactNode
}

export interface KanbanColumnProps {
	/** Must be a key of the value map. */
	value: string
	className?: string
	children?: ReactNode
}

export interface KanbanColumnContentProps {
	value: string
	className?: string
	children?: ReactNode
}

export interface KanbanItemProps {
	value: string
	className?: string
	/** Stops this card being dragged, e.g. while it is mid-mutation. */
	disabled?: boolean
	/** Overrides the board's `onItemClick` for this card. */
	onClick?: () => void
	children?: ReactNode
}

export interface KanbanItemHandleProps {
	className?: string
	children?: ReactNode
}

export interface KanbanItemActionsProps {
	className?: string
	icon?: ReactNode
	label?: string
}

export interface KanbanOverlayProps<T = unknown> {
	className?: string
	/** Replaces the default outline with the consumer's own card. */
	render?: (context: { item: T | null; columnId: string | null }) => ReactNode
}
