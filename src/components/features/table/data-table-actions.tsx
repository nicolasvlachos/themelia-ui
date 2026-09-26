/**
 * Row actions: a menu, buttons, or whichever fits. `auto` measures the container, not the
 * window, since the same table runs in drawers and at page width.
 */
import { MoreHorizontalIcon } from "lucide-react"
import type { RowData } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState } from "react"

import { ActionButtons, ActionMenu, resolveContextActions } from "@/components/base/action-menu"
import { cx } from "@/lib/cx"

import { defaultDataTableStrings } from "./table.strings"
import type { DataTableActionsProps } from "./table.types"
import styles from "./table.module.css"

export function DataTableActions<TData extends RowData>({
	row,
	actions,
	menuLabel,
	displayMode = "menu",
	responsiveBreakpoint = 1040,
	strings = defaultDataTableStrings,
}: DataTableActionsProps<TData>) {
	const hostRef = useRef<HTMLDivElement>(null)
	const [wide, setWide] = useState(false)

	useEffect(() => {
		if (displayMode !== "auto") return
		const element = hostRef.current
		if (!element) return

		/* Measures the nearest table: the actions cell alone would always report no room. */
		const measured = element.closest("table") ?? element
		const observer = new ResizeObserver(([entry]) => {
			if (entry) setWide(entry.contentRect.width >= responsiveBreakpoint)
		})
		observer.observe(measured)
		return () => observer.disconnect()
	}, [displayMode, responsiveBreakpoint])

	/* The shared resolver binds predicates and handlers to the row; `href` is stripped (the table never navigates). */
	const definitions = useMemo(
		() => resolveContextActions<TData>(actions, row, { stripHref: true }),
		[actions, row],
	)

	if (definitions.length === 0) return null

	const inline = displayMode === "inline" || (displayMode === "auto" && wide)

	return (
		// The wrapper stops a press on an action from also firing the row's own click.
		<div
			ref={hostRef}
			className={cx("data-table-actions--component", styles.rowActions)}
			onClick={(event) => event.stopPropagation()}
		>
			{inline ? (
				<ActionButtons actions={definitions} />
			) : (
				<ActionMenu
					actions={definitions}
					icon={MoreHorizontalIcon}
					strings={{ trigger: menuLabel ?? strings.actions.menuLabel }}
					align="end"
					buttonProps={{ tone: "neutral", buttonStyle: "ghost", iconOnly: true }}
				/>
			)}
		</div>
	)
}
