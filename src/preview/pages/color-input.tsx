import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ColorInputPage() {
	return (
		<ComponentPage>
			<Example
				example="color-input/color"
				title="ColorInput"
				description="The text field holds whatever the design tokens use — any CSS colour. The native picker only speaks hex, so it is a companion rather than the source of truth: what it returns is converted to OKLCH, and what is typed is preserved verbatim."
			/>

			<Example
				example="color-input/color-formats"
				title="What the picker hands back"
				description="The native picker only speaks hex. `format` says what to convert that into, because a raw #rrggbb is the odd one out in a token file written in oklch() — and so is an oklch() in one written in hex. Typed text is never rewritten: this only applies to what the swatch's picker returns."
			/>

			<Example id="color-input-api" title="API">
				<PropTable owner="ColorInput" />
			</Example>
		</ComponentPage>
	)
}
