import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BlocksOrderPage() {
	return (
		<ComponentPage>
			<Example
				example="blocks-order/order-status-axes"
				title="Two statuses, not one"
				description="Money and goods move separately: an order can be refunded before anything ships, partially fulfilled while fully paid, or authorized with nothing captured. The kit's older OrderStatus union collapses both into one word and cannot say any of that, so fulfillment and payment are separate vocabularies with separate tone maps — and neither takes an override that could disagree with its data."
			/>

			<Example
				example="blocks-order/order-fulfillment"
				title="Fulfillment groups"
				description="Each group carries its own status, the location it ships from, and its own actions — the first renders as a button and the rest collapse into an overflow, built from one array so the menu cannot offer what the button already does. A group takes items, or takes <OrderLineItem> children when a caller needs the rows themselves."
			/>

			<Example
				example="blocks-order/order-line-item"
				title="A line, and what a consumer attaches to it"
				description="properties is the domain's own name for per-line custom data — a gift message, engraving text, a subscription interval — rendered as label/value rows so every consumer's extras share one treatment. children takes whatever properties cannot. The line total is passed, never multiplied: this one carries a bundle discount, so 2 × €24.00 is not €38.40."
			/>

			<Example
				example="blocks-order/order-summary"
				title="OrderSummary"
				description="What was ordered and what has actually moved are different questions, so they sit in separate panels — running them together is how Total and Balance start reading as the same kind of number. A row's note is a middle column, so counts and rates line up down a stack."
			/>

			<Example
				example="blocks-order/order-transactions"
				title="OrderTransactions"
				description="The payment ledger, and its own component — what was attempted, when, by what, and whether it worked. A refund here is signed but never green: AmountRow tints a deduction green because money off a customer's total is a gain to them, and in a merchant's ledger a refund is money going out. A failed attempt stays in the list, because an order showing only what worked cannot answer why it was never captured."
			/>

			<Example
				example="blocks-order/order-customer"
				title="Customer and addresses"
				description="Read-only, which is what separates this from AddressCard — an editable settings card that draws its own chrome, and two of those stacked in a sidebar read as two settings cards rather than one panel. billingSameAsShipping states the match in a line instead of repeating the address and making the reader compare two blocks to discover they are identical."
			/>

			<Example id="order-props" title="Props">
				<Callout>
					<strong>Nothing here does arithmetic.</strong> A line total is passed, not
					multiplied, because a line can carry a discount, a tax-inclusive price or a
					proration that <code>unitPrice × quantity</code> does not predict — and a row that
					multiplied would be confidently wrong on exactly the lines that matter.
				</Callout>
				<PropTable
					owners={[
						"OrderHeader",
						"FulfillmentGroup",
						"OrderLineItem",
						"OrderSummary",
						"OrderTransactions",
						"OrderCustomer",
					]}
				/>
				<PropTable symbols={["OrderTimeline", "SummaryPanel", "AmountRow"]} />
			</Example>
		</ComponentPage>
	)
}
