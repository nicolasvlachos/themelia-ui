import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { ColorInput } from "themelia-ui/base/value-inputs"


export default function ColorFormats() {
	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
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
	)
}
