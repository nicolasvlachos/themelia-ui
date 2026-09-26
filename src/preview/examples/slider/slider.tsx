import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { SliderField } from "themelia-ui/base/value-inputs"


export default function SliderExample() {
	const [volume, setVolume] = useState(40)

	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Volume">
				<SliderField value={volume} onValueChange={setVolume} showValue unit="%" />
			</FormField>
			<FormField label="Steps of 10" helperText="onValueCommitted fires once on release, not on every step.">
				<SliderField defaultValue={50} step={10} showValue />
			</FormField>
			<FormField label="Invalid" error="Pick a value above 60.">
				<SliderField defaultValue={20} invalid showValue />
			</FormField>
			<FormField label="Disabled">
				<SliderField defaultValue={30} disabled showValue />
			</FormField>
		</Stack>
	)
}
