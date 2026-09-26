import { useState } from "react"

import { BanknoteIcon, CheckIcon, CloudIcon, CreditCardIcon, HeadphonesIcon, ShieldIcon } from "lucide-react"

import {
	AddressCard, CartSummary, CodeEntry, DiscountStack, InventoryLevel, InvoiceHeader,
	InvoiceLineItems, InvoiceMini, LoyaltyPoints, OrderStatusCard, PaymentMethodCard,
	PaymentTimeline, RefundStatus, ShipmentTracking, SubscriptionSummary, TaxBreakdown,
	UpcomingBookings,
	type Booking, type CartLine, type OrderEvent,
} from "@/components/admin/patterns/commerce"
import { AdaptiveGrid, GridCell, Stack } from "@/components/base/structure"

import { ContentBlock } from "@/components/base/display"
import { toast } from "@/components/base/toaster"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const CART: CartLine[] = [
	{ id: "1", title: "Merino crew neck", variantTitle: "Medium / Charcoal", quantity: 1, price: "89.00 EUR" },
	{ id: "2", title: "Oxford shirt", variantTitle: "Large / White", quantity: 2, price: "124.00 EUR" },
	{ id: "3", title: "Leather belt", quantity: 1, price: "45.00 EUR" },
]

const ORDER_EVENTS: OrderEvent[] = [
	{ id: "1", label: "Order placed", timestamp: "14 Aug, 09:12", complete: true },
	{ id: "2", label: "Payment captured", timestamp: "14 Aug, 09:12", complete: true },
	{ id: "3", label: "Packed", timestamp: "15 Aug, 11:40", complete: true },
	{ id: "4", label: "Shipped", timestamp: "16 Aug, 06:02", complete: true },
	{ id: "5", label: "Delivered", complete: false },
]

const BOOKINGS: Booking[] = [
	{ id: "1", date: "2026-09-02", time: "09:30", service: "Studio session", customer: "Alice Mercer", amount: "120.00 EUR" },
	{ id: "2", date: "2026-09-02", time: "14:00", service: "Equipment hire", customer: "Contoso Ltd", amount: "48.00 EUR" },
	{ id: "3", date: "2026-09-04", time: "11:15", service: "Consultation", customer: "Northwind Traders", amount: "90.00 EUR" },
]

const ADDRESS = {
	name: "Alice Mercer",
	line1: "14 Kingsway",
	line2: "Flat 3",
	city: "London",
	postalCode: "WC2B 6UF",
	country: "United Kingdom",
	phone: "+44 20 7946 0102",
}

function CodeEntryDemo({ gift = false }: { gift?: boolean }) {
	const [appliedCode, setAppliedCode] = useState<string | undefined>(gift ? "GC-4417-92AB" : undefined)
	const [error, setError] = useState<string>()
	const [loading, setLoading] = useState(false)
	return <CodeEntry
		kind={gift ? "gift" : "discount"}
		appliedCode={appliedCode}
		appliedDiscount={!gift && appliedCode ? "25.00 EUR" : undefined}
		balance={gift && appliedCode ? "45.00 EUR" : undefined}
		error={error}
		loading={loading}
		onApply={async code => {
			setLoading(true)
			setError(undefined)
			await new Promise(resolve => setTimeout(resolve, 600))
			if (code.toUpperCase() === (gift ? "GC-4417-92AB" : "WELCOME10")) setAppliedCode(code.toUpperCase())
			else setError(gift ? "Gift card not found. Try GC-4417-92AB." : "Code not found. Try WELCOME10.")
			setLoading(false)
		}}
		onRemove={() => { setAppliedCode(undefined); setError(undefined) }}
	/>
}

export function BlocksCommercePage() {
	return (
		<ComponentPage
			title="Commerce"
			summary="Reusable blocks for checkout, fulfillment, billing, and customer accounts. Each adapts to its container and keeps application actions in consumer callbacks."
			importPath="@/components/admin/patterns/commerce"
			exports={["CartSummary", "TaxBreakdown", "DiscountStack", "CodeEntry", "InvoiceHeader", "InvoiceLineItems", "InvoiceMini", "OrderStatusCard", "ShipmentTracking", "RefundStatus", "AddressCard", "PaymentMethodCard", "PaymentTimeline", "SubscriptionSummary", "InventoryLevel", "UpcomingBookings", "LoyaltyPoints"]}
		>
			<Example
				id="cart-summary"
				title="CartSummary"
				description="Products and quantities stay together, with aligned line prices and a single ledger for charges, savings, and the final total. Prices are formatted line totals; the consumer owns the calculation."
				stacked
				code={`<CartSummary items={items} subtotal="258.00 EUR" discount="50.00 EUR" total="264.40 EUR" />`}
			>
				<Stack maxWidth="32rem" gap="none">
				<CartSummary
					items={CART}
					subtotal="258.00 EUR"
					tax="51.60 EUR"
					shipping="4.80 EUR"
					discount="50.00 EUR"
					total="264.40 EUR"
					onCheckout={() => toast("Checkout requested", { description: "Preview callback — connect this action to your application." })}
				/>
				</Stack>
			</Example>

			<Example
				id="tax-breakdown"
				title="TaxBreakdown"
				description="Aligned tax rates and amounts, with one final total. A tax rollup appears only when there are multiple tax lines."
				stacked
				code={`<TaxBreakdown subtotal="258.00 EUR" taxes={taxes} totalTax="52.89 EUR" total="310.89 EUR" />`}
			>
				<Stack maxWidth="32rem" gap="none">
				<TaxBreakdown
					subtotal="258.00 EUR"
					taxes={[
						{ id: "vat", label: "VAT", rate: "20%", amount: "51.60 EUR" },
						{ id: "eco", label: "Eco levy", rate: "0.5%", amount: "1.29 EUR" },
					]}
					totalTax="52.89 EUR"
					total="310.89 EUR"
				/>
				</Stack>
			</Example>

			<Example
				id="discount-stack"
				title="DiscountStack"
				description="Applied discounts in their stacking order, with a consistent deduction sign and total savings."
				stacked
				code={`<DiscountStack discounts={discounts} totalSavings="50.00 EUR" />`}
			>
				<Stack maxWidth="32rem" gap="none">
				<DiscountStack
					discounts={[
						{ id: "1", label: "Summer sale", kind: "Automatic", amount: "30.00 EUR" },
						{ id: "2", label: "WELCOME10", kind: "Code", amount: "20.00 EUR" },
					]}
					totalSavings="50.00 EUR"
				/>
				</Stack>
			</Example>

			<Example
				id="code-entry"
				title="CodeEntry"
				description="Apply WELCOME10 to try a discount, or remove and reapply GC-4417-92AB for the gift card. Other codes show a recoverable error; pending requests disable the controls."
				stacked
				code={`<CodeEntry onApply={apply} />
<CodeEntry kind="gift" appliedCode="GC-4417-92AB" balance="45.00 EUR" onRemove={remove} />`}
			>
				{/* Two instances: empty on the left, applied on the right, covering both kinds. */}
				<AdaptiveGrid minColumnWidth="lg" gap="xl">
					<GridCell>
						<CodeEntryDemo />
					</GridCell>
					<GridCell>
						<CodeEntryDemo gift />
					</GridCell>
				</AdaptiveGrid>
			</Example>

			<Example
				id="order-status"
				title="OrderStatusCard"
				description="The latest event, next step, and delivery estimate stay visible. Expand Order history for the complete sequence."
				stacked
				code={`<OrderStatusCard orderNumber="#1041" status="shipped" events={events} eta="18 Aug" />`}
			>
				<Stack maxWidth="40rem" gap="none">
				<OrderStatusCard orderNumber="#1041" status="shipped" events={ORDER_EVENTS} eta="18 Aug" />
				</Stack>
			</Example>

			<Example
				id="shipment-tracking"
				title="ShipmentTracking"
				description="A copyable tracking reference, aligned shipment details, and a compact event timeline. The latest reached event stays current until delivery."
				stacked
				code={`<ShipmentTracking trackingNumber="1Z999AA1…" carrier="UPS" status="inTransit" steps={steps} />`}
			>
				<Stack maxWidth="40rem" gap="none">
				<ShipmentTracking
					trackingNumber="1Z999AA10123456784"
					carrier="UPS"
					status="inTransit"
					steps={[
						{ label: "Label created", done: true, timestamp: "14 Aug, 09:40" },
						{ label: "Collected", done: true, timestamp: "14 Aug, 17:05" },
						{ label: "In transit", done: true, timestamp: "15 Aug, 03:22" },
						{ label: "Out for delivery", done: false },
						{ label: "Delivered", done: false },
					]}
					details={[{ label: "Service", value: "Express" }]}
				/>
				</Stack>
			</Example>

			<Example
				id="refund-status"
				title="RefundStatus"
				description="The refund amount, current stage, destination, and expected date in one compact summary."
				stacked
				code={`<RefundStatus stage="processing" amount="124.00 EUR" reason="Damaged on arrival" />`}
			>
				<Stack maxWidth="40rem" gap="none">
				<RefundStatus
					stage="processing"
					amount="124.00 EUR"
					reason="Damaged on arrival"
					method="Visa ending 4417"
					eta="22 Aug"
				/>
				</Stack>
			</Example>

			<Example
				id="invoice-header"
				title="InvoiceHeader"
				description="Invoice identity and status, billing parties, key dates, and the amount due."
				stacked
				code={`<InvoiceHeader invoiceNumber="INV-2026-0114" status="overdue" from={from} to={to} amountDue="3,120.00 EUR" />`}
			>
				<Stack maxWidth="40rem" gap="none">
				<InvoiceHeader
					invoiceNumber="INV-2026-0114"
					status="overdue"
					from={{ name: "Northwind Traders", location: "Rotterdam, NL" }}
					to={{ name: "Adventure Park Bansko", location: "Bansko, BG" }}
					issuedAt="14 Aug 2026"
					dueAt="28 Aug 2026"
					amountDue="3,120.00 EUR"
				/>
				</Stack>
			</Example>

			<Example
				id="invoice-line-items"
				title="InvoiceLineItems"
				description="Quantity, unit price, and line amount with calculated subtotal, tax, and total. Narrow panels switch to a compact list with visible totals; numeric amounts use the Money primitive."
				stacked
				code={`<InvoiceLineItems currency="EUR" taxRate={0.2} lines={lines} />`}
			>
				<InvoiceLineItems
					currency="EUR"
					taxRate={0.2}
					lines={[
						{ id: "1", description: "Design retainer", quantity: 1, unitPrice: 2000 },
						{ id: "2", description: "Implementation", quantity: 12, unitPrice: 45 },
						{ id: "3", description: "Hosting", quantity: 3, unitPrice: 20 },
					]}
				/>
			</Example>

			<Example
				id="invoice-mini"
				title="InvoiceMini"
				description="Compact invoice summaries with a reference, customer, status, due date, and total. The surrounding surface belongs to the caller."
				stacked
				code={`<ContentBlock surface="bordered"><InvoiceMini invoiceNumber="INV-0114" status="overdue" customerName="…" total="3,120.00 EUR" /></ContentBlock>`}
			>
				<AdaptiveGrid minColumnWidth="md" gap="xl">
					<GridCell>
						<ContentBlock surface="bordered"><InvoiceMini invoiceNumber="INV-0114" status="overdue" customerName="Adventure Park Bansko" lineCount={3} dueAt="28 Aug" total="3,120.00 EUR" /></ContentBlock>
					</GridCell>
					<GridCell>
						<ContentBlock surface="bordered"><InvoiceMini invoiceNumber="INV-0115" status="pending" customerName="Northwind Traders" lineCount={1} dueAt="04 Sep" total="900.00 EUR" /></ContentBlock>
					</GridCell>
					<GridCell>
						<ContentBlock surface="bordered"><InvoiceMini invoiceNumber="INV-0392" status="paid" customerName="Contoso Ltd" lineCount={7} dueAt="12 Aug" total="12,480.00 EUR" /></ContentBlock>
					</GridCell>
				</AdaptiveGrid>
			</Example>

			<Example
				id="address-card"
				title="AddressCard"
				description="A readable postal address with optional default status and account actions."
				stacked
				code={`<AddressCard kind="shipping" name="Alice Mercer" line1="14 Kingsway" city="London" country="United Kingdom" isDefault />`}
			>
				<Stack maxWidth="28rem" gap="none">
				<AddressCard kind="shipping" {...ADDRESS} isDefault onEdit={() => toast("Edit address requested", { description: "Preview callback — connect this action to your application." })} onRemove={() => toast("Remove address requested", { description: "Preview callback — connect this action to your application." })} />
				</Stack>
			</Example>

			<Example
				id="payment-method"
				title="PaymentMethodCard"
				description="The card brand, last four digits, holder, and expiry, with a change action."
				stacked
				code={`<PaymentMethodCard brand="visa" last4="4417" expiry="09/28" isDefault onChange={change} />`}
			>
				<Stack maxWidth="28rem" gap="none">
				<PaymentMethodCard brand="visa" last4="4417" expiry="09/28" holderName="A. Mercer" isDefault onChange={() => toast("Change payment method requested", { description: "Preview callback — connect this action to your application." })} />
				</Stack>
			</Example>

			<Example
				id="payment-timeline"
				title="PaymentTimeline"
				description="Payment events in order, with settled and pending markers and aligned amounts."
				stacked
				code={`<PaymentTimeline events={events} />`}
			>
				<Stack maxWidth="32rem" gap="none">
				<PaymentTimeline
					events={[
						{ id: "1", label: "Authorised", date: "14 Aug", amount: "3,120.00 EUR", icon: CreditCardIcon, settled: true },
						{ id: "2", label: "Captured", date: "15 Aug", amount: "3,120.00 EUR", icon: BanknoteIcon, settled: true },
						{ id: "3", label: "Payout", date: "Expected 22 Aug", icon: BanknoteIcon, settled: false },
					]}
				/>
				</Stack>
			</Example>

			<Example
				id="subscription-summary"
				title="SubscriptionSummary"
				description="Plan, recurring price, renewal date, and included services, with upgrade and manage actions."
				stacked
				code={`<SubscriptionSummary planName="Scale" price="240.00 EUR" cycle="Per month" nextBillingDate="01 Sep 2026" />`}
			>
				<Stack maxWidth="32rem" gap="none">
				<SubscriptionSummary
					planName="Scale"
					price="240.00 EUR"
					cycle="Per month"
					nextBillingDate="01 Sep 2026"
					status="Active"
					perks={[
						{ label: "Unlimited seats", icon: CheckIcon },
						{ label: "99.9% uptime SLA", icon: ShieldIcon },
						{ label: "Priority support", icon: HeadphonesIcon },
						{ label: "500 GB storage", icon: CloudIcon },
					]}
					onManage={() => toast("Manage subscription requested", { description: "Preview callback — connect this action to your application." })}
					onUpgrade={() => toast("Upgrade subscription requested", { description: "Preview callback — connect this action to your application." })}
				/>
				</Stack>
			</Example>

			<Example
				id="inventory-level"
				title="InventoryLevel"
				description="A visible stock count and capacity gauge, with low-stock and out-of-stock states and restocking context."
				stacked
				code={`<InventoryLevel productName="Merino crew neck" stock={8} reorderLevel={12} maxStock={120} />`}
			>
				<AdaptiveGrid minColumnWidth="lg" gap="xl">
					<GridCell>
						<InventoryLevel productName="Merino crew neck" variant="Medium / Charcoal" stock={8} reorderLevel={12} maxStock={120} lastRestocked="02 Aug" />
					</GridCell>
					<GridCell>
						<InventoryLevel productName="Oxford shirt" variant="Large / White" stock={0} reorderLevel={10} maxStock={80} lastRestocked="21 Jul" />
					</GridCell>
				</AdaptiveGrid>
			</Example>

			<Example
				id="upcoming-bookings"
				title="UpcomingBookings"
				description="Compact rounded date tiles with appointment times beside the service and customer. Dates follow the provider locale; the consumer supplies the display order."
				stacked
				code={`<UpcomingBookings bookings={bookings} boxedDate />`}
			>
				<Stack maxWidth="40rem" gap="none">
				<UpcomingBookings bookings={BOOKINGS} boxedDate />
				</Stack>
			</Example>

			<Example
				id="loyalty-points"
				title="LoyaltyPoints"
				description="A prominent points balance followed by recent earnings and redemptions. Movement signs follow their direction."
				stacked
				code={`<LoyaltyPoints balance={4830} tier="Platinum" movements={movements} onRedeem={redeem} />`}
			>
				<Stack maxWidth="32rem" gap="none">
				<LoyaltyPoints
					balance={4830}
					tier="Platinum"
					tierTone="secondary"
					movements={[
						{ id: "1", label: "Order #1041", date: "16 Aug", points: "310", earned: true },
						{ id: "2", label: "Redeemed for shipping", date: "12 Aug", points: "500", earned: false },
						{ id: "3", label: "Birthday bonus", date: "01 Aug", points: "250", earned: true },
					]}
					onRedeem={() => toast("Redeem points requested", { description: "Preview callback — connect this action to your application." })}
				/>
				</Stack>
			</Example>

			<Example id="commerce-props" title="Props">
				<Callout>
					<strong>Amounts arrive formatted.</strong> Every surface here takes
					<code> "89.00 EUR"</code>, not <code>89</code> — the code that fetched the money
					knows its currency, locale and rounding, and a block that reformatted it would be
					guessing at all three. <code>InvoiceLineItems</code> is the deliberate exception:
					it totals its lines, so it takes numbers and hands them to <code>Money</code>.
				</Callout>
				<PropTable
					rows={[
						{ name: "AmountRow label / amount", type: "ReactNode / string", required: true, description: "The ledger row every money surface is built from. Not InlineStat: this one knows about money, and InlineStat displays any value." },
						{ name: "AmountRow total / deduction", type: "boolean", default: "false", description: "total marks the row the eye should land on. deduction rewrites the sign to U+2212 whatever the caller passed, and tints the figure." },
						{ name: "CodeEntry kind", type: '"discount" | "gift"', default: '"discount"', description: "Picks the icon, the copy, and whether the code is upper-cased on submit." },
						{ name: "CodeEntry balance", type: "string", description: "What is left on a gift card — money that may outlast this order. The one real difference between the two kinds." },
						{ name: "OrderStatusCard status", type: '"pending" | "paid" | "fulfilled" | "shipped" | "delivered" | "cancelled"', required: true, description: "Drives the chip's tone. There is no tone override." },
						{ name: "OrderStatusCard defaultHistoryOpen", type: "boolean", description: "Opens the event list on first render. Closed otherwise: the panel above already says what just happened, what is next and when it lands, and the list repeats two of the three." },
						{ name: "InvoiceLineItems taxRate", type: "number", description: "A ratio — 0.2 is 20%. Omit it to show no tax row." },
						{ name: "InventoryLevel stock / reorderLevel / maxStock", type: "number", required: true, description: "Below reorderLevel reads as low; zero reads as out, which is checked first." },
						{ name: "LoyaltyPoints tier / tierTone", type: "ReactNode / BadgeTone", description: "No default tier name: it is a caller's word, and an English literal here is one no strings override could reach." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
