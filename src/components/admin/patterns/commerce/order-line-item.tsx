/**
 * OrderLineItem: one row of ordered goods (thumbnail, title, variant, SKU,
 * `unit × quantity`, total), shared by fulfillment groups, refunds and packing slips.
 * It never computes the total: discounts, tax and proration break `unit × quantity`.
 */
import { ImageIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { MetadataList, VisuallyHidden } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultFulfillmentGroupStrings, type FulfillmentGroupStrings } from "./commerce.strings"
import styles from "./commerce.module.css"

/** A per-line fact the kit did not anticipate — a gift message, engraving, an interval. */
export interface OrderLineProperty {
	label: ReactNode
	value: ReactNode
}

export interface OrderLine {
	id: string
	title: string
	/** The chosen option — "OS / blue". */
	variantTitle?: string
	sku?: string
	imageSrc?: string
	imageAlt?: string
	/** Already formatted, including its currency. */
	unitPrice: string
	quantity: number
	/** Already formatted. Passed, never multiplied. */
	total: string
	/** Rendered as label/value rows under the title, so every consumer's extras match. */
	properties?: OrderLineProperty[]
	/** Whatever `properties` cannot express. */
	children?: ReactNode
}

/* `id` and `title` are the line's, not the div's DOM id and tooltip. */
export interface OrderLineItemProps
	extends Omit<ComponentProps<"div">, "children" | "id" | "title">,
		OrderLine {
	strings?: Partial<FulfillmentGroupStrings>
}

export function OrderLineItem({
	id: _id,
	title,
	variantTitle,
	sku,
	imageSrc,
	imageAlt,
	unitPrice,
	quantity,
	total,
	properties,
	children,
	strings,
	className,
	...props
}: OrderLineItemProps) {
	const copy = { ...defaultFulfillmentGroupStrings, ...strings }

	return (
		<div className={cx("order-line-item--component", styles.lineItem, className)} {...props}>
			<span className={styles.lineThumb}>
				{imageSrc ? (
					<img
						src={imageSrc}
						alt={imageAlt ?? title}
						onError={(event) => {
							/* On a failed load, hide the image and show the placeholder. */
							event.currentTarget.hidden = true
						}}
					/>
				) : (
					<ImageIcon className={styles.lineThumbIcon} aria-hidden="true" />
				)}
			</span>

			<div className={styles.lineBody}>
				<Text weight="medium" className="order-line-item--title">
					{title}
				</Text>

				{(variantTitle != null || sku != null) && (
					<span className={styles.lineMeta}>
						{variantTitle != null && <Badge tone="neutral">{variantTitle}</Badge>}
						{/* An identifier, so mono. */}
						{sku != null && <MonoValue size="xs" type="secondary">{sku}</MonoValue>}
					</span>
				)}

				{properties && properties.length > 0 && (
					<MetadataList layout="inline" density="compact" items={properties.map((property, index) => ({
						id: String(index), label: property.label, value: property.value,
					}))} />
				)}

				{children}
			</div>

			{/*
			 * One accessible string for the price column, as hidden text: an `aria-label` on
			 * a role-less span is ignored, and the visible parts are `aria-hidden`.
			 */}
			<span className={styles.linePrice}>
				<VisuallyHidden>{copy.formatUnitPrice(unitPrice, quantity)}</VisuallyHidden>
				<Text tag="span" size="xs" type="secondary" numeric aria-hidden="true">
					{unitPrice}
				</Text>
				<Text tag="span" size="xs" type="secondary" aria-hidden="true">
					×
				</Text>
				<Text tag="span" size="xs" weight="medium" numeric aria-hidden="true">
					{quantity}
				</Text>
			</span>

			<Text tag="span" weight="medium" numeric className={styles.lineTotal}>
				{total}
			</Text>
		</div>
	)
}
