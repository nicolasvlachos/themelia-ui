import { MetadataList } from "themelia-ui/base/display"
import { Money } from "themelia-ui/primitives"

export default function MoneyUnitExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Euros from cents", value: <Money amount={129950} currency="EUR" unit="minor" /> },
				{ label: "Yen, no minor unit", value: <Money amount={1299} currency="JPY" unit="minor" minorUnitScale={1} /> },
				{ label: "Dinars from fils", value: <Money amount={129950} currency="KWD" unit="minor" minorUnitScale={1000} /> },
			]}
		/>
	)
}
