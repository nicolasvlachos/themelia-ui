import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Input } from "@/components/base/text-inputs"
import { MonoValue } from "@/components/primitives"
import { useFormFieldBinding, useStateFormControl } from "@/lib/forms"

import { MEASURE } from "../partials/measures"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

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

export function FormBindingPage() {
	const [submitted, setSubmitted] = useState<string | null>(null)
	const control = useStateFormControl(
		{ email: "", workspace: "acme-corp" },
		{ errors: { email: "" } },
	)

	return (
		<ComponentPage
			title="Form binding"
			summary="The headless contract between a form library and the kit's fields. One small interface — useField — that plain React state, react-hook-form, or anything else can satisfy."
			importPath="themelia-ui/forms"
			exports={["useFormFieldBinding", "useStateFormControl"]}
		>
			<Example
				id="form-binding-state"
				title="useStateFormControl"
				description="The zero-dependency default. It holds the values in React state and returns a FormControl, so a form needs no library at all until it needs one."
				stacked
				code={`const control = useStateFormControl({ email: "", workspace: "acme-corp" })

function BoundInput({ name, label, control }) {
  const field = useFormFieldBinding<string>({ name, control })
  return (
    <FormField label={label} error={field.error}>
      <Input
        value={field.value ?? ""}
        onChange={(event) => field.onValueChange(event.target.value)}
        onBlur={field.onBlur}
      />
    </FormField>
  )
}`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<BoundInput name="email" label="Email" control={control} type="email" />
					<BoundInput name="workspace" label="Workspace" control={control} />
					<Stack direction="horizontal" gap="sm" align="center">
						<Button onClick={() => setSubmitted(JSON.stringify(control.values))}>
							Submit
						</Button>
						<Button buttonStyle="outline" onClick={() => control.reset()}>
							Reset
						</Button>
					</Stack>
					{submitted !== null && <MonoValue>{submitted}</MonoValue>}
				</Stack>
			</Example>

			<Example id="form-binding-contract" title="The contract" stacked>
				<Callout>
					A <code>FormControl</code> is one method: <code>useField(name)</code> returning a{" "}
					<code>FieldState</code>. That is the entire surface a form library has to satisfy,
					which is why the react-hook-form adapter is a single function and lives behind its
					own subpath — <code>themelia-ui/forms-rhf</code> — so that{" "}
					<code>themelia-ui/forms</code> stays dependency-free. A consumer on plain state
					never resolves react-hook-form at all, which is what makes it a genuinely optional
					peer rather than one in name only.
				</Callout>
			</Example>

			<Example
				id="form-binding-rhf"
				title="rhfFormControl"
				description="The react-hook-form adapter. It delegates to useController, so registration, validation and dirty tracking keep working — it adds a shape, not a second source of truth."
				stacked
				code={`import { rhfFormControl } from "themelia-ui/forms-rhf"

const form = useForm({ defaultValues: { email: "" } })
const control = rhfFormControl(form.control)

const email = useFormFieldBinding<string>({ name: "email", control })`}
			>
				<Callout>
					Not rendered here: react-hook-form is an optional peer, and the preview app does not
					install it. The adapter is thirteen lines, and the example above is the whole of it.
				</Callout>
			</Example>

			<Example id="form-binding-api" title="API">
				<PropTable
					rows={[
						{ name: "useFormFieldBinding", type: "({ name, control, disabled }) => FieldBinding", description: "Turns a control and a field name into the exact props a kit control takes — value, onValueChange, onBlur, invalid, error, disabled." },
						{ name: "useStateFormControl", type: "(initialValues, { errors? }) => FormControl & { values, reset }", description: "A FormControl over plain React state. Also exposes the current values and a reset, which a library-backed control owns itself." },
						{ name: "rhfFormControl", api: "@/lib/forms-rhf#rhfFormControl", type: "(control: Control) => FormControl", description: "Wraps a react-hook-form control. Imported from themelia-ui/forms-rhf, never from /forms." },
						{ name: "FormControl", api: "@/lib/forms#FormControl", type: "{ useField<T>(name): FieldState<T> }", description: "The one-method interface a form library satisfies to work with the kit's fields." },
						{ name: "FieldState", api: "@/lib/forms#FieldState", type: "{ value, setValue, onBlur?, error?, disabled? }", description: "What a control reports for one field. Everything past value and setValue is optional." },
						{ name: "FieldBinding", api: "@/lib/forms#FieldBinding", type: "{ name, value, onValueChange, onBlur, invalid, error, disabled }", description: "What useFormFieldBinding returns — spreadable onto a control." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
