import { useState } from "react"
import { BuildingIcon, CreditCardIcon, SettingsIcon } from "lucide-react"

import { Checkbox } from "@/components/base/choice-inputs"
import { Text } from "@/components/base/typography"
import { SchemaForm, type SchemaFormSchema, type SchemaFormValues } from "@/components/features"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const VENUE_SCHEMA: SchemaFormSchema = {
	title: "Venue details",
	description: "What appears on the booking confirmation.",
	sections: [
		{ id: "identity", title: "Identity", icon: <BuildingIcon />, columns: 2 },
		{
			id: "commercial",
			title: "Commercial",
			description: "Only the deposit is shown to the customer.",
			icon: <CreditCardIcon />,
			columns: 2,
		},
		{ id: "advanced", title: "Advanced", icon: <SettingsIcon />, columns: 1 },
	],
	fields: [
		{
			key: "name",
			label: "Venue name",
			sectionId: "identity",
			required: true,
			placeholder: "Marlow Hall",
			defaultValue: "Marlow Hall",
		},
		{
			key: "email",
			type: "email",
			label: "Bookings email",
			sectionId: "identity",
			required: true,
			placeholder: "bookings@example.com",
			defaultValue: "bookings@marlowhall.example",
			validate: (value) =>
				typeof value === "string" && value.includes("@") ? true : "That is not an email address.",
		},
		{
			key: "address",
			type: "textarea",
			label: "Address",
			sectionId: "identity",
			width: "full",
			rows: 2,
			defaultValue: "14 Bridge Street, Marlow",
		},
		{
			key: "capacity",
			type: "integer",
			label: "Seated capacity",
			sectionId: "commercial",
			min: 0,
			step: 10,
			defaultValue: 180,
		},
		{
			key: "deposit",
			type: "decimal",
			label: "Deposit",
			sectionId: "commercial",
			decimalPlaces: 2,
			min: 0,
			defaultValue: 300,
			helperText: "Charged when the booking is confirmed.",
		},
		{
			key: "tier",
			type: "radio-cards",
			label: "Rate card",
			sectionId: "commercial",
			width: "full",
			columns: 3,
			defaultValue: "standard",
			options: [
				{ value: "standard", label: "Standard", description: "The published rate." },
				{ value: "partner", label: "Partner", description: "15% off, invoiced monthly." },
				{ value: "internal", label: "Internal", description: "No charge." },
			],
		},
		{
			key: "amenities",
			type: "checkbox-cards",
			label: "Included",
			sectionId: "commercial",
			width: "full",
			columns: 3,
			defaultValue: ["bar"],
			options: [
				{ value: "bar", label: "Bar" },
				{ value: "kitchen", label: "Kitchen" },
				{ value: "parking", label: "Parking" },
			],
		},
		{
			key: "tags",
			type: "tags",
			label: "Tags",
			sectionId: "advanced",
			maxTags: 5,
			recommendations: ["wedding", "conference", "accessible", "late licence"],
			defaultValue: ["wedding"],
		},
		{
			key: "selfService",
			type: "switch",
			switchStyle: "card",
			label: "Self-service booking",
			description: "Customers can book without an operator.",
			sectionId: "advanced",
			defaultValue: false,
		},
		{
			key: "cutoffHours",
			type: "integer",
			label: "Cut-off (hours before)",
			sectionId: "advanced",
			min: 0,
			defaultValue: 48,
			// Only meaningful once self-service is on — the whole reason the predicate form exists.
			hidden: (values) => values.selfService !== true,
		},
		{
			key: "metadata",
			type: "json",
			label: "Integration metadata",
			sectionId: "advanced",
			rows: 4,
			defaultValue: { externalId: "MRL-1", region: "south" },
			helperText: "Sent verbatim to the booking provider.",
		},
	],
}

const SETTINGS_SCHEMA: SchemaFormSchema = {
	sections: [
		{ id: "notify", title: "Notifications", columns: 1 },
		{ id: "billing", title: "Billing", columns: 2 },
	],
	fields: [
		{
			key: "digest",
			type: "switch",
			label: "Daily digest",
			description: "One email at 08:00 with yesterday's bookings.",
			sectionId: "notify",
			defaultValue: true,
		},
		{
			key: "channel",
			type: "select",
			label: "Escalation channel",
			sectionId: "notify",
			allowClear: true,
			placeholder: "None",
			options: [
				{ value: "email", label: "Email" },
				{ value: "sms", label: "SMS" },
				{ value: "webhook", label: "Webhook" },
			],
		},
		{
			key: "vat",
			label: "VAT number",
			sectionId: "billing",
			placeholder: "GB123456789",
		},
		{
			key: "terms",
			type: "integer",
			label: "Payment terms (days)",
			sectionId: "billing",
			defaultValue: 30,
			min: 0,
		},
	],
}

export function SchemaFormPage() {
	const [submitted, setSubmitted] = useState<string | null>(null)
	const [failSave, setFailSave] = useState(false)

	const submit = async (values: SchemaFormValues) => {
		await new Promise((resolve) => setTimeout(resolve, 600))
		if (failSave) throw new Error("Preview save failed")
		setSubmitted(JSON.stringify(values))
	}

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
				id="form-layout"
				title="One surface"
				description="Submit with the email emptied, or the name — validation runs on submit, and each message clears the moment its own field changes. Turn on self-service and a field appears: `hidden` takes a predicate over the whole value set, and hidden or disabled fields do not block submission. Failed saves keep every value for retry; pending saves disable editing and reset."
				stacked
				code={`<SchemaForm
  schema={{
    sections: [{ id: "identity", title: "Identity", columns: 2 }],
    fields: [
      { key: "name", label: "Venue name", sectionId: "identity", required: true },
      { key: "cutoff", type: "integer", label: "Cut-off",
        hidden: (values) => values.selfService !== true },
    ],
  }}
  onSubmit={(values) => api.save(values)}
  onReset={() => undefined}
/>`}
			>
				<Checkbox label="Make the save fail" checked={failSave} onChange={(event) => setFailSave(event.target.checked)} />
				<SchemaForm
					schema={VENUE_SCHEMA}
					onSubmit={(values) => submit(values)}
					onReset={() => setSubmitted(null)}
				/>
				{!!submitted && (
					<Text size="xs" type="secondary" numeric>submitted: {submitted}</Text>
				)}
			</Example>

			<Example
				id="cards-layout"
				title="One surface per section"
				description="The same schema shape in the layout a long settings page wants. Nothing about the fields changes — only where the borders are."
				stacked
				code={`<SchemaForm schema={schema} layout="cards" onSubmit={save} />`}
			>
				<SchemaForm
					schema={SETTINGS_SCHEMA}
					layout="cards"
					submitLabel="Save settings"
					onSubmit={(values) => submit(values)}
				/>
			</Example>

			<Example id="schema-form-rules" title="What the schema decides" stacked>
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
