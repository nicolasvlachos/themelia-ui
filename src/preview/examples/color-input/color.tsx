import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { ColorInput } from "themelia-ui/base/value-inputs"


export default function Color() {
	const [color, setColor] = useState("oklch(0.45 0.12 155)")

	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Brand" helperText="The swatch shows the painted colour, so var() and named colours work.">
				<ColorInput value={color} onValueChange={setColor} />
			</FormField>
			<FormField label="Seeded from a token">
				<ColorInput defaultValue="var(--destructive)" />
			</FormField>
		</Stack>
	)
}
