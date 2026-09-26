import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CurrencyInputPage() {
	return (
		<ComponentPage>
			<Example
				example="currency-input/currency"
				title="CurrencyInput"
				description="The amount and the currency are separate channels. An amount stored as “€1,234.50” has to be parsed by everything downstream, and the parse depends on a locale nobody recorded."
			/>

			<Example id="currency-input-api" title="API">
				<PropTable owner="CurrencyInput"
					rows={[
						{ name: "value / onChange", type: "string / ChangeEventHandler<HTMLInputElement>", description: "Read event.target.value in onChange. The amount, as a string." },
						{ name: "currency / onCurrencyChange", type: "string", description: "The currency code. A separate channel from the amount." },
						{ name: "currencies", type: "CurrencyOption[]", description: "Which codes the picker offers." },
						{ name: "CURRENCY_SYMBOLS", type: "Record<string, string>", description: "Code-to-symbol map used for the prefix, exported so a caller can render the same symbol elsewhere." },
						{ name: "MoneyInput", type: "component", description: "The same field taking a single { amount, currency } object, for a form that stores it that way." },
						{ name: "strings", type: "Partial<CurrencyInputStrings>", description: "Overrides this field's own copy. It EXTENDS the decimal strings, which extend the input strings — a currency field is one of each, so it owns the selector's name, the two steppers, and the clear action alike." },
						{ name: "disableCurrencySelector", type: "boolean", description: "Shows the currency read-only, for an amount whose currency is decided elsewhere in the form." },
						{ name: "invalid", type: "boolean", description: "The error surface. The message stays on the FormField." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
