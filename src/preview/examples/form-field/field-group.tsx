import { FieldGroup, FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"


export default function FieldGroupExample() {
	return (
		<div style={{ maxWidth: "34rem", width: "100%" }}>
			<FieldGroup legend="Reporting period" description="Both ends are inclusive.">
				<Stack direction="horizontal" gap="sm">
					<FormField label="From">
						<Input type="date" defaultValue="2026-03-01" />
					</FormField>
					<FormField label="To">
						<Input type="date" defaultValue="2026-03-31" />
					</FormField>
				</Stack>
			</FieldGroup>
		</div>
	)
}
