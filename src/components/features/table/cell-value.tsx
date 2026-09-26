/**
 * CellValue: one column's value, formatted. Unlike `MetadataValue` (a labelled fact), a
 * cell has no label, is nowrap by default, and shows a visible missing state. Accepts a
 * tuple (`[row.total, "money", { currency }]`) or an object; prefer the object beyond two
 * options.
 */
import type { Locale } from "date-fns"
import { useContext, useMemo, type ReactElement, type ReactNode } from "react"

import {
	DatePrimitive, DateTime, Email, EmptyValue, FileSize, Link, MonoValue, Money,
	MutedValue, Name, Number as NumberPrimitive, Percent, Phone, RelativeTime,
	SecondaryValue, Time, Value, type FileSizeUnit, type MoneyUnit,
} from "@/components/primitives"
import { cx } from "@/lib/cx"
import { UIConfigContext } from "@/lib/ui-provider"

import styles from "./table.module.css"

export type CellValueKind =
	| "value" | "secondary" | "muted" | "name" | "mono"
	| "link" | "email" | "phone" | "url"
	| "money" | "number" | "percent" | "fileSize"
	| "date" | "time" | "dateTime" | "relativeTime"

export type PrimitiveCellValue = string | number | Date | null | undefined

export interface CellValueDescriptor {
	value?: PrimitiveCellValue
	/** Which primitive renders it. Defaults to `value`. */
	kind?: CellValueKind
	/** Pre-rendered content, used verbatim; bypasses `kind` and all formatting. */
	display?: ReactNode
	/** Where the value navigates, for `link` and the contact kinds. */
	href?: string
	currency?: string
	minimumFractionDigits?: number
	maximumFractionDigits?: number
	locale?: string
	dateLocale?: Locale
	/** date-fns pattern, for the date and time kinds. */
	pattern?: string
	/** The unit the raw value is already in. `fileSize` only. */
	from?: FileSizeUnit
	/** Minor or major units. `money` only; see the primitive. */
	moneyUnit?: MoneyUnit
	/** What shows when the value is absent. */
	fallback?: ReactNode
	/** Forces the missing state regardless of the value. */
	missing?: boolean
	/** Lets the cell wrap. Cells are nowrap so columns stay readable. */
	wrap?: boolean
	className?: string
}

export type CellValueTuple = readonly [
	value: PrimitiveCellValue,
	kind?: CellValueKind,
	options?: Omit<CellValueDescriptor, "value" | "kind">,
]

export type CellStackValue =
	| PrimitiveCellValue
	| false
	| ReactElement
	| CellValueDescriptor
	| CellValueTuple

export interface CellValueProps extends CellValueDescriptor {
	children?: ReactNode
}

function isAbsent(value: PrimitiveCellValue): boolean {
	if (value === null || value === undefined) return true
	if (typeof value === "string") return value.trim().length === 0
	if (value instanceof Date) return Number.isNaN(value.getTime())
	return false
}

export function CellValue({
	value,
	kind = "value",
	display,
	href,
	currency,
	minimumFractionDigits,
	maximumFractionDigits,
	locale,
	dateLocale,
	pattern,
	from,
	moneyUnit,
	fallback,
	missing,
	wrap = false,
	className,
	children,
}: CellValueProps) {
	const wrapper = cx("cell-value--component", !wrap && styles.nowrap, className)

	/* The date primitives read their locale from the scope, so `dateLocale` scopes it around this value. */
	const config = useContext(UIConfigContext)
	const scoped = useMemo(
		() => (dateLocale ? { ...config, dates: { ...config.dates, locale: dateLocale } } : null),
		[config, dateLocale],
	)

	if (children !== undefined) return <span className={wrapper}>{children}</span>
	if (display !== undefined) return <span className={wrapper}>{display}</span>

	if (missing || isAbsent(value)) {
		return (
			<span className={wrapper}>
				<EmptyValue label={fallback} />
			</span>
		)
	}

	const text = typeof value === "string" || typeof value === "number" ? value : String(value)
	const numeric = typeof value === "number" ? value : Number(value)

	const node = (() => {
		switch (kind) {
			case "secondary":
				return <SecondaryValue>{text}</SecondaryValue>
			case "muted":
				return <MutedValue>{text}</MutedValue>
			case "name":
				return <Name value={String(text)} />
			case "mono":
				return <MonoValue>{text}</MonoValue>
			case "link":
			case "url":
				return <Link href={href ?? String(text)}>{text}</Link>
			case "email":
				return <Email value={String(text)} />
			case "phone":
				return <Phone value={String(text)} />
			case "money":
				/* The raw value, not `Number(value)`: Money parses grouped US/EU strings; `Number("1.234,56")` is NaN. */
				return (
					<Money amount={value as number | string} currency={currency} unit={moneyUnit} locale={locale} />
				)
			case "number":
				return (
					<NumberPrimitive
						value={numeric}
						locale={locale}
						options={{ minimumFractionDigits, maximumFractionDigits }}
					/>
				)
			case "percent":
				return (
					<Percent
						value={numeric}
						locale={locale}
						options={{ minimumFractionDigits, maximumFractionDigits }}
					/>
				)
			case "fileSize":
				return <FileSize value={numeric} from={from} />
			case "date":
				return <DatePrimitive value={value} pattern={pattern} />
			case "time":
				return <Time value={value} pattern={pattern} />
			case "dateTime":
				return <DateTime value={value} pattern={pattern} />
			case "relativeTime":
				return <RelativeTime value={value} />
			default:
				return <Value>{text}</Value>
		}
	})()

	return (
		<span className={wrapper}>
			{scoped ? <UIConfigContext.Provider value={scoped}>{node}</UIConfigContext.Provider> : node}
		</span>
	)
}

export interface CellStackProps {
	/** Rendered top to bottom. A `false` entry is dropped, so a conditional line is one `&&`. */
	values: CellStackValue[]
	className?: string
}

/** Several values stacked in one cell (a name over an email) without a bespoke component. */
export function CellStack({ values, className }: CellStackProps) {
	const entries = values.filter((entry) => entry !== false)
	if (entries.length === 0) return <EmptyValue />

	return (
		<span className={cx("cell-stack--component", styles.cellStack, className)}>
			{entries.map((entry, index) => {
				const key = `cell-${index}`

				if (Array.isArray(entry)) {
					const [value, kind, options] = entry as CellValueTuple
					return <CellValue key={key} value={value} kind={kind} {...options} />
				}

				if (entry !== null && typeof entry === "object" && !(entry instanceof Date)) {
					// A rendered element carries its own everything; a descriptor does not.
					if ("type" in entry) return <span key={key}>{entry as ReactElement}</span>
					return <CellValue key={key} {...(entry as CellValueDescriptor)} />
				}

				return <CellValue key={key} value={entry as PrimitiveCellValue} />
			})}
		</span>
	)
}
