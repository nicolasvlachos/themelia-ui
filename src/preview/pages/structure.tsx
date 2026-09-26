import { Text } from "@/components/base/typography"

import { Example } from "../partials/example"
import { ComponentPage } from "../partials/component-page"
import { PropTable } from "../partials/prop-table"

export function StructurePage() {
	return (
		<ComponentPage
			title="Stack & Grid"
			summary="Stack, Grid, GridCell, AdaptiveGrid, Split, and Bleed. Every prop takes a value or a per-breakpoint object, so a layout that changes shape does not need two rendered trees."
			importPath="@/components/base/structure"
			exports={["Stack", "Grid", "GridCell", "AdaptiveGrid", "Split", "Bleed"]}
		>
			<Example
				example="structure/stack"
				title="Stack"
				description="Vertical by default, because most page composition is. Gaps come from the spacing scale, so a compact scope tightens every Stack."
				stacked
			/>

			<Example
				example="structure/responsive-props"
				title="Responsive props"
				description="Resize the window: this row stacks below md and becomes a row above it. One tree, one prop."
				stacked
			/>

			<Example
				example="structure/grid"
				title="Grid"
				description="An explicit column count, for when the layout is a decision rather than a consequence of available space."
				stacked
			/>

			<Example
				example="structure/adaptivegrid"
				title="AdaptiveGrid"
				description="Columns follow the available width via auto-fit, so it needs no breakpoints. Use it when the question is 'how narrow may a column get', not 'how many columns do I want'."
				stacked
			/>

			<Example
				example="structure/split"
				title="Split"
				description="A fixed column beside a fluid one. Grid divides space into equal shares and Stack gives each child what it asks for; neither says 'this side is 18rem and the other takes the rest', which is the shape of a rail beside content."
				stacked
			/>

			<Example
				example="structure/bleed"
				title="Bleed"
				description="Lets a child escape the padding it is sitting in — a full-width image at the top of a padded card, a rule that meets both edges. The amount is a spacing step rather than a length, so it cancels a padding that came from the same scale and the two cannot drift apart under a density change."
				stacked
			/>

			<Example
				id="implementation-note"
				title="Implementation note" stacked>
				<Text type="secondary">
					The source kit compiled responsive structure into class tables — six breakpoints
					by eight gap steps by five axes, every combination written out. Here each prop
					writes one custom property per breakpoint and the module has one media query per
					breakpoint that reads it, falling back to the next one down. Six rules replace
					the whole table, and adding a gap step costs nothing.
				</Text>
			</Example>

			<Example
				id="stack-api"
				title="Stack API">
				<PropTable owner="Stack"
					rows={[
						{ name: "direction", type: 'ResponsiveValue<"vertical" | "horizontal">', default: '"vertical"', description: "Main axis." },
						{ name: "gap", type: "ResponsiveValue<StructureGap>", default: '"md"', description: "Space between children, on the semantic spacing scale." },
						{ name: "align", type: "ResponsiveValue<StructureAlign>", default: '"stretch"', description: "Cross-axis alignment." },
						{ name: "justify", type: "ResponsiveValue<StructureJustify>", default: '"start"', description: "Main-axis distribution." },
						{ name: "wrap", type: "ResponsiveValue<boolean>", default: "false", description: "Allows children onto more than one line." },
						{ name: "maxWidth", type: "ResponsiveValue<StructureWidth | string>", default: "—", description: "Caps the width — a content step (sm…2xl, full, none) or any CSS length. A field measure is a control decision rather than a content one, which is why a raw length is allowed beside the scale." },
					]}
				/>
			</Example>
				<Example
				id="split-api"
				title="Split API">
				<PropTable owner="Split"
					rows={[
						{ name: "side", type: '"start" | "end"', default: '"end"', description: "Which visual column is the fixed one. The DOM order never changes with it — the first child is the main content on both settings, so a reader tabbing through reaches it first either way." },
						{ name: "sideWidth", type: "ResponsiveValue<StructureWidth | string>", default: '"18rem"', description: "The fixed column's width. A maximum rather than an exact size, so a narrow viewport shrinks the rail instead of squeezing the content beside it to nothing." },
						{ name: "gap", type: "ResponsiveValue<StructureGap>", default: '"md"', description: "Space between the two columns." },
						{ name: "collapseBelow", type: '"sm" | "md" | "lg" | "xl" | "never"', default: '"md"', description: "Below this breakpoint the two columns become one. `never` keeps them side by side at every width." },
					]}
				/>
			</Example>

			<Example
				id="bleed-api"
				title="Bleed API">
				<PropTable owner="Bleed"
					rows={[
						{ name: "amount", type: "ResponsiveValue<StructureGap>", default: '"none"', description: "How far to escape, on the spacing scale. Match it to the padding being cancelled — a surface at `--space-md` bleeds md — so the two move together under a density change." },
						{ name: "axis", type: '"inline" | "block" | "both"', default: '"inline"', description: "Which way. Sideways is the common case: an image bleeds across and keeps its vertical rhythm." },
					]}
				/>
			</Example>

	</ComponentPage>
	)
}
