/* The filter contexts and hooks, kept apart from the provider component for fast refresh. */
import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react"

import type { FilterContextValue } from "./filters.types"

export const FilterContext = createContext<FilterContextValue | undefined>(undefined)

// Internal (not public): replacing a saved view also cancels uncommitted edits.
export const FilterDraftResetContext = createContext(0)

export function useFilterDraftReset(): number {
	return useContext(FilterDraftResetContext)
}

export function useFilters(): FilterContextValue {
	const context = useContext(FilterContext)
	if (!context) throw new Error("useFilters must be used inside <FilterProvider>.")
	return context
}

/** Popup state is local, but a new request closes it and discards its navigation draft. */
export function useFilterTransientState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>] {
	const { isNavigating } = useFilters()
	const [value, setValue] = useState(initialValue)
	const [lastNavigation, setLastNavigation] = useState(isNavigating)
	if (lastNavigation !== isNavigating) {
		setLastNavigation(isNavigating)
		if (isNavigating) setValue(initialValue)
	}
	return [value, setValue]
}
