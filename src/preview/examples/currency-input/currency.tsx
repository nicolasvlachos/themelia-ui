import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { CurrencyInput } from "themelia-ui/base/forms-numeric"
import { Stack } from "themelia-ui/base/structure"


export default function Currency() {
	const [amount, setAmount] = useState("1299.50")
	const [currency, setCurrency] = useState("EUR")

	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
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
	)
}
