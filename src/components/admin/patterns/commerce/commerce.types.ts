/**
 * The status vocabularies every commerce surface shares. Each union has exactly one tone
 * map, and no surface takes a tone prop that could disagree with its status.
 */
import type { BadgeTone } from "@/components/base/badge"

/** Where an invoice stands. */
export type InvoiceStatus = "paid" | "pending" | "overdue"

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
	paid: "success",
	pending: "warning",
	overdue: "destructive",
}

/** How far an order has travelled. Ordered as the stages actually occur. */
export type OrderStatus = "pending" | "paid" | "fulfilled" | "shipped" | "delivered" | "cancelled"

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
	pending: "warning",
	paid: "info",
	fulfilled: "info",
	shipped: "primary",
	delivered: "success",
	cancelled: "destructive",
}

/** Where a parcel is. `delayed` is a warning, not an error — it is still coming. */
export type ShipmentStatus = "pending" | "inTransit" | "delivered" | "delayed"

export const SHIPMENT_STATUS_TONE: Record<ShipmentStatus, BadgeTone> = {
	pending: "neutral",
	inTransit: "info",
	delivered: "success",
	delayed: "warning",
}

/** The four stages money takes on its way back. */
export type RefundStage = "requested" | "approved" | "processing" | "completed"

export const REFUND_STAGES: readonly RefundStage[] = ["requested", "approved", "processing", "completed"]

/**
 * Card networks and wallets. The brand is named, never painted: trademark colours would
 * need literals `verify composition` forbids. Pass a logo as `icon`.
 */
export type PaymentBrand =
	| "visa"
	| "mastercard"
	| "amex"
	| "paypal"
	| "applePay"
	| "googlePay"
	| "unknown"

/** What an address is for. */
export type AddressKind = "shipping" | "billing" | "pickup"

/* ── Order status, on two axes ───────────────────────────────────────────────────
 * Goods and money move independently ("refunded, still unfulfilled"). `OrderStatus`
 * remains for a single summary state; an order page uses both of these.
 */

/** Where the goods are. */
export type FulfillmentStatus =
	| "unfulfilled"
	| "partiallyFulfilled"
	| "fulfilled"
	| "scheduled"
	| "onHold"
	| "cancelled"

export const FULFILLMENT_STATUS_TONE: Record<FulfillmentStatus, BadgeTone> = {
	/* Warning, not destructive: unfulfilled is the starting state, not a failure. */
	unfulfilled: "warning",
	partiallyFulfilled: "warning",
	fulfilled: "success",
	scheduled: "info",
	onHold: "neutral",
	cancelled: "destructive",
}

/** Where the money is. */
export type PaymentStatus =
	| "pending"
	| "authorized"
	| "paid"
	| "partiallyRefunded"
	| "refunded"
	| "voided"

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeTone> = {
	pending: "warning",
	/* Authorized is money promised, not money taken — informational, not success. */
	authorized: "info",
	paid: "success",
	partiallyRefunded: "neutral",
	refunded: "neutral",
	voided: "neutral",
}

/* ── Transactions ────────────────────────────────────────────────────────────── */

/** What was attempted against the payment method. */
export type TransactionKind =
	| "authorization"
	| "capture"
	| "sale"
	| "refund"
	| "void"
	| "chargeback"

/** Whether it worked. */
export type TransactionStatus = "success" | "pending" | "failure"

export const TRANSACTION_STATUS_TONE: Record<TransactionStatus, BadgeTone> = {
	success: "success",
	pending: "warning",
	failure: "destructive",
}

/** Which kinds take money out of the merchant. Drives the sign; the caller passes the magnitude. */
export const OUTGOING_TRANSACTION_KINDS: ReadonlySet<TransactionKind> = new Set([
	"refund",
	"void",
	"chargeback",
])

/** A postal address as an order carries it. `AddressCard` keeps its own flat props. */
export interface OrderAddress {
	name?: string
	line1: string
	line2?: string
	city: string
	/** State, province, or region. */
	region?: string
	postalCode?: string
	country: string
	phone?: string
}
