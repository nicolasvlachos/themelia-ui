import { MetadataList } from "themelia-ui/base/display"
import { InlineList } from "themelia-ui/primitives"

import { THREE } from "./data"

export default function InlineListExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Default", value: <InlineList items={THREE} /> },
				{ label: "Alternatives", value: <InlineList items={["red", "green", "blue"]} join="or" /> },
				{ label: "No conjunction", value: <InlineList items={THREE} join="none" /> },
				{ label: "At most two", value: <InlineList items={["a", "b", "c", "d"]} max={2} /> },
				{ label: "Two items", value: <InlineList items={["Alice", "Bob"]} /> },
				{ label: "One item", value: <InlineList items={["Alice"]} /> },
				{ label: "No items", value: <InlineList items={[]} /> },
			]}
		/>
	)
}
