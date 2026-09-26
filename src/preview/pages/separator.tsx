import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SeparatorPage() {
	return (
		<ComponentPage>
			<Example
				example="separator/separator"
				title="Separator"
				description="A labelled separator is a rule with a gap punched through it, not two rules — so the line meets the label exactly at both sides regardless of text length."
			/>

			<Example
				example="separator/separator-variants"
				title="Variants and thickness"
				description="A dashed or dotted rule reads as provisional — a fold, a drop target, a boundary the reader can cross — where a solid one reads as structure. Thickness is a per-rule override of `--separator-thickness`, for a seam between panels rather than between rows."
			/>

			<Example id="separator-api" title="API">
				<PropTable owner="Separator"
					rows={[
						{ name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which way the rule runs. A vertical separator needs a height from its container." },
						{ name: "variant", type: '"solid" | "dashed" | "dotted"', default: '"solid"', description: "How the rule is drawn. Structural, not semantic — a dashed rule is the same divider, drawn as provisional." },
						{ name: "thickness", type: "string | number", description: "Per-rule override of `--separator-thickness`. A number is read as pixels." },
						{ name: "label", type: "ReactNode", description: "Text set into a gap in the rule. Drops the separator role, because the rule is then decoration around real text." },
						{ name: "aria-hidden", type: "boolean", description: "Set true to hide a decorative rule from assistive technology. Unlabelled separators otherwise expose separator semantics." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
