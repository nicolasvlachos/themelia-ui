import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { DecimalInput, RoundingModeSelect, type RoundingMode } from "themelia-ui/base/forms-numeric"
import { Stack } from "themelia-ui/base/structure"


export default function RoundingModeExample() {
	const [mode, setMode] = useState<RoundingMode>("half-even")

	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Rounding" helperText="Applies to the field below.">
				<RoundingModeSelect
					value={mode}
					modes={["floor", "round", "ceil", "half-even"]}
					onValueChange={(next) => next && setMode(next)}
				/>
			</FormField>
			<FormField label="Amount" helperText="Type 2.345 and blur.">
				<DecimalInput defaultValue="2.345" decimalPlaces={2} roundingMode={mode} />
			</FormField>
		</Stack>
	)
}
