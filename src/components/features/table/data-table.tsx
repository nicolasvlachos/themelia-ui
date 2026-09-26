/**
 * DataTable: TanStack's row model in the kit's chrome (see table.types.ts).
 *
 * Sorting, selection, visibility, full screen and page are each controllable but never
 * required: a prop wins when given, internal state otherwise, and the callback fires either way.
 */
import {
	flexRender, type ColumnFiltersState, type ColumnVisibilityState, type RowData,
	type RowSelectionState, type SortingState, type Updater,
} from "@tanstack/react-table"
import {
	getCoreRowModel, getFilteredRowModel, getSortedRowModel, useLegacyTable,
	type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import {
	useCallback, useMemo, useRef, useState,
	type CSSProperties, type ReactNode,
} from "react"

import { Input } from "@/components/base/text-inputs"
import { Pagination } from "@/components/base/navigation"
import { Separator } from "@/components/base/display"
import { Table } from "@/components/base/table"
import { Text } from "@/components/base/typography"
import { BatchActionBar } from "@/components/base/batch-action-bar"
import { useDensity } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"

import { DataTableActions } from "./data-table-actions"
import { DataTableBody } from "./data-table-body"
import { DataTableHeader } from "./data-table-header"
import { DataTableToolbar } from "./data-table-toolbar"
import { addSelectionColumn } from "./table-helpers"
import { mergeDataTableStrings } from "./table.strings"
import type {
	DataTableProps, DataTableSelectionToolbarContext, } from "./table.types"
import { useFullscreenTableModality } from "./use-fullscreen-modality"
import styles from "./table.module.css"
import { DataTableSizeContext } from "./data-table-size"

function toCssLength(value: number | string | undefined): string | undefined {
	if (value === undefined) return undefined
	return typeof value === "number" ? `${value}px` : value
}

export function DataTable<TData extends RowData, TValue = unknown>({
	size,
	surface = "card",
	headerTransparent = false,
	columns,
	data,
	columnGroups,
	enableSorting = false,
	enableFiltering = false,
	enableRowSelection = false,
	enableMultiRowSelection = true,
	enableSubRowSelection = false,
	enableColumnVisibility = false,
	manualSorting = false,
	fullscreen: controlledFullscreen,
	defaultFullscreen = false,
	onFullscreenChange,
	showFullscreenToggle = false,
	stickyHeader = false,
	stickyToolbar = false,
	stickyFirstColumn = false,
	maxBodyHeight,
	fillAvailableHeight = false,
	striped = false,
	emptyStateMessage,
	emptyStateAction,
	className,
	rowClassName,
	cellClassName,
	headerClassName,
	wrapperClassName,
	tableContainerClassName,
	strings: stringsOverride,
	filterColumn,
	filterPlaceholder,
	topbarContent,
	topbarEnd,
	topbarClassName,
	toolbarLabelVisibility = "hidden",
	footerContent,
	selectionToolbar,
	bulkActions,
	selectionToolbarClassName,
	rowActions,
	rowActionsMenuLabel,
	rowActionsDisplayMode,
	rowActionsBreakpoint,
	pageCount,
	page,
	onPageChange,
	totalRowCount,
	pageSize,
	onRowClick,
	onRowSelectionChange,
	onSortingChange,
	onColumnVisibilityChange,
	onColumnFiltersChange,
	getRowId,
	rowSelection: controlledRowSelection,
	sorting: controlledSorting,
	defaultSorting,
	columnVisibility: controlledColumnVisibility,
	defaultColumnVisibility,
	initialState,
	storageKey,
	style,
}: DataTableProps<TData, TValue>) {
	/* The provider's density maps onto the table's three sizes. */
	const { density } = useDensity()
	const resolvedSize = size ?? (density === "compact" ? "sm" : density === "comfortable" ? "lg" : "md")

	const strings = useMemo(() => mergeDataTableStrings(stringsOverride), [stringsOverride])

	/* The tuple form: a column array rebuilt every render resets TanStack's column state. */
	const resolvedColumns = useMemo(() => {
		if (Array.isArray(columns) && columns.length === 2 && Array.isArray(columns[1])) {
			return columns[0] as LegacyColumnDef<TData, TValue>[]
		}
		return columns as LegacyColumnDef<TData, TValue>[]
	}, [columns])

	const storageName = storageKey ? `dt.${storageKey}.columns` : null

	const initialVisibility = useMemo<ColumnVisibilityState>(() => {
		const explicit = defaultColumnVisibility ?? initialState?.columnVisibility ?? {}
		if (!storageName || typeof window === "undefined") return explicit

		try {
			const stored = window.localStorage.getItem(storageName)
			/* The explicit default wins over the persisted preference. */
			return { ...(stored ? (JSON.parse(stored) as ColumnVisibilityState) : {}), ...explicit }
		} catch {
			return explicit
		}
	}, [defaultColumnVisibility, initialState?.columnVisibility, storageName])

	const [internalSorting, setInternalSorting] = useState<SortingState>(
		defaultSorting ?? initialState?.sorting ?? [],
	)
	const [internalVisibility, setInternalVisibility] =
		useState<ColumnVisibilityState>(initialVisibility)
	const [internalSelection, setInternalSelection] = useState<RowSelectionState>(
		initialState?.rowSelection ?? {},
	)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		initialState?.columnFilters ?? [],
	)
	const [internalFullscreen, setInternalFullscreen] = useState(defaultFullscreen)

	const sorting = controlledSorting ?? internalSorting
	const columnVisibility = controlledColumnVisibility ?? internalVisibility
	const rowSelection = controlledRowSelection ?? internalSelection
	const fullscreen = controlledFullscreen ?? internalFullscreen

	const tableAreaRef = useRef<HTMLDivElement>(null)
	const regionRef = useRef<HTMLDivElement>(null)

	const handleSorting = useCallback(
		(updater: Updater<SortingState>) => {
			const next = typeof updater === "function" ? updater(sorting) : updater
			if (controlledSorting === undefined) setInternalSorting(next)
			onSortingChange?.(next)
		},
		[controlledSorting, onSortingChange, sorting],
	)

	const handleVisibility = useCallback(
		(updater: Updater<ColumnVisibilityState>) => {
			const next = typeof updater === "function" ? updater(columnVisibility) : updater
			if (controlledColumnVisibility === undefined) setInternalVisibility(next)

			if (storageName && typeof window !== "undefined") {
				try {
					window.localStorage.setItem(storageName, JSON.stringify(next))
				} catch {
					// Quota full or storage disabled: only the preference is lost.
				}
			}

			onColumnVisibilityChange?.(next)
		},
		[columnVisibility, controlledColumnVisibility, onColumnVisibilityChange, storageName],
	)

	const handleSelection = useCallback(
		(updater: Updater<RowSelectionState>) => {
			const next = typeof updater === "function" ? updater(rowSelection) : updater
			if (controlledRowSelection === undefined) setInternalSelection(next)
			onRowSelectionChange?.(next)
		},
		[controlledRowSelection, onRowSelectionChange, rowSelection],
	)

	const handleFilters = useCallback(
		(updater: Updater<ColumnFiltersState>) => {
			const next = typeof updater === "function" ? updater(columnFilters) : updater
			setColumnFilters(next)
			onColumnFiltersChange?.(next)
		},
		[columnFilters, onColumnFiltersChange],
	)

	const setFullscreen = useCallback(
		(next: boolean) => {
			if (controlledFullscreen === undefined) setInternalFullscreen(next)
			onFullscreenChange?.(next)
		},
		[controlledFullscreen, onFullscreenChange],
	)

	const exitFullscreen = useCallback(() => setFullscreen(false), [setFullscreen])
	useFullscreenTableModality(fullscreen, regionRef, exitFullscreen)

	const resolveMenuLabel = useCallback(
		(row: TData) =>
			typeof rowActionsMenuLabel === "function"
				? rowActionsMenuLabel(row)
				: (rowActionsMenuLabel ?? strings.actions.menuLabel),
		[rowActionsMenuLabel, strings.actions.menuLabel],
	)

	const allColumns = useMemo<LegacyColumnDef<TData, TValue>[]>(() => {
		const base = enableRowSelection
			? addSelectionColumn<TData, TValue>(resolvedColumns, strings)
			: resolvedColumns

		if (!rowActions) return base

		return [
			...base,
			{
				id: "actions",
				header: strings.actions.triggerLabel,
				cell: ({ row }: { row: { original: TData } }) => (
					<DataTableActions
						row={row.original}
						actions={rowActions}
						menuLabel={resolveMenuLabel(row.original)}
						displayMode={rowActionsDisplayMode}
						responsiveBreakpoint={rowActionsBreakpoint}
						strings={strings}
					/>
				),
				enableSorting: false,
				enableHiding: false,
				meta: { align: "end" },
				size: 40,
			} as LegacyColumnDef<TData, TValue>,
		]
	}, [
		enableRowSelection, resolveMenuLabel, resolvedColumns, rowActions, rowActionsBreakpoint,
		rowActionsDisplayMode, strings,
	])

	const table = useLegacyTable<TData>({
		data,
		columns: allColumns as LegacyColumnDef<TData, unknown>[],
		state: { sorting, columnVisibility, rowSelection, columnFilters },
		enableSorting,
		manualSorting,
		enableRowSelection,
		enableMultiRowSelection,
		enableSubRowSelection,
		onSortingChange: enableSorting ? handleSorting : undefined,
		onRowSelectionChange: enableRowSelection ? handleSelection : undefined,
		onColumnVisibilityChange: handleVisibility,
		onColumnFiltersChange: enableFiltering ? handleFilters : undefined,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(enableFiltering ? { getFilteredRowModel: getFilteredRowModel() } : {}),
		getRowId,
	})

	const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
	const clearSelection = useCallback(() => table.resetRowSelection(), [table])

	const selectionContext: DataTableSelectionToolbarContext<TData> = {
		table,
		selectedRows,
		selectedRowCount: selectedRows.length,
		totalRowCount: totalRowCount ?? data.length,
		rowSelection,
		clearSelection,
	}

	const bulkActionNode =
		typeof bulkActions === "function" ? bulkActions(selectionContext) : bulkActions

	const selectionNode = (() => {
		if (!enableRowSelection || selectedRows.length === 0) return null
		if (selectionToolbar === null || selectionToolbar === false) return null
		if (typeof selectionToolbar === "function") return selectionToolbar(selectionContext)
		if (selectionToolbar !== undefined) return selectionToolbar

		/*
		 * The shared bar, docked so the selection stays reachable after scrolling far away.
		 * The root's `container-type: inline-size` does not trap the fixed dock.
		 */
		return (
			<BatchActionBar
				selectedCount={selectedRows.length}
				totalCount={selectionContext.totalRowCount}
				onClear={clearSelection}
				className={selectionToolbarClassName}
				strings={{
					summary: (count, total) => strings.selection.summary(count, total ?? selectionContext.totalRowCount),
					clear: strings.selection.clear,
				}}
			>
				{bulkActionNode}
			</BatchActionBar>
		)
	})()

	const bodyMaxHeight = toCssLength(maxBodyHeight)
	const scrolls = fullscreen || fillAvailableHeight || bodyMaxHeight !== undefined

	const hasTopbar = !!(
		topbarContent ||
		topbarEnd ||
		enableColumnVisibility ||
		showFullscreenToggle ||
		(enableFiltering && filterColumn)
	)

	const pager = pageCount !== undefined && pageCount > 1 && (
		<>
			<Separator />
			<div className={styles.footer}>
				{totalRowCount !== undefined && pageSize !== undefined && page !== undefined && (
					<Text type="secondary">
						{strings.pagination.summary(
							Math.min((page - 1) * pageSize + 1, totalRowCount),
							Math.min(page * pageSize, totalRowCount),
							totalRowCount,
						)}
					</Text>
				)}
				<Pagination
					page={page ?? 1}
					total={pageCount}
					onPageChange={(next) => onPageChange?.(next)}
					strings={{
						label: strings.pagination.label,
						previous: strings.pagination.previous,
						next: strings.pagination.next,
						page: strings.pagination.page,
						morePages: strings.pagination.morePages,
					}}
				/>
			</div>
		</>
	)

	return (
		<DataTableSizeContext.Provider value={resolvedSize}>
			{/* Full screen covers navigation too, so it is modal: role and `aria-modal` here, behaviour from `useFullscreenTableModality`. */}
			<div
				ref={regionRef}
				role={fullscreen ? "dialog" : undefined}
				aria-modal={fullscreen ? true : undefined}
				aria-label={fullscreen ? strings.accessibility.fullscreenRegion : undefined}
				data-slot="data-table"
				data-size={resolvedSize}
				data-surface={surface}
				data-fullscreen={fullscreen || undefined}
				style={{ ...style, ...(bodyMaxHeight ? { "--data-table-body-max-height": bodyMaxHeight } : {}) } as CSSProperties}
				className={cx(
					"data-table--component",
					styles.root,
					fillAvailableHeight && styles.rootFill,
					wrapperClassName,
				)}
			>
				{hasTopbar && (
					<div className={cx(styles.topbar, stickyToolbar && styles.topbarSticky)}>
						<div className={cx(styles.topbarGrid, topbarClassName)}>
							<div className={styles.topbarStart}>
								{enableFiltering && !!filterColumn && (
									<Input
										value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
										onChange={(event) =>
											table.getColumn(filterColumn)?.setFilterValue(event.target.value)
										}
										placeholder={filterPlaceholder ?? strings.filter.searchPlaceholder}
										clearable
										onClear={() => table.getColumn(filterColumn)?.setFilterValue("")}
										className={styles.filterInput}
									/>
								)}
								{topbarContent}
							</div>
							<div className={styles.topbarEnd}>
								{topbarEnd}
								<DataTableToolbar
									table={table}
									tableAreaRef={tableAreaRef}
									fullscreen={fullscreen}
									onFullscreenChange={setFullscreen}
									showFullscreenToggle={showFullscreenToggle}
									enableColumnVisibility={enableColumnVisibility}
									labelVisibility={toolbarLabelVisibility}
									strings={strings}
								/>
							</div>
						</div>
						<Separator />
					</div>
				)}

				{selectionNode}

				<div
					ref={tableAreaRef}
					className={cx(styles.tableArea, scrolls && styles.tableAreaScrolls)}
				>
					{/* The primitive makes its container a tab stop only while it scrolls; the name is ours to give. */}
					<Table
						strings={{ scrollRegion: strings.accessibility.scrollRegion }}
						stickyHeader={stickyHeader}
						className={cx(styles.table, className)}
						containerClassName={cx(
							styles.tableContainer,
							scrolls && styles.tableContainerScrolls,
							bodyMaxHeight !== undefined && styles.tableContainerBounded,
							tableContainerClassName,
						)}
					>
						<DataTableHeader
							table={table}
							stickyHeader={stickyHeader}
							headerClassName={headerClassName}
							cellClassName={cellClassName}
							stickyFirstColumn={stickyFirstColumn}
							hasSelectionColumn={enableRowSelection}
							columnGroups={columnGroups}
							headerTransparent={headerTransparent}
						/>
						<DataTableBody
							table={table}
							onRowClick={onRowClick}
							emptyStateMessage={emptyStateMessage}
							emptyStateAction={emptyStateAction}
							cellClassName={cellClassName}
							rowClassName={rowClassName}
							stickyFirstColumn={stickyFirstColumn}
							hasSelectionColumn={enableRowSelection}
							striped={striped}
							strings={strings}
						/>
					</Table>
				</div>

				{pager}

				{!!footerContent && <div className={styles.footer}>{footerContent}</div>}
			</div>
		</DataTableSizeContext.Provider>
	)
}

void flexRender
export type { ReactNode }
