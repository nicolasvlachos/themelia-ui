import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { SliderField } from "themelia-ui/base/value-inputs"


export default function SliderSizes() {
	const [volume, setVolume] = useState(40)

	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="sm — the default">
				<SliderField value={volume} onValueChange={setVolume} showValue unit="%" />
			</FormField>
			<FormField label="md — a larger target">
				<SliderField size="md" value={volume} onValueChange={setVolume} showValue unit="%" />
			</FormField>
		</Stack>
	)
}
