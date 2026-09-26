/**
 * DataTable: TanStack's row model (sorting, selection, visibility, `ColumnDef`s) in the
 * kit's chrome (toolbar, sticky panes, full screen, selection bar, pager, empty state).
 * The table renders the page it is handed and never slices `data`; paging is the consumer's.
 */
/*
 * The `/legacy` (v8-shaped) entry keeps v9's `TFeatures` generic off the public props, so
 * `DataTableProps<TData, TValue>` stays writable by consumers.
 */
import type {
	LegacyColumnDef as ColumnDef, LegacyRow as Row, LegacyTable as Table,
} from "@tanstack/react-table/legacy"
import type {
	CellData, ColumnFiltersState, ColumnVisibilityState as VisibilityState, RowData,
	RowSelectionState, SortingState, TableFeatures,
} from "@tanstack/react-table"
import type { CSSProperties, DependencyList, ReactNode, RefObject } from "react"

import type { ContextAction } from "@/components/base/action-menu"
import type { ButtonProps } from "@/components/base/buttons"
import type { ComponentScale } from "@/lib/component-vocabulary"

import type { DataTableStrings, DataTableStringsOverride } from "./table.strings"

declare module "@tanstack/react-table" {
	/** Per-column alignment, applied to both the header label and the body cells. */
	/* Parameters repeat TanStack's verbatim; a differing signature would conflict, not merge. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required to match TanStack's own signature.
	interface ColumnMeta<
		in out TFeatures extends TableFeatures,
		in out TData extends RowData,
		TValue extends CellData = CellData,
	> {
		align?: "start" | "center" | "end"
	}
}

/**
 * A row action: the kit's `ContextAction`, bound to the row. `onClick`, `visible` and
 * `disabled` receive the row; everything else is an `ActionDefinition` field.
 */
export interface TableAction<TData extends RowData> extends ContextAction<TData> {
	label: string
	/** Carried as data; the table never navigates. Route with your own router in `onClick`. */
	href?: string
}

export type RowSelectionHandler = (selection: RowSelectionState) => void
export type SortingHandler = (sorting: SortingState) => void
export type RowClickHandler<TData extends RowData> = (row: TData) => void
export type ColumnVisibilityHandler = (visibility: VisibilityState) => void
export type ColumnFiltersHandler = (filters: ColumnFiltersState) => void

/** A band above the header row, spanning several columns. */
export interface ColumnGroup {
	header: string
	/** Column ids; must be contiguous. */
	columns: string[]
}

export interface DataTableSelectionToolbarContext<TData extends RowData> {
	table: Table<TData>
	selectedRows: TData[]
	selectedRowCount: number
	totalRowCount: number
	rowSelection: RowSelectionState
	clearSelection: () => void
}

/** Density of the whole table: row spacing only, not type size. */
export type DataTableSize = ComponentScale

/**
 * The wrapper's chrome. `card` is the default admin surface; `glass` is a hairline outline
 * with no fill, for a table inside another card; `flat` draws nothing.
 */
export type DataTableSurface = "card" | "glass" | "flat"

/** How row actions render. `auto` picks by the container's width. */
export type RowActionsDisplayMode = "menu" | "inline" | "auto"

export type ClassNameFor<TData extends RowData> = string | ((column: string, row: Row<TData> | null) => string)

export interface DataTableProps<TData extends RowData, TValue = unknown> {
	size?: DataTableSize
	surface?: DataTableSurface
	/** Drops the header row's muted fill. */
	headerTransparent?: boolean

	/**
	 * Column definitions, or a `[columns, deps]` tuple memoised here. A column array rebuilt
	 * every render resets TanStack's column state.
	 */
	columns: ColumnDef<TData, TValue>[] | [ColumnDef<TData, TValue>[], DependencyList]
	data: TData[]
	columnGroups?: ColumnGroup[]

	enableSorting?: boolean
	enableFiltering?: boolean
	enableRowSelection?: boolean
	enableMultiRowSelection?: boolean
	enableSubRowSelection?: boolean
	enableColumnVisibility?: boolean

	fullscreen?: boolean
	defaultFullscreen?: boolean
	onFullscreenChange?: (fullscreen: boolean) => void
	showFullscreenToggle?: boolean

	/** The consumer owns sorting: the table reports intent and does not reorder `data`. */
	manualSorting?: boolean

	stickyHeader?: boolean
	stickyToolbar?: boolean
	stickyFirstColumn?: boolean
	/** Caps the scrolling body. A number is pixels. */
	maxBodyHeight?: number | string
	/** Fills the parent's height, scrolling the body instead of the page. */
	fillAvailableHeight?: boolean
	striped?: boolean

	emptyStateMessage?: string
	emptyStateAction?: ReactNode

	className?: string
	rowClassName?: string | ((row: Row<TData>, index: number) => string)
	cellClassName?: ClassNameFor<TData>
	headerClassName?: string
	wrapperClassName?: string
	tableContainerClassName?: string
	strings?: DataTableStringsOverride

	/** The column the toolbar's filter searches. Required alongside `enableFiltering`. */
	filterColumn?: string
	filterPlaceholder?: string

	topbarContent?: ReactNode
	topbarEnd?: ReactNode
	topbarClassName?: string
	/** Whether built-in toolbar controls draw their labels. Icon-only by default. */
	toolbarLabelVisibility?: "responsive" | "hidden"
	footerContent?: ReactNode

	/** `undefined` renders the default, `null`/`false` suppresses it, a function replaces it. */
	selectionToolbar?:
		| ReactNode
		| ((context: DataTableSelectionToolbarContext<TData>) => ReactNode)
	bulkActions?: ReactNode | ((context: DataTableSelectionToolbarContext<TData>) => ReactNode)
	selectionToolbarClassName?: string

	rowActions?: TableAction<TData>[] | ((row: TData) => TableAction<TData>[])
	rowActionsMenuLabel?: string | ((row: TData) => string)
	rowActionsDisplayMode?: RowActionsDisplayMode
	/** Container width, in pixels, at which `auto` switches from a menu to inline. */
	rowActionsBreakpoint?: number

	/** Total page count. Supplying it renders the pager. */
	pageCount?: number
	page?: number
	onPageChange?: (page: number) => void
	/** The result-count line beside the pager. */
	totalRowCount?: number
	pageSize?: number

	onRowClick?: RowClickHandler<TData>
	onRowSelectionChange?: RowSelectionHandler
	onSortingChange?: SortingHandler
	onColumnVisibilityChange?: ColumnVisibilityHandler
	onColumnFiltersChange?: ColumnFiltersHandler

	/**
	 * A stable id per row, used as the selection key. Supply it whenever `data` can reorder
	 * or page; the index default makes selection follow a position, not a record.
	 */
	getRowId?: (row: TData, index: number) => string

	rowSelection?: RowSelectionState
	sorting?: SortingState
	defaultSorting?: SortingState
	columnVisibility?: VisibilityState
	defaultColumnVisibility?: VisibilityState
	initialState?: {
		sorting?: SortingState
		rowSelection?: RowSelectionState
		columnVisibility?: VisibilityState
		columnFilters?: ColumnFiltersState
	}

	/**
	 * Persists column visibility to localStorage under `dt.{storageKey}.columns`. An explicit
	 * `defaultColumnVisibility` still wins over the persisted value.
	 */
	storageKey?: string
	style?: CSSProperties
}

export interface DataTableHeaderProps<TData extends RowData> {
	table: Table<TData>
	stickyHeader?: boolean
	headerClassName?: string
	cellClassName?: ClassNameFor<TData>
	stickyFirstColumn?: boolean
	/** Whether column 0 is the selection checkbox, so the pinned pair covers the identity column too. */
	hasSelectionColumn?: boolean
	columnGroups?: ColumnGroup[]
	headerTransparent?: boolean
}

export interface DataTableBodyProps<TData extends RowData> {
	table: Table<TData>
	onRowClick?: RowClickHandler<TData>
	emptyStateMessage?: string
	emptyStateAction?: ReactNode
	cellClassName?: ClassNameFor<TData>
	rowClassName?: string | ((row: Row<TData>, index: number) => string)
	stickyFirstColumn?: boolean
	/** Whether column 0 is the selection checkbox, so the pinned pair covers the identity column too. */
	hasSelectionColumn?: boolean
	striped?: boolean
	strings?: DataTableStrings
}

export interface DataTableToolbarProps<TData extends RowData> {
	table: Table<TData>
	/** The wrapper holding the Table; the toolbar finds the scroll container inside it. */
	tableAreaRef: RefObject<HTMLDivElement | null>
	fullscreen: boolean
	onFullscreenChange: (fullscreen: boolean) => void
	showFullscreenToggle?: boolean
	enableColumnVisibility?: boolean
	labelVisibility?: "responsive" | "hidden"
	strings?: DataTableStrings
}

export interface ColumnVisibilityToggleProps<TData extends RowData> {
	table: Table<TData>
	className?: string
	align?: "start" | "center" | "end"
	labelVisibility?: "responsive" | "hidden"
	strings?: DataTableStrings
	/** Extends or replaces the trigger's public Button composition. */
	buttonProps?: Omit<ButtonProps, "children">
}

export interface DataTableActionsProps<TData extends RowData> {
	row: TData
	actions: TableAction<TData>[] | ((row: TData) => TableAction<TData>[])
	menuLabel?: string
	displayMode?: RowActionsDisplayMode
	/** Container width, in pixels, at which `auto` switches. */
	responsiveBreakpoint?: number
	strings?: DataTableStrings
}
