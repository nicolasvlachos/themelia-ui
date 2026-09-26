/**
 * MetadataValue — a typed fact rendered by the primitive that knows its kind. A
 * descriptor (`{ kind: "money", value: 4200, currency: "EUR" }`) is serialisable data;
 * `kind: "node"` passes a node through. Each descriptor exposes only the fields its
 * primitive consumes, so a mismatched field is a type error.
 */
import type { ReactNode } from "react"

import { Badge, type BadgeProps } from "@/components/base/badge"
import {
	Date as DateValue, DateTime, Email, EmptyValue, Link, Money, MonoValue, Phone, Time,
	Url, Value,
	type DateInput, type MoneyProps,
} from "@/components/primitives"
import { EMPTY } from "@/lib/format"
import { cx } from "@/lib/cx"

export type MetadataValueKind =
	| "text" | "mono" | "email" | "phone" | "url" | "link"
	| "date" | "time" | "datetime" | "money" | "badge" | "node" | "empty"

type DisplayValue = Exclude<ReactNode, null | undefined>
type DateValueInput = Exclude<DateInput, null | undefined>

/** Styling hook shared by every descriptor. */
interface DescriptorBase {
	className?: string
}

/** Absent handling, shared by every descriptor whose value can arrive blank. */
interface ValueFallback {
	/** Shown when the value is absent. Defaults to an em dash. */
	emptyLabel?: ReactNode
}

/** Pre-rendered content used verbatim, bypassing this descriptor's formatting. */
interface DisplayOverride {
	display?: ReactNode
}

export type MetadataTextValueDescriptor = DescriptorBase & ValueFallback & DisplayOverride & {
	/** Plain text. The default when `kind` is omitted. */
	kind?: "text"
	value: DisplayValue
}

export type MetadataMonoValueDescriptor = DescriptorBase & ValueFallback & DisplayOverride & {
	/** Fixed width, for ids, hashes, and codes that compare down a column. */
	kind: "mono"
	value: DisplayValue
}

export type MetadataContactValueDescriptor = DescriptorBase & ValueFallback & DisplayOverride & {
	/** Rendered as the matching `mailto:`, `tel:`, or external link. */
	kind: "email" | "phone" | "url"
	value: string
}

export type MetadataLinkValueDescriptor = DescriptorBase & ValueFallback & DisplayOverride & {
	/** A link whose text and destination differ. */
	kind: "link"
	href: string
	/** Falls back to `href`. */
	value?: DisplayValue
}

/*
 * Temporal kinds take only `pattern`: locale and default pattern come from the scope's
 * dates config, so a fact can't disagree with its surface.
 */
export type MetadataDateValueDescriptor = DescriptorBase & ValueFallback & {
	kind: "date"
	value: DateValueInput
	/** A date-fns pattern, overriding the scope's. */
	pattern?: string
}

export type MetadataTimeValueDescriptor = DescriptorBase & ValueFallback & {
	kind: "time"
	value: DateValueInput
	pattern?: string
}

export type MetadataDateTimeValueDescriptor = DescriptorBase & ValueFallback & {
	kind: "datetime"
	value: DateValueInput
	pattern?: string
}

/*
 * Money: symbol, currency display and fraction digits are scope policy; a fact sets only
 * what varies between amounts.
 */
export type MetadataMoneyValueDescriptor = DescriptorBase & ValueFallback & {
	kind: "money"
	/** In major units, unless `minorUnitScale` says otherwise. */
	value: number | string
	currency?: MoneyProps["currency"]
	unit?: MoneyProps["unit"]
	minorUnitScale?: MoneyProps["minorUnitScale"]
	formatMode?: MoneyProps["formatMode"]
	locale?: MoneyProps["locale"]
}

export type MetadataBadgeValueDescriptor = DescriptorBase & ValueFallback & DisplayOverride & {
	kind: "badge"
	value: DisplayValue
	badgeTone?: BadgeProps["tone"]
	badgeVariant?: BadgeProps["variant"]
}

export type MetadataNodeValueDescriptor = {
	/** Arbitrary content, bypassing every formatting path here. */
	kind: "node"
	node: ReactNode
}

export type MetadataEmptyValueDescriptor = DescriptorBase & ValueFallback & {
	/**
	 * Known-absent: renders the dash, saying "we looked", unlike an omitted row.
	 */
	kind: "empty"
}

export type MetadataValueDescriptor =
	| MetadataTextValueDescriptor
	| MetadataMonoValueDescriptor
	| MetadataContactValueDescriptor
	| MetadataLinkValueDescriptor
	| MetadataDateValueDescriptor
	| MetadataTimeValueDescriptor
	| MetadataDateTimeValueDescriptor
	| MetadataMoneyValueDescriptor
	| MetadataBadgeValueDescriptor
	| MetadataNodeValueDescriptor
	| MetadataEmptyValueDescriptor

export type MetadataValueProps = MetadataValueDescriptor

const HOOK = "metadata-value--component"

function isAbsent(value: unknown) {
	return value === null || value === undefined || value === ""
}

function renderAbsent(className: string | undefined, emptyLabel: ReactNode = EMPTY) {
	return <EmptyValue size="inherit" label={emptyLabel} className={cx(HOOK, className)} />
}

/** Exhaustiveness check: a new kind without a case is a compile error. */
function assertNever(value: never): never {
	throw new Error(`Unsupported metadata value descriptor: ${JSON.stringify(value)}`)
}

export function MetadataValue(props: MetadataValueProps) {
	if (props.kind === "node") return <>{props.node}</>
	if (props.kind === "empty") return renderAbsent(props.className, props.emptyLabel)

	// A link is the exception: it has a destination even when it has no text.
	if (props.kind !== "link" && isAbsent(props.value)) {
		return renderAbsent(props.className, props.emptyLabel)
	}

	const className = cx(HOOK, props.className)

	switch (props.kind) {
		case undefined:
		case "text":
			return <Value size="inherit" className={cx("metadata-value--component", className)}>{props.display ?? props.value}</Value>
		case "mono":
			return <MonoValue size="inherit" className={className}>{props.display ?? props.value}</MonoValue>
		case "email":
			return <Email value={props.value} display={props.display} emptyLabel={props.emptyLabel} className={className} />
		case "phone":
			return <Phone value={props.value} display={props.display} emptyLabel={props.emptyLabel} className={className} />
		case "url":
			return <Url value={props.value} display={props.display} emptyLabel={props.emptyLabel} className={className} />
		case "link":
			return (
				<Link href={props.href} emptyLabel={props.emptyLabel} className={className}>
					{props.display ?? props.value ?? props.href}
				</Link>
			)
		case "date":
			return <DateValue value={props.value} pattern={props.pattern} emptyLabel={props.emptyLabel} size="inherit" className={className} />
		case "time":
			return <Time value={props.value} pattern={props.pattern} emptyLabel={props.emptyLabel} size="inherit" className={className} />
		case "datetime":
			return <DateTime value={props.value} pattern={props.pattern} emptyLabel={props.emptyLabel} size="inherit" className={className} />
		case "money":
			return (
				<Money
					amount={props.value} currency={props.currency} unit={props.unit}
					minorUnitScale={props.minorUnitScale} formatMode={props.formatMode}
					locale={props.locale} emptyLabel={props.emptyLabel} size="inherit" className={className}
				/>
			)
		case "badge":
			return (
				<Badge tone={props.badgeTone ?? "secondary"} variant={props.badgeVariant} className={className}>
					{props.display ?? props.value}
				</Badge>
			)
		default:
			return assertNever(props)
	}
}
