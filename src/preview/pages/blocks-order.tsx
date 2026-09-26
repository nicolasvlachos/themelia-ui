import { BanIcon } from "lucide-react"

import {
	FulfillmentGroup, OrderCustomer, OrderHeader, OrderLineItem, OrderSummary,
	OrderTransactions,
	type OrderLine, type Transaction,
} from "@/components/admin/patterns/commerce"
import { Grid, GridCell, Stack } from "@/components/base/structure"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const LINES: OrderLine[] = [
	{
		id: "1",
		title: "ADIDAS | CLASSIC BACKPACK | LEGEND INK MULTICOLOUR",
		variantTitle: "OS / blue",
		sku: "AD-04-OS-blue",
		unitPrice: "€50.00",
		quantity: 1,
		total: "€50.00",
	},
	{
		id: "2",
		title: "VANS | ERA 59 MOROCCAN | GEO/DRESS BLUES",
		variantTitle: "8 / blue",
		sku: "VN-04-8-blue",
		unitPrice: "€119.95",
		quantity: 1,
		total: "€119.95",
	},
	{
		id: "3",
		title: "NIKE | TODDLER ROSHE ONE",
		variantTitle: "4 / black",
		sku: "NK-02-4-black",
		unitPrice: "€70.00",
		quantity: 1,
		total: "€70.00",
	},
]

const PERSONALISED: OrderLine = {
	id: "4",
	title: "ENGRAVED LEATHER TAG",
	variantTitle: "Tan",
	sku: "LT-01-tan",
	unitPrice: "€24.00",
	quantity: 2,
	/* Not 2 × 24: this line carries a bundle discount the unit price does not predict. */
	total: "€38.40",
	properties: [
		{ label: "Engraving", value: "A. MERCER" },
		{ label: "Gift message", value: "Happy birthday, from all of us" },
		{ label: "Bundle", value: "Buy 2, save 20%" },
	],
}

const TRANSACTIONS: Transaction[] = [
	{
		id: "1",
		kind: "authorization",
		status: "success",
		amount: "€239.95",
		processedAt: "21 Dec 2025, 22:10",
		method: "Visa ending 4417",
		reference: "ch_3Qa8Kd2eZvKYlo2C",
		gateway: "Stripe",
	},
	{
		id: "2",
		kind: "capture",
		status: "failure",
		amount: "€239.95",
		processedAt: "22 Dec 2025, 04:02",
		method: "Visa ending 4417",
		reference: "ch_3Qa8Kd2eZvKYlo2C",
		gateway: "Stripe",
	},
	{
		id: "3",
		kind: "refund",
		status: "success",
		amount: "€239.95",
		processedAt: "23 Dec 2025, 09:41",
		method: "Visa ending 4417",
		reference: "re_3QaB9x2eZvKYlo2C",
		gateway: "Stripe",
	},
]

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
				id="order-status-axes"
				title="Two statuses, not one"
				description="Money and goods move separately: an order can be refunded before anything ships, partially fulfilled while fully paid, or authorized with nothing captured. The kit's older OrderStatus union collapses both into one word and cannot say any of that, so fulfillment and payment are separate vocabularies with separate tone maps — and neither takes an override that could disagree with its data."
				stacked
				code={`<OrderHeader
  orderNumber="1036"
  paymentStatus="refunded"
  fulfillmentStatus="unfulfilled"
  placedAt="December 21, 2025 at 10:10 pm"
  source="Simple Sample Data (via import)"
/>`}
			>
				<Stack gap="xl">
					<OrderHeader
						orderNumber="1036"
						paymentStatus="refunded"
						fulfillmentStatus="unfulfilled"
						placedAt="December 21, 2025 at 10:10 pm"
						source="Simple Sample Data (via import)"
						actions={[
							{ id: "print", label: "Print packing slip" },
							{ id: "cancel", label: "Cancel order", tone: "destructive" },
						]}
					/>
					<OrderHeader orderNumber="1037" paymentStatus="authorized" fulfillmentStatus="scheduled" placedAt="2 Jan 2026" />
					<OrderHeader orderNumber="1038" paymentStatus="paid" fulfillmentStatus="partiallyFulfilled" placedAt="4 Jan 2026" />
				</Stack>
			</Example>

			<Example
				id="order-fulfillment"
				title="Fulfillment groups"
				description="Each group carries its own status, the location it ships from, and its own actions — the first renders as a button and the rest collapse into an overflow, built from one array so the menu cannot offer what the button already does. A group takes items, or takes <OrderLineItem> children when a caller needs the rows themselves."
				stacked
				code={`<FulfillmentGroup
  status="unfulfilled"
  location="Bul Bulgaria 111"
  notice="Shipping not required"
  items={lines}
  actions={[{ id: "fulfil", label: "Mark as fulfilled", onClick: fulfil }]}
/>`}
			>
				<Stack gap="xl">
					<FulfillmentGroup
						status="unfulfilled"
						location="Bul Bulgaria 111"
						notice="Shipping not required"
						noticeIcon={BanIcon}
						items={LINES}
						actions={[
							{ id: "fulfil", label: "Mark as fulfilled" },
							{ id: "hold", label: "Put on hold" },
							{ id: "cancel", label: "Cancel items", tone: "destructive" },
						]}
					/>
					<FulfillmentGroup
						status="fulfilled"
						location="Amsterdam warehouse"
						items={[LINES[1]!]}
						actions={[{ id: "track", label: "Track shipment" }]}
					/>
				</Stack>
			</Example>

			<Example
				id="order-line-item"
				title="A line, and what a consumer attaches to it"
				description="properties is the domain's own name for per-line custom data — a gift message, engraving text, a subscription interval — rendered as label/value rows so every consumer's extras share one treatment. children takes whatever properties cannot. The line total is passed, never multiplied: this one carries a bundle discount, so 2 × €24.00 is not €38.40."
				stacked
				code={`<OrderLineItem
  {...line}
  properties={[
    { label: "Engraving", value: "A. MERCER" },
    { label: "Gift message", value: "Happy birthday" },
  ]}
/>`}
			>
				{/* Passed as children rather than items — the seam a caller uses for a bespoke row. */}
				<FulfillmentGroup status="unfulfilled">
					<OrderLineItem {...PERSONALISED} />
				</FulfillmentGroup>
			</Example>

			<Example
				id="order-summary"
				title="OrderSummary"
				description="What was ordered and what has actually moved are different questions, so they sit in separate panels — running them together is how Total and Balance start reading as the same kind of number. A row's note is a middle column, so counts and rates line up down a stack."
				stacked
				code={`<OrderSummary
  goods={[{ label: "Subtotal", note: "3 items", amount: "€239.95" }]}
  total={{ label: "Total", amount: "€239.95" }}
  payments={[{ label: "Paid", amount: "€0.00" }, { label: "Balance", amount: "€239.95" }]}
  alert="€239.95 of the balance is currently unauthorized"
/>`}
			>
				<OrderSummary
					paymentStatus="refunded"
					goods={[
						{ id: "sub", label: "Subtotal", note: "3 items", amount: "€239.95" },
						{ id: "ship", label: "Shipping", note: "Standard", amount: "€0.00" },
						{ id: "tax", label: "Tax", note: "20%", amount: "€0.00" },
					]}
					total={{ label: "Total", amount: "€239.95" }}
					payments={[
						{ id: "paid", label: "Paid", amount: "€0.00" },
						{ id: "balance", label: "Balance", amount: "€239.95" },
					]}
					alert="€239.95 of the balance is currently unauthorized"
				/>
			</Example>

			<Example
				id="order-transactions"
				title="OrderTransactions"
				description="The payment ledger, and its own component — what was attempted, when, by what, and whether it worked. A refund here is signed but never green: AmountRow tints a deduction green because money off a customer's total is a gain to them, and in a merchant's ledger a refund is money going out. A failed attempt stays in the list, because an order showing only what worked cannot answer why it was never captured."
				stacked
				code={`<OrderTransactions transactions={transactions} />`}
			>
				<OrderTransactions transactions={TRANSACTIONS} />
			</Example>

			<Example
				id="order-customer"
				title="Customer and addresses"
				description="Read-only, which is what separates this from AddressCard — an editable settings card that draws its own chrome, and two of those stacked in a sidebar read as two settings cards rather than one panel. billingSameAsShipping states the match in a line instead of repeating the address and making the reader compare two blocks to discover they are identical."
				stacked
				code={`<OrderCustomer
  name="Alice Mercer"
  email="alice@example.test"
  orderCount={4}
  shippingAddress={address}
  billingSameAsShipping
/>`}
			>
				<Grid columns={{ base: 1, md: 2 }} gap="xl">
					<GridCell>
						<OrderCustomer
							name="Alice Mercer"
							email="alice.mercer@example.test"
							phone="+44 20 7946 0102"
							orderCount={4}
							shippingAddress={{
								name: "Alice Mercer",
								line1: "14 Kingsway",
								line2: "Flat 3",
								city: "London",
								postalCode: "WC2B 6UF",
								country: "United Kingdom",
							}}
							billingSameAsShipping
							onOpenCustomer={() => {}}
							onEditShipping={() => {}}
						/>
					</GridCell>
					<GridCell>
						<OrderCustomer
							name="Adventure Park Bansko"
							email="ops@bansko.example"
							orderCount={1}
							shippingAddress={{
								line1: "Pirin Street 71",
								city: "Bansko",
								region: "Blagoevgrad",
								postalCode: "2770",
								country: "Bulgaria",
							}}
							billingAddress={{
								line1: "Bul Bulgaria 111",
								city: "Sofia",
								postalCode: "1404",
								country: "Bulgaria",
							}}
							onEditShipping={() => {}}
							onEditBilling={() => {}}
						/>
					</GridCell>
				</Grid>
			</Example>

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
