import { MetadataList } from "themelia-ui/base/display"
import { Money } from "themelia-ui/primitives"

export default function MoneyDual() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{
					label: "Discrete",
					value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} />,
				},
				{
					label: "Muted",
					value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} secondaryEmphasis="muted" />,
				},
				{
					label: "Matching",
					value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} secondaryEmphasis="match" />,
				},
				{
					label: "Arrow separator",
					value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} separator="→" />,
				},
				{
					label: "Stacked",
					value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} layout="stacked" />,
				},
				{
					label: "Hidden",
					value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} secondaryEmphasis="hidden" />,
				},
			]}
		/>
	)
}
