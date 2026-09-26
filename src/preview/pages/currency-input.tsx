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
				<PropTable owners={["CurrencyInput"]} />
				<PropTable symbols={["MoneyInput", "CURRENCY_SYMBOLS"]} />
			</Example>
		</ComponentPage>
	)
}
