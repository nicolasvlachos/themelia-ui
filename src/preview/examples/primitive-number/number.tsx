import { MetadataList } from "themelia-ui/base/display"
import { Number, Percent } from "themelia-ui/primitives"

export default function NumberExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Grouped digits", value: <Number value={1234567.891} /> },
				{ label: "Negative", value: <Number value={-42} /> },
				{ label: "Fraction as percent", value: <Percent value={0.214} /> },
				{ label: "One as percent", value: <Percent value={1} /> },
				{ label: "Already scaled", value: <Percent value={21.4} scaled /> },
				{ label: "No number", value: <Number value={null} /> },
			]}
		/>
	)
}
