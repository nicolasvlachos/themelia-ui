import { useState } from "react"
import { BuildingIcon, CreditCardIcon, SettingsIcon } from "lucide-react"

import { Checkbox } from "themelia-ui/base/choice-inputs"
import { Text } from "themelia-ui/base/typography"
import { SchemaForm, type SchemaFormSchema, type SchemaFormValues } from "themelia-ui/features/schema-form"

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

export default function FormLayout() {
	const [submitted, setSubmitted] = useState<string | null>(null)
	const [failSave, setFailSave] = useState(false)

	const submit = async (values: SchemaFormValues) => {
		await new Promise((resolve) => setTimeout(resolve, 600))
		if (failSave) throw new Error("Save failed")
		setSubmitted(JSON.stringify(values))
	}

	return (
		<>
			<Checkbox label="Make the save fail" checked={failSave} onChange={(event) => setFailSave(event.target.checked)} />
			<SchemaForm
				schema={VENUE_SCHEMA}
				onSubmit={(values) => submit(values)}
				onReset={() => setSubmitted(null)}
			/>
			{!!submitted && (
				<Text size="xs" type="secondary" numeric>submitted: {submitted}</Text>
			)}
		</>
	)
}
