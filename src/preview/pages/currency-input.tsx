import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { CurrencyInput } from "@/components/base/forms-numeric"
import { Stack } from "@/components/base/structure"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CurrencyInputPage() {
	const [amount, setAmount] = useState("1299.50")
	const [currency, setCurrency] = useState("EUR")

	return (
		<ComponentPage
			title="Currency input"
			summary="An amount and its currency, kept in separate channels so neither has to be parsed back out of a formatted string."
			importPath="@/components/base/forms-numeric"
			exports={["CurrencyInput", "CURRENCY_SYMBOLS", "MoneyInput"]}
		>
			<Example
				id="currency"
				title="CurrencyInput"
				description="The amount and the currency are separate channels. An amount stored as “€1,234.50” has to be parsed by everything downstream, and the parse depends on a locale nobody recorded."
				stacked
				code={`<CurrencyInput
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  currency={currency}
  onCurrencyChange={setCurrency}
/>`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="Invoice total">
						<CurrencyInput
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							currency={currency}
							onCurrencyChange={setCurrency}
							currencies={["EUR", "USD", "GBP"]}
						/>
					</FormField>
					<FormField label="Selector at the end">
						<CurrencyInput defaultValue="49.00" defaultCurrency="USD" currencyPosition="end" />
					</FormField>
				</Stack>
			</Example>

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
