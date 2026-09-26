import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Textarea } from "themelia-ui/base/text-inputs"


export default function TextareaExample() {
	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
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
	)
}
