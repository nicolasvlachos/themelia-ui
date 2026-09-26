/**
 * Money. Currency, locale and the dual-pricing policy resolve through the provider.
 * Not right-aligned by default: it is a span in running text as often as a cell;
 * `<TableCell align="end">` aligns a column.
 */
import type { ReactNode, Ref } from "react"

import { cx } from "@/lib/cx"
import {
	useFormatting, useMoneyConfig,
	type MoneyFormatMode, type MoneyDisplayMode, type MoneyLayout, type MoneySecondaryEmphasis,
} from "@/lib/ui-provider"

import styles from "./money.module.css"
import { ValueRoot, type SpanProps, type ValueProps } from "./value"

/** The unit the amount ARRIVES in. `minor` is cents, pence, öre. */
export type MoneyUnit = "major" | "minor"

export interface MoneyValue {
	/**
	 * The amount, in a channel separate from its currency. A number or a decimal string: a
	 * single dot is decimal, and a grouped US or EU string is parsed by POSITION — whichever
	 * of , or . appears last is the decimal point — so a value that came back through a
	 * European locale does not parse a thousand times too large.
	 */
	amount?: number | string | null
	/** The amount's ISO currency code, kept apart from the amount all the way to the render. */
	currency?: string
	/**
	 * The unit the amount ARRIVES in. Use `minor` for APIs that store integer minor units.
	 * @default "major"
	 */
	unit?: MoneyUnit
	/**
	 * Minor units per major unit, for a currency whose exponent is not two.
	 * @default 100
	 */
	minorUnitScale?: number
	/**
	 * How this amount is written. Falls back to the scope's `money.formatMode`, so
	 * `UIProvider` defaults can change it.
	 * @default "with-symbol"
	 */
	formatMode?: MoneyFormatMode
}

export interface MoneyProps extends SpanProps, MoneyValue {
	/** Overrides the scope's locale for this value. */
	locale?: string
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	align?: ValueProps["align"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	/**
	 * A converted value shown beside the primary one. Passing it is the request for the pair:
	 * the scope's policy can narrow that (`displayMode="primary-only"`) but never widen it,
	 * and never invents a value.
	 */
	secondary?: MoneyValue | null
	/** Whether the pair shows. `dynamic` shows it only when the two codes actually differ. */
	displayMode?: MoneyDisplayMode
	/** Beside, or under. Falls back to the scope's `money.layout`. */
	layout?: MoneyLayout
	/** How loud the second value is against the first. */
	secondaryEmphasis?: MoneySecondaryEmphasis
	/**
	 * Between the two, inline. A middle dot; pass an arrow for a conversion. It is
	 * `aria-hidden`: read aloud, the mark between two amounts is punctuation for the eye.
	 */
	separator?: ReactNode
	ref?: Ref<HTMLSpanElement>
}

/** A plain API decimal string: dot as the decimal point, no grouping. */
const DECIMAL_STRING = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i

/**
 * Accepts "1.234,56" as readily as "1,234.56": when both marks appear, the last one is
 * the decimal point.
 */
function normalizeDecimalString(value: string): string {
	const trimmed = value.trim()
	if (!trimmed) return ""
	// API decimal strings take precedence over ambiguous locale grouping marks.
	if (DECIMAL_STRING.test(trimmed)) return trimmed

	const comma = trimmed.lastIndexOf(",")
	const dot = trimmed.lastIndexOf(".")

	if (comma >= 0 && dot >= 0) {
		const decimal = comma > dot ? "," : "."
		const grouping = decimal === "," ? "." : ","
		const [whole = "", fraction, ...rest] = trimmed.split(decimal)
		const groups = whole.replace(/^[+-]/, "").split(grouping)
		if (rest.length || fraction === undefined || !/^\d*$/.test(fraction) ||
			!/^\d{1,3}$/.test(groups[0] ?? "") || groups.slice(1).some(group => !/^\d{3}$/.test(group))) return trimmed
		return `${whole.split(grouping).join("")}.${fraction}`
	}
	if (comma >= 0) {
		if (/^[+-]?\d{1,3}(?:,\d{3})+$/.test(trimmed)) return trimmed.split(",").join("")
		return /^[+-]?\d*,\d+$/.test(trimmed) ? trimmed.replace(",", ".") : trimmed
	}
	if (/^[+-]?\d{1,3}(?:\.\d{3})+$/.test(trimmed)) return trimmed.split(".").join("")
	return trimmed
}

function parseAmount(amount: MoneyValue["amount"]): number | null {
	if (amount === null || amount === undefined || amount === "") return null
	const normalized = typeof amount === "number" ? amount : normalizeDecimalString(amount)
	if (typeof normalized === "string" && !DECIMAL_STRING.test(normalized)) return null
	const parsed = Number(normalized)
	return Number.isFinite(parsed) ? parsed : null
}

function toMajor(value: MoneyValue): number | null {
	const parsed = parseAmount(value.amount)
	if (parsed === null) return null
	if (value.unit !== "minor") return parsed
	const scale = value.minorUnitScale
	return parsed / (scale !== undefined && Number.isFinite(scale) && scale > 0 ? scale : 100)
}

/** The currency's own decimal places, from Intl (JPY has none, KWD three). */
function fractionDigits(currency: string, locale?: string) {
	try {
		const resolved = new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions()
		return {
			minimumFractionDigits: resolved.minimumFractionDigits ?? 2,
			maximumFractionDigits: resolved.maximumFractionDigits ?? 2,
		}
	} catch {
		return { minimumFractionDigits: 2, maximumFractionDigits: 2 }
	}
}

function formatMoney(value: number, currency: string, locale: string | undefined, mode: MoneyFormatMode) {
	const digits = fractionDigits(currency, locale)

	if (mode === "decimal" || !currency) return new Intl.NumberFormat(locale, digits).format(value)
	if (mode === "with-code") return `${new Intl.NumberFormat(locale, digits).format(value)} ${currency}`

	try {
		return new Intl.NumberFormat(locale, {
			...digits,
			style: "currency",
			currency,
			currencyDisplay: "symbol",
		}).format(value)
	} catch {
		// An unknown code: a crypto ticker, an internal unit.
		return `${new Intl.NumberFormat(locale, digits).format(value)} ${currency}`
	}
}

export function Money({
	amount,
	currency,
	unit,
	minorUnitScale,
	formatMode,
	locale,
	align,
	secondary,
	displayMode,
	layout,
	secondaryEmphasis = "discrete",
	separator = "·",
	className,
	...props
}: MoneyProps) {
	const { locale: scopeLocale } = useFormatting()
	const money = useMoneyConfig()

	const resolvedLocale = locale ?? scopeLocale
	const resolvedCurrency = currency ?? money.defaultCurrency
	const resolvedMode = formatMode ?? money.formatMode
	const primary = toMajor({ amount, unit, minorUnitScale })

	if (primary === null) {
		return <ValueRoot hook="money" numeric align={align} className={className} {...props} />
	}

	const primaryLabel = formatMoney(primary, resolvedCurrency, resolvedLocale, resolvedMode)

	/* The policy can only narrow what the call site asked for: no `secondary`, no pair. */
	const secondaryAmount = secondary ? toMajor(secondary) : null
	const secondaryCurrency = secondary?.currency ?? money.displayCurrency ?? resolvedCurrency
	const mode = displayMode ?? (money.dualPricingEnabled ? money.displayMode : "dual")
	const showSecondary =
		secondaryAmount !== null &&
		secondaryEmphasis !== "hidden" &&
		mode !== "primary-only" &&
		(mode !== "dynamic" || secondaryCurrency !== resolvedCurrency)

	if (!showSecondary || !secondary) {
		return (
			<ValueRoot hook="money" numeric align={align} className={className} {...props}>
				{primaryLabel}
			</ValueRoot>
		)
	}

	const secondaryLabel = formatMoney(
		secondaryAmount,
		secondaryCurrency,
		resolvedLocale,
		secondary.formatMode ?? resolvedMode,
	)
	const resolvedLayout = layout ?? money.layout
	const emphasis = secondaryEmphasis

	return (
		<ValueRoot
			hook="money"
			numeric
			align={align}
			data-layout={resolvedLayout}
			className={cx(styles.pair, resolvedLayout === "stacked" && styles.stacked, className)}
			{...props}
		>
			<span className={styles.primary}>{primaryLabel}</span>
			{resolvedLayout === "inline" && (
				/* Punctuation for the eye only; not read aloud. */
				<span className={styles.separator} aria-hidden>
					{separator}
				</span>
			)}
			<span className={styles.secondary} data-emphasis={emphasis}>
				{secondaryLabel}
			</span>
		</ValueRoot>
	)
}
