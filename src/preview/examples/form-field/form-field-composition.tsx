import { FormField } from "themelia-ui/base/forms"
import { FieldShell, Input } from "themelia-ui/base/text-inputs"


export default function FormFieldComposition() {
	return (
		<div style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Weight" required hint="Use the packaged weight.">
				{(fieldProps) => (
					<FieldShell {...fieldProps} end="kg">
						{(controlProps) => (
							<div style={{ display: "contents" }}>
								<Input type="number" defaultValue="24" {...controlProps} />
							</div>
						)}
					</FieldShell>
				)}
			</FormField>
		</div>
	)
}
