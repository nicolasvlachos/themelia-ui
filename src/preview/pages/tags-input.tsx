import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import { TagsInput } from "@/components/base/value-inputs"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TagsInputPage() {
	const [tags, setTags] = useState(["invoice", "q4"])

	return (
		<ComponentPage
			title="Tags input"
			summary="A list of short strings entered inline as chips. Enter commits, Backspace on an empty field removes the last one."
			importPath="@/components/base/value-inputs"
			exports={["TagsInput"]}
		>
			<Example
				id="tags"
				title="TagsInput"
				description="Chips and the entry field share one surface, so it reads as a field with things in it. Enter commits, Backspace on an empty field removes the last chip, and pasting a comma-separated list splits it."
				stacked
				code={`<TagsInput value={tags} onValueChange={setTags} maxTags={5} showCount showClearAll />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
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
			</Example>

			<Example id="tags-input-api" title="API">
				<PropTable owner="TagsInput"
					rows={[
						{ name: "value / onValueChange", type: "string[]", description: "The chips. Controlled." },
						{ name: "maxTags", type: "number", description: "Stops accepting new entries once reached." },
						{ name: "allowDuplicates / caseSensitive", type: "boolean", default: "false", description: "Whether the same string can appear twice, and whether the comparison is case-sensitive." },
						{ name: "showCount / showClearAll", type: "boolean", description: "The \"2 / 5\" summary and the clear control under the field. Count needs maxTags." },
						{ name: "minLength / maxLength / validate", type: "number / (value) => boolean", description: "Entry rules. validate runs after the length checks — the field refuses the tag rather than accepting a bad one and reporting it later." },
						{ name: "delimiter", type: "string | RegExp", default: "comma or newline", description: "Splits pasted text into several tags — which is what a column copied out of a spreadsheet looks like." },
						{ name: "addOnBlur / sortTags", type: "boolean", description: "Commit whatever is typed when focus leaves, and keep the list ordered." },
						{ name: "renderTag", type: "(tag, index, remove) => ReactNode", description: "Replaces the chip, for a tag that carries an avatar or a colour." },
						{ name: "invalid / strings", type: "boolean / Partial<TagsInputStrings>", description: "The error surface, and this field's own copy — clear-all, plus each tag's remove named after the tag it removes." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
