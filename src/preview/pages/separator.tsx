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
				<PropTable owners={["Separator"]} />
			</Example>
		</ComponentPage>
	)
}
