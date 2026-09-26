import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import { Textarea } from "@/components/base/text-inputs"
import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TextareaPage() {
	return (
		<ComponentPage
			title="Textarea"
			summary="Multi-line text on the same field surface as Input, with the same invalid and disabled treatment."
			importPath="@/components/base/text-inputs"
			exports={["Textarea"]}
		>
			<Example
				id="textarea"
				title="Textarea"
				description="The same surface as Input, so a form that mixes the two does not step between two field treatments."
				stacked
				code={`<Textarea rows={4} placeholder="Notes" />
<Textarea showCharacterCount maxLength={280} />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="Notes" helperText="Plain multi-line text.">
						<Textarea rows={4} placeholder="Anything worth recording." />
					</FormField>
					<FormField label="Summary" helperText="With a limit and a count.">
						<Textarea rows={3} showCharacterCount maxLength={280} defaultValue="Quarterly summary." />
					</FormField>
					<FormField label="Invalid" error="Required.">
						<Textarea rows={2} invalid />
					</FormField>
					<FormField label="Disabled">
						<Textarea rows={2} disabled defaultValue="Not editable." />
					</FormField>
				</Stack>
			</Example>

			<Example id="textarea-api" title="API">
				<PropTable owner="Textarea"
					rows={[
						{ name: "rows", type: "number", description: "Visible lines before it scrolls." },
						{ name: "showCharacterCount / maxLength", type: "boolean / number", description: "A count under the field, and the limit it counts against." },
						{ name: "invalid", type: "boolean", description: "The error surface, same as Input." },
						{ name: "minRows / maxRows", type: "number", description: "The floor and ceiling when the field grows with its content. Without a ceiling a long note pushes the submit button off the screen." },
						{ name: "clearable / onClear", type: "boolean / () => void", description: "A clear control in the trailing lane. `strings.clear` is its accessible name." },
						{ name: "loading", type: "boolean", default: "false", description: "Replaces the trailing affordance with a spinner." },
						{ name: "strings", type: "Partial<InputStrings>", description: "Overrides this field's own copy — the clear label, the character-count format." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
