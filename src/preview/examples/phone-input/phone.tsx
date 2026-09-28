import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { PhoneInput } from "themelia-ui/base/value-inputs"


export default function Phone() {
	const [prefix, setPrefix] = useState("+31")
	const [phone, setPhone] = useState("6 1234 5678")

	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			<FormField label="Mobile" helperText="Leaving the field strips a typed prefix and the trunk zero.">
				<PhoneInput
					prefix={prefix}
					onPrefixChange={setPrefix}
					prefixes={["NL", "BE", "DE", "GB", "US"]}
					value={phone}
					onChange={(event) => setPhone(event.target.value)}
				/>
			</FormField>
			<FormField label="Without the picker">
				<PhoneInput disablePrefixSelector defaultValue="020 123 4567" />
			</FormField>
		</Stack>
	)
}
