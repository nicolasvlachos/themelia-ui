import { MetadataList } from "themelia-ui/base/display"
import { Money } from "themelia-ui/primitives"

export default function MoneyFormat() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "With symbol", value: <Money amount={1299.5} currency="EUR" formatMode="with-symbol" /> },
				{ label: "With code", value: <Money amount={1299.5} currency="EUR" formatMode="with-code" /> },
				{ label: "Number only", value: <Money amount={1299.5} currency="EUR" formatMode="decimal" /> },
			]}
		/>
	)
}
