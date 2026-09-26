import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input, SlugField } from "themelia-ui/base/text-inputs"


function SlugFieldDemo() {
	const [title, setTitle] = useState("Northwind Traders — Q4 Report & Notes")

	return (
		<Stack gap="lg" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Title">
				<Input value={title} onChange={(event) => setTitle(event.target.value)} />
			</FormField>
			<FormField label="URL" helperText="Derived from the title. Accents fold, punctuation collapses.">
				<SlugField value={title} prefix="acme.com/" />
			</FormField>
		</Stack>
	)
}

export default function SlugFieldExample() {
	return (
		<SlugFieldDemo />
	)
}
