/**
 * PreviewTriggerCell — the trigger, shaped for a table cell. It is a button only when there
 * is something to open; otherwise the same text renders inert, with no caret, pointer or popup ARIA.
 */
import type { ComponentProps, ComponentType, ReactNode } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Badge, type BadgeProps } from "@/components/base/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"
import { EmptyValue, Name, SecondaryValue, Value } from "@/components/primitives"
import { cx } from "@/lib/cx"

import styles from "./async-preview.module.css"

type BadgeSpec = ReactNode | { label: ReactNode; tone?: BadgeProps["tone"] }

export interface PreviewTriggerCellProps
	extends Omit<ComponentProps<"button">, "children" | "value" | "name"> {
	/** The cell's own text. */
	value?: ReactNode | null
	/** Second line, quieter. */
	secondary?: ReactNode | null
	leading?: ReactNode
	trailing?: ReactNode
	badge?: BadgeSpec
	icon?: ComponentType<{ className?: string }>
	/** Shown when `value` is absent — the em dash, unless a column wants its own word. */
	emptyLabel?: ReactNode
	/** Whether this row has a preview at all. Off renders plain text. */
	hasPreview?: boolean
	/** Why it is unavailable. Shown as a tooltip on the inert cell. */
	disabledReason?: ReactNode
	/** Runs the value through `Name` to normalise casing. */
	asName?: boolean
	className?: string
}

function CellBadge({ badge }: { badge: BadgeSpec }) {
	if (badge == null || badge === false) return null
	if (typeof badge === "object" && badge !== null && "label" in badge) {
		const spec = badge as { label: ReactNode; tone?: BadgeProps["tone"] }
		return <Badge tone={spec.tone ?? "neutral"}>{spec.label}</Badge>
	}
	return <Badge tone="neutral">{badge as ReactNode}</Badge>
}

export function PreviewTriggerCell({
	value,
	secondary,
	leading,
	trailing,
	badge,
	icon: Icon,
	emptyLabel,
	hasPreview = true,
	disabledReason,
	asName = false,
	disabled,
	className,
	...props
}: PreviewTriggerCellProps) {
	const isEmpty = value == null || value === ""
	const interactive = hasPreview && !disabled && !isEmpty

	const content = (
		<>
			{!!Icon && <Icon className={styles.cellIcon} />}
			{leading}
			<span className={styles.cellText}>
				<span className={styles.cellValueRow}>
					{isEmpty ? (
						<EmptyValue label={emptyLabel} />
					) : asName && typeof value === "string" ? (
						<Name value={value} />
					) : (
						<Value>{value}</Value>
					)}
					<CellBadge badge={badge} />
					{/* The caret appears ONLY when there is something to open. */}
					{interactive && <ChevronDownIcon aria-hidden className={styles.cellCaret} />}
				</span>
				{!!secondary && <SecondaryValue size="xs">{secondary}</SecondaryValue>}
			</span>
			{trailing}
		</>
	)

	if (!interactive) {
		const inert = (
			<span data-slot="preview-cell" className={cx(styles.cell, styles.cellInert, className)}>
				{content}
			</span>
		)
		if (!disabledReason) return inert
		return (
			<Tooltip>
				<TooltipTrigger render={inert} />
				<TooltipContent>{disabledReason}</TooltipContent>
			</Tooltip>
		)
	}

	return (
		<button
			type="button"
			data-slot="preview-cell"
			className={cx("preview-trigger-cell--component", styles.cell, className)}
			{...props}
		>
			{content}
		</button>
	)
}
