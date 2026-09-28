import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ItemPage() {
	return (
		<ComponentPage>
			<Example
				example="item/item"
				title="Item"
				description="Every surface below is the same element: a list row, a menu row, a table row. That is why alignment, truncation, and the media-to-first-line rule are decided here once instead of three times — and why a surface prop, not a second component, is what makes one of them quieter."
			/>

			<Example
				example="item/cards-scale"
				title="Density"
				description="Neither Card nor Item takes a size prop. Density is scoped instead, so a dense list can sit inside a normally-scaled card."
			/>

			<Example
				example="item/item-ruled"
				title="A ruled group"
				description="A group's default gap is right for a list of independent things — search results, a feed — where each row is its own object. Inside one card it is wrong: at a rem apart, three cart lines or three secrets read as three unrelated blocks, and the card grows a third taller than its content needs. ruled swaps the air for a hairline, and drops a neutral row's own inline padding, which exists to hold a row off a surface it is not drawing. The rule is painted as a positioned pseudo-element, not a border: a row carries a radius for its hover ground, and a border follows the box it is on — the hairline came out with a quarter-arc hooking down at each end."
			/>

			<Example id="item-rule" title="Rows are Items">
				<Callout label="Rule">
					A list row, a menu row, and a table row are the same shape: something on the
					left, a title with optional supporting text, controls on the right. They share
					one primitive so that alignment, truncation, and the media-to-first-line rule
					are decided once instead of three times.
				</Callout>
			</Example>

			<Example id="item-api" title="API">
				<PropTable
					owners={[
						"Item",
						"ItemMedia",
						"ItemContent",
						"ItemActions",
						"ItemHeader",
						"ItemFooter",
						"ItemGroup",
						"ItemSeparator",
					]}
				/>
				<PropTable
					rows={[
						{ name: "data-density", api: ["css:--padding-sm"], type: '"compact" | "default" | "comfortable"', description: "On any ancestor, or through a provider's `density`: a dense list inside a card at the default density." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
