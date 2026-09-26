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
				<PropTable owner="ColorInput"
					rows={[
						{ name: "value / onValueChange", type: "string", description: "Any CSS colour string. Not normalised — what you type is what is stored." },
						{ name: "previewValue", type: "string", description: "What the swatch shows, when it differs from the value — a resolved token, say." },
						{ name: "strings", type: "Partial<ColorInputStrings>", description: "Overrides this field's own copy — the swatch's name. It is a control, the native picker lives under it, so it needs one." },
						{ name: "format", type: "\"oklch\" | \"hex\" | \"rgb\" | \"hsl\"", default: "\"oklch\"", description: "What the PICKER emits — typed text is never rewritten. The kit's own palette is OKLCH, which is why that is the default; a consumer whose tokens are hex, rgb or hsl gets their own notation back. The conversion is culori's, the same library lib/theming/contrast.ts uses." },
						{ name: "emitHex", type: "boolean", default: "false", description: "Deprecated: the older spelling of format=\"hex\", kept because it is published API. format wins where both are given." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
