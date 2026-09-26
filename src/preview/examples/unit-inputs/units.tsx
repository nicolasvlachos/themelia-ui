import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import {
	CoordinatesInput,
	DimensionsInput,
	WeightInput,
	type CoordinatesValue,
	type DimensionsValue,
} from "themelia-ui/base/forms-numeric"
import { Stack } from "themelia-ui/base/structure"


export default function Units() {
	const [weight, setWeight] = useState("2.4")
	const [dimensions, setDimensions] = useState<DimensionsValue>({ length: "30", width: "20", height: "12" })
	const [coordinates, setCoordinates] = useState<CoordinatesValue>({ latitude: "52.370216", longitude: "4.895168" })

	return (
		<Stack gap="xl" style={{ maxWidth: "34rem", width: "100%" }}>
			<FormField label="Shipping weight">
				<WeightInput
					value={weight}
					onChange={(event) => setWeight(event.target.value)}
					defaultUnit="kg"
				/>
			</FormField>
			<FormField label="Package">
				<DimensionsInput value={dimensions} onValueChange={setDimensions} defaultUnit="cm" />
			</FormField>
			<FormField label="Warehouse" helperText="Latitude is ±90, longitude ±180 — bounded separately.">
				<CoordinatesInput value={coordinates} onValueChange={setCoordinates} />
			</FormField>
		</Stack>
	)
}
