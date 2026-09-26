import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FormBindingPage() {
	return (
		<ComponentPage>
			<Example
				example="form-binding/form-binding-state"
				title="useStateFormControl"
				description="The zero-dependency default. It holds the values in React state and returns a FormControl, so a form needs no library at all until it needs one."
			/>

			<Example id="form-binding-contract" title="The contract">
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
				<PropTable symbols={["useFormFieldBinding", "useStateFormControl", "rhfFormControl"]} />
				<PropTable owners={["FormControl", "FieldState", "FieldBinding"]} />
			</Example>
		</ComponentPage>
	)
}
