import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PhoneInputPage() {
	return (
		<ComponentPage>
			<Example
				example="phone-input/phone"
				title="PhoneInput"
				description="The dial code and the number are separate fields. One combined field has to guess where the prefix ends, and it guesses wrong on every number pasted with its own formatting."
			/>

			<Example id="value-inputs-rule" title="One field surface">
				<Callout label="Rule">
					Every control here wears the shared field surface — the chips container and the
					phone number field carry <code>data-field-shell</code> and{" "}
					<code>data-field-control</code>, so their height, border, focus ring, and invalid
					state come from <code>styles/fields.css</code> rather than from four local
					copies that drift.
				</Callout>
			</Example>

			<Example id="phone-input-api" title="API">
				<PropTable owners={["PhoneInput"]} />
			</Example>
		</ComponentPage>
	)
}
