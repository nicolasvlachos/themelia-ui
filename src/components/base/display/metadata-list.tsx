/**
 * MetadataList — label/value facts about one thing, in three layouts over the same data:
 * `grid` (label above value, in columns; the default, for detail panels), `rows` (a ruled
 * `<dl>`, for labels of varied length), `inline` ("Created 4 Jan · By Alice · v3.2").
 * Returns `null` when there is nothing to show.
 */
import { Fragment, isValidElement, useMemo, type ComponentType, type ReactNode } from "react"
import { InfoIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Grid, Stack } from "@/components/base/structure"
import type { ResponsiveValue } from "@/components/base/structure"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"
import { DisplayLabel, Text } from "@/components/base/typography"
import { EMPTY } from "@/lib/format"
import { cx } from "@/lib/cx"

import { Separator } from "./separator"
import { MetadataValue, type MetadataValueDescriptor } from "./metadata-value"
import { defaultMetadataListStrings, type MetadataListStrings } from "./metadata-list.strings"
import styles from "./metadata.module.css"

export type MetadataColumns = 1 | 2 | 3 | 4
export type MetadataLayout = "grid" | "rows" | "inline"
/** `compact` tightens the rhythm for a dense panel. */
export type MetadataDensity = "default" | "compact"

export interface MetadataListItem {
	/** Stable identity. Without one the label and index stand in. */
	id?: string
	label: ReactNode
	/** A node, or a descriptor that names the fact's kind. */
	value?: ReactNode | MetadataValueDescriptor | null
	/** Supporting copy under the value. */
	description?: ReactNode | null
	/** Shown from an info trigger beside the label — for a fact that needs explaining. */
	tooltip?: ReactNode
	icon?: ComponentType<{ className?: string }>
	emptyLabel?: ReactNode
	/** Takes over the value entirely, for one fact that none of the kinds cover. */
	render?: (item: MetadataListItem) => ReactNode
}

/** The inline layout has no second line to put a description on. */
export type MetadataInlineListItem = Omit<MetadataListItem, "description"> & {
	description?: never
}

interface MetadataListSharedProps {
	/**
	 * How many columns the grid uses. A plain number picks a responsive recipe; an object
	 * sets the breakpoints itself.
	 */
	columns?: ResponsiveValue<MetadataColumns>
	density?: MetadataDensity
	/** Shown for a fact whose value is absent. Defaults to an em dash. */
	emptyLabel?: ReactNode
	title?: ReactNode
	/** Draws a rule between the title and the first fact. */
	titleSeparator?: boolean
	className?: string
	/** Between a label and its value, inline. Defaults to a colon. */
	separator?: string
	/** Between facts — `true` for the default rule, or a character for the inline layout. */
	itemSeparator?: boolean | string
	strings?: Partial<MetadataListStrings>
}

interface MetadataGridRowsProps extends MetadataListSharedProps {
	items: MetadataListItem[]
	layout?: "grid" | "rows"
}

interface MetadataInlineProps extends MetadataListSharedProps {
	items: MetadataInlineListItem[]
	layout: "inline"
}

export type MetadataListProps = MetadataGridRowsProps | MetadataInlineProps

/** A column count is a ceiling: recipes step it down at narrower widths. */
const COLUMN_RECIPES: Record<MetadataColumns, ResponsiveValue<MetadataColumns>> = {
	1: 1,
	2: { base: 1, md: 2 },
	3: { base: 1, sm: 2, lg: 3 },
	4: { base: 1, sm: 2, lg: 3, xl: 4 },
}

function resolveColumns(columns: ResponsiveValue<MetadataColumns>): ResponsiveValue<MetadataColumns> {
	return typeof columns === "object" ? columns : COLUMN_RECIPES[columns]
}

function itemKey(item: MetadataListItem, index: number) {
	if (item.id) return item.id
	return `metadata-${typeof item.label === "string" ? item.label : index}-${index}`
}

/** Descriptor vs node: check for an element first, since an element is also an object. */
function isDescriptor(value: unknown): value is MetadataValueDescriptor {
	return (
		typeof value === "object" &&
		value !== null &&
		!isValidElement(value) &&
		!Array.isArray(value) &&
		("kind" in value || "node" in value || "value" in value)
	)
}

function renderValue(
	value: ReactNode | MetadataValueDescriptor,
	absent: boolean,
	emptyLabel: ReactNode,
	valueClass: string,
) {
	if (isDescriptor(value)) {
		if (value.kind === "node") return <MetadataValue {...value} />
		return (
			<MetadataValue
				{...value}
				emptyLabel={value.emptyLabel ?? emptyLabel}
				className={cx(valueClass, value.className)}
			/>
		)
	}

	if (typeof value === "string" || typeof value === "number") {
		return (
			<MetadataValue
				kind={absent ? "empty" : "text"}
				value={value}
				emptyLabel={emptyLabel}
				className={valueClass}
			/>
		)
	}

	return value
}

function InfoTrigger({ label, copy }: { label: ReactNode; copy: MetadataListStrings }) {
	const name = typeof label === "string" ? copy.formatInfoLabel(label) : copy.infoFallback
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						type="button"
						tone="neutral"
						buttonStyle="ghost"
						iconOnly
						aria-label={name}
						className={styles.infoTrigger}
						// Small glyph, full-size target (styles/targets.css).
						data-hit-area
					>
						<InfoIcon />
					</Button>
				}
			/>
			{/* No Text wrapper: TooltipContent owns its type and colour. */}
			<TooltipContent side="top" align="start" className={styles.tooltip}>
				{label}
			</TooltipContent>
		</Tooltip>
	)
}

/** The label, its optional icon, and its optional info trigger. */
function ItemLabel({
	item,
	copy,
	className,
}: {
	item: MetadataListItem
	copy: MetadataListStrings
	className?: string
}) {
	const Icon = item.icon
	return (
		<>
			{!!Icon && <Icon className={styles.itemIcon} />}
			<DisplayLabel className={cx("metadata-list--label", styles.label, className)}>
				{item.label}
			</DisplayLabel>
			{item.tooltip != null && <InfoTrigger label={item.tooltip} copy={copy} />}
		</>
	)
}

export function MetadataList({
	items,
	columns = 2,
	density = "default",
	emptyLabel = EMPTY,
	title,
	titleSeparator = false,
	className,
	layout = "grid",
	separator = ": ",
	itemSeparator = false,
	strings,
}: MetadataListProps) {
	const copy = { ...defaultMetadataListStrings, ...strings }
	const list = useMemo(() => (items as MetadataListItem[]).filter(Boolean), [items])

	if (list.length === 0) return null

	const compact = density === "compact"
	const valueClass = styles.value
	const hasTitle = title !== null && title !== undefined

	const head = (
		<>
			{!!hasTitle && (
				<DisplayLabel className={cx("metadata-list--title", styles.title)}>{title}</DisplayLabel>
			)}
			{!!(hasTitle && titleSeparator) && (
				<Separator className={cx("metadata-list--title-separator", styles.titleSeparator)} />
			)}
		</>
	)

	const rootClass = cx("metadata-list--component", styles.root, className)

	/** Everything each layout needs about one fact, resolved once. */
	const facts = list.map((item, index) => ({
		item,
		key: itemKey(item, index),
		absent: item.value === null || item.value === undefined,
		emptyLabel: item.emptyLabel ?? emptyLabel,
		value: item.value ?? (item.emptyLabel ?? emptyLabel),
	}))

	if (layout === "inline") {
		/* Separators go between facts; a trailing dot reads as a fact that failed to load. */
		const between = typeof itemSeparator === "string" ? itemSeparator : itemSeparator ? "·" : ""
		/* Compact tightens gaps only; the value keeps its size in every layout. */

		return (
			<div className={rootClass}>
				{head}
				<Stack
					direction="horizontal"
					gap={compact ? "sm" : "md"}
					align="baseline"
					wrap
					className={cx("metadata-list--inline", styles.inline)}
				>
					{facts.map(({ item, key, absent, emptyLabel: fallback, value }, index) => (
						<Fragment key={key}>
							<div className={cx("metadata-list--item", styles.inlineItem)}>
								{/* Label, info trigger and colon form one box, so the row gap never lands before the colon. */}
								<span className={styles.inlineLabel}>
									<ItemLabel item={item} copy={copy} className={styles.labelWrap} />
									<Text size="inherit" type="secondary">{separator}</Text>
								</span>
								{/* A rendered value sits in the value's box, taking its size. */}
								{item.render
									? <span className={styles.value}>{item.render(item)}</span>
									: renderValue(value, absent, fallback, styles.value)}
							</div>
							{!!(between && index < facts.length - 1) && (
								<Text
									size="inherit"
									type="secondary"
									aria-hidden
									className={cx("metadata-list--item-separator", styles.inlineSeparator)}
								>
									{between}
								</Text>
							)}
						</Fragment>
					))}
				</Stack>
			</div>
		)
	}

	if (layout === "rows") {
		return (
			<div className={rootClass}>
				{head}
				{/* A real `<dl>`, announced as a description list. */}
				{/*
 * `data-row-density`, not `data-density`: the latter is a scope boundary and would reset
 * a caller's compact scope.
 */}
				<dl
					data-row-density={density}
					className={cx("metadata-list--rows", styles.rows, itemSeparator !== false && styles.rowsDivided)}
				>
					{facts.map(({ item, key, absent, emptyLabel: fallback, value }) => (
						<div key={key} className={cx("metadata-list--item", styles.row)}>
							<dt className={styles.rowLabel}>
								<ItemLabel item={item} copy={copy} className={styles.labelWrap} />
							</dt>
							<dd className={styles.rowValue}>
								{item.render
									? <div className={valueClass}>{item.render(item)}</div>
									: renderValue(value, absent, fallback, valueClass)}
								{!!item.description && (
									<Text
										size="xs"
										type="secondary"
										className={cx("metadata-list--description", styles.description)}
									>
										{item.description}
									</Text>
								)}
							</dd>
						</div>
					))}
				</dl>
			</div>
		)
	}

	return (
		<div className={rootClass}>
			{head}
			<Grid
				columns={resolveColumns(columns)}
				gap={compact ? "md" : "xl"}
				align="start"
				className="metadata-list--grid"
			>
				{facts.map(({ item, key, absent, emptyLabel: fallback, value }) => (
					<div key={key} className={cx("metadata-list--item", styles.gridItem)}>
						<div className={styles.gridLabel}>
							<ItemLabel item={item} copy={copy} />
						</div>
						{item.render
							? <div className={valueClass}>{item.render(item)}</div>
							: renderValue(value, absent, fallback, valueClass)}
						{!!item.description && (
							<Text
								size="xs"
								type="secondary"
								className={cx("metadata-list--description", styles.description)}
							>
								{item.description}
							</Text>
						)}
					</div>
				))}
			</Grid>
		</div>
	)
}
