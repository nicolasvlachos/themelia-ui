import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function InlineStatPage() {
	return (
		<ComponentPage
			title="Inline stat"
			summary="One label and one value — the pair that sits inside another surface's chrome: a card footer, a header strip, a row of totals. A set of facts about one thing is a MetadataList instead."
			importPath="@/components/base/display"
			exports={["InlineStat"]}
		>
			<Example
				example="inline-stat/inline-stat"
				title="Three layouts for one fact"
				description="One label and one value, for the pair that sits inside another surface — a card footer, a header strip. The same three layouts as the list, spent on one fact: between claims the full width, inline reads as one unit among others, stacked makes the figure the subject. A set of facts about one thing is a MetadataList instead."
				stacked
			/>

			<Example id="inline-stat-api" title="InlineStat API">
				<PropTable owner="InlineStat"
					rows={[
						{ name: "label", type: "ReactNode", required: true, description: "Names the fact. Rendered as a DisplayLabel, which has one style everywhere." },
						{ name: "value", type: "ReactNode", description: "The fact itself. Absent renders the empty marker rather than collapsing the row to its label — a dash says the fact was looked for." },
						{ name: "layout", type: '"between" | "inline" | "stacked"', default: '"between"', description: "The three differ only in how the free space between label and value is spent." },
						{ name: "mono", type: "boolean", default: "false", description: "Tabular figures, for an amount or a counter — what makes a column of these compare down the page instead of jittering with each digit's width." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
