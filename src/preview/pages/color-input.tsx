import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import { ColorInput } from "@/components/base/value-inputs"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ColorInputPage() {
	const [color, setColor] = useState("oklch(0.45 0.12 155)")

	return (
		<ComponentPage
			title="Color input"
			summary="A colour value with a swatch. It accepts any CSS colour, including a token that resolves to one, and hands the picker’s choice back in whichever notation your tokens are written in — oklch, hex, rgb or hsl."
			importPath="@/components/base/value-inputs"
			exports={["ColorInput"]}
		>
			<Example
				id="color"
				title="ColorInput"
				description="The text field holds whatever the design tokens use — any CSS colour. The native picker only speaks hex, so it is a companion rather than the source of truth: what it returns is converted to OKLCH, and what is typed is preserved verbatim."
				stacked
				code={`<ColorInput value={color} onValueChange={setColor} />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="Brand" helperText="The swatch shows the painted colour, so var() and named colours work.">
						<ColorInput value={color} onValueChange={setColor} />
					</FormField>
					<FormField label="Seeded from a token">
						<ColorInput defaultValue="var(--destructive)" />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="color-formats"
				title="What the picker hands back"
				description="The native picker only speaks hex. `format` says what to convert that into, because a raw #rrggbb is the odd one out in a token file written in oklch() — and so is an oklch() in one written in hex. Typed text is never rewritten: this only applies to what the swatch's picker returns."
				stacked
				code={`<ColorInput format="hex" … />
<ColorInput format="rgb" … />
<ColorInput format="hsl" … />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="oklch (default)" helperText="Pick a colour from the swatch to see the notation change.">
						<ColorInput defaultValue="oklch(0.45 0.12 155)" />
					</FormField>
					<FormField label="hex">
						<ColorInput format="hex" defaultValue="#2f6f4e" />
					</FormField>
					<FormField label="rgb">
						<ColorInput format="rgb" defaultValue="rgb(47, 111, 78)" />
					</FormField>
					<FormField label="hsl">
						<ColorInput format="hsl" defaultValue="hsl(151, 40%, 31%)" />
					</FormField>
				</Stack>
			</Example>

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
