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
	/**
	 * Replaces the built-in matching entirely. What a server-filtered index passes: the rows are
	 * already right, so nothing local runs.
	 */
	filterRows?: DataViewFilterRows<TData>
	/**
	 * Reads the value a filter compares against, for a nested or computed field. Without it the
	 * filter's key is read as a path.
	 */
	getFilterValue?: DataViewFilterValueGetter<TData>
	tabs?: FilterTab[]
	/**
	 * A tab row, or a select — the same saved views, at two widths. A tab row is better when it
	 * fits and useless when it does not, and a bar carrying five pills often does not.
	 */
	tabsDisplay?: "tabs" | "select"
	tabsLabel?: string
	/**
	 * Below 768px, `sheet` keeps search inline and opens filter editors in an inset sheet.
	 * Choose `inline` for a caller-owned mobile layout.
	 * @default "sheet"
	 */
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
	/** Content in the auxiliary row, after the saved-view select. */
	toolbarAfterFilters?: ReactNode
	/** Trailing content in the table's topbar, beside its own controls. */
	topbarEnd?: ReactNode
	/** Below the table, inside the frame. */
	footer?: ReactNode
}

export interface DataViewProps<TData extends RowData, TValue = unknown> {
	/** The rows, passed straight through to DataTable after the filters have run. */
	data: readonly TData[]
	/** Passed straight through to DataTable. */
	columns: DataTableProps<TData, TValue>["columns"]
	/**
	 * `filters`, `activeFilters` and `onFilterChange` are meaningless apart — two of the three
	 * describe a state nobody can read — so they travel as one object the whole feature can be
	 * optional on. Without it a DataView is a table in a frame.
	 */
	filtering?: DataViewFilteringConfig<TData>
	/**
	 * Customizes the filter failure warning, `filterError`. Filter-control copy belongs to
	 * `filtering.strings`; pager copy belongs to `DataViewPagination`'s `strings`.
	 */
	strings?: Partial<DataViewStrings>
	/**
	 * Everything DataTable takes except `columns`, `data`, `surface`, `headerTransparent`, and
	 * the two topbar slots — the view owns those.
	 */
	table?: DataViewTableOptions<TData, TValue>
	/**
	 * `topbarContent` above the bar, `toolbarStart` and `toolbarAfterFilters` around the
	 * saved-view select, `topbarEnd` beside the table's controls, `footer` below the table.
	 */
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
