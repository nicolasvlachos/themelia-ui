/**
 * DataView — a filter bar and a table, wired together: filter state, row filtering, the
 * bar inside the table's topbar, and pagination, all against one row set.
 *
 * Filtering is one optional config object (filters, active filters, change handler belong
 * together); without it a DataView is a table in a frame.
 */
import type { RowData } from "@tanstack/react-table"
import type { ReactNode } from "react"

import type {
	ActiveFilter, FilterConfig, FilterErrorHandler, FilterStrings, FilterTab,
} from "@/components/features/filters"
import type { DataTableProps } from "@/components/features/table"

import type { DataViewPaginationStrings, DataViewStrings } from "./data-view.strings"

export interface DataViewShellProps {
	children?: ReactNode
	header?: ReactNode
	toolbar?: ReactNode
	footer?: ReactNode
	/** Rendered in place of the content when `empty` is set. */
	emptySlot?: ReactNode
	empty?: boolean
	className?: string
	contentClassName?: string
}

export interface DataViewToolbarProps {
	leading?: ReactNode
	search?: ReactNode
	filters?: ReactNode
	views?: ReactNode
	/** Pushed to the trailing edge — the page's own actions, not the table's. */
	actions?: ReactNode
	className?: string
}

export interface DataViewTableFrameProps {
	toolbar?: ReactNode
	children?: ReactNode
	footer?: ReactNode
	className?: string
	toolbarClassName?: string
	contentClassName?: string
	footerClassName?: string
}

export interface DataViewFilterRowsArgs<TData extends RowData> {
	data: readonly TData[]
	activeFilters: readonly ActiveFilter[]
	filters: readonly FilterConfig[]
}

/** Replaces the built-in row matching entirely — for filtering done on the server. */
export type DataViewFilterRows<TData extends RowData> = (
	args: DataViewFilterRowsArgs<TData>,
) => TData[]

/** Reads the value a filter compares against, for a nested or computed field. */
export type DataViewFilterValueGetter<TData extends RowData> = (
	row: TData,
	filter: FilterConfig,
) => unknown

export interface DataViewFilteringConfig<TData extends RowData> {
	filters: FilterConfig[]
	activeFilters: ActiveFilter[]
	onFilterChange: (filters: ActiveFilter[]) => void
	filterRows?: DataViewFilterRows<TData>
	getFilterValue?: DataViewFilterValueGetter<TData>
	tabs?: FilterTab[]
	/** A tab row, or a select — the same saved views, at two widths. */
	tabsDisplay?: "tabs" | "select"
	tabsLabel?: string
	/** Narrow viewports use the filters sheet by default. */
	mobilePresentation?: "sheet" | "inline"
	/** A change is in flight; the bar dims. */
	isFiltering?: boolean
	strings?: Partial<FilterStrings>
	onError?: FilterErrorHandler
}

/** The table's props, minus the ones DataView owns (e.g. `surface`: the frame draws the card). */
export type DataViewTableOptions<TData extends RowData, TValue = unknown> = Omit<
	DataTableProps<TData, TValue>,
	"columns" | "data" | "surface" | "headerTransparent" | "topbarContent" | "topbarEnd"
>

export interface DataViewSlots {
	/** Above the filter bar, inside the table's topbar. */
	topbarContent?: ReactNode
	/** Leading content in the auxiliary row, beside the saved-view select. */
	toolbarStart?: ReactNode
	toolbarAfterFilters?: ReactNode
	/** Trailing content in the table's topbar, beside its own controls. */
	topbarEnd?: ReactNode
	/** Below the table, inside the frame. */
	footer?: ReactNode
}

export interface DataViewProps<TData extends RowData, TValue = unknown> {
	data: readonly TData[]
	columns: DataTableProps<TData, TValue>["columns"]
	filtering?: DataViewFilteringConfig<TData>
	strings?: Partial<DataViewStrings>
	table?: DataViewTableOptions<TData, TValue>
	slots?: DataViewSlots
	className?: string
}

export interface UseDataViewOptions<TData extends RowData> {
	data: readonly TData[]
	filtering?: DataViewFilteringConfig<TData>
}

export interface UseDataViewResult<TData extends RowData> {
	rows: readonly TData[]
	error: unknown
	/** The matcher threw; `rows` is then the unfiltered data. */
	failed: boolean
}

export interface DataViewPaginationProps {
	page: number
	pageCount?: number
	/** The result-count line beside the pager. */
	total?: ReactNode
	onPageChange?: (page: number) => void
	disabled?: boolean
	className?: string
	strings?: Partial<DataViewPaginationStrings>
}

export interface SavedViewTab {
	id: string
	label: ReactNode
	count?: ReactNode
	disabled?: boolean
}

export interface SavedViewTabsProps {
	views: readonly SavedViewTab[]
	value: string
	onValueChange: (value: string) => void
	className?: string
}
