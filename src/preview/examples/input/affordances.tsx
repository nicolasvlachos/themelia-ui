import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { FieldShell, Input, PasswordInput, SearchInput } from "themelia-ui/base/text-inputs"
import { Text } from "themelia-ui/base/typography"


export default function Affordances() {
	const [search, setSearch] = useState("shipping")

	return (
		<Stack gap="lg" style={{ maxWidth: "26rem", width: "100%" }}>
			<FormField label="Search" helperText="Clear appears once there is a value.">
				<SearchInput
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					onClear={() => setSearch("")}
					placeholder="Search orders"
				/>
			</FormField>
			<FormField label="Password" helperText="Revealing is its own control, never hover or focus.">
				<PasswordInput defaultValue="hunter2" />
			</FormField>
			<FormField label="Password, invalid" error="Too short.">
				<PasswordInput defaultValue="abc" invalid />
			</FormField>
			<FormField label="Weight" helperText="A trailing unit, outside the text.">
				<FieldShell end={<Text tag="span" size="xs" type="secondary">kg</Text>}>
					<Input type="number" defaultValue="12" />
				</FieldShell>
			</FormField>
			<FormField label="Character count">
				<Input showCharacterCount maxLength={40} defaultValue="Counted" />
			</FormField>
		</Stack>
	)
}
