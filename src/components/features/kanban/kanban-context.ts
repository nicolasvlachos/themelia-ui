import { createContext, useContext } from "react"

import type { KanbanContextValue } from "./kanban.types"

const KanbanContext = createContext<KanbanContextValue | null>(null)
export const KanbanContextProvider = KanbanContext.Provider

export function useKanbanContext<T = unknown>(): KanbanContextValue<T> {
	const context = useContext(KanbanContext)
	if (!context) throw new Error("Kanban parts must be used inside a <Kanban> root.")
	return context as unknown as KanbanContextValue<T>
}

/**
 * What one card publishes to its parts. `registerHandle`: a mounted handle registers
 * itself, and the card then attaches drag listeners to the handle instead of its surface.
 */
export interface KanbanItemContextValue<T = unknown> {
	listeners: unknown
	attributes: unknown
	setActivatorNodeRef: (node: HTMLElement | null) => void
	registerHandle: () => () => void
	itemId: string
	/** `null` when the id resolves to nothing, e.g. a card removed mid-drag. */
	item: T | null
}

const KanbanItemContext = createContext<KanbanItemContextValue | null>(null)
export const KanbanItemContextProvider = KanbanItemContext.Provider

export function useKanbanItemContext<T = unknown>(): KanbanItemContextValue<T> {
	const context = useContext(KanbanItemContext)
	if (!context) {
		throw new Error("KanbanItemHandle and KanbanItemActions must be used inside a <KanbanItem>.")
	}
	return context as KanbanItemContextValue<T>
}
