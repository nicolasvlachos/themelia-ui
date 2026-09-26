import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"
import {
	createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState,
	type ComponentProps, type ReactNode,
} from "react"

import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { observeResize } from "@/lib/observers"
import { readScrollEdges } from "@/lib/scroll-edges"

import styles from "./table.module.css"
import { defaultTableStrings, type TableStrings } from "./table.strings"

/** Column alignment. Numeric columns read wrong anywhere but the end. */
export type TableAlign = "start" | "center" | "end"

const ALIGN = {
	start: styles.alignStart,
	center: styles.alignCenter,
	end: styles.alignEnd,
} satisfies Record<TableAlign, string>

export interface TableProps extends ComponentProps<"table"> {
	/** Class for the scroll container rather than the `<table>` itself. */
	containerClassName?: string
	/** Pins the header while the body scrolls. Only meaningful when the container is bounded. */
	stickyHeader?: boolean
	/** Overrides this table's own copy — the scroll region's name and `TableEmpty`'s message. */
	strings?: Partial<TableStrings>
}

/** Which way a sorted column is ordered. `null` is "sortable, but not the sort column". */
export type TableSortDirection = "ascending" | "descending" | null

/* `align` is an HTML attribute on `<td>`/`<th>` (a string), so the prop must replace it. */
export interface TableCellProps extends Omit<ComponentProps<"td">, "align"> {
	align?: TableAlign
	/** Allows the cell to wrap. Cells are nowrap by default so columns stay readable. */
	wrap?: boolean
}

export interface TableHeadProps extends Omit<ComponentProps<"th">, "align"> {
	align?: TableAlign
	wrap?: boolean
	/** Renders the label as a sort control. Pair with `sortDirection` and `onSort`. */
	sortable?: boolean
	/** This column's current direction, or `null` when another column is the sort. */
	sortDirection?: TableSortDirection
	onSort?: () => void
}

/** A plain string or number child is wrapped in typography; a node is left alone. */
function isSimpleText(value: ReactNode): value is string | number | bigint {
	return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
}

/* The caption registers itself, so the scroll region can be named by it. */
const TableCaptionContext = createContext<{ id: string; register: (present: boolean) => void } | null>(null)
/* The table's resolved copy, for parts that render words of their own. */
const TableStringsContext = createContext<TableStrings>(defaultTableStrings)

interface TableEdges {
	/** Scrolls on either axis, so the container becomes a tab stop and a named group. */
	scrollable: boolean
	start: boolean
	end: boolean
}

const RESTING: TableEdges = { scrollable: false, start: false, end: false }

export function Table({ className, containerClassName, strings, stickyHeader, ...props }: TableProps) {
	const copy = useMemo(() => ({ ...defaultTableStrings, ...strings }), [strings])
	const containerRef = useRef<HTMLDivElement>(null)
	const captionId = useId()
	const [hasCaption, setHasCaption] = useState(false)
	const [edges, setEdges] = useState<TableEdges>(RESTING)

	/*
	 * The container is a tab stop (and a named group) only while it actually scrolls; the
	 * same measurement drives the edge fades.
	 */
	const measure = useCallback(() => {
		const element = containerRef.current
		if (!element) return
		const inline = readScrollEdges(element)
		const next = {
			scrollable: inline.overflow || readScrollEdges(element, "vertical").overflow,
			start: inline.start,
			end: inline.end,
		}
		setEdges((old) =>
			old.scrollable === next.scrollable && old.start === next.start && old.end === next.end ? old : next,
		)
	}, [])

	useEffect(() => {
		const element = containerRef.current
		if (!element) return
		measure()
		element.addEventListener("scroll", measure, { passive: true })
		const stop = observeResize([element, ...element.children], measure)
		return () => {
			element.removeEventListener("scroll", measure)
			stop()
		}
	}, [measure])

	const caption = useMemo(() => ({ id: captionId, register: setHasCaption }), [captionId])
	const tableLabel = copy.scrollRegion ?? props["aria-label"]
	const tableLabelledBy = props["aria-labelledby"]

	return (
		<TableCaptionContext.Provider value={caption}>
			<TableStringsContext.Provider value={copy}>
				<div
					ref={containerRef}
					tabIndex={edges.scrollable ? 0 : undefined}
					/* A named group, not a region: many tables must not become indistinguishable landmarks. */
					role={edges.scrollable && (tableLabel || tableLabelledBy || hasCaption) ? "group" : undefined}
					aria-label={edges.scrollable ? tableLabel : undefined}
					aria-labelledby={edges.scrollable && !tableLabel ? (tableLabelledBy ?? (hasCaption ? captionId : undefined)) : undefined}
					data-sticky-header={stickyHeader ? "" : undefined}
					data-fade-start={edges.start ? "" : undefined}
					data-fade-end={edges.end ? "" : undefined}
					className={cx("table--container", styles.container, containerClassName)}
				>
					<table className={cx("table--component", styles.table, className)} {...props} />
				</div>
			</TableStringsContext.Provider>
		</TableCaptionContext.Provider>
	)
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
	return <thead className={cx("table--header", styles.header, className)} {...props} />
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
	return <tbody className={cx("table--body", styles.body, className)} {...props} />
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
	return <tfoot className={cx("table--footer", styles.footer, className)} {...props} />
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
	return <tr className={cx("table--row", styles.row, className)} {...props} />
}

export function TableHead({
	className,
	children,
	align,
	wrap,
	sortable,
	sortDirection = null,
	onSort,
	...props
}: TableHeadProps) {
	const label = isSimpleText(children) ? (
		<DisplayLabel className="table--head-text">{children}</DisplayLabel>
	) : (
		children
	)

	// `aria-sort` belongs on the <th>, not the button. The neutral state still shows an icon.
	const SortIcon =
		sortDirection === "ascending"
			? ArrowUpIcon
			: sortDirection === "descending"
				? ArrowDownIcon
				: ArrowUpDownIcon

	return (
		<th
			aria-sort={sortable ? (sortDirection ?? "none") : undefined}
			className={cx(
				"table--head",
				styles.head,
				align && ALIGN[align],
				wrap && styles.wrap,
				className,
			)}
			{...props}
		>
			{sortable ? (
				<button
					type="button"
					className={cx("table--head-sort", styles.headSort)}
					// Drawn under 24px; the TARGET must not be. See styles/targets.css.
					data-hit-area
					data-active={sortDirection ? "" : undefined}
					onClick={onSort}
				>
					{label}
					<SortIcon aria-hidden className={styles.headSortIcon} />
				</button>
			) : (
				label
			)}
		</th>
	)
}

export function TableCell({ className, children, align, wrap, ...props }: TableCellProps) {
	return (
		<td
			className={cx(
				"table--cell",
				styles.cell,
				align && ALIGN[align],
				wrap && styles.wrap,
				className,
			)}
			{...props}
		>
			{isSimpleText(children) ? (
				<Text tag="span" size="inherit" className="table--cell-text">
					{children}
				</Text>
			) : (
				children
			)}
		</td>
	)
}

export interface TableEmptyProps extends Omit<ComponentProps<"td">, "children"> {
	/** How many columns the table has, so the message spans all of them. */
	colSpan: number
	/** The message. Defaults to the table's `strings.empty`. */
	children?: ReactNode
}

/** The "no rows" row, spanning every column. */
export function TableEmpty({ className, colSpan, children, ...props }: TableEmptyProps) {
	const copy = useContext(TableStringsContext)
	return (
		<tr className={cx("table--row", styles.row)}>
			<td colSpan={colSpan} className={cx("table--empty", styles.empty, className)} {...props}>
				<Text tag="span" size="sm" type="secondary">
					{children ?? copy.empty}
				</Text>
			</td>
		</tr>
	)
}

export function TableCaption({ className, children, id, ...props }: ComponentProps<"caption">) {
	const context = useContext(TableCaptionContext)
	const register = context?.register
	useEffect(() => {
		if (!register) return
		register(true)
		return () => register(false)
	}, [register])

	return (
		<caption id={id ?? context?.id} className={cx("table--caption", styles.caption, className)} {...props}>
			{isSimpleText(children) ? (
				<Text tag="span" size="inherit" type="secondary" className="table--caption-text">
					{children}
				</Text>
			) : (
				children
			)}
		</caption>
	)
}
