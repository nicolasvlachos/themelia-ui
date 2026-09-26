import { MetadataList } from "themelia-ui/base/display"
import { Range } from "themelia-ui/primitives"

export default function RangeExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Plain numbers", value: <Range from={10} to={50} /> },
				{ label: "Pounds", value: <Range from={10} to={50} currency="GBP" /> },
				{ label: "Euros", value: <Range from={10} to={50} currency="EUR" /> },
				{ label: "Days", value: <Range from={2} to={5} unit="day" /> },
				{ label: "Equal ends", value: <Range from={10} to={10} currency="GBP" /> },
				{ label: "One end only", value: <Range from={10} currency="GBP" /> },
				{ label: "Neither end", value: <Range from={null} to={null} /> },
			]}
		/>
	)
}
