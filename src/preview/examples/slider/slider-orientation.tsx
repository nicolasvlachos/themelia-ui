import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { SliderField } from "themelia-ui/base/value-inputs"


export default function SliderOrientation() {
	const [volume, setVolume] = useState(40)
	const [range, setRange] = useState<number[]>([20, 70])

	return (
		<Stack direction="horizontal" align="start">
			<FormField label="Level">
				<SliderField
					orientation="vertical"
					value={volume}
					onValueChange={setVolume}
					showValue
					unit="%"
				/>
			</FormField>
			<div style={{ maxWidth: "26rem", width: "100%" }}>
				<FormField label="Budget band" helperText="Two handles, one field.">
					<SliderField value={range} onValueChange={setRange} showValue />
				</FormField>
			</div>
		</Stack>
	)
}
