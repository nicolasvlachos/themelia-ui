/**
 * Copy owned by the commerce blocks: one dictionary for the domain, so shared words match.
 * Counts are functions, so a translation controls pluralisation.
 */
export interface CartStrings {
	title: string
	subtotal: string
	tax: string
	shipping: string
	discount: string
	total: string
	checkout: string
	formatQuantity: (quantity: number) => string
}

export const defaultCartStrings: CartStrings = {
	title: "Cart",
	subtotal: "Subtotal",
	tax: "Tax",
	shipping: "Shipping",
	discount: "Discount",
	total: "Total",
	checkout: "Checkout",
	formatQuantity: (quantity) => `×${quantity}`,
}

export interface TaxBreakdownStrings {
	title: string
	subtotal: string
	totalTax: string
	total: string
}

export const defaultTaxBreakdownStrings: TaxBreakdownStrings = {
	title: "Tax",
	subtotal: "Subtotal",
	totalTax: "Total tax",
	total: "Total",
}

/**
 * Copy for `CodeEntry`, which serves both a discount code and a gift card.
 *
 * Two presets rather than two components: the wording differs because redeeming a gift
 * card is a balance lookup before it is an application, but the interaction is identical.
 */
export interface CodeEntryStrings {
	title: string
	/** Under the title. Empty for the discount case, which needs no explaining. */
	helperText?: string
	/** The field shows no visible label, so this is its only accessible name. */
	fieldLabel: string
	placeholder: string
	apply: string
	remove: string
	applied: string
	/** What is left on a gift card. Unused by the discount preset. */
	balance: string
}

export const defaultDiscountCodeStrings: CodeEntryStrings = {
	title: "Have a code?",
	fieldLabel: "Discount code",
	placeholder: "Enter code",
	apply: "Apply",
	remove: "Remove",
	applied: "Applied",
	balance: "Remaining balance",
}

export const defaultGiftCodeStrings: CodeEntryStrings = {
	title: "Redeem a gift card",
	helperText: "One gift card or voucher per order.",
	fieldLabel: "Gift card code",
	placeholder: "Enter gift card code",
	/* A lookup before it is an application — a card may hold less than the order. */
	apply: "Check balance",
	remove: "Remove",
	applied: "Applied",
	balance: "Available balance",
}

export interface DiscountStackStrings {
	title: string
	totalSavings: string
}

export const defaultDiscountStackStrings: DiscountStackStrings = {
	title: "Applied discounts",
	totalSavings: "Total savings",
}

export interface InvoiceStrings {
	title: string
	billFrom: string
	billTo: string
	issued: string
	due: string
	amountDue: string
	item: string
	quantity: string
	price: string
	amount: string
	subtotal: string
	tax: string
	total: string
	paid: string
	pending: string
	overdue: string
	formatLineCount: (count: number) => string
}

export const defaultInvoiceStrings: InvoiceStrings = {
	title: "Invoice",
	billFrom: "Bill from",
	billTo: "Bill to",
	issued: "Issued",
	due: "Due",
	amountDue: "Amount due",
	item: "Item",
	quantity: "Qty",
	price: "Price",
	amount: "Amount",
	subtotal: "Subtotal",
	tax: "Tax",
	total: "Total",
	paid: "Paid",
	pending: "Pending",
	overdue: "Overdue",
	formatLineCount: (count) => `${count} ${count === 1 ? "item" : "items"}`,
}

export interface OrderStatusStrings {
	title: string
	statusLabel: string
	latestEvent: string
	nextStep: string
	eta: string
	/** The disclosure over the full event list — it takes the count, which is the reason to open it. */
	formatHistory: (count: number) => string
	pending: string
	paid: string
	fulfilled: string
	shipped: string
	delivered: string
	cancelled: string
}

export const defaultOrderStatusStrings: OrderStatusStrings = {
	title: "Order status",
	statusLabel: "Current status",
	latestEvent: "Latest event",
	nextStep: "Next step",
	eta: "Estimated delivery",
	formatHistory: (count) => `Order history (${count} ${count === 1 ? "event" : "events"})`,
	pending: "Pending",
	paid: "Paid",
	fulfilled: "Fulfilled",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
}

export interface ShipmentStrings {
	title: string
	carrier: string
	trackingNumber: string
	pending: string
	inTransit: string
	delivered: string
	delayed: string
}

export const defaultShipmentStrings: ShipmentStrings = {
	title: "Shipment",
	carrier: "Carrier",
	trackingNumber: "Tracking number",
	pending: "Pending",
	inTransit: "In transit",
	delivered: "Delivered",
	delayed: "Delayed",
}

export interface RefundStrings {
	title: string
	amount: string
	reason: string
	method: string
	eta: string
	requested: string
	approved: string
	processing: string
	completed: string
}

export const defaultRefundStrings: RefundStrings = {
	title: "Refund",
	amount: "Refund amount",
	reason: "Reason",
	method: "Refund to",
	eta: "Expected by",
	requested: "Requested",
	approved: "Approved",
	processing: "Processing",
	completed: "Completed",
}

export interface AddressStrings {
	defaultBadge: string
	edit: string
	remove: string
	makeDefault: string
	shipping: string
	billing: string
	pickup: string
}

export const defaultAddressStrings: AddressStrings = {
	defaultBadge: "Default",
	edit: "Edit",
	remove: "Remove",
	makeDefault: "Make default",
	shipping: "Shipping address",
	billing: "Billing address",
	pickup: "Pickup address",
}

export interface PaymentMethodStrings {
	title: string
	defaultBadge: string
	expires: string
	change: string
	/** Names the card without reading the number aloud. */
	formatCard: (brand: string, last4: string) => string
}

export const defaultPaymentMethodStrings: PaymentMethodStrings = {
	title: "Payment method",
	defaultBadge: "Default",
	expires: "Expires",
	change: "Change",
	formatCard: (brand, last4) => `${brand} ending ${last4}`,
}

export interface SubscriptionStrings {
	title: string
	plan: string
	nextBilling: string
	included: string
	manage: string
	upgrade: string
}

export const defaultSubscriptionStrings: SubscriptionStrings = {
	title: "Subscription",
	plan: "Plan",
	nextBilling: "Next billing",
	included: "Included",
	manage: "Manage",
	upgrade: "Upgrade",
}

export interface InventoryStrings {
	inStock: string
	lowStock: string
	outOfStock: string
	reorderAt: string
	lastRestocked: string
	/** Names the gauge, which otherwise states the level by width alone. */
	formatLevel: (stock: number, max: number) => string
}

export const defaultInventoryStrings: InventoryStrings = {
	inStock: "In stock",
	lowStock: "Low stock",
	outOfStock: "Out of stock",
	reorderAt: "Reorder at",
	lastRestocked: "Last restocked",
	formatLevel: (stock, max) => `${stock} of ${max} units`,
}

export interface LoyaltyStrings {
	title: string
	balanceLabel: string
	pointsAvailable: string
	/** Over the movement list — without it the rows hang under a balance they only relate to. */
	activityLabel: string
	redeem: string
}

export const defaultLoyaltyStrings: LoyaltyStrings = {
	title: "Loyalty",
	balanceLabel: "Balance",
	pointsAvailable: "points available",
	activityLabel: "Recent activity",
	redeem: "Redeem points",
}

export interface VendorStrings {
	tabOverview: string
	tabStats: string
	totalEarnings: string
	message: string
	hire: string
	/** Names the tick, which otherwise states the fact by shape alone. */
	verified: string
}

export const defaultVendorStrings: VendorStrings = {
	tabOverview: "Overview",
	tabStats: "Performance",
	totalEarnings: "Total earnings",
	message: "Message",
	hire: "Hire vendor",
	verified: "Verified",
}

export interface SeoStrings {
	title: string
	edit: string
	noTitle: string
	noDescription: string
	noPermalink: string
	checks: Record<"title" | "description" | "permalink" | "slug" | "url" | "keyword", string>
	status: Record<"good" | "review" | "missing", string>
	formatScore: (score: number) => string
	/** "62 / 60" — the measured length against its cap. */
	formatMeasure: (actual: number, max: number) => string
	/** Inside a check's ring. A locale that writes percentages differently overrides it. */
	formatPercent: (percent: number) => string
}

export const defaultSeoStrings: SeoStrings = {
	title: "Search appearance",
	edit: "Edit listing",
	noTitle: "Untitled page",
	noDescription: "No description yet. Search engines will pick their own.",
	noPermalink: "No permalink yet",
	checks: {
		title: "Title length",
		description: "Description length",
		permalink: "Permalink length",
		slug: "Slug format",
		url: "Secure origin",
		keyword: "Keyword present",
	},
	status: { good: "Good", review: "Needs review", missing: "Missing" },
	formatScore: (score) => `${score} / 100`,
	formatPercent: (percent) => `${percent}%`,
	formatMeasure: (actual, max) => `${actual} / ${max}`,
}

export interface InventorySectionStrings {
	title: string
	description: string
	sections: Record<"identity" | "tracking" | "location" | "shipping" | "customs" | "tags", string>
	fields: Record<
		| "sku" | "barcode" | "trackQuantity" | "available" | "committed" | "incoming"
		| "lowStockThreshold" | "inventoryPolicy" | "binLocation" | "requiresShipping"
		| "weight" | "countryOfOrigin" | "hsCode" | "tags",
		string
	>
	placeholders: Partial<Record<string, string>>
	hints: Partial<Record<string, string>>
	policy: Record<"deny" | "continue", string>
	summary: Record<"available" | "committed" | "incoming" | "threshold", string>
}

export const defaultInventorySectionStrings: InventorySectionStrings = {
	title: "Inventory",
	description: "Stock, identifiers, and how this product ships.",
	sections: {
		identity: "Product identifiers",
		tracking: "Stock management",
		location: "Storage location",
		shipping: "Shipping",
		customs: "Customs",
		tags: "Organization",
	},
	fields: {
		sku: "SKU",
		barcode: "Barcode",
		trackQuantity: "Track quantity",
		available: "Available",
		committed: "Committed",
		incoming: "Incoming",
		lowStockThreshold: "Low stock at",
		inventoryPolicy: "When out of stock",
		binLocation: "Bin",
		requiresShipping: "Requires shipping",
		weight: "Weight",
		countryOfOrigin: "Country of origin",
		hsCode: "HS code",
		tags: "Tags",
	},
	placeholders: {
		sku: "ABC-123",
		barcode: "0123456789012",
		binLocation: "A-14-3",
		hsCode: "6109.10",
		tags: "Add a tag",
	},
	hints: {
		trackQuantity: "Off means this product is always available to sell.",
		lowStockThreshold: "Below this, the product reads as low stock.",
		inventoryPolicy: "Whether customers can order past zero.",
		binLocation: "Where it sits in the warehouse.",
		customs: "Used on customs forms for international shipments.",
		hsCode: "The tariff classification for this product.",
	},
	policy: {
		deny: "Stop selling",
		continue: "Keep selling (backorder)",
	},
	summary: {
		available: "Available",
		committed: "Committed",
		incoming: "Incoming",
		threshold: "Low stock at",
	},
}

export interface OrderHeaderStrings {
	/** Precedes the order's own reference — "#1036". */
	formatOrderNumber: (orderNumber: string) => string
	/** Joins when the order was placed to where it came from. */
	formatOrigin: (placedAt: string, source: string) => string
}

export const defaultOrderHeaderStrings: OrderHeaderStrings = {
	formatOrderNumber: (orderNumber) => `#${orderNumber}`,
	formatOrigin: (placedAt, source) => `${placedAt} from ${source}`,
}

/** Shared by every surface that names a fulfillment or payment state. */
export interface OrderStatusVocabulary {
	fulfillment: Record<
		| "unfulfilled" | "partiallyFulfilled" | "fulfilled"
		| "scheduled" | "onHold" | "cancelled",
		string
	>
	payment: Record<
		"pending" | "authorized" | "paid" | "partiallyRefunded" | "refunded" | "voided",
		string
	>
}

export const defaultOrderStatusVocabulary: OrderStatusVocabulary = {
	fulfillment: {
		unfulfilled: "Unfulfilled",
		partiallyFulfilled: "Partially fulfilled",
		fulfilled: "Fulfilled",
		scheduled: "Scheduled",
		onHold: "On hold",
		cancelled: "Cancelled",
	},
	payment: {
		pending: "Pending",
		authorized: "Authorized",
		paid: "Paid",
		partiallyRefunded: "Partially refunded",
		refunded: "Refunded",
		voided: "Voided",
	},
}

export interface FulfillmentGroupStrings {
	/** Names the group by state and size — "Unfulfilled (3)". */
	formatHeading: (status: string, count: number) => string
	/** Reads the price column aloud — "€50.00 each, 1 of them". */
	formatUnitPrice: (unitPrice: string, quantity: number) => string
}

export const defaultFulfillmentGroupStrings: FulfillmentGroupStrings = {
	formatHeading: (status, count) => `${status} (${count})`,
	formatUnitPrice: (unitPrice, quantity) => `${unitPrice} × ${quantity}`,
}

export interface OrderSummaryStrings {
	title: string
}

export const defaultOrderSummaryStrings: OrderSummaryStrings = {
	title: "Payment",
}

export interface TransactionStrings {
	title: string
	kind: Record<
		"authorization" | "capture" | "sale" | "refund" | "void" | "chargeback",
		string
	>
	status: Record<"success" | "pending" | "failure", string>
	reference: string
	empty: string
}

export const defaultTransactionStrings: TransactionStrings = {
	title: "Transactions",
	kind: {
		authorization: "Authorization",
		capture: "Capture",
		sale: "Sale",
		refund: "Refund",
		void: "Void",
		chargeback: "Chargeback",
	},
	status: { success: "Success", pending: "Pending", failure: "Failed" },
	reference: "Reference",
	empty: "No transactions yet.",
}

export interface OrderCustomerStrings {
	title: string
	shippingAddress: string
	billingAddress: string
	/*
	 * One name per edit, because each is the accessible NAME of a pencil with no text
	 * beside it. A single "Edit" would announce two controls identically, and a listener
	 * moving between them would have no way to tell which address they were about to open.
	 */
	editShipping: string
	editBilling: string
	/** Shown in place of a repeated address. */
	sameAsShipping: string
	noAddress: string
	formatOrderCount: (count: number) => string
}

export const defaultOrderCustomerStrings: OrderCustomerStrings = {
	title: "Customer",
	shippingAddress: "Shipping address",
	billingAddress: "Billing address",
	editShipping: "Edit shipping address",
	editBilling: "Edit billing address",
	sameAsShipping: "Same as shipping address",
	noAddress: "No address on file",
	formatOrderCount: (count) => `${count} ${count === 1 ? "order" : "orders"}`,
}
