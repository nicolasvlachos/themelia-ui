import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BlocksCommercePage() {
	return (
		<ComponentPage>
			<Example
				example="blocks-commerce/cart-summary"
				title="CartSummary"
				description="Products and quantities stay together, with aligned line prices and a single ledger for charges, savings, and the final total. Prices are formatted line totals; the consumer owns the calculation."
			/>

			<Example
				example="blocks-commerce/tax-breakdown"
				title="TaxBreakdown"
				description="Aligned tax rates and amounts, with one final total. A tax rollup appears only when there are multiple tax lines."
			/>

			<Example
				example="blocks-commerce/discount-stack"
				title="DiscountStack"
				description="Applied discounts in their stacking order, with a consistent deduction sign and total savings."
			/>

			<Example
				example="blocks-commerce/code-entry"
				title="CodeEntry"
				description="Apply WELCOME10 to try a discount, or remove and reapply GC-4417-92AB for the gift card. Other codes show a recoverable error; pending requests disable the controls."
			/>

			<Example
				example="blocks-commerce/order-status"
				title="OrderStatusCard"
				description="The latest event, next step, and delivery estimate stay visible. Expand Order history for the complete sequence."
			/>

			<Example
				example="blocks-commerce/shipment-tracking"
				title="ShipmentTracking"
				description="A copyable tracking reference, aligned shipment details, and a compact event timeline. The latest reached event stays current until delivery."
			/>

			<Example
				example="blocks-commerce/refund-status"
				title="RefundStatus"
				description="The refund amount, current stage, destination, and expected date in one compact summary."
			/>

			<Example
				example="blocks-commerce/invoice-header"
				title="InvoiceHeader"
				description="Invoice identity and status, billing parties, key dates, and the amount due."
			/>

			<Example
				example="blocks-commerce/invoice-line-items"
				title="InvoiceLineItems"
				description="Quantity, unit price, and line amount with calculated subtotal, tax, and total. Narrow panels switch to a compact list with visible totals; numeric amounts use the Money primitive."
			/>

			<Example
				example="blocks-commerce/invoice-mini"
				title="InvoiceMini"
				description="Compact invoice summaries with a reference, customer, status, due date, and total. The surrounding surface belongs to the caller."
			/>

			<Example
				example="blocks-commerce/address-card"
				title="AddressCard"
				description="A readable postal address with optional default status and account actions."
			/>

			<Example
				example="blocks-commerce/payment-method"
				title="PaymentMethodCard"
				description="The card brand, last four digits, holder, and expiry, with a change action."
			/>

			<Example
				example="blocks-commerce/payment-timeline"
				title="PaymentTimeline"
				description="Payment events in order, with settled and pending markers and aligned amounts."
			/>

			<Example
				example="blocks-commerce/subscription-summary"
				title="SubscriptionSummary"
				description="Plan, recurring price, renewal date, and included services, with upgrade and manage actions."
			/>

			<Example
				example="blocks-commerce/inventory-level"
				title="InventoryLevel"
				description="A visible stock count and capacity gauge, with low-stock and out-of-stock states and restocking context."
			/>

			<Example
				example="blocks-commerce/upcoming-bookings"
				title="UpcomingBookings"
				description="Compact rounded date tiles with appointment times beside the service and customer. Dates follow the provider locale; the consumer supplies the display order."
			/>

			<Example
				example="blocks-commerce/loyalty-points"
				title="LoyaltyPoints"
				description="A prominent points balance followed by recent earnings and redemptions. Movement signs follow their direction."
			/>

			<Example
				example="blocks-commerce/cart-summary-blueprint"
				title="Compose your own"
				description="The summaries are a `Card`, a `MetadataList` of `Money` rows and an action. Compose one yourself for a total the blocks do not model: the amounts stay formatted by the provider's locale and currency settings."
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
					owners={["AmountRow", "CodeEntry", "OrderStatusCard", "InvoiceLineItems", "InventoryLevel", "LoyaltyPoints"]}
				/>
			</Example>
		</ComponentPage>
	)
}
