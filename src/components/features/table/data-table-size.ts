/*
 * The table's size, for parts rendered inside a row. Its own module so data-table.tsx
 * exports only components and stays hot-reloadable.
 */
import { createContext, useContext } from "react"

import type { DataTableSize } from "./table.types"

export const DataTableSizeContext = createContext<DataTableSize>("md")

export function useDataTableSize(): DataTableSize {
	return useContext(DataTableSizeContext)
}
