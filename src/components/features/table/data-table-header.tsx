/**
 * The header rows: an optional band of column groups, then the columns. Sorting is the
 * kit's `TableHead`; this maps TanStack's `"asc" | "desc" | false` onto its
 * `"ascending" | "descending" | null`.
 */
import { flexRender } from "@tanstack/react-table"
import type { RowData } from "@tanstack/react-table"
import type { ReactNode } from "react"

import { TableHead, TableHeader, TableRow } from "@/components/base/table"
import { DisplayLabel } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { resolveCellClassName } from "./table-helpers"
import type { DataTableHeaderProps } from "./table.types"
import styles from "./table.module.css"

export function DataTableHeader<TData extends RowData>({
	table,
	stickyHeader = false,
	headerClassName,
	cellClassName,
	stickyFirstColumn = false,
	hasSelectionColumn = false,
	columnGroups,
	headerTransparent = false,
}: DataTableHeaderProps<TData>) {
	const headerGroups = table.getHeaderGroups()

	/**
	 * The band above the header row, built by walking the visible header order and coalescing
	 * runs, so hidden or reordered columns never make a band span the wrong cells.
	 */
	const groupRow = (() => {
		if (!columnGroups?.length || headerGroups.length === 0) return null

		const headers = headerGroups[0]?.headers ?? []
		const cells: ReactNode[] = []
		let current: string | null = null
		let span = 0

		const flush = () => {
			if (span === 0) return
			cells.push(
				<TableHead key={`group-${current ?? "none"}-${cells.length}`} colSpan={span} align="center" className={styles.groupHead}>
					{!!current && <DisplayLabel>{current}</DisplayLabel>}
				</TableHead>,
			)
		}

		headers.forEach((header, index) => {
			const name = columnGroups.find((group) => group.columns.includes(header.id))?.header ?? ""
			if (name !== current) {
				flush()
				current = name
				span = 1
			} else {
				span += 1
			}
			if (index === headers.length - 1) flush()
		})

		return <TableRow className={styles.groupRow}>{cells}</TableRow>
	})()

	return (
		<TableHeader
			className={cx("data-table-header--component", styles.header, headerTransparent && styles.headerTransparent, headerClassName)}
			data-sticky={stickyHeader || undefined}
		>
			{groupRow}

			{headerGroups.map((headerGroup) => (
				<TableRow key={headerGroup.id}>
					{headerGroup.headers.map((header, index) => {
						if (header.isPlaceholder) {
							return <TableHead key={header.id} aria-hidden />
						}

						const sorted = header.column.getIsSorted()

						return (
							<TableHead
								key={header.id}
								align={header.column.columnDef.meta?.align}
								sortable={header.column.getCanSort()}
								sortDirection={
									sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : null
								}
								onSort={() => header.column.toggleSorting()}
								className={cx(
									resolveCellClassName(
										header.id,
										null,
										cellClassName,
										stickyFirstColumn,
										index,
										hasSelectionColumn,
									),
									// Above the sticky header, so a pinned first column does not slide under it.
									stickyHeader &&
										stickyFirstColumn &&
										(index === 0 || (hasSelectionColumn && index === 1)) &&
										styles.stickyCorner,
								)}
							>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</TableHead>
						)
					})}
				</TableRow>
			))}
		</TableHeader>
	)
}
