import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SchemaFormPage() {
	return (
		<ComponentPage>
			<Example
				example="schema-form/form-layout"
				title="One surface"
				description="Submit with the email emptied, or the name — validation runs on submit, and each message clears the moment its own field changes. Turn on self-service and a field appears: `hidden` takes a predicate over the whole value set, and hidden or disabled fields do not block submission. Failed saves keep every value for retry; pending saves disable editing and reset."
			/>

			<Example
				example="schema-form/cards-layout"
				title="One surface per section"
				description="The same schema shape in the layout a long settings page wants. Nothing about the fields changes — only where the borders are."
			/>

			<Example id="schema-form-rules" title="What the schema decides">
				<Callout label="Rule">
					A field's <code>type</code> decides which control renders <strong>and</strong> which
					extra keys are meaningful — <code>options</code> belongs to a select,{" "}
					<code>rows</code> to a textarea, <code>decimalPlaces</code> to a number. The field
					union makes the wrong shape unwritable, rather than leaving the renderer to guess.
				</Callout>
				<Text size="sm" type="secondary">
					Validation runs on <strong>submit</strong>, not on change. A field that turns red
					while you are still typing it is telling you that you have not finished, which you
					know. Server messages passed through <code>errors</code> win over the form's own and
					stay until the consumer replaces them — retyping a name does not make it available.
				</Text>
				<Text size="sm" type="secondary">
					Every consumer predicate runs inside a try/catch, and a throw becomes a default
					rather than a crash: <code>hidden</code> falls to false so the field stays visible,{" "}
					<code>disabled</code> falls to true so a field nobody can vouch for is not editable.{" "}
					<code>onError</code> is how you hear about it.
				</Text>
			</Example>

			<Example id="schema-form-api" title="API">
				<PropTable owners={["SchemaForm", "SchemaFormFieldBase"]} />
				<PropTable symbols={["useSchemaForm", "SchemaFormActions", "SchemaFormFieldRenderer"]} />
			</Example>
		</ComponentPage>
	)
}
