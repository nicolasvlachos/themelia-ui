/**
 * What happened to an order: its stage, journey, parcel and refund. Every status chip
 * derives its tone from a typed union; there is no tone prop to contradict the data.
 */
import { PackageIcon, RotateCcwIcon, TruckIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import {
	Collapsible, CollapsibleContent, CollapsibleTrigger, ContentBlock, MetadataList,
} from "@/components/base/display"
import { Copyable } from "@/components/base/copyable"
import { Timeline, type TimelineItem } from "@/components/base/timeline"
import { Steps, type Step } from "@/components/patterns/timelines"
import { Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import {
	defaultOrderStatusStrings, defaultRefundStrings, defaultShipmentStrings,
	type OrderStatusStrings, type RefundStrings, type ShipmentStrings,
} from "./commerce.strings"
import {
	ORDER_STATUS_TONE, REFUND_STAGES, SHIPMENT_STATUS_TONE,
	type OrderStatus, type RefundStage, type ShipmentStatus,
} from "./commerce.types"
import { AmountRow, SummaryPanel } from "./summary-panel"
import styles from "./commerce.module.css"

/* ══ OrderStatusCard ═══════════════════════════════════════════════════════════════ */

export interface OrderEvent {
	id: string
	label: string
	/** Already formatted. */
	timestamp?: string
	complete: boolean
}

export interface OrderStatusCardProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	orderNumber: string
	status: OrderStatus
	/** Oldest first, so "latest complete" and "next" are found by position. */
	events: OrderEvent[]
	/** Already formatted. */
	eta?: string
	/**
	 * Opens the full event list on first render. Closed by default: the panel above
	 * already summarises it.
	 */
	defaultHistoryOpen?: boolean
	strings?: Partial<OrderStatusStrings>
}

export function OrderStatusCard({
	orderNumber,
	status,
	events,
	eta,
	defaultHistoryOpen = false,
	strings,
	className,
	...props
}: OrderStatusCardProps) {
	const copy = { ...defaultOrderStatusStrings, ...strings }
	const statusLabel = copy[status]

	/* The furthest complete event, not the last in the list — they differ once one is skipped. */
	const latestIndex = events.findLastIndex(event => event.complete)
	const latest = events[latestIndex]
	const terminal = status === "cancelled" || status === "delivered"
	const next = terminal ? undefined : events.slice(latestIndex + 1).find(event => !event.complete)

	return (
		<ContentBlock
			icon={<PackageIcon aria-hidden="true" />}
			title={copy.title}
			titleSuffix={<Badge tone={ORDER_STATUS_TONE[status]}>{statusLabel}</Badge>}
			description={<MonoValue>{orderNumber}</MonoValue>}
			className={cx("order-status--component", styles.block, className)}
			{...props}
		>
			{(latest || next || eta != null) && (
				<SummaryPanel>
					<MetadataList layout="rows" items={[
						...(latest ? [{ id: "latest", label: copy.latestEvent, value: latest.label, description: latest.timestamp }] : []),
						...(next ? [{ id: "next", label: copy.nextStep, value: next.label }] : []),
						...(eta != null ? [{ id: "eta", label: copy.eta, value: eta }] : []),
					]} />
				</SummaryPanel>
			)}

			{events.length > 0 && (
				<Collapsible defaultOpen={defaultHistoryOpen}>
					<CollapsibleTrigger className={styles.orderHistoryToggle}>
						<Text tag="span" size="xs" weight="medium">
							{copy.formatHistory(events.length)}
						</Text>
					</CollapsibleTrigger>
					<CollapsibleContent className={styles.orderHistory}>
						<Timeline
							items={events.map((event) => ({
								id: event.id,
								title: event.label,
								timestamp: event.timestamp,
								status: event.complete ? "completed" : "pending",
							}))}
						/>
					</CollapsibleContent>
				</Collapsible>
			)}
		</ContentBlock>
	)
}

/* ══ OrderTimeline ═════════════════════════════════════════════════════════════════ */

export interface OrderTimelineEvent {
	id: string
	title: string
	description?: string
	/** Already formatted. */
	timestamp: string
	status: "completed" | "current" | "pending"
}

export interface OrderTimelineProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	events: OrderTimelineEvent[]
}

export function OrderTimeline({ events, className, ...props }: OrderTimelineProps) {
	const items: TimelineItem[] = events.map((event) => ({
		id: event.id,
		title: event.title,
		description: event.description,
		timestamp: event.timestamp,
		status: event.status,
	}))

	return (
		<ContentBlock className={cx("order-timeline--component", className)} {...props}>
			<Timeline items={items} />
		</ContentBlock>
	)
}

/* ══ PaymentTimeline ═══════════════════════════════════════════════════════════════ */

export interface PaymentEvent {
	id: string
	label: string
	/** Already formatted. */
	date: string
	/** Already formatted, including its currency. */
	amount?: string
	icon?: LucideIcon
	settled: boolean
}

export interface PaymentTimelineProps extends Omit<ComponentProps<"div">, "children"> {
	events: PaymentEvent[]
}

export function PaymentTimeline({ events, className, ...props }: PaymentTimelineProps) {
	const items: TimelineItem[] = events.map((event) => ({
		id: event.id,
		title: event.label,
		description: event.date,
		icon: event.icon,
		status: event.settled ? "success" : "pending",
		/* The amount sits in the trailing lane, uncoloured: the dot already reports "settled". */
		trailing: event.amount != null ? (
			<Text tag="span" weight="medium" numeric>
				{event.amount}
			</Text>
		) : undefined,
	}))

	return (
		<div className={cx("payment-timeline--component", styles.paymentTimeline, className)} {...props}>
			<Timeline items={items} />
		</div>
	)
}

/* ══ ShipmentTracking ══════════════════════════════════════════════════════════════ */

export interface TrackingStep {
	id?: string
	label: string
	/** Whether the parcel has reached this event. The latest reached event stays current until delivery. */
	done: boolean
	/** Already formatted. When the stage happened — a parcel's rail is a log, not a plan. */
	timestamp?: string
}

export interface ShipmentDetail {
	label: string
	value: ReactNode
}

export interface ShipmentTrackingProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	trackingNumber: string
	carrier?: string
	status: ShipmentStatus
	steps: TrackingStep[]
	/** Anything else worth stating — weight, service, signature. */
	details?: ShipmentDetail[]
	strings?: Partial<ShipmentStrings>
}

export function ShipmentTracking({
	trackingNumber,
	carrier,
	status,
	steps,
	details,
	strings,
	className,
	...props
}: ShipmentTrackingProps) {
	const copy = { ...defaultShipmentStrings, ...strings }

	const latestReached = steps.findLastIndex(step => step.done)
	const current = status === "delivered" ? -1 : Math.max(0, latestReached)
	const journey: Step[] = steps.map((step, index) => ({
		id: step.id ?? `${step.label}-${index}`,
		title: step.label,
		timestamp: step.timestamp,
		status: index === current ? "current" : step.done ? "completed" : "upcoming",
	}))

	return (
		<ContentBlock
			icon={<TruckIcon aria-hidden="true" />}
			title={copy.title}
			titleSuffix={<Badge tone={SHIPMENT_STATUS_TONE[status]}>{copy[status]}</Badge>}
			className={cx("shipment-tracking--component", styles.block, className)}
			{...props}
		>
			<SummaryPanel>
				<MetadataList layout="rows" items={[
					{ id: "tracking", label: copy.trackingNumber, render: () => <Copyable value={trackingNumber} mono compact truncate /> },
					...(carrier != null ? [{ id: "carrier", label: copy.carrier, value: carrier }] : []),
					...(details ?? []).map((detail, index) => ({ id: `detail-${index}`, label: detail.label, value: detail.value })),
				]} />
			</SummaryPanel>
			{journey.length > 0 && <Steps steps={journey} />}
		</ContentBlock>
	)
}

/* ══ RefundStatus ══════════════════════════════════════════════════════════════════ */

export interface RefundStatusProps extends Omit<ComponentProps<typeof ContentBlock>, "children"> {
	stage: RefundStage
	/** Already formatted, including its currency. */
	amount: string
	reason?: ReactNode
	/** Where the money is going back to. */
	method?: ReactNode
	/** Already formatted. */
	eta?: string
	strings?: Partial<RefundStrings>
}

export function RefundStatus({
	stage,
	amount,
	reason,
	method,
	eta,
	strings,
	className,
	...props
}: RefundStatusProps) {
	const copy = { ...defaultRefundStrings, ...strings }
	const reached = REFUND_STAGES.indexOf(stage)

	return (
		<ContentBlock
			icon={<RotateCcwIcon aria-hidden="true" />}
			title={copy.title}
			className={cx("refund-status--component", styles.block, className)}
			{...props}
		>
			<SummaryPanel>
				<AmountRow label={copy.amount} amount={amount} total />
			</SummaryPanel>

			{/* An ordered list: the stages happen in sequence. */}
			<ol className={styles.refundStages}>
				{REFUND_STAGES.map((refundStage, index) => (
					<li
						key={refundStage}
						data-reached={index <= reached ? "" : undefined}
						data-current={index === reached ? "" : undefined}
						aria-current={index === reached ? "step" : undefined}
						className={styles.refundStage}
					>
						<span className={styles.refundBar} aria-hidden="true" />
						<Text tag="span" size="xs" weight={index === reached ? "semibold" : "regular"}>
							{copy[refundStage]}
						</Text>
					</li>
				))}
			</ol>

			<MetadataList layout="rows" items={[
				...(method != null ? [{ id: "method", label: copy.method, value: method }] : []),
				...(eta != null ? [{ id: "eta", label: copy.eta, value: eta }] : []),
				...(reason != null ? [{ id: "reason", label: copy.reason, value: reason }] : []),
			]} />
		</ContentBlock>
	)
}
