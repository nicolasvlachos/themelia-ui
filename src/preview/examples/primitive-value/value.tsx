import { MetadataList } from "themelia-ui/base/display"
import { EmptyValue, MonoValue, MutedValue, SecondaryValue, Value } from "themelia-ui/primitives"

export default function ValueExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Default", value: <Value>Northwind Traders</Value> },
				{ label: "Secondary", value: <SecondaryValue>Supporting detail</SecondaryValue> },
				{ label: "Muted", value: <MutedValue>Quieter still</MutedValue> },
				{ label: "Monospaced", value: <MonoValue>req_8f21c440</MonoValue> },
				{ label: "Empty", value: <EmptyValue /> },
			]}
		/>
	)
}
