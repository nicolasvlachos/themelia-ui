import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ProductsPage() {
	return (
		<ComponentPage>
			<Example
				example="products/overview"
				title="Overview and quote"
				description="The header of a product page and the price it adds up to. The quote's total is ruled off rather than tinted — a filled band on the last line makes a total look like an alert, which is the one thing it is not."
			/>

			<Example
				example="products/rows"
				title="Readiness, structure, operations"
				description="Three cards, one row shape. They differ only in what sits in the trailing lane — a badge, a number, a value — so there is one row component and three wrappers, not four near-identical ones. Shared Item parts own the row layout. On narrow cards, the trailing value or action moves below the content so the title and description stay readable."
			/>

			<Example
				example="products/contract"
				title="Details, contract, policies"
				description="Facts go through MetadataList, so an email or an SKU is rendered by the kind that knows how — this module does not restate it. The contract's metric tiles are keyed to a container rather than the viewport, because how many fit is a question about the card and this card is as often a panel beside a sidebar as a full-width page."
			/>

			<Example id="products-rules" title="Two rules">
				<Callout label="Every value is a node">
					A price, a stock level, an SKU: each is already formatted by the app that owns it,
					with its own currency and its own “out of stock” wording. Typing them as{" "}
					<code>number</code> would put money formatting in this module, which it cannot do
					correctly for anyone; a <code>format</code> prop per field would be six props doing
					one job.
				</Callout>
				<Callout label="A verb you omit is a control that disappears">
					There is an <code>onXxx</code> per verb rather than one <code>onChange</code> with a
					discriminant, because a catalogue row has three or four distinct verbs and collapsing
					them moves the switch statement into every consumer — and loses the ability to omit
					one, which is how its control is hidden.
				</Callout>
			</Example>

			<Example id="products-api" title="API">
				<PropTable
					owners={[
						"ProductReadinessCard",
						"ProductReadinessItem",
						"ProductDetailsCard",
						"ProductContractOverview",
						"ProductQuotePreviewLine",
					]}
				/>
				<PropTable
					symbols={[
						"ProductSurface",
						"ProductPoliciesCard",
						"ProductVariantDetails",
						"ProductSummaryRow",
						"ProductReadinessRow",
						"ProductOperationRow",
						"ProductStructureMetricRow",
						"ProductRowActions",
						"ProductVariantActionMenu",
						"ProductOptionActionMenu",
						"ProductVariantCell",
						"ProductThumbnail",
						"ProductToneDot",
						"ProductEmptyState",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
