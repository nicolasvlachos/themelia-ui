/**
 * The rows, tiles and tone helpers every product surface shares. Tone is a `data-tone`
 * attribute read by one CSS block, not per-tone class names; metrics render through
 * `MetadataList` with the tone on the value.
 */
import { ChevronRightIcon, EyeIcon, ImagePlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { PRODUCT_TONE_BADGE } from "./product-tone"
import type { ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { DataTableActions, type TableAction } from "@/components/features/table"
import { Empty } from "@/components/base/feedback"
import {
	Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle,
} from "@/components/base/item"
import { DisplayLabel, Text } from "@/components/base/typography"
import { PreviewImage } from "@/components/base/upload"
import { Value } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultProductOptionActionMenuStrings } from "./products.strings"
import type {
	ProductOperationsItem, ProductOptionActionMenuProps,
	ProductOptionSummary, ProductPolicySummary, ProductReadinessItem, ProductStructureMetric,
	ProductTone,
} from "./products.types"
import styles from "./products.module.css"


/** The row's accessible name: the verb and the subject ("Fix: Pricing"), since several rows share a verb. */
function plainLabel(action: ReactNode, subject: ReactNode): string | undefined {
	const text = (node: ReactNode) =>
		typeof node === "string" || typeof node === "number" ? String(node) : ""
	const verb = text(action)
	const thing = text(subject)
	if (!verb && !thing) return undefined
	return verb && thing ? `${verb}: ${thing}` : verb || thing
}

export function ProductToneDot({ tone = "neutral" }: { tone?: ProductTone }) {
	return <span aria-hidden data-tone={tone} className={cx("product-tone-dot--component", styles.dot)} />
}

/**
 * A variant's picture, or a dashed slot where one would go (a grey square reads as a
 * failed image). Only a button with `onSelect`; otherwise the slot is inert and muted.
 */
export function ProductThumbnail({
	src,
	alt,
	media,
	onSelect,
	label,
	className,
}: {
	src?: string
	alt?: string
	/** Replaces the image entirely: a video still, a swatch, a monogram. */
	media?: ReactNode
	onSelect?: () => void
	/** Names the slot when it is pressable. */
	label?: string
	className?: string
}) {
	const body =
		media ??
		(src ? (
			/* `PreviewImage` owns the load/fail state machine for URLs we did not create. */
			<PreviewImage
				src={src}
				alt={alt}
				fallback={<ImagePlusIcon aria-hidden />}
				className={styles.thumbImage}
			/>
		) : (
			<ImagePlusIcon aria-hidden />
		))

	const filled = !!media || !!src
	const classes = cx("product-thumbnail--component", styles.thumb, className)

	if (!onSelect) {
		return (
			<span aria-hidden={!alt || undefined} data-filled={filled || undefined} className={classes}>
				{body}
			</span>
		)
	}

	return (
		<button
			type="button"
			aria-label={label}
			data-filled={filled || undefined}
			className={classes}
			onClick={onSelect}
		>
			{body}
		</button>
	)
}

export function ProductEmptyState({
	title,
	description,
	action,
	className,
}: {
	title: ReactNode
	description: ReactNode
	action?: ReactNode
	className?: string
}) {
	return (
		<Empty
			padding="md"
			border
			title={title}
			description={description}
			action={action}
			className={cx("product-empty-state--component", styles.empty, className)}
		/>
	)
}

export function ProductRowActions<TItem extends object>({
	item,
	actions,
	menuLabel,
	className,
}: {
	item: TItem
	actions: TableAction<TItem>[]
	menuLabel: string
	className?: string
}) {
	if (actions.length === 0) return null

	return (
		<div className={cx("product-row-actions--component", styles.rowActions, className)}>
			<DataTableActions row={item} actions={actions} menuLabel={menuLabel} displayMode="menu" />
		</div>
	)
}

/**
 * The row shape every card in this family uses; only the trailing lane differs.
 *
 * The row itself is the target (with a chevron) rather than holding an action button.
 * A row with an `actions` menu stays a plain row, since a menu trigger inside a button is
 * invalid; its open verb joins the menu.
 */
function ProductRow({
	tone = "neutral",
	label,
	description,
	media,
	trailing,
	onSelect,
	selectLabel,
	children,
}: {
	tone?: ProductTone
	label: ReactNode
	description?: ReactNode
	media?: ReactNode
	trailing?: ReactNode
	onSelect?: () => void
	/** Names what pressing the row does, for a reader who cannot see the chevron. */
	selectLabel?: string
	children?: ReactNode
}) {
	const interactive = !!onSelect

	return (
		<Item
			render={interactive ? <button type="button" /> : undefined}
			onClick={onSelect}
			aria-label={selectLabel}
			data-interactive={interactive || undefined}
			className={styles.row}
		>
			<ItemMedia variant="icon" data-tone={tone} className={styles.rowMedia}>
				{media ?? <ProductToneDot tone={tone} />}
			</ItemMedia>
			<ItemContent className={styles.rowContent}>
				<ItemTitle>{label}</ItemTitle>
				{!!description && <ItemDescription>{description}</ItemDescription>}
				{children}
			</ItemContent>
			{(!!trailing || interactive) && (
				<ItemActions className={styles.rowTrailing}>
					{trailing}
					{interactive && <ChevronRightIcon aria-hidden className={styles.rowChevron} />}
				</ItemActions>
			)}
		</Item>
	)
}

export function ProductStructureMetricRow({
	metric,
	actions,
}: {
	metric: ProductStructureMetric
	actions?: ReactNode
}) {
	return (
		<ProductRow
			tone={metric.tone ?? "neutral"}
			label={metric.label}
			description={metric.description}
			media={metric.icon}
			trailing={
				<>
					<Value weight="semibold" className={cx("product-structure-metric-row--component", styles.numeric)}>{metric.value}</Value>
					{actions}
				</>
			}
		/>
	)
}

export function ProductReadinessRow({
	item,
	actionFallback,
	onSelect,
	actions,
}: {
	item: ProductReadinessItem
	actionFallback: ReactNode
	onSelect?: () => void
	actions?: ReactNode
}) {
	/* A completed check defaults to success, so `completed` alone sets the colour. */
	const tone = item.tone ?? (item.completed ? "success" : "neutral")
	const select = item.onSelect ?? onSelect

	/* A row with its own menu cannot also be a button (see ProductRow). */
	const rowSelect = actions ? undefined : select

	return (
		<ProductRow
			tone={tone}
			label={item.label}
			description={item.description}
			onSelect={rowSelect}
			selectLabel={rowSelect ? plainLabel(item.actionLabel ?? actionFallback, item.label) : undefined}
			trailing={
				item.value || actions ? (
					<>
						{!!item.value && <Badge tone={PRODUCT_TONE_BADGE[tone]}>{item.value}</Badge>}
						{actions}
					</>
				) : undefined
			}
		/>
	)
}

export function ProductOperationRow({
	item,
	actionFallback,
	onSelect,
	actions,
}: {
	item: ProductOperationsItem
	actionFallback: ReactNode
	onSelect?: () => void
	actions?: ReactNode
}) {
	const tone = item.tone ?? "neutral"
	const select = item.onSelect ?? onSelect

	const rowSelect = actions ? undefined : select

	return (
		<ProductRow
			tone={tone}
			label={item.label}
			description={item.description}
			onSelect={rowSelect}
			selectLabel={rowSelect ? plainLabel(item.actionLabel ?? actionFallback, item.label) : undefined}
			trailing={
				item.value || actions ? (
					<>
						{!!item.value && <Text tag="span" weight="semibold">{item.value}</Text>}
						{actions}
					</>
				) : undefined
			}
		/>
	)
}

export function ProductSummaryRow({
	item,
	actionLabel,
	onSelect,
	actions,
}: {
	item: ProductOptionSummary | ProductPolicySummary
	actionLabel?: ReactNode
	onSelect?: () => void
	actions?: ReactNode
}) {
	const tone = item.tone ?? "neutral"
	const values = "values" in item ? item.values : undefined

	const rowSelect = actions ? undefined : onSelect

	return (
		<ProductRow
			tone={tone}
			label={item.label}
			description={item.description}
			onSelect={rowSelect}
			selectLabel={rowSelect ? plainLabel(actionLabel, item.label) : undefined}
			trailing={
				item.value || item.badge || actions ? (
					<>
						{!!item.value && <Text tag="span" weight="semibold">{item.value}</Text>}
						{item.badge}
						{actions}
					</>
				) : undefined
			}
		>
			{!!values?.length && (
				<div className={styles.rowValues}>
					{values.map((value, index) => (
						<Badge key={index} tone="neutral">{value}</Badge>
					))}
				</div>
			)}
		</ProductRow>
	)
}

/**
 * The per-option overflow menu, exported for screens that lay out options themselves and
 * want the same verbs and labels as the summary card.
 */
export function ProductOptionActionMenu({
	option,
	index = 0,
	onSelectOption,
	onEditOption,
	onDeleteOption,
	renderOptionActions,
	menuLabel,
	className,
	strings,
}: ProductOptionActionMenuProps) {
	const copy = { ...defaultProductOptionActionMenuStrings, ...strings }

	const onSelect = onSelectOption ? () => onSelectOption(option) : undefined
	const onEdit = onEditOption ? () => onEditOption(option) : undefined
	const onDelete = onDeleteOption ? () => onDeleteOption(option) : undefined

	if (renderOptionActions) {
		return (
			<div className={cx("product-option-action-menu--component", styles.rowActions, className)}>
				{renderOptionActions(option, { index, onSelect, onEdit, onDelete })}
			</div>
		)
	}

	return (
		<ProductRowActions
			item={option}
			menuLabel={menuLabel ?? copy.actionsLabel}
			className={cx("product-option-action-menu--component", className)}
			actions={[
				...(onSelect ? [{ id: "open", label: copy.viewLabel, icon: <EyeIcon />, onClick: onSelect }] : []),
				...(onEdit ? [{ id: "edit", label: copy.editLabel, icon: <PencilIcon />, onClick: onEdit }] : []),
				...(onDelete
					? [{ id: "delete", label: copy.deleteLabel, icon: <Trash2Icon />, tone: "destructive" as const, onClick: onDelete }]
					: []),
			]}
		/>
	)
}

/**
 * A label/value pair whose label is visually hidden while a column heading names the value,
 * and shown once the table collapses at narrow widths.
 */
export function ProductVariantCell({
	label,
	weight,
	className,
	children,
}: {
	label: ReactNode
	weight?: "normal" | "medium" | "semibold" | "bold"
	className?: string
	children: ReactNode
}) {
	return (
		<div className={cx("product-variant-cell--component", styles.variantPair, className)}>
			<DisplayLabel className={styles.variantPairLabel}>{label}</DisplayLabel>
			<Text weight={weight} truncate>{children}</Text>
		</div>
	)
}
