import { MetadataList } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Money } from "themelia-ui/primitives"
import { UIProvider } from "themelia-ui/ui-provider"

export default function MoneyProviderExample() {
	return (
		<Stack gap="lg">
			<UIProvider
				config={{
					formatting: { locale: "de-DE" },
					money: {
						defaultCurrency: "EUR",
						displayCurrency: "USD",
						dualPricingEnabled: true,
						displayMode: "dynamic",
						layout: "stacked",
					},
				}}
			>
				<MetadataList
					layout="rows"
					items={[
						{ label: "With a conversion", value: <Money amount={1299.5} secondary={{ amount: 1416.2 }} /> },
						{ label: "No conversion", value: <Money amount={1299.5} /> },
						{ label: "Same currency", value: <Money amount={1299.5} secondary={{ amount: 1299.5, currency: "EUR" }} /> },
					]}
				/>
			</UIProvider>
			<Text size="xs" type="secondary">
				German locale, so the group separator is a dot and the symbol trails the number.
				The third row is <code>dynamic</code> at work: both codes are EUR, so the pair
				would say the same thing twice and only one value renders.
			</Text>
		</Stack>
	)
}
