/** Helpers several table parts need and none owns. */
import type { LegacyColumnDef, LegacyRow, LegacyTable } from "@tanstack/react-table/legacy"
import type { RowData } from "@tanstack/react-table"

import { Checkbox } from "@/components/base/choice-inputs"
import { VisuallyHidden } from "@/components/base/display"

import { ExpandToggle } from "./data-table-expanded-row"
import { defaultDataTableStrings, type DataTableStrings } from "./table.strings"
import type { ClassNameFor } from "./table.types"
import styles from "./table.module.css"

/** The gutter columns' ids. Their cells keep the widths the pinned offsets are computed from. */
export const EXPAND_COLUMN_ID = "expand"
const SELECTION_COLUMN_ID = "selection"

/**
 * Which cells stay put when the table scrolls sideways: the leading checkbox and expand toggle,
 * when there are any, and the identity column after them, so a row never loses its name.
 */
export function resolveCellClassName<TData extends RowData>(
	columnId: string,
	row: LegacyRow<TData> | null,
	cellClassName: ClassNameFor<TData> | undefined,
	stickyFirstColumn: boolean,
	cellIndex: number,
	hasSelectionColumn = false,
	hasExpandColumn = false,
): string {
	const custom =
		typeof cellClassName === "function" ? cellClassName(columnId, row) : (cellClassName ?? "")
	const base =
		columnId === EXPAND_COLUMN_ID ? `${custom} ${styles.expandCell}`
		: columnId === SELECTION_COLUMN_ID ? `${custom} ${styles.selectionCell}`
		: custom

	const gutter = (hasSelectionColumn ? 1 : 0) + (hasExpandColumn ? 1 : 0)
	if (!stickyFirstColumn || cellIndex > gutter) return base
	if (cellIndex === 0) return `${base} ${styles.stickyColumn}`
	// Beside the checkbox: the toggle, or the identity column when there is no toggle.
	if (hasSelectionColumn && cellIndex === 1) return `${base} ${styles.stickyColumnNext}`
	return `${base} ${styles.stickyColumnAfterGutter}`
}

/** How many leading cells are pinned with `stickyFirstColumn`: the gutter columns and the identity one. */
export function pinnedCellCount(hasSelectionColumn: boolean, hasExpandColumn: boolean): number {
	return 1 + (hasSelectionColumn ? 1 : 0) + (hasExpandColumn ? 1 : 0)
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
		id: SELECTION_COLUMN_ID,
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
		/* Must agree with --_selection-width (table.module.css), which offsets the pinned column beside it. */
		size: 40,
	} as LegacyColumnDef<TData, TValue>

	return [selection, ...columns]
}

/** Prepends the expand toggle column, built here so it always agrees with `expandedRow`. */
export function addExpandColumn<TData extends RowData, TValue = unknown>(
	columns: LegacyColumnDef<TData, TValue>[],
	strings: DataTableStrings,
	panelId: (rowId: string) => string,
): LegacyColumnDef<TData, TValue>[] {
	const expand = {
		id: EXPAND_COLUMN_ID,
		header: () => <VisuallyHidden>{strings.expansion.column}</VisuallyHidden>,
		cell: ({ row }: { row: LegacyRow<TData> }) => (
			<ExpandToggle row={row} panelId={panelId(row.id)} strings={strings} />
		),
		enableSorting: false,
		enableHiding: false,
		/* Must agree with --_expand-width (table.module.css), which offsets the pinned column after it. */
		size: 24,
	} as LegacyColumnDef<TData, TValue>

	return [expand, ...columns]
}
