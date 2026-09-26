/** The body rows, and the row that stands in for them when there are none. */
import { flexRender } from "@tanstack/react-table"
import type { RowData } from "@tanstack/react-table"
import { PackageOpenIcon } from "lucide-react"

import { Empty } from "@/components/base/feedback"
import { TableBody, TableCell, TableRow } from "@/components/base/table"
import { cx } from "@/lib/cx"

import { resolveCellClassName } from "./table-helpers"
import { defaultDataTableStrings } from "./table.strings"
import type { DataTableBodyProps } from "./table.types"
import styles from "./table.module.css"

export function DataTableBody<TData extends RowData>({
	table,
	onRowClick,
	emptyStateMessage,
	emptyStateAction,
	cellClassName,
	rowClassName,
	stickyFirstColumn = false,
	hasSelectionColumn = false,
	striped = false,
	strings = defaultDataTableStrings,
}: DataTableBodyProps<TData>) {
	const rows = table.getRowModel().rows

	if (rows.length === 0) {
		return (
			<TableBody>
				<TableRow className={styles.emptyRow}>
					{/* Spans the visible columns only; `getAllColumns()` counts hidden ones too. */}
					<TableCell colSpan={table.getVisibleFlatColumns().length} className={styles.emptyCell}>
						<Empty
							title={emptyStateMessage ?? strings.emptyMessage}
							description={false}
							media={<PackageOpenIcon />}
							mediaVariant="icon-soft"
							action={emptyStateAction}
						/>
					</TableCell>
				</TableRow>
			</TableBody>
		)
	}

	return (
		<TableBody className="data-table-body--component" data-striped={striped || undefined}>
			{rows.map((row, rowIndex) => {
				const selected = row.getIsSelected()

				return (
					<TableRow
						key={row.id}
						data-state={selected ? "selected" : undefined}
						data-clickable={onRowClick ? "" : undefined}
						className={cx(
							styles.row,
							typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName,
						)}
						onClick={onRowClick ? () => onRowClick(row.original) : undefined}
					>
						{row.getVisibleCells().map((cell, cellIndex) => (
							<TableCell
								key={cell.id}
								align={cell.column.columnDef.meta?.align}
								className={resolveCellClassName(
									cell.column.id,
									row,
									cellClassName,
									stickyFirstColumn,
									cellIndex,
									hasSelectionColumn,
								)}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						))}
					</TableRow>
				)
			})}
		</TableBody>
	)
}
