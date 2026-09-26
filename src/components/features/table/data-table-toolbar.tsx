/**
 * The table's own controls (scroll arrows, columns menu, full screen) as one bordered
 * group that renders nothing when empty. Scroll arrows show only while the table overflows,
 * which only the table can measure.
 */
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { RowData } from "@tanstack/react-table"

import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/base/toolbar"
import { cx } from "@/lib/cx"

import { ColumnVisibilityToggle } from "./column-visibility-toggle"
import { FullscreenToggle } from "./fullscreen-toggle"
import { defaultDataTableStrings, defaultDataTableToolbarLabel } from "./table.strings"
import type { DataTableToolbarProps } from "./table.types"
import { useDataTableScrollState } from "./use-table-scroll"
import styles from "./table.module.css"

export function DataTableToolbar<TData extends RowData>({
	table,
	tableAreaRef,
	fullscreen,
	onFullscreenChange,
	showFullscreenToggle = false,
	enableColumnVisibility = false,
	labelVisibility = "hidden",
	strings = defaultDataTableStrings,
}: DataTableToolbarProps<TData>) {
	// `fullscreen` in the deps: the viewport-sized layout changes what overflows.
	const scroll = useDataTableScrollState(tableAreaRef, { deps: [fullscreen] })

	const hideable = enableColumnVisibility
		? table.getAllColumns().filter((column) => column.getCanHide())
		: []

	const hasArrows = scroll.canScrollLeft || scroll.canScrollRight
	const hasColumns = hideable.length > 0
	if (!hasArrows && !hasColumns && !showFullscreenToggle) return null

	return (
		<Toolbar
			aria-label={strings.toolbarLabel ?? defaultDataTableToolbarLabel}
			className={cx("data-table-toolbar--component", styles.toolbar)}
		>
			{hasArrows && (
				<>
					<ToolbarButton
						type="button"
						tone="neutral"
						buttonStyle="ghost"
						iconOnly
						aria-label={strings.toolbar.scrollLeft}
						disabled={!scroll.canScrollLeft}
						onClick={scroll.scrollLeft}
					>
						<ChevronLeftIcon />
					</ToolbarButton>
					<ToolbarButton
						type="button"
						tone="neutral"
						buttonStyle="ghost"
						iconOnly
						aria-label={strings.toolbar.scrollRight}
						disabled={!scroll.canScrollRight}
						onClick={scroll.scrollRight}
					>
						<ChevronRightIcon />
					</ToolbarButton>
					{(hasColumns || showFullscreenToggle) && (
						<ToolbarSeparator className={styles.toolbarDivider} />
					)}
				</>
			)}

			{hasColumns && (
				<>
					<ColumnVisibilityToggle
						table={table}
						strings={strings}
						labelVisibility={labelVisibility}
						buttonProps={{ render: <ToolbarButton /> }}
					/>
					{showFullscreenToggle && <ToolbarSeparator className={styles.toolbarDivider} />}
				</>
			)}

			{showFullscreenToggle && (
				<FullscreenToggle
					fullscreen={fullscreen}
					onFullscreenChange={onFullscreenChange}
					enterLabel={strings.toolbar.enterFullscreen}
					exitLabel={strings.toolbar.exitFullscreen}
					render={<ToolbarButton />}
				/>
			)}
		</Toolbar>
	)
}
