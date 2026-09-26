/**
 * The order page's surfaces: header, fulfillment groups, summary. An order splits into
 * fulfillment groups with their own state; its money moves on a separate axis.
 */
import { MapPinIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { ActionButtons, ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import { Badge } from "@/components/base/badge"
import { Alert, AlertDescription } from "@/components/base/feedback"
import { ContentBlock } from "@/components/base/display"
import { Heading, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import {
	defaultFulfillmentGroupStrings, defaultOrderHeaderStrings, defaultOrderStatusVocabulary,
	defaultOrderSummaryStrings,
	type FulfillmentGroupStrings, type OrderHeaderStrings, type OrderStatusVocabulary,
	type OrderSummaryStrings,
} from "./commerce.strings"
import {
	FULFILLMENT_STATUS_TONE, PAYMENT_STATUS_TONE,
	type FulfillmentStatus, type PaymentStatus,
} from "./commerce.types"
import { OrderLineItem, type OrderLine } from "./order-line-item"
import { AmountRow, SummaryPanel } from "./summary-panel"
import styles from "./commerce.module.css"

/** Resolves the two status vocabularies against a partial override. */
function resolveVocabulary(vocabulary?: Partial<OrderStatusVocabulary>): OrderStatusVocabulary {
	return {
		fulfillment: { ...defaultOrderStatusVocabulary.fulfillment, ...vocabulary?.fulfillment },
		payment: { ...defaultOrderStatusVocabulary.payment, ...vocabulary?.payment },
	}
}

/* ══ OrderHeader ═══════════════════════════════════════════════════════════════════ */

export interface OrderHeaderProps extends Omit<ComponentProps<"div">, "children"> {
	orderNumber: string
	/** Where the goods are. */
	fulfillmentStatus?: FulfillmentStatus
	/** Where the money is. */
	paymentStatus?: PaymentStatus
	/** Already formatted. */
	placedAt?: string
	/** Where the order came from — a channel, an app, an import. */
	source?: string
	actions?: ActionDefinition[]
	strings?: Partial<OrderHeaderStrings>
	vocabulary?: Partial<OrderStatusVocabulary>
}

export function OrderHeader({
	orderNumber,
	fulfillmentStatus,
	paymentStatus,
	placedAt,
	source,
	actions,
	strings,
	vocabulary,
	className,
	...props
}: OrderHeaderProps) {
	const copy = { ...defaultOrderHeaderStrings, ...strings }
	const words = resolveVocabulary(vocabulary)

	/* Date, source, both or neither; each status badge renders only when given. */
	const origin =
		placedAt != null && source != null
			? copy.formatOrigin(placedAt, source)
			: (placedAt ?? source)

	return (
		<div className={cx("order-header--component", styles.orderHeader, className)} {...props}>
			<div className={styles.orderHeaderTop}>
				<Heading level={1} size="lg" className="order-header--number">
					{copy.formatOrderNumber(orderNumber)}
				</Heading>

				{paymentStatus != null && (
					<Badge tone={PAYMENT_STATUS_TONE[paymentStatus]} dot>
						{words.payment[paymentStatus]}
					</Badge>
				)}
				{fulfillmentStatus != null && (
					<Badge tone={FULFILLMENT_STATUS_TONE[fulfillmentStatus]} dot>
						{words.fulfillment[fulfillmentStatus]}
					</Badge>
				)}

				{actions && actions.length > 0 && (
					<span className={styles.orderHeaderActions}>
						<ActionMenu actions={actions} />
					</span>
				)}
			</div>

			{origin != null && (
				<Text size="xs" type="secondary" className="order-header--origin">
					{origin}
				</Text>
			)}
		</div>
	)
}

/* ══ FulfillmentGroup ══════════════════════════════════════════════════════════════ */

export interface FulfillmentGroupProps extends Omit<ComponentProps<"div">, "children"> {
	status: FulfillmentStatus
	/** Where it ships from. */
	location?: ReactNode
	/** A standing fact about the group — "Shipping not required". */
	notice?: ReactNode
	/** The glyph beside the notice. A component, so the group sizes it. */
	noticeIcon?: LucideIcon
	items?: OrderLine[]
	/** Overrides `items` entirely, for a caller who needs the rows themselves. */
	children?: ReactNode
	/** The first renders as a button; the rest collapse into an overflow menu. */
	actions?: ActionDefinition[]
	strings?: Partial<FulfillmentGroupStrings>
	vocabulary?: Partial<OrderStatusVocabulary>
}

export function FulfillmentGroup({
	status,
	location,
	notice,
	noticeIcon: NoticeIcon,
	items,
	children,
	actions,
	strings,
	vocabulary,
	className,
	...props
}: FulfillmentGroupProps) {
	const copy = { ...defaultFulfillmentGroupStrings, ...strings }
	const words = resolveVocabulary(vocabulary)

	/* Counts `items` only; with custom `children` the heading carries no count. */
	const heading =
		items != null
			? copy.formatHeading(words.fulfillment[status], items.length)
			: words.fulfillment[status]

	return (
		<ContentBlock
			surface="card"
			/* Flush, so the band rules reach the card's border; each band pays its own inset. */
			flush
			className={cx("fulfillment-group--component", styles.group, className)}
			{...props}
		>
			<div className={cx("fulfillment-group--header", styles.groupHead)}>
				<div className={styles.groupHeadTop}>
					<Badge tone={FULFILLMENT_STATUS_TONE[status]} dot>
						{heading}
					</Badge>
					{/* A place, not a pill: pills in this kit are states. */}
					{location != null && (
						<span className={cx("fulfillment-group--location", styles.groupLocation)}>
							<MapPinIcon className={styles.groupMarkIcon} aria-hidden="true" />
							<Text tag="span" size="xs" type="secondary">
								{location}
							</Text>
						</span>
					)}
				</div>

				{notice != null && (
					<span className={styles.groupNotice}>
						{NoticeIcon && <NoticeIcon className={styles.groupMarkIcon} aria-hidden="true" />}
						<Text tag="span" size="xs" type="secondary">
							{notice}
						</Text>
					</span>
				)}
			</div>

			<div className={cx("fulfillment-group--items", styles.groupItems)}>
				{children ?? items?.map((line) => <OrderLineItem key={line.id} {...line} strings={strings} />)}
			</div>

			{actions && actions.length > 0 && (
				<div className={styles.groupActions}>
					<ActionButtons actions={actions} max={1} />
				</div>
			)}
		</ContentBlock>
	)
}

/* ══ OrderSummary ══════════════════════════════════════════════════════════════════ */

export interface SummaryLine {
	id?: string
	label: ReactNode
	/** A middle column — "3 items", "20%". */
	note?: ReactNode
	/** Already formatted, including its currency. */
	amount: string
	/** Money off the customer's total. */
	deduction?: boolean
}

export interface OrderSummaryProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	/** What was ordered — subtotal, discount, shipping, tax. */
	goods: SummaryLine[]
	/** The line the eye should land on. */
	total: SummaryLine
	/** What has actually moved — paid, refunded, balance. */
	payments?: SummaryLine[]
	paymentStatus?: PaymentStatus
	/** A standing caveat about the balance, not an error. */
	alert?: ReactNode
	strings?: Partial<OrderSummaryStrings>
	vocabulary?: Partial<OrderStatusVocabulary>
}

export function OrderSummary({
	goods,
	total,
	payments,
	paymentStatus,
	alert,
	strings,
	vocabulary,
	className,
	...props
}: OrderSummaryProps) {
	const copy = { ...defaultOrderSummaryStrings, ...strings }
	const words = resolveVocabulary(vocabulary)

	const row = (line: SummaryLine, index: number, isTotal = false) => (
		<AmountRow
			key={line.id ?? index}
			label={line.label}
			note={line.note}
			amount={line.amount}
			deduction={line.deduction}
			total={isTotal}
		/>
	)

	return (
		<ContentBlock
			title={copy.title}
			headerEnd={
				paymentStatus != null ? (
					<Badge tone={PAYMENT_STATUS_TONE[paymentStatus]}>{words.payment[paymentStatus]}</Badge>
				) : undefined
			}
			className={cx("order-summary--component", styles.block, className)}
			{...props}
		>
			<SummaryPanel>
				{goods.map((line, index) => row(line, index))}
				{row(total, -1, true)}
			</SummaryPanel>

			{/* A separate panel: what was ordered and what has moved are different questions. */}
			{payments && payments.length > 0 && (
				<SummaryPanel>{payments.map((line, index) => row(line, index))}</SummaryPanel>
			)}

			{alert != null && (
				/* `note`: standing information, not an error. */
				<Alert tone="warning" role="note" className="order-summary--alert">
					<AlertDescription>{alert}</AlertDescription>
				</Alert>
			)}
		</ContentBlock>
	)
}
