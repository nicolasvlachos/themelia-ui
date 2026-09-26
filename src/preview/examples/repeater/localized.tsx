import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { LocalizedStringField, type LocalizedValue } from "themelia-ui/base/repeaters"
import { Stack } from "themelia-ui/base/structure"


const LOCALES = [
	{ value: "en", label: "English" },
	{ value: "nl", label: "Nederlands" },
]

export default function Localized() {
	const [name, setName] = useState<LocalizedValue>({ en: "Invoice", nl: "Factuur" })

	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField htmlFor={false} label="Display name" helperText="Switch locale — the value follows.">
				<LocalizedStringField locales={LOCALES} value={name} onValueChange={setName} />
			</FormField>
		</Stack>
	)
}
