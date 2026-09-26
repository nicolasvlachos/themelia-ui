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
				<PropTable owner="ProductReadinessCard"
					rows={[
						{ name: "ProductReadinessCard score", type: "number", description: "0–100, clamped — a percentage bar cannot show 140, and a NaN would render as an empty track." },
						{ name: "tone", api: "ProductReadinessItem.tone", type: "\"neutral\" | \"primary\" | \"success\" | \"warning\" | \"destructive\" | \"info\"", description: "No secondary: it means “not this one”, which is not a state a product can be in. A readiness item with completed and no tone derives success, so ticking a box does not also mean remembering the colour." },
						{ name: "surface", api: "ProductOptionsMatrix.surface", type: "\"card\" | \"embedded\"", description: "card frames the surface; embedded renders it bare inside one that already exists." },
						{ name: "ProductDetailsCard description", type: "ReactNode | false", description: "false suppresses the default rather than rendering it empty — which is the difference between a card with no subtitle and a card with a blank line where one was." },
						{ name: "ProductContractOverview terms", type: "MetadataListItem[]", description: "Facts go through MetadataList, so an email or an SKU is rendered by the kind that knows how; this module does not restate it." },
						{ name: "ProductQuotePreviewLine.emphasis", type: "boolean", description: "Rules the line off and weights it. Not a tint: a filled band on the last line makes a total look like an alert, which is the one thing a total is not." },
						{ name: "renderItem", type: "(item, index) => ReactNode", description: "Replaces a whole row. The rows are one component with three wrappers, so a consumer replacing one is replacing the same shape everywhere it appears." },
						{ name: "ProductDetailsCard / ProductPoliciesCard", type: "component", description: "The two remaining cards a product page is assembled from \u2014 the facts that identify it, and what the customer agrees to. Each is a ContentBlock with a list inside and the same four verbs on every row." },
						{ name: "ProductVariantDetails", type: "component", description: "One variant, read-only: what it is, what it costs, and which options it stands for. `variant` is optional because the panel is also what a page shows before one is chosen." },
						{ name: "ProductSummaryRow / ProductReadinessRow / ProductOperationRow / ProductStructureMetricRow", type: "component", description: "Three cards, one row shape. They differ only in what sits in the trailing lane \u2014 a badge, a number, a value \u2014 so there is one row component and three wrappers rather than four near-identical ones." },
						{ name: "ProductRowActions / ProductVariantActionMenu / ProductOptionActionMenu", type: "component", description: "The verbs, built from one array so the overflow cannot offer what the button already does. Three menus rather than one because a variant, an option and a row answer to different sets." },
						{ name: "ProductVariantCell / ProductThumbnail / ProductToneDot", type: "component", description: "The pieces every product surface shares. Tone is a data attribute rather than six class names, so a row\u2019s state is one string in the DOM and the CSS reads it once." },
						{ name: "ProductEmptyState", type: "component", description: "What a product card shows with nothing in it, sized to the card rather than to the page \u2014 a full-page empty state inside a half-width card reads as a broken layout." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
