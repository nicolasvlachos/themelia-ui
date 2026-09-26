/**
 * Cells common to admin tables, as thin arrangements over kit primitives (Badge, Money,
 * Date) that add a visible missing state, one line by default, and column alignment.
 */
import { CalendarIcon, MailIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Badge, type BadgeTone } from "@/components/base/badge"
import { DatePrimitive, EmptyValue, Money, formatInitials } from "@/components/primitives"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./table.module.css"

type DateValue = ComponentProps<typeof DatePrimitive>["value"]

export interface StatusCellEntry {
	label: ReactNode
	tone?: BadgeTone
	icon?: ReactNode
}

export interface StatusCellProps<TStatus extends string> {
	value?: TStatus | null
	/** Label and tone for every status this column can show. */
	map: Record<TStatus, StatusCellEntry>
	/** Shown when the status is absent, or present but not in the map. */
	emptyLabel?: ReactNode
	className?: string
}

export function StatusCell<TStatus extends string>({
	value,
	map,
	emptyLabel,
	className,
}: StatusCellProps<TStatus>) {
	const entry = value ? map[value] : undefined
	/* An unmapped status falls back rather than printing the raw enum. */
	if (!entry) return <EmptyValue label={emptyLabel} />

	return (
		<Badge tone={entry.tone ?? "neutral"} className={cx("status-cell--component", className)}>
			{entry.icon}
			{entry.label}
		</Badge>
	)
}

export interface StatusClusterCellItem extends StatusCellEntry {
	id?: string
	hidden?: boolean
}

export interface StatusClusterCellProps {
	items?: readonly StatusClusterCellItem[]
	emptyLabel?: ReactNode
	className?: string
}

/** Several chips in one cell, e.g. overdue and partially paid. */
export function StatusClusterCell({
	items = [],
	emptyLabel,
	className,
}: StatusClusterCellProps) {
	const visible = items.filter((item) => !item.hidden)
	if (visible.length === 0) return <EmptyValue label={emptyLabel} />

	return (
		<span className={cx("status-cluster-cell--component", styles.cluster, className)}>
			{visible.map((item, index) => (
				<Badge key={item.id ?? index} tone={item.tone ?? "neutral"}>
					{item.icon}
					{item.label}
				</Badge>
			))}
		</span>
	)
}

export interface DateCellProps {
	value?: DateValue
	/** date-fns pattern. Falls back to the scope's own. */
	pattern?: string
	showIcon?: boolean
	icon?: ReactNode
	emptyLabel?: ReactNode
	className?: string
}

export function DateCell({
	value,
	pattern,
	showIcon = false,
	icon,
	emptyLabel,
	className,
}: DateCellProps) {
	if (value === null || value === undefined || value === "") {
		return <EmptyValue label={emptyLabel} />
	}

	return (
		<span className={cx("date-cell--component", styles.iconCell, className)}>
			{showIcon && <span className={styles.cellIcon}>{icon ?? <CalendarIcon />}</span>}
			<DatePrimitive value={value} pattern={pattern} type="secondary" emptyLabel={emptyLabel} />
		</span>
	)
}

export interface DateMetaCellProps extends DateCellProps {
	/** A second line under the date. A function derives it from the parsed date. */
	secondary?: ReactNode | ((date: Date) => ReactNode)
}

export function DateMetaCell({
	value,
	pattern,
	showIcon = true,
	icon,
	emptyLabel,
	secondary,
	className,
}: DateMetaCellProps) {
	if (value === null || value === undefined || value === "") {
		return <EmptyValue label={emptyLabel} />
	}

	const parsed = value instanceof Date ? value : new Date(value)
	const secondaryNode =
		typeof secondary === "function"
			? Number.isNaN(parsed.getTime())
				? null
				: secondary(parsed)
			: secondary

	return (
		<span className={cx("date-meta-cell--component", styles.iconCell, styles.iconCellTop, className)}>
			{showIcon && <span className={styles.cellIcon}>{icon ?? <CalendarIcon />}</span>}
			<span className={styles.cellStack}>
				<DatePrimitive value={value} pattern={pattern} type="secondary" emptyLabel={emptyLabel} />
				{!!secondaryNode && (
					<Text tag="span" size="xs" type="secondary">{secondaryNode}</Text>
				)}
			</span>
		</span>
	)
}

export interface CurrencyCellProps {
	value?: number | string | null
	currency?: string
	locale?: string
	emptyLabel?: ReactNode
	weight?: "normal" | "medium" | "semibold" | "bold"
	className?: string
}

export function CurrencyCell({
	value,
	currency,
	locale,
	emptyLabel,
	weight = "semibold",
	className,
}: CurrencyCellProps) {
	return (
		<Money
			amount={value}
			currency={currency}
			locale={locale}
			/* Without a currency, `with-symbol` would make Intl invent a symbol from the locale. */
			formatMode={currency ? "with-symbol" : "decimal"}
			emptyLabel={emptyLabel}
			weight={weight}
			className={cx("currency-cell--component", className)}
		/>
	)
}

export interface AvatarCellProps {
	name?: string | null
	/** Falls back to initials when absent or broken. */
	imageUrl?: string
	icon?: ReactNode
	subtitle?: ReactNode
	emptyLabel?: ReactNode
	className?: string
}

export function AvatarCell({
	name,
	imageUrl,
	icon,
	subtitle,
	emptyLabel,
	className,
}: AvatarCellProps) {
	if (!name || name.trim().length === 0) return <EmptyValue label={emptyLabel} />

	return (
		<span className={cx("avatar-cell--component", styles.avatarCell, className)}>
			<Avatar size="sm">
				{!!imageUrl && <AvatarImage src={imageUrl} alt="" />}
				<AvatarFallback>
					{/* `first-words`: "Marlow Hall Events" reads better as MH than ME. */}
					{formatInitials(name, { strategy: "first-words" }) || (icon ?? <MailIcon />)}
				</AvatarFallback>
			</Avatar>
			<span className={styles.cellStack}>
				<Text tag="span" weight="medium" truncate>{name}</Text>
				{!!subtitle && (
					<Text tag="span" size="xs" type="secondary" truncate>
						{subtitle}
					</Text>
				)}
			</span>
		</span>
	)
}
