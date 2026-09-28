/**
 * Expandable rows: the toggle at a row's start, and the panel it opens under the row with the
 * panel's loading, error and empty states. The body decides which panels exist; this draws one.
 */
import type { RowData } from "@tanstack/react-table"
import type { LegacyRow } from "@tanstack/react-table/legacy"
import { ChevronRightIcon } from "lucide-react"
import {
	Component, Fragment, Suspense, useCallback, useEffect, useLayoutEffect, useRef,
	type ReactNode,
} from "react"

import { Button } from "@/components/base/buttons"
import { ContentSkeleton } from "@/components/base/skeleton"
import { TableRow } from "@/components/base/table"
import { Text } from "@/components/base/typography"
import { useAsyncPreview } from "@/components/features/async-preview/use-async-preview"

import type { DataTableStrings } from "./table.strings"
import type { DataTableExpandedRow as ExpandedRowConfig, DataTableExpandedRowContext } from "./table.types"
import styles from "./table.module.css"

const noop = () => {}

export interface ExpandToggleProps<TData extends RowData> {
	row: LegacyRow<TData>
	/** The id of the panel this toggle opens. */
	panelId: string
	strings: DataTableStrings
}

/** The chevron at a row's start. A row `canExpand` refuses gets nothing, and never opens. */
export function ExpandToggle<TData extends RowData>({ row, panelId, strings }: ExpandToggleProps<TData>) {
	if (!row.getCanExpand()) return null
	const open = row.getIsExpanded()

	return (
		<button
			type="button"
			id={`${panelId}-toggle`}
			aria-expanded={open}
			// The panel exists only while open, so only then is there something to control.
			aria-controls={open ? panelId : undefined}
			aria-label={open ? strings.expansion.hide(row.index) : strings.expansion.show(row.index)}
			// Drawn at the icon's size; the TARGET must not be under 24px. See styles/targets.css.
			data-hit-area
			className={styles.expandToggle}
			onClick={(event) => {
				// Opening a panel must not also fire a clickable row.
				event.stopPropagation()
				row.toggleExpanded()
			}}
		>
			<ChevronRightIcon aria-hidden />
		</button>
	)
}

interface PanelMessageProps {
	children: ReactNode
	action?: ReactNode
	/** Announces the line: an error the reader just caused by opening the row. */
	alert?: boolean
}

function PanelMessage({ children, action, alert = false }: PanelMessageProps) {
	return (
		<div role={alert ? "alert" : undefined} className={styles.expandedMessage}>
			<Text tag="span" type="secondary">{children}</Text>
			{action}
		</div>
	)
}

function RetryButton({ label, onRetry }: { label: string; onRetry: () => void }) {
	return (
		<Button type="button" tone="neutral" appearance="outline" onClick={onRetry}>
			{label}
		</Button>
	)
}

interface PanelBoundaryProps {
	strings: DataTableStrings
	children: ReactNode
}

interface PanelBoundaryState {
	failed: boolean
	/** Bumped by Retry, remounting what the boundary wraps. */
	attempt: number
}

/** Keeps a panel that throws inside its own row. Retry remounts the panel's content. */
class PanelBoundary extends Component<PanelBoundaryProps, PanelBoundaryState> {
	state: PanelBoundaryState = { failed: false, attempt: 0 }

	static getDerivedStateFromError(): Partial<PanelBoundaryState> {
		return { failed: true }
	}

	retry = () => this.setState((state) => ({ failed: false, attempt: state.attempt + 1 }))

	render() {
		const { strings, children } = this.props
		if (this.state.failed) {
			return (
				<PanelMessage alert action={<RetryButton label={strings.expansion.retry} onRetry={this.retry} />}>
					{strings.expansion.error}
				</PanelMessage>
			)
		}
		return <Fragment key={this.state.attempt}>{children}</Fragment>
	}
}

interface PanelContentProps<TData extends RowData> {
	row: TData
	config: ExpandedRowConfig<TData, unknown>
	strings: DataTableStrings
	collapse: () => void
}

/**
 * `render` runs here, inside the boundary and the Suspense fallback, rather than in the row: a
 * render function called by the parent would throw or suspend outside both.
 */
function RenderedPanel<TData extends RowData>({ row, config, collapse }: PanelContentProps<TData>) {
	return <>{config.render(row, { detail: undefined, refresh: noop, collapse })}</>
}

/**
 * `onLoad` through the AsyncPreview machinery: closing aborts, only the newest request writes,
 * and the result is kept per row for the hook's staleness window.
 */
function LoadedPanel<TData extends RowData>({
	row, config, strings, collapse, open, cacheKey,
}: PanelContentProps<TData> & { open: boolean; cacheKey: string }) {
	const { onLoad, render } = config
	const preview = useAsyncPreview<unknown, TData>({
		type: "data-table-row",
		context: row,
		cacheKey,
		open,
		onShow: ({ signal }) => (onLoad ? onLoad(row, { signal }) : Promise.resolve(undefined)),
	})

	if (preview.status === "error") {
		return (
			<PanelMessage alert action={<RetryButton label={strings.expansion.retry} onRetry={preview.refresh} />}>
				{strings.expansion.error}
			</PanelMessage>
		)
	}
	if (preview.status === "empty") return <PanelMessage>{strings.expansion.empty}</PanelMessage>
	if (preview.status !== "success") return <ContentSkeleton lines={3} label={strings.expansion.loading} />

	const context: DataTableExpandedRowContext<unknown> = {
		detail: preview.data,
		refresh: preview.refresh,
		collapse,
	}
	return <>{render(row, context)}</>
}

export interface DataTableExpandedRowProps<TData extends RowData> {
	row: LegacyRow<TData>
	/** `false` while the panel plays its closing animation, before the body drops it. */
	open: boolean
	/** Called once the panel has finished closing. */
	onExited: (rowId: string) => void
	/** The visible column count, so the panel spans the row. */
	colSpan: number
	panelId: string
	cacheKey: string
	config: ExpandedRowConfig<TData, unknown>
	strings: DataTableStrings
}

/** One open row's panel: a row of its own, spanning the columns, under the row it belongs to. */
export function DataTableExpandedRow<TData extends RowData>({
	row, open, onExited, colSpan, panelId, cacheKey, config, strings,
}: DataTableExpandedRowProps<TData>) {
	const rowRef = useRef<HTMLTableRowElement>(null)
	const motionRef = useRef<HTMLDivElement>(null)
	const toggleId = `${panelId}-toggle`
	const rowId = row.id

	const collapse = useCallback(() => row.toggleExpanded(false), [row])

	// Focus inside a closing panel goes back to its toggle, never to a node about to vanish.
	useLayoutEffect(() => {
		if (open) return
		if (rowRef.current?.contains(document.activeElement)) document.getElementById(toggleId)?.focus()
	}, [open, toggleId])

	/*
	 * Dropped once the shrink has run. A timer rather than `transitionend`: a background tab
	 * never fires the event, and under reduced motion there is no transition to end.
	 */
	useEffect(() => {
		if (open) return
		const motion = motionRef.current
		const seconds = motion ? Number.parseFloat(getComputedStyle(motion).transitionDuration) : 0
		if (!seconds) {
			onExited(rowId)
			return
		}
		const timer = window.setTimeout(() => onExited(rowId), seconds * 1000 + 50)
		return () => window.clearTimeout(timer)
	}, [open, onExited, rowId])

	const content = config.onLoad ? (
		<LoadedPanel row={row.original} config={config} strings={strings} collapse={collapse} open={open} cacheKey={cacheKey} />
	) : (
		<RenderedPanel row={row.original} config={config} strings={strings} collapse={collapse} />
	)

	return (
		<TableRow
			ref={rowRef}
			id={panelId}
			data-slot="data-table-expanded-row"
			data-state={open ? "open" : "closing"}
			// A closing panel is on its way out: nothing in it takes focus or a click.
			inert={!open || undefined}
			className={styles.expandedRow}
		>
			<td colSpan={colSpan} className={styles.expandedCell}>
				{/* Pinned to the visible part of a wide table, outside the clip (a clipping ancestor would become the sticky box). */}
				<div className={styles.expandedPin}>
					<div ref={motionRef} className={styles.expandedMotion}>
						<div className={styles.expandedClip}>
							<div className={styles.expandedContent}>
								<PanelBoundary strings={strings}>
									<Suspense fallback={<ContentSkeleton lines={3} label={strings.expansion.loading} />}>
										{content}
									</Suspense>
								</PanelBoundary>
							</div>
						</div>
					</div>
				</div>
			</td>
		</TableRow>
	)
}
