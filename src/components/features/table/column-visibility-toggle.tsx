/** The columns menu: one checkbox per hideable column. */
import { Settings2Icon } from "lucide-react"
import type { RowData } from "@tanstack/react-table"

import { ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import { cx } from "@/lib/cx"

import { defaultDataTableStrings } from "./table.strings"
import type { ColumnVisibilityToggleProps } from "./table.types"

export function ColumnVisibilityToggle<TData extends RowData>({
	table,
	className,
	align = "end",
	labelVisibility = "hidden",
	strings = defaultDataTableStrings,
	buttonProps,
}: ColumnVisibilityToggleProps<TData>) {
	const columns = table.getAllColumns().filter((column) => column.getCanHide())
	if (columns.length === 0) return null

	const actions: ActionDefinition[] = columns.map((column) => {
		const header = column.columnDef.header
		return {
			id: column.id,
			type: "checkbox",
			// Headers are often components; the formatter makes the column id readable.
			label: strings.columnVisibility.formatLabel(
				column.id,
				typeof header === "string" ? header : undefined,
			),
			group: strings.columnVisibility.title,
			checked: column.getIsVisible(),
			onCheckedChange: (checked) => column.toggleVisibility(checked),
		}
	})

	return (
		<ActionMenu
			actions={actions}
			icon={Settings2Icon}
			label={strings.columnVisibility.triggerLabel}
			labelVisibility={labelVisibility}
			align={align}
			// Keeps column order (the menu would otherwise move destructive entries last).
			preserveOrder
			buttonProps={{
				tone: "neutral",
				buttonStyle: "ghost",
				iconOnly: labelVisibility === "hidden",
				...buttonProps,
				className: cx("column-visibility-toggle--component", buttonProps?.className, className),
			}}
		/>
	)
}
