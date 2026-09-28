import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { useFormFieldBinding, useStateFormControl } from "themelia-ui/forms"
import { MonoValue } from "themelia-ui/primitives"


/**
 * A field bound through the headless contract, so the demo exercises the real seam rather
 * than describing it. `useFormFieldBinding` returns exactly the props a control takes.
 */
function BoundInput({
	name,
	label,
	control,
	type,
}: {
	name: string
	label: string
	control: Parameters<typeof useFormFieldBinding<string>>[0]["control"]
	type?: string
}) {
	const field = useFormFieldBinding<string>({ name, control })
	return (
		<FormField label={label} error={field.error}>
			<Input
				type={type}
				value={field.value ?? ""}
				onChange={(event) => field.onValueChange(event.target.value)}
				onBlur={field.onBlur}
				aria-invalid={field.invalid || undefined}
			/>
		</FormField>
	)
}

export default function FormBindingState() {
	const [submitted, setSubmitted] = useState<string | null>(null)
	const control = useStateFormControl(
		{ email: "", workspace: "acme-corp" },
		{ errors: { email: "" } },
	)

	return (
		<Stack style={{ maxWidth: "26rem", width: "100%" }}>
			<BoundInput name="email" label="Email" control={control} type="email" />
			<BoundInput name="workspace" label="Workspace" control={control} />
			<Stack direction="horizontal" gap="sm" align="center">
				<Button onClick={() => setSubmitted(JSON.stringify(control.values))}>
					Submit
				</Button>
				<Button appearance="outline" onClick={() => control.reset()}>
					Reset
				</Button>
			</Stack>
			{submitted !== null && <MonoValue>{submitted}</MonoValue>}
		</Stack>
	)
}
