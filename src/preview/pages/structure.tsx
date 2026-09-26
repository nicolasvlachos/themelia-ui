import { Text } from "@/components/base/typography"

import { Example } from "../partials/example"
import { ComponentPage } from "../partials/component-page"
import { PropTable } from "../partials/prop-table"

export function StructurePage() {
	return (
		<ComponentPage>
			<Example
				example="structure/stack"
				title="Stack"
				description="Vertical by default, because most page composition is. Gaps come from the spacing scale, so a compact scope tightens every Stack."
			/>

			<Example
				example="structure/responsive-props"
				title="Responsive props"
				description="Resize the window: this row stacks below md and becomes a row above it. One tree, one prop."
			/>

			<Example
				example="structure/grid"
				title="Grid"
				description="An explicit column count, for when the layout is a decision rather than a consequence of available space."
			/>

			<Example
				example="structure/adaptivegrid"
				title="AdaptiveGrid"
				description="Columns follow the available width via auto-fit, so it needs no breakpoints. Use it when the question is 'how narrow may a column get', not 'how many columns do I want'."
			/>

			<Example
				example="structure/split"
				title="Split"
				description="A fixed column beside a fluid one. Grid divides space into equal shares and Stack gives each child what it asks for; neither says 'this side is 18rem and the other takes the rest', which is the shape of a rail beside content."
			/>

			<Example
				example="structure/bleed"
				title="Bleed"
				description="Lets a child escape the padding it is sitting in — a full-width image at the top of a padded card, a rule that meets both edges. The amount is a spacing step rather than a length, so it cancels a padding that came from the same scale and the two cannot drift apart under a density change."
			/>

			<Example
				id="implementation-note"
				title="Implementation note">
				<Text type="secondary">
					Each prop writes one custom property per breakpoint, and the module has one media
					query per breakpoint that reads it, falling back to the next one down. Six rules
					do what a class table would need every combination written out for — six
					breakpoints by eight gap steps by five axes — and adding a gap step costs nothing.
				</Text>
			</Example>

			<Example
				id="stack-api"
				title="Stack API">
				<PropTable owner="Stack" />
			</Example>
				<Example
				id="split-api"
				title="Split API">
				<PropTable owner="Split" />
			</Example>

			<Example
				id="bleed-api"
				title="Bleed API">
				<PropTable owner="Bleed" />
			</Example>

	</ComponentPage>
	)
}
