/** The body rows, the panels open under them, and the row that stands in for them when there are none. */
import { flexRender } from "@tanstack/react-table"
import type { RowData } from "@tanstack/react-table"
import { PackageOpenIcon } from "lucide-react"
import { Fragment, useCallback, useState } from "react"

import { Empty } from "@/components/base/feedback"
import { TableBody, TableCell, TableRow } from "@/components/base/table"
import { cx } from "@/lib/cx"

import { DataTableExpandedRow } from "./data-table-expanded-row"
import { resolveCellClassName } from "./table-helpers"
import { defaultDataTableStrings } from "./table.strings"
import type { DataTableBodyProps } from "./table.types"
import styles from "./table.module.css"

const NO_ROWS: readonly string[] = []

/**
 * Rows whose panel is still shrinking: closed in the table's state, kept here until the panel
 * reports it has finished. Worked out while rendering (React's "adjusting state when a prop
 * changes"), so a closing panel is never unmounted and remounted on its way out.
 */
function useClosingPanels(openIds: readonly string[]) {
	const key = openIds.join("\u0000")
	const [state, setState] = useState(() => ({ key, open: openIds, closing: NO_ROWS }))

	let closing = state.closing
	if (state.key !== key) {
		const stillOpen = new Set(openIds)
		closing = [...new Set([...state.closing, ...state.open])].filter((id) => !stillOpen.has(id))
		setState({ key, open: openIds, closing })
	}

	const finish = useCallback((id: string) => {
		setState((current) =>
			current.closing.includes(id)
				? { ...current, closing: current.closing.filter((entry) => entry !== id) }
				: current,
		)
	}, [])

	return { closing, finish }
}

/** The body rows, and the row that stands in for all of them when there are none. */
export function DataTableBody<TData extends RowData>({
	table,
	onRowClick,
	emptyStateMessage,
	emptyStateAction,
	cellClassName,
	rowClassName,
	stickyFirstColumn = false,
	hasSelectionColumn = false,
	hasExpandColumn = false,
	expandedRow,
	expansionId = "",
	striped = false,
	strings = defaultDataTableStrings,
}: DataTableBodyProps<TData>) {
	const rows = table.getRowModel().rows
	/* Spans the visible columns only; `getAllColumns()` counts hidden ones too. */
	const colSpan = table.getVisibleFlatColumns().length

	// A row `canExpand` refuses never opens, even when a controlled `expanded` names it.
	const openIds = expandedRow
		? rows.filter((row) => row.getIsExpanded() && row.getCanExpand()).map((row) => row.id)
		: NO_ROWS
	const { closing, finish } = useClosingPanels(openIds)

	if (rows.length === 0) {
		return (
			<TableBody>
				<TableRow className={styles.emptyRow}>
					<TableCell colSpan={colSpan} className={styles.emptyCell}>
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
				const open = openIds.includes(row.id)
				const panelShown = !!expandedRow && (open || closing.includes(row.id))
				const panelId = `${expansionId}-panel-${row.id}`

				return (
					<Fragment key={row.id}>
						<TableRow
							data-state={selected ? "selected" : undefined}
							data-clickable={onRowClick ? "" : undefined}
							// The row and its panel read as one: the divider moves below the panel.
							data-expanded={panelShown || undefined}
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
										hasExpandColumn,
									)}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
						{panelShown && (
							<DataTableExpandedRow
								row={row}
								open={open}
								onExited={finish}
								colSpan={colSpan}
								panelId={panelId}
								cacheKey={`${expansionId}:${row.id}`}
								config={expandedRow}
								strings={strings}
							/>
						)}
					</Fragment>
				)
			})}
		</TableBody>
	)
}
