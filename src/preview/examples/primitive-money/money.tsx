import { MetadataList } from "themelia-ui/base/display"
import { Money } from "themelia-ui/primitives"

export default function MoneyExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Euros", value: <Money amount={1299.5} currency="EUR" /> },
				{ label: "US dollars", value: <Money amount={1299.5} currency="USD" /> },
				{ label: "Negative pounds", value: <Money amount={-42} currency="GBP" /> },
				{ label: "Yen, no decimals", value: <Money amount={0} currency="JPY" /> },
				{ label: "No amount", value: <Money amount={null} currency="EUR" /> },
			]}
		/>
	)
}
