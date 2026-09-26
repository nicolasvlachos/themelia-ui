/**
 * Composed skeletons — shapes that mirror the layouts they stand in for, so nothing
 * reflows. The shapes are `aria-hidden`; the wrapper is a live status announcing one label.
 */
import type { ComponentProps } from "react"
import { resolveStrings } from "@/lib/strings"

import { defaultSkeletonStrings, type SkeletonStrings } from "./skeleton.strings"

import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { Skeleton } from "./skeleton"
import styles from "./skeleton.module.css"

export interface ContentSkeletonProps extends ComponentProps<"div"> {
	/** Number of text lines. The last is short, so the block reads as prose. */
	lines?: number
	/** A heading above the lines. */
	showTitle?: boolean
	/** Announced in place of the shapes. */
	label?: string
	/** Overrides the default announcement. `label` still wins for one instance. */
	strings?: Partial<SkeletonStrings>
}

export function ContentSkeleton({
	lines = 3,
	showTitle = false,
	label,
	strings,
	className,
	...props
}: ContentSkeletonProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cx("content-skeleton--component", styles.block, className)}
			{...props}
		>
			{/* Text, not aria-label: a live region announces its content. */}
			<VisuallyHidden>{label ?? resolveStrings(defaultSkeletonStrings, strings).loading}</VisuallyHidden>
			{showTitle && <Skeleton aria-hidden className={styles.title} />}
			<div aria-hidden className={styles.lines}>
				{Array.from({ length: lines }, (_, index) => (
					<Skeleton
						key={index}
						className={cx(styles.line, index === lines - 1 && lines > 1 && styles.lineLast)}
					/>
				))}
			</div>
		</div>
	)
}

export interface PageSkeletonProps extends ComponentProps<"div"> {
	/** The page header: a title, its description, and the actions at the end of the row. */
	showHeader?: boolean
	/** Content panels below the header. */
	blocks?: number
	label?: string
	/** Overrides the default announcement. `label` still wins for one instance. */
	strings?: Partial<SkeletonStrings>
}

/* PageHeader's row (title and description, then actions) over card-like panels. */
export function PageSkeleton({
	showHeader = true,
	blocks = 2,
	label,
	strings,
	className,
	...props
}: PageSkeletonProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cx("page-skeleton--component", styles.block, className)}
			{...props}
		>
			{/* Text, not aria-label: a live region announces its content. */}
			<VisuallyHidden>{label ?? resolveStrings(defaultSkeletonStrings, strings).loadingPage}</VisuallyHidden>
			{showHeader && (
				<div aria-hidden className={styles.pageHeader}>
					<div className={styles.pageHeaderText}>
						<Skeleton className={styles.title} />
						<Skeleton className={cx(styles.line, styles.pageHeaderDescription)} />
					</div>
					<div className={styles.pageHeaderActions}>
						<Skeleton className={styles.action} />
						<Skeleton className={styles.action} />
					</div>
				</div>
			)}
			{Array.from({ length: blocks }, (_, index) => (
				<SkeletonPanel key={index} />
			))}
		</div>
	)
}

/** A card's worth: a heading over a short paragraph, inside the card's edge and inset. */
function SkeletonPanel() {
	return (
		<div aria-hidden className={styles.panel}>
			<Skeleton className={styles.heading} />
			<div className={styles.lines}>
				<Skeleton className={styles.line} />
				<Skeleton className={styles.line} />
				<Skeleton className={cx(styles.line, styles.lineLast)} />
			</div>
		</div>
	)
}

export interface TwoColumnPageSkeletonProps extends ComponentProps<"div"> {
	label?: string
	/** Overrides the default announcement. `label` still wins for one instance. */
	strings?: Partial<SkeletonStrings>
}

/** A detail page: a title over the record's panel, beside its owner and facts. */
export function TwoColumnPageSkeleton({ label, strings, className, ...props }: TwoColumnPageSkeletonProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cx("two-column-page-skeleton--component", styles.block, className)}
			{...props}
		>
			{/* Text, not aria-label: a live region announces its content. */}
			<VisuallyHidden>{label ?? resolveStrings(defaultSkeletonStrings, strings).loadingPage}</VisuallyHidden>
			<Skeleton aria-hidden className={styles.title} />
			<div className={styles.twoColumn}>
				<SkeletonPanel />
				<div aria-hidden className={styles.panel}>
					<div className={styles.identity}>
						<Skeleton className={styles.avatar} />
						<div className={styles.lines}>
							<Skeleton className={cx(styles.line, styles.identityName)} />
							<Skeleton className={cx(styles.line, styles.identityMeta)} />
						</div>
					</div>
					<div className={styles.facts}>
						{Array.from({ length: 3 }, (_, index) => (
							<div key={index} className={styles.fact}>
								<Skeleton className={cx(styles.line, styles.factLabel)} />
								<Skeleton className={cx(styles.line, styles.factValue)} />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export interface TableSkeletonProps extends ComponentProps<"div"> {
	rows?: number
	/** Match the real table, or the placeholder reflows when the data lands. */
	columns?: number
	showHeader?: boolean
	/** Draws the table's own edge, as DataView does. Turn off inside a card that has one. */
	framed?: boolean
	label?: string
	/** Overrides the default announcement. `label` still wins for one instance. */
	strings?: Partial<SkeletonStrings>
}

export function TableSkeleton({
	rows = 5,
	columns = 4,
	showHeader = true,
	framed = true,
	label,
	strings,
	className,
	...props
}: TableSkeletonProps) {
	const cells = (key: number) =>
		Array.from({ length: columns }, (_, column) => (
			<div key={`${key}-${column}`} className={styles.tableCell}>
				<Skeleton className={styles.tableBar} />
			</div>
		))

	return (
		<div
			role="status"
			aria-live="polite"
			className={cx("table-skeleton--component", styles.table, framed && styles.tableFramed, className)}
			{...props}
		>
			{/* Text, not aria-label: a live region announces its content. */}
			<VisuallyHidden>{label ?? resolveStrings(defaultSkeletonStrings, strings).loadingTable}</VisuallyHidden>
			{showHeader && (
				<div aria-hidden className={cx(styles.tableRow, styles.tableHeadRow)}>
					{cells(-1)}
				</div>
			)}
			{Array.from({ length: rows }, (_, row) => (
				<div key={row} aria-hidden className={styles.tableRow}>
					{cells(row)}
				</div>
			))}
		</div>
	)
}
