import { GlobeIcon } from "lucide-react"
import { useState } from "react"

import { Select } from "themelia-ui/base/choice-inputs"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { NativeSelect } from "themelia-ui/base/text-inputs"


const COUNTRIES = [
	{ value: "nl", label: "Netherlands", description: "VAT charged at 21%.", icon: <GlobeIcon /> },
	{ value: "de", label: "Germany", description: "VAT charged at 19%.", icon: <GlobeIcon /> },
	{ value: "fr", label: "France", description: "VAT charged at 20%.", icon: <GlobeIcon /> },
	{ value: "us", label: "United States", description: "Sales tax varies by state.", icon: <GlobeIcon /> },
	{ value: "jp", label: "Japan", description: "Consumption tax at 10%.", icon: <GlobeIcon />, disabled: true },
]

export default function SelectExample() {
	const [country, setCountry] = useState<string | undefined>("nl")

	return (
		<Stack gap="lg" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Billing country">
				<Select options={COUNTRIES} value={country} onValueChange={setCountry} allowClear />
			</FormField>
			<FormField label="Invalid" error="Choose a country to continue.">
				<Select options={COUNTRIES} invalid placeholder="Choose a country" />
			</FormField>
			<FormField label="Disabled">
				<Select options={COUNTRIES} disabled defaultValue="nl" />
			</FormField>
			<FormField
				label="Native select"
				helperText="The escape hatch: NativeSelect, when the platform picker is specifically what you want."
			>
				<NativeSelect defaultValue="nl">
					<option value="nl">Netherlands</option>
					<option value="de">Germany</option>
				</NativeSelect>
			</FormField>
		</Stack>
	)
}
