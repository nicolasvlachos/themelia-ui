import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BlocksOrderPage() {
	return (
		<ComponentPage
			title="Order"
			summary="An order is not one list of goods with one status. It splits into fulfillment groups, each with its own state and location, and its money moves on an axis of its own — which is why an order can be Refunded and Unfulfilled at the same time."
			importPath="@/components/admin/patterns/commerce"
			exports={["OrderHeader", "FulfillmentGroup", "OrderLineItem", "OrderSummary", "OrderTransactions", "OrderCustomer",
				"OrderTimeline", "SummaryPanel", "AmountRow",
			]}
		>
			<Example
				example="blocks-order/order-status-axes"
				title="Two statuses, not one"
				description="Money and goods move separately: an order can be refunded before anything ships, partially fulfilled while fully paid, or authorized with nothing captured. The kit's older OrderStatus union collapses both into one word and cannot say any of that, so fulfillment and payment are separate vocabularies with separate tone maps — and neither takes an override that could disagree with its data."
				stacked
			/>

			<Example
				example="blocks-order/order-fulfillment"
				title="Fulfillment groups"
				description="Each group carries its own status, the location it ships from, and its own actions — the first renders as a button and the rest collapse into an overflow, built from one array so the menu cannot offer what the button already does. A group takes items, or takes <OrderLineItem> children when a caller needs the rows themselves."
				stacked
			/>

			<Example
				example="blocks-order/order-line-item"
				title="A line, and what a consumer attaches to it"
				description="properties is the domain's own name for per-line custom data — a gift message, engraving text, a subscription interval — rendered as label/value rows so every consumer's extras share one treatment. children takes whatever properties cannot. The line total is passed, never multiplied: this one carries a bundle discount, so 2 × €24.00 is not €38.40."
				stacked
			/>

			<Example
				example="blocks-order/order-summary"
				title="OrderSummary"
				description="What was ordered and what has actually moved are different questions, so they sit in separate panels — running them together is how Total and Balance start reading as the same kind of number. A row's note is a middle column, so counts and rates line up down a stack."
				stacked
			/>

			<Example
				example="blocks-order/order-transactions"
				title="OrderTransactions"
				description="The payment ledger, and its own component — what was attempted, when, by what, and whether it worked. A refund here is signed but never green: AmountRow tints a deduction green because money off a customer's total is a gain to them, and in a merchant's ledger a refund is money going out. A failed attempt stays in the list, because an order showing only what worked cannot answer why it was never captured."
				stacked
			/>

			<Example
				example="blocks-order/order-customer"
				title="Customer and addresses"
				description="Read-only, which is what separates this from AddressCard — an editable settings card that draws its own chrome, and two of those stacked in a sidebar read as two settings cards rather than one panel. billingSameAsShipping states the match in a line instead of repeating the address and making the reader compare two blocks to discover they are identical."
				stacked
			/>

			<Example id="order-props" title="Props">
				<Callout>
					<strong>Nothing here does arithmetic.</strong> A line total is passed, not
					multiplied, because a line can carry a discount, a tax-inclusive price or a
					proration that <code>unitPrice × quantity</code> does not predict — and a row that
					multiplied would be confidently wrong on exactly the lines that matter.
				</Callout>
				<PropTable
					rows={[
						{ name: "OrderHeader fulfillmentStatus", type: '"unfulfilled" | "partiallyFulfilled" | "fulfilled" | "scheduled" | "onHold" | "cancelled"', description: "Where the goods are. Independent of payment." },
						{ name: "OrderHeader paymentStatus", type: '"pending" | "authorized" | "paid" | "partiallyRefunded" | "refunded" | "voided"', description: "Where the money is. Both, one, or neither reads correctly — an order with nothing to ship has no fulfillment state to state." },
						{ name: "OrderHeader vocabulary", type: "Partial<OrderStatusVocabulary>", description: "Overrides the words for either axis without touching the tones, which stay derived." },
						{ name: "FulfillmentGroup items / children", type: "OrderLine[] / ReactNode", description: "items renders the rows; children replaces them wholesale, for a caller who needs control of a row. The same seam Accordion offers." },
						{ name: "FulfillmentGroup actions", type: "ActionDefinition[]", description: "The first becomes a button, the rest an overflow — one array, so the menu cannot duplicate the button." },
						{ name: "FulfillmentGroup notice / noticeIcon", type: "ReactNode / LucideIcon", description: "A standing fact about the group and the glyph beside it. The icon is a prop rather than a node because one passed as a child arrives at lucide's own 24px default — three lines tall against the text it annotates." },
						{ name: "OrderLineItem properties", type: "{ label, value }[]", description: "Per-line custom data, styled once so every consumer's extras match." },
						{ name: "OrderLineItem total", type: "string", required: true, description: "Already formatted. Passed rather than computed." },
						{ name: "OrderSummary goods / total / payments", type: "SummaryLine[] / SummaryLine / SummaryLine[]", description: "Goods and payments render as separate panels. A SummaryLine's note is a middle column, so counts and rates align down a stack." },
						{ name: "OrderSummary alert", type: "ReactNode", description: 'Standing information about the balance, rendered role="note" — nothing has gone wrong yet.' },
						{ name: "OrderTransactions transactions", type: "Transaction[]", required: true, description: "kind drives the sign; a failed attempt stays in the list, because an order showing only what worked cannot answer why it was never captured." },
						{ name: "OrderCustomer billingSameAsShipping", type: "boolean", default: "false", description: "Renders a line in place of a repeated address." },
						{ name: "OrderTimeline", type: "component", description: "An order\u2019s events on the shared rail, for a surface that wants the history without OrderStatusCard\u2019s facts panel around it." },
						{ name: "SummaryPanel / AmountRow", type: "component", description: "The money ledger \u2014 the shape almost every commerce surface is made of: a tinted block of label/amount rows, a rule, and one row that matters more than the rest. A cart, a tax breakdown, an invoice and a subscription all draw it, and each rebuilding it inline is how one of them ends up emphasising its total differently from the others." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
