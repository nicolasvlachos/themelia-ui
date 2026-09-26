import { useState } from "react"

import { Text } from "themelia-ui/base/typography"
import { SchemaForm, type SchemaFormSchema, type SchemaFormValues } from "themelia-ui/features/schema-form"

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

export default function CardsLayout() {
	const [submitted, setSubmitted] = useState<string | null>(null)

	const submit = async (values: SchemaFormValues) => {
		await new Promise((resolve) => setTimeout(resolve, 600))
		setSubmitted(JSON.stringify(values))
	}

	return (
		<>
			<SchemaForm
				schema={SETTINGS_SCHEMA}
				layout="cards"
				submitLabel="Save settings"
				onSubmit={(values) => submit(values)}
			/>
			{!!submitted && (
				<Text size="xs" type="secondary" numeric>submitted: {submitted}</Text>
			)}
		</>
	)
}
