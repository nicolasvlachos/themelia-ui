import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BlocksCommercePage() {
	return (
		<ComponentPage
			title="Commerce"
			summary="Reusable blocks for checkout, fulfillment, billing, and customer accounts. Each adapts to its container and keeps application actions in consumer callbacks."
			importPath="@/components/admin/patterns/commerce"
			exports={["CartSummary", "TaxBreakdown", "DiscountStack", "CodeEntry", "InvoiceHeader", "InvoiceLineItems", "InvoiceMini", "OrderStatusCard", "ShipmentTracking", "RefundStatus", "AddressCard", "PaymentMethodCard", "PaymentTimeline", "SubscriptionSummary", "InventoryLevel", "UpcomingBookings", "LoyaltyPoints"]}
		>
			<Example
				example="blocks-commerce/cart-summary"
				title="CartSummary"
				description="Products and quantities stay together, with aligned line prices and a single ledger for charges, savings, and the final total. Prices are formatted line totals; the consumer owns the calculation."
				stacked
			/>

			<Example
				example="blocks-commerce/tax-breakdown"
				title="TaxBreakdown"
				description="Aligned tax rates and amounts, with one final total. A tax rollup appears only when there are multiple tax lines."
				stacked
			/>

			<Example
				example="blocks-commerce/discount-stack"
				title="DiscountStack"
				description="Applied discounts in their stacking order, with a consistent deduction sign and total savings."
				stacked
			/>

			<Example
				example="blocks-commerce/code-entry"
				title="CodeEntry"
				description="Apply WELCOME10 to try a discount, or remove and reapply GC-4417-92AB for the gift card. Other codes show a recoverable error; pending requests disable the controls."
				stacked
			/>

			<Example
				example="blocks-commerce/order-status"
				title="OrderStatusCard"
				description="The latest event, next step, and delivery estimate stay visible. Expand Order history for the complete sequence."
				stacked
			/>

			<Example
				example="blocks-commerce/shipment-tracking"
				title="ShipmentTracking"
				description="A copyable tracking reference, aligned shipment details, and a compact event timeline. The latest reached event stays current until delivery."
				stacked
			/>

			<Example
				example="blocks-commerce/refund-status"
				title="RefundStatus"
				description="The refund amount, current stage, destination, and expected date in one compact summary."
				stacked
			/>

			<Example
				example="blocks-commerce/invoice-header"
				title="InvoiceHeader"
				description="Invoice identity and status, billing parties, key dates, and the amount due."
				stacked
			/>

			<Example
				example="blocks-commerce/invoice-line-items"
				title="InvoiceLineItems"
				description="Quantity, unit price, and line amount with calculated subtotal, tax, and total. Narrow panels switch to a compact list with visible totals; numeric amounts use the Money primitive."
				stacked
			/>

			<Example
				example="blocks-commerce/invoice-mini"
				title="InvoiceMini"
				description="Compact invoice summaries with a reference, customer, status, due date, and total. The surrounding surface belongs to the caller."
				stacked
			/>

			<Example
				example="blocks-commerce/address-card"
				title="AddressCard"
				description="A readable postal address with optional default status and account actions."
				stacked
			/>

			<Example
				example="blocks-commerce/payment-method"
				title="PaymentMethodCard"
				description="The card brand, last four digits, holder, and expiry, with a change action."
				stacked
			/>

			<Example
				example="blocks-commerce/payment-timeline"
				title="PaymentTimeline"
				description="Payment events in order, with settled and pending markers and aligned amounts."
				stacked
			/>

			<Example
				example="blocks-commerce/subscription-summary"
				title="SubscriptionSummary"
				description="Plan, recurring price, renewal date, and included services, with upgrade and manage actions."
				stacked
			/>

			<Example
				example="blocks-commerce/inventory-level"
				title="InventoryLevel"
				description="A visible stock count and capacity gauge, with low-stock and out-of-stock states and restocking context."
				stacked
			/>

			<Example
				example="blocks-commerce/upcoming-bookings"
				title="UpcomingBookings"
				description="Compact rounded date tiles with appointment times beside the service and customer. Dates follow the provider locale; the consumer supplies the display order."
				stacked
			/>

			<Example
				example="blocks-commerce/loyalty-points"
				title="LoyaltyPoints"
				description="A prominent points balance followed by recent earnings and redemptions. Movement signs follow their direction."
				stacked
			/>

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
