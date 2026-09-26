/** Helpers several table parts need and none owns. */
import type { LegacyColumnDef, LegacyRow, LegacyTable } from "@tanstack/react-table/legacy"
import type { RowData } from "@tanstack/react-table"

import { Checkbox } from "@/components/base/choice-inputs"

import { defaultDataTableStrings, type DataTableStrings } from "./table.strings"
import type { ClassNameFor } from "./table.types"
import styles from "./table.module.css"

/**
 * Which cells stay put when the table scrolls sideways. With selection on, the pinned group
 * is the checkbox and the identity column after it, so a row never loses its name.
 */
export function resolveCellClassName<TData extends RowData>(
	columnId: string,
	row: LegacyRow<TData> | null,
	cellClassName: ClassNameFor<TData> | undefined,
	stickyFirstColumn: boolean,
	cellIndex: number,
	hasSelectionColumn = false,
): string {
	const base =
		typeof cellClassName === "function" ? cellClassName(columnId, row) : (cellClassName ?? "")

	if (!stickyFirstColumn) return base
	if (cellIndex === 0) return `${base} ${styles.stickyColumn}`
	if (hasSelectionColumn && cellIndex === 1) return `${base} ${styles.stickyColumnNext}`
	return base
}

export function getSelectedRowsData<TData extends RowData>(table: LegacyTable<TData>): TData[] {
	return table.getSelectedRowModel().rows.map((row) => row.original)
}

/** Prepends the selection column, built here so it always agrees with `enableRowSelection`. */
export function addSelectionColumn<TData extends RowData, TValue = unknown>(
	columns: LegacyColumnDef<TData, TValue>[],
	strings: DataTableStrings = defaultDataTableStrings,
): LegacyColumnDef<TData, TValue>[] {
	const selection = {
		id: "selection",
		header: ({ table }: { table: LegacyTable<TData> }) => (
			/* The kit's Checkbox is a native input: `onChange`, reading the next state from the event. */
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				// Some but not all selected: without it a partial page shows an empty box.
				indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
				onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
				aria-label={strings.selection.selectAll}
			/>
		),
		cell: ({ row }: { row: LegacyRow<TData> }) => (
			<Checkbox
				checked={row.getIsSelected()}
				disabled={!row.getCanSelect()}
				onChange={(event) => row.toggleSelected(event.target.checked)}
				// Ticking a box must not trigger a clickable row.
				onClick={(event) => event.stopPropagation()}
				aria-label={strings.selection.row(row.index)}
			/>
		),
		enableSorting: false,
		enableHiding: false,
		/* Must agree with --table-selection-w, which offsets the pinned column beside it. */
		size: 40,
	} as LegacyColumnDef<TData, TValue>

	return [selection, ...columns]
}
