/**
 * DataView — the filter bar and the table, as one surface. The bar renders inside the
 * table's topbar, sharing a row with its scroll arrows and columns menu. `tabsDisplay`
 * shows saved views as a tab row or, where space is short, a select.
 */
import type { RowData } from "@tanstack/react-table"

import {
	FilterLayout, FilterProvider, FilterTabs,
} from "@/components/features/filters"
import { DataTable } from "@/components/features/table"
import { Select } from "@/components/base/choice-inputs"
import { Alert, AlertDescription } from "@/components/base/feedback"
import { Pagination } from "@/components/base/navigation"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultDataViewPaginationStrings, defaultDataViewStrings } from "./data-view.strings"
import type {
	DataViewPaginationProps, DataViewProps, DataViewShellProps, DataViewTableFrameProps,
	DataViewToolbarProps, SavedViewTabsProps,
} from "./data-view.types"
import { useDataView } from "./use-data-view"
import styles from "./data-view.module.css"

/* ── The plain shells ─────────────────────────────────────────────────────────────── */

export function DataViewShell({
	children,
	header,
	toolbar,
	footer,
	emptySlot,
	empty = false,
	className,
	contentClassName,
}: DataViewShellProps) {
	return (
		<section
			data-slot="data-view-shell"
			className={cx("data-view-shell--component", styles.shell, className)}
		>
			{!!header && <div className={styles.shellRegion}>{header}</div>}
			{!!toolbar && <div className={styles.shellRegion}>{toolbar}</div>}
			<div className={cx(styles.shellContent, contentClassName)}>
				{empty ? emptySlot : children}
			</div>
			{!!footer && <div className={styles.shellRegion}>{footer}</div>}
		</section>
	)
}

export function DataViewToolbar({
	leading,
	search,
	filters,
	views,
	actions,
	className,
}: DataViewToolbarProps) {
	return (
		<div
			data-slot="data-view-toolbar"
			className={cx("data-view-toolbar--component", styles.toolbar, className)}
		>
			<div className={styles.toolbarInner}>
				<Stack direction="horizontal" wrap align="center" gap="md" className={styles.toolbarLeading}>
					{leading}
					{search}
					{filters}
					{views}
				</Stack>
				{!!actions && (
					<Stack direction="horizontal" wrap align="center" gap="md" className={styles.toolbarActions}>
						{actions}
					</Stack>
				)}
			</div>
		</div>
	)
}

export function DataViewTableFrame({
	toolbar,
	children,
	footer,
	className,
	toolbarClassName,
	contentClassName,
	footerClassName,
}: DataViewTableFrameProps) {
	return (
		<section
			data-slot="data-view-table-frame"
			className={cx("data-view-table-frame--component", styles.frame, className)}
		>
			{!!toolbar && <div className={cx(styles.frameToolbar, toolbarClassName)}>{toolbar}</div>}
			<div className={cx(styles.frameContent, contentClassName)}>{children}</div>
			{!!footer && <div className={cx(styles.frameFooter, footerClassName)}>{footer}</div>}
		</section>
	)
}

/* ── Saved views ──────────────────────────────────────────────────────────────────── */

/** A saved-view row that is NOT filter-driven — for a consumer holding views themselves. */
export function SavedViewTabs({ views, value, onValueChange, className }: SavedViewTabsProps) {
	return (
		<Select
			value={value}
			options={views.map((view) => ({
				value: view.id,
				label: typeof view.label === "string" ? view.label : view.id,
				disabled: view.disabled,
			}))}
			onValueChange={(next) => next !== undefined && onValueChange(next)}
			className={cx("saved-view-tabs--component", styles.viewSelect, className)}
		/>
	)
}

/* ── Pagination ───────────────────────────────────────────────────────────────────── */

export function DataViewPagination({
	page,
	pageCount,
	total,
	onPageChange,
	disabled = false,
	className,
	strings,
}: DataViewPaginationProps) {
	const copy = { ...defaultDataViewPaginationStrings, ...strings }
	const hasPages = pageCount !== undefined && pageCount > 1
	// A single page needs no controls, but its result count still answers the filter.
	if (!hasPages && total == null) return null

	return (
		<div
			data-slot="data-view-pagination"
			data-disabled={disabled || undefined}
			className={cx("data-view-pagination--component", styles.pagination, className)}
		>
			{total != null && (
				<Text role="status" aria-live="polite" type="secondary" numeric>{total}</Text>
			)}
			{hasPages && <Pagination
				page={page}
				total={pageCount}
				onPageChange={(next) => onPageChange?.(next)}
				disabled={disabled}
				strings={copy}
			/>}
		</div>
	)
}

/* ── The whole thing ──────────────────────────────────────────────────────────────── */

export function DataView<TData extends RowData, TValue = unknown>({
	data,
	columns,
	filtering,
	strings,
	table,
	slots,
	className,
}: DataViewProps<TData, TValue>) {
	const { rows, failed } = useDataView({ data, filtering })
	const copy = { ...defaultDataViewStrings, ...strings }

	const tabs = filtering?.tabs ?? []
	const tabsDisplay = filtering?.tabsDisplay ?? "tabs"
	const showSelect = tabsDisplay === "select" && tabs.length > 0
	const hasAuxRow = !!slots?.toolbarStart || !!slots?.toolbarAfterFilters || showSelect
	const hasTopbar = !!filtering || !!slots?.topbarContent || hasAuxRow

	const frame = (
		<DataViewTableFrame className={cx("data-view--component", className)} footer={slots?.footer}>
			<DataTable<TData, TValue>
				{...table}
				columns={columns}
				data={rows as TData[]}
				/* The frame draws the card. */
				surface="flat"
				topbarContent={
					hasTopbar ? (
						<Stack gap="lg" className={styles.topbar}>
							{slots?.topbarContent}
							{failed && <Alert tone="warning" role="alert"><AlertDescription>{copy.filterError}</AlertDescription></Alert>}

							{hasAuxRow && (
								<Stack direction="horizontal" gap="md" align="center" wrap>
									{slots?.toolbarStart}
									{showSelect && <FilterTabs tabs={tabs} display="select" label={filtering?.tabsLabel} />}
									{slots?.toolbarAfterFilters}
								</Stack>
							)}

							{!!filtering && (
								<FilterLayout
									variant="compact"
									mobilePresentation={filtering.mobilePresentation}
									// The tab row only in `tabs` mode; the select covers the other.
									tabs={tabsDisplay === "tabs" ? tabs : undefined}
									showClearFilters={filtering.activeFilters.length > 0}
									className={styles.filters}
								/>
							)}
						</Stack>
					) : undefined
				}
				topbarEnd={slots?.topbarEnd}
			/>
		</DataViewTableFrame>
	)

	if (!filtering) return frame

	return (
		<FilterProvider
			filters={filtering.filters}
			activeFilters={filtering.activeFilters}
			onFilterChange={filtering.onFilterChange}
			navigating={filtering.isFiltering ?? false}
			strings={filtering.strings}
			onError={filtering.onError}
		>
			{frame}
		</FilterProvider>
	)
}
