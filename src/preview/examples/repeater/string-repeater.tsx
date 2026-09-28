import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { StringRepeater } from "themelia-ui/base/repeaters"
import { Stack } from "themelia-ui/base/structure"


export default function StringRepeaterExample() {
	const [domains, setDomains] = useState(["acme.com", "acme.dev"])

	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField htmlFor={false} label="Allowed domains" helperText="Drag the handle, or focus it and press ↑ / ↓.">
				<StringRepeater
					value={domains}
					onValueChange={setDomains}
					placeholder="example.com"
					sortable
					aria-label="Domain"
				/>
			</FormField>
			<FormField htmlFor={false} label="Empty" helperText="With a cap of three.">
				<StringRepeater value={[]} onValueChange={() => {}} maxItems={3} />
			</FormField>
		</Stack>
	)
}
