import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PhoneInputPage() {
	return (
		<ComponentPage
			title="Phone input"
			summary="A dial code and a number, in two channels, so the country prefix is never parsed back out of the digits."
			importPath="@/components/base/value-inputs"
			exports={["PhoneInput", "DEFAULT_COUNTRY_PREFIXES"]}
		>
			<Example
				example="phone-input/phone"
				title="PhoneInput"
				description="The dial code and the number are separate fields. One combined field has to guess where the prefix ends, and it guesses wrong on every number pasted with its own formatting."
				stacked
			/>

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
