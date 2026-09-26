import { MetadataList } from "themelia-ui/base/display"
import { Ratio } from "themelia-ui/primitives"

export default function RatioExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "In words", value: <Ratio value={3} total={10} /> },
				{ label: "Complete", value: <Ratio value={7} total={7} /> },
				{ label: "Fraction", value: <Ratio value={3} total={10} format="fraction" /> },
				{ label: "Large numbers", value: <Ratio value={1240} total={10000} /> },
				{ label: "No total", value: <Ratio value={3} /> },
				{ label: "No count", value: <Ratio value={null} /> },
			]}
		/>
	)
}
