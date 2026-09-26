import { MetadataList } from "themelia-ui/base/display"
import { Measure } from "themelia-ui/primitives"

export default function MeasureExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Kilograms", value: <Measure value={2.5} unit="kilogram" /> },
				{ label: "Narrow", value: <Measure value={2.5} unit="kilogram" unitDisplay="narrow" /> },
				{ label: "Long", value: <Measure value={2.5} unit="kilogram" unitDisplay="long" /> },
				{ label: "Metres", value: <Measure value={180} unit="meter" /> },
				{ label: "Celsius", value: <Measure value={21.5} unit="celsius" /> },
				{ label: "Days", value: <Measure value={14} unit="day" /> },
				{ label: "Unknown unit", value: <Measure value={2.5} unit="bananas" /> },
			]}
		/>
	)
}
