/**
 * Commerce blocks: carts, invoices, orders, the customer's record. Amounts arrive already
 * formatted (except `InvoiceLineItems`, which does arithmetic), and a status chip derives
 * its tone from its status, with no override.
 */
export {
	CartSummary, TaxBreakdown, DiscountStack,
	type CartSummaryProps, type CartLine,
	type TaxBreakdownProps, type TaxLine,
	type DiscountStackProps, type Discount,
	CodeEntry, type CodeEntryProps, type CodeEntryKind,
} from "./cart"

export {
	OrderStatusCard, OrderTimeline, PaymentTimeline, ShipmentTracking, RefundStatus,
	type OrderStatusCardProps, type OrderEvent,
	type OrderTimelineProps, type OrderTimelineEvent,
	type PaymentTimelineProps, type PaymentEvent,
	type ShipmentTrackingProps, type TrackingStep, type ShipmentDetail,
	type RefundStatusProps,
} from "./order"

export {
	InvoiceHeader, InvoiceLineItems, InvoiceMini,
	type InvoiceHeaderProps, type InvoiceParty,
	type InvoiceLineItemsProps, type InvoiceLine,
	type InvoiceMiniProps,
} from "./invoice"

export {
	AddressCard, PaymentMethodCard, SubscriptionSummary, InventoryLevel,
	type AddressCardProps,
	type PaymentMethodCardProps,
	type SubscriptionSummaryProps, type SubscriptionPerk,
	type InventoryLevelProps,
} from "./account"

export { AmountRow, SummaryPanel, type AmountRowProps, type SummaryPanelProps } from "./summary-panel"

export { formatDeduction, stripLeadingMinus, MINUS_SIGN } from "./format-amount"

export {
	INVOICE_STATUS_TONE, ORDER_STATUS_TONE, SHIPMENT_STATUS_TONE, REFUND_STAGES,
	FULFILLMENT_STATUS_TONE, PAYMENT_STATUS_TONE, TRANSACTION_STATUS_TONE,
	OUTGOING_TRANSACTION_KINDS,
	type InvoiceStatus, type OrderStatus, type ShipmentStatus, type RefundStage,
	type PaymentBrand, type AddressKind,
	type FulfillmentStatus, type PaymentStatus,
	type TransactionKind, type TransactionStatus, type OrderAddress,
} from "./commerce.types"

export {
	defaultCartStrings, defaultTaxBreakdownStrings, defaultDiscountCodeStrings, defaultGiftCodeStrings,
	defaultDiscountStackStrings, defaultInvoiceStrings, defaultOrderStatusStrings,
	defaultShipmentStrings, defaultRefundStrings, defaultAddressStrings,
	defaultPaymentMethodStrings, defaultSubscriptionStrings, defaultInventoryStrings,
	defaultLoyaltyStrings, defaultVendorStrings, defaultSeoStrings,
	defaultInventorySectionStrings, defaultOrderHeaderStrings, defaultOrderStatusVocabulary,
	defaultFulfillmentGroupStrings, defaultOrderSummaryStrings, defaultTransactionStrings,
	defaultOrderCustomerStrings,
	type CartStrings, type TaxBreakdownStrings, type CodeEntryStrings,
	type DiscountStackStrings, type InvoiceStrings, type OrderStatusStrings,
	type ShipmentStrings, type RefundStrings, type AddressStrings,
	type PaymentMethodStrings, type SubscriptionStrings, type InventoryStrings,
	type LoyaltyStrings, type VendorStrings, type SeoStrings,
	type InventorySectionStrings, type OrderHeaderStrings, type OrderStatusVocabulary,
	type FulfillmentGroupStrings, type OrderSummaryStrings, type TransactionStrings,
	type OrderCustomerStrings,
} from "./commerce.strings"

export {
	UpcomingBookings, BookingCard,
	type UpcomingBookingsProps, type Booking,
	type BookingCardProps, type BookingDetail,
} from "./booking"

export { LoyaltyPoints, type LoyaltyPointsProps, type LoyaltyMovement } from "./loyalty"

export {
	VendorProfile,
	type VendorProfileProps, type VendorStat, type VendorMetric, type VendorView,
} from "./vendor-profile"

export { SeoListing, type SeoListingProps } from "./seo-listing"

export {
	calculateSeoScore, seoPermalinkPath, seoPermalinkSlug, DEFAULT_SEO_LIMITS,
	type SeoScore, type SeoScoreInput, type SeoCheck, type SeoCheckId,
	type SeoCheckStatus, type SeoLimits,
} from "./seo-score"

export {
	InventorySection,
	type InventorySectionProps, type InventorySectionValue, type InventorySectionField,
	type InventorySectionName, type InventoryPolicy,
} from "./inventory-section"

export {
	OrderLineItem,
	type OrderLineItemProps, type OrderLine, type OrderLineProperty,
} from "./order-line-item"

export {
	OrderHeader, FulfillmentGroup, OrderSummary,
	type OrderHeaderProps, type FulfillmentGroupProps,
	type OrderSummaryProps, type SummaryLine,
} from "./order-detail"

export {
	OrderTransactions, type OrderTransactionsProps, type Transaction,
} from "./order-transactions"

export { OrderCustomer, type OrderCustomerProps } from "./order-customer"
