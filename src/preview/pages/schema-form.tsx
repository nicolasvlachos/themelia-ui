import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SchemaFormPage() {
	return (
		<ComponentPage
			title="Schema form"
			summary="A form described as data: fields with a type, a label, and the rules that govern them. Every control is already a kit component, so what this owns is the mapping — which control a type gets, how sections bucket fields, and when a message appears."
			importPath="@/components/features/schema-form"
			exports={["SchemaForm", "useSchemaForm",
				"SchemaFormActions", "SchemaFormFieldRenderer",
			]}
		>
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
				<PropTable owner="SchemaForm"
					rows={[
						{ name: "schema", type: "SchemaFormSchema", required: true, description: "Sections and fields. A section names its fields explicitly or claims the ones carrying its sectionId; whatever no section claimed lands in a leading default bucket." },
						{ name: "field.type", api: "SchemaFormField.type", type: "SchemaFormFieldType", description: "text / email / password / url / tel / search, textarea, number / integer / decimal, select, radio-cards, checkbox-cards, tags, switch, json, custom. Omitted means text." },
						{ name: "field.hidden / field.disabled", api: ["SchemaFormField.hidden", "SchemaFormField.disabled"], type: "boolean | (values) => boolean", description: "The predicate form reads the whole value set, for a field that only matters once a sibling says so. A hidden field is not rendered and not validated — blocking a submit on a required field the reader cannot see is a dead end." },
						{ name: "field.validate", api: "SchemaFormField.validate", type: "validator | validator[]", description: "Return a string to fail. The first message wins: the rest are about a value already known to be wrong." },
						{ name: "field.formatValue / parseValue", api: ["SchemaFormField.formatValue", "SchemaFormField.parseValue"], type: "(value, values) => …", description: "The two halves of a custom representation — what the control shows, and what the form stores." },
						{ name: "field.width", api: "SchemaFormField.width", type: "auto | half | third | full", description: "Column span inside the section grid, which is keyed to a container. A form in a 320px drawer collapses to one column whatever the section asked for." },
						{ name: "layout", type: "form | cards", description: "One bordered surface with sections inside it, or one surface per section. The schema does not change between them." },
						{ name: "value / defaultValue", type: "SchemaFormValues", description: "Controlled or not. Under a controlled value the schema's own defaults still apply, so a consumer holding two fields does not blank the rest." },
						{ name: "errors", type: "Record<key, string>", description: "Server messages. Merged over the form's own and not cleared by typing." },
						{ name: "renderField / renderSection", type: "(context) => ReactNode", description: "renderField receives defaultField, so decorating is as easy as replacing." },
						{ name: "onSubmit", type: "(values, helpers, event) => void | Promise", description: "Runs only if validation passed. helpers carries setFieldValue, setValues, reset, and validate — for a server response that has to write back into the form." },
						{ name: "useSchemaForm", type: "hook", description: "The values, the errors, and validate() without any of the rendering." },
						{ name: "SchemaFormActions", type: "component", description: "The form\u2019s submit row, generated from the same schema. Exported so a screen can place it somewhere the generated layout does not \u2014 a drawer footer, a sticky bar." },
						{ name: "SchemaFormFieldRenderer", type: "component", description: "One field, resolved from its schema entry to a control. Reach for it when a form is mostly generated but one field needs to be placed by hand." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
