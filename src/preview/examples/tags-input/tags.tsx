import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { TagsInput } from "themelia-ui/base/value-inputs"


export default function Tags() {
	const [tags, setTags] = useState(["invoice", "q4"])

	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Labels" helperText="Try pasting: alpha, beta, gamma">
				<TagsInput value={tags} onValueChange={setTags} maxTags={5} showCount showClearAll />
			</FormField>
			<FormField label="Validated" helperText="Rejects anything that is not lowercase.">
				<TagsInput
					defaultValue={["ok"]}
					validate={(tag) => tag === tag.toLowerCase()}
					placeholder="lowercase only…"
				/>
			</FormField>
			<FormField label="Invalid" error="At least one label is required.">
				<TagsInput invalid placeholder="Add a label…" />
			</FormField>
		</Stack>
	)
}
