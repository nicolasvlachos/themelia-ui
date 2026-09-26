import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { KeyValueEditor, type KeyValuePair } from "themelia-ui/base/repeaters"
import { Stack } from "themelia-ui/base/structure"


export default function KeyValue() {
	const [headers, setHeaders] = useState<KeyValuePair[]>([
		{ key: "X-Api-Version", value: "2026-01" },
		{ key: "X-Trace", value: "on" },
	])

	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			<FormField htmlFor={false} label="Request headers" helperText="Try entering the same key twice.">
				<KeyValueEditor value={headers} onValueChange={setHeaders} sortable />
			</FormField>
		</Stack>
	)
}
