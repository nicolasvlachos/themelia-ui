import { MetadataList } from "themelia-ui/base/display"
import { Email } from "themelia-ui/primitives"

export default function EmailExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Default", value: <Email value="jane@northwind.example" /> },
				{ label: "Display name", value: <Email value="raj@northwind.example" display="Raj Patel" /> },
				{ label: "No address", value: <Email value={null} /> },
			]}
		/>
	)
}
