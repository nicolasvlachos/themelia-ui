/**
 * Address: a postal address, ordered for its country. `block` renders an `<address>` with
 * one element per line; `inline` is a one-line span. Both share one ordering.
 */
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { useFormatting } from "@/lib/ui-provider"

import { ValueRoot, type ValueProps } from "./value"
import {
	formatAddress,
	formatAddressLines,
	type AddressOrder,
	type AddressParts,
} from "./address.format"

import styles from "./address.module.css"

export interface AddressProps
	extends Omit<ComponentPropsWithoutRef<"address">, "children" | "color"> {
	/** The address, as fields. Anything empty simply drops out. */
	value?: AddressParts | null
	/**
	 * `block` is the envelope form across several lines; `inline` is one line for a cell.
	 */
	format?: "block" | "inline"
	/**
	 * An ISO country code deciding the line order (`US`, `GB`, `DE`). Read from
	 * `value.country` when that is a code; never inferred from the reader's locale.
	 */
	countryCode?: string | null
	/** Overrides the ordering outright, for a country the kit does not know. */
	order?: AddressOrder
	emptyLabel?: ReactNode
	size?: ValueProps["size"]
	weight?: ValueProps["weight"]
	type?: ValueProps["type"]
	ref?: Ref<HTMLElement>
}

export function Address({
	value,
	format = "block",
	countryCode,
	order,
	emptyLabel,
	size,
	weight,
	type,
	className,
	ref,
	...props
}: AddressProps) {
	const { locale } = useFormatting()

	/* A two-letter `country` is a code; a longer one is a name and stays a printed line. */
	const fromValue = value?.country && /^[A-Za-z]{2}$/.test(value.country.trim()) ? value.country : undefined
	const resolvedCode = countryCode ?? fromValue

	if (format === "inline") {
		return (
			<ValueRoot
				hook="address"
				emptyLabel={emptyLabel}
				size={size}
				weight={weight}
				type={type}
				className={className}
				ref={ref as Ref<HTMLSpanElement>}
				{...(props as object)}
			>
				{value ? formatAddress(value, { countryCode: resolvedCode, order, locale }) || undefined : undefined}
			</ValueRoot>
		)
	}

	const lines = value ? formatAddressLines(value, { countryCode: resolvedCode, order, locale }) : []

	if (lines.length === 0) {
		return (
			<ValueRoot
				hook="address"
				emptyLabel={emptyLabel}
				size={size}
				weight={weight}
				type={type}
				className={className}
				ref={ref as Ref<HTMLSpanElement>}
				{...(props as object)}
			>
				{undefined}
			</ValueRoot>
		)
	}

	return (
		<address ref={ref} className={cx("address--component", styles.block, className)} {...props}>
			{lines.map((line) => (
				<Text key={line} tag="span" size={size} weight={weight} type={type} className={styles.line}>
					{line}
				</Text>
			))}
		</address>
	)
}
