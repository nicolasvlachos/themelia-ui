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

/** What an open row's `render` is handed beside the row's data. */
export interface DataTableExpandedRowContext<TDetail> {
	/** What `onLoad` resolved to. `undefined` when there is no `onLoad`. */
	detail: TDetail
	/** Loads again, skipping the cache. Does nothing without `onLoad`. */
	refresh: () => void
	/** Closes this row's panel — after a save inside it, say. */
	collapse: () => void
}

/**
 * Expandable rows: a panel under an open row, opened by a toggle at the row's start. Passing
 * `expandedRow` at all turns it on; `render` is the one required field.
 */
export interface DataTableExpandedRow<TData extends RowData, TDetail = unknown> {
	/** The panel under an open row. */
	render: (row: TData, context: DataTableExpandedRowContext<TDetail>) => ReactNode
	/**
	 * Fetches what the panel shows when its row opens. The table shows a skeleton meanwhile,
	 * aborts the request (`signal`) when the row closes, offers Retry on failure and keeps the
	 * result for five minutes per row. `null` or `undefined` means the row has no details.
	 * Write it before `render`: TypeScript types `detail` from it, left to right.
	 */
	onLoad?: (row: TData, args: { signal: AbortSignal }) => Promise<TDetail | null | undefined>
	/** Rows it refuses get no toggle and never open. */
	canExpand?: (row: TData) => boolean
	/**
	 * Several rows open at once. `false` closes the open row when another opens.
	 * @default true
	 */
	multiple?: boolean
	/**
	 * The open rows, keyed by row id. Controlled: rendered as given, even several under
	 * `multiple: false`. Supply `getRowId` when `data` can reorder or page, or an open panel
	 * follows a position rather than a record.
	 */
	expanded?: Record<string, boolean>
	/** The rows open at first, keyed by row id. */
	defaultExpanded?: Record<string, boolean>
	onExpandedChange?: (expanded: Record<string, boolean>) => void
}

export interface DataTableSelectionToolbarContext<TData extends RowData> {
	table: Table<TData>
	selectedRows: TData[]
	selectedRowCount: number
	totalRowCount: number
	rowSelection: RowSelectionState
	clearSelection: () => void
}

/**
 * Row spacing for the whole table, not type size. Unset, a compact provider density picks
 * `sm`.
 */
export type DataTableSize = ComponentScale

/**
 * The wrapper's chrome. `card` is the default admin surface; `glass` is a hairline outline
 * with no fill, for a table inside another card; `flat` draws nothing.
 */
export type DataTableSurface = "card" | "glass" | "flat"

/** How row actions render. `auto` picks by the container's width. */
export type RowActionsDisplayMode = "menu" | "inline" | "auto"

export type ClassNameFor<TData extends RowData> = string | ((column: string, row: Row<TData> | null) => string)

export interface DataTableProps<TData extends RowData, TValue = unknown, TDetail = unknown> {
	size?: DataTableSize
	/**
	 * The wrapper's chrome. `card` is the ordinary treatment; `glass` is a hairline outline for a
	 * table inside another card, where two card surfaces are a box in a box; `flat` draws nothing.
	 */
	surface?: DataTableSurface
	/** Drops the header row's muted fill. */
	headerTransparent?: boolean

	/**
	 * Ordinary TanStack column definitions, or a `[columns, deps]` tuple memoised here, because
	 * an array rebuilt every render resets column state on every keystroke elsewhere on the page.
	 */
	columns: ColumnDef<TData, TValue>[] | [ColumnDef<TData, TValue>[], DependencyList]
	/** The page to render. The table never slices it. */
	data: TData[]
	columnGroups?: ColumnGroup[]

	/** Turns on sorting: the header control AND the state behind it. */
	enableSorting?: boolean
	/** Turns on the toolbar's filter AND the state behind it. Requires `filterColumn`. */
	enableFiltering?: boolean
	/**
	 * Turns on selection: the checkbox column AND the state behind it, so a checkbox column
	 * cannot exist with selection switched off.
	 */
	enableRowSelection?: boolean
	enableMultiRowSelection?: boolean
	enableSubRowSelection?: boolean
	/** Turns on column hiding: the toolbar's columns menu AND the state behind it. */
	enableColumnVisibility?: boolean

	fullscreen?: boolean
	defaultFullscreen?: boolean
	onFullscreenChange?: (fullscreen: boolean) => void
	showFullscreenToggle?: boolean

	/** The consumer owns sorting: the table reports intent and does not reorder `data`. */
	manualSorting?: boolean

	/**
	 * Pins the header row. A pinned pane needs a bounded container to be pinned inside — sticky
	 * with no height cap (`maxBodyHeight`, `fillAvailableHeight`) sticks to the page, which is
	 * nothing.
	 */
	stickyHeader?: boolean
	stickyToolbar?: boolean
	/**
	 * Pins the first column — and the selection checkbox before it, when there is one — while
	 * the body scrolls sideways.
	 */
	stickyFirstColumn?: boolean
	/**
	 * Caps the scrolling body. A number is pixels. This is the bound a sticky header needs to be
	 * pinned inside.
	 */
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

	/**
	 * The bar shown while rows are selected. `undefined` renders the default bar, `null` or
	 * `false` suppresses it, a node or a function replaces it. The function's context carries the
	 * selected rows and a `clearSelection`.
	 */
	selectionToolbar?:
		| ReactNode
		| ((context: DataTableSelectionToolbarContext<TData>) => ReactNode)
	/**
	 * The actions inside the default selection bar, or a function of the same context — the
	 * selected rows and a `clearSelection` — that returns them.
	 */
	bulkActions?: ReactNode | ((context: DataTableSelectionToolbarContext<TData>) => ReactNode)
	selectionToolbarClassName?: string

	/**
	 * Each row's actions, or a factory of them. The factory form is what a real table needs:
	 * “Delete” belongs on a cancelled booking and nowhere else. `href` is carried as data — the
	 * table never navigates.
	 */
	rowActions?: TableAction<TData>[] | ((row: TData) => TableAction<TData>[])
	rowActionsMenuLabel?: string | ((row: TData) => string)
	/**
	 * How row actions render: a menu, inline buttons, or `auto`. `auto` measures the TABLE, not
	 * the window: whether three buttons fit is a question about the table, and the same one is
	 * as often in a drawer as at page width.
	 */
	rowActionsDisplayMode?: RowActionsDisplayMode
	/** Container width, in pixels, at which `auto` switches from a menu to inline. */
	rowActionsBreakpoint?: number

	/**
	 * Total page count. Supplying it renders the pager once there is more than one page. Add
	 * `totalRowCount` and `pageSize` for the “1–5 of 13” line beside it.
	 */
	pageCount?: number
	/** The current page, from 1. */
	page?: number
	/** Receives the page the pager moves to. */
	onPageChange?: (page: number) => void
	/** The result-count line beside the pager. */
	totalRowCount?: number
	pageSize?: number

	onRowClick?: RowClickHandler<TData>
	/**
	 * Turns on expandable rows: a toggle column at the row's start AND the panel it opens,
	 * with the state behind them. Without it the table has neither.
	 */
	expandedRow?: DataTableExpandedRow<TData, TDetail>
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
	 * `defaultColumnVisibility` still wins over the persisted value: a developer who hides a
	 * column in code means it.
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
	/** Whether the expand toggle column leads the row (after any checkbox), for the pinned group. */
	hasExpandColumn?: boolean
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
	/** Whether the expand toggle column leads the row (after any checkbox), for the pinned group. */
	hasExpandColumn?: boolean
	/** The expanded-row config. Open rows render its panel under them. */
	expandedRow?: DataTableExpandedRow<TData, unknown>
	/** Prefixes each panel's id and cache key, so two tables never share either. */
	expansionId?: string
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
