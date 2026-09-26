import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function InlineStatPage() {
	return (
		<ComponentPage>
			<Example
				example="inline-stat/inline-stat"
				title="Three layouts for one fact"
				description="One label and one value, for the pair that sits inside another surface — a card footer, a header strip. The same three layouts as the list, spent on one fact: between claims the full width, inline reads as one unit among others, stacked makes the figure the subject. A set of facts about one thing is a MetadataList instead."
			/>

			<Example id="inline-stat-api" title="InlineStat API">
				<PropTable owner="InlineStat" />
			</Example>
		</ComponentPage>
	)
}
