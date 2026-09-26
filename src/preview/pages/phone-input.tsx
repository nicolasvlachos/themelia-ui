import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import { PhoneInput } from "@/components/base/value-inputs"

import { MEASURE } from "../partials/measures"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PhoneInputPage() {
	const [prefix, setPrefix] = useState("+31")
	const [phone, setPhone] = useState("6 1234 5678")

	return (
		<ComponentPage
			title="Phone input"
			summary="A dial code and a number, in two channels, so the country prefix is never parsed back out of the digits."
			importPath="@/components/base/value-inputs"
			exports={["PhoneInput", "DEFAULT_COUNTRY_PREFIXES"]}
		>
			<Example
				id="phone"
				title="PhoneInput"
				description="The dial code and the number are separate fields. One combined field has to guess where the prefix ends, and it guesses wrong on every number pasted with its own formatting."
				stacked
				code={`<PhoneInput
  prefix={prefix}
  onPrefixChange={setPrefix}
  value={number}
  onChange={(e) => setNumber(e.target.value)}
/>`}
			>
				<Stack gap="xl" style={MEASURE.wide}>
					<FormField label="Mobile" helperText="Leaving the field strips a typed prefix and the trunk zero.">
						<PhoneInput
							prefix={prefix}
							onPrefixChange={setPrefix}
							prefixes={["NL", "BE", "DE", "GB", "US"]}
							value={phone}
							onChange={(event) => setPhone(event.target.value)}
						/>
					</FormField>
					<FormField label="Without the picker">
						<PhoneInput disablePrefixSelector defaultValue="020 123 4567" />
					</FormField>
				</Stack>
			</Example>

			<Example id="value-inputs-rule" title="One field surface" stacked>
				<Callout label="Rule">
					Every control here wears the shared field surface — the chips container and the
					phone number field carry <code>data-field-shell</code> and{" "}
					<code>data-field-control</code>, so their height, border, focus ring, and invalid
					state come from <code>styles/fields.css</code> rather than from four local
					copies that drift.
				</Callout>
			</Example>

			<Example id="phone-input-api" title="API">
				<PropTable owner="PhoneInput"
					rows={[
						{ name: "value / onChange", type: "string / ChangeEventHandler<HTMLInputElement>", description: "Read event.target.value in onChange. The national number, without the prefix." },
						{ name: "prefix / onPrefixChange", type: "string", description: "The dial code, as its own channel." },
						{ name: "prefixes", type: "CountryPrefixOption[]", description: "Which dial codes the column offers. DEFAULT_COUNTRY_PREFIXES is the built-in set." },
						{ name: "defaultPrefix / disablePrefixSelector", type: "string / boolean", description: "Which code starts, and whether it can be changed — a form scoped to one country should not offer the list." },
						{ name: "showCountryName / strings", type: "boolean / Partial<PhoneInputStrings>", description: "Whether the trigger names the country beside the code. `strings` carries the dial-code lane's placeholder and its accessible name." },
						{ name: "normalizeOnBlur", type: "boolean", description: "Tidies spacing when focus leaves, rather than fighting the reader mid-entry." },
						{ name: "invalid", type: "boolean", description: "The error surface. The message stays on the FormField." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
