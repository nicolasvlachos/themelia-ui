import { MetadataList } from "themelia-ui/base/display"
import { Phone } from "themelia-ui/primitives"

export default function PhoneExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Grouped with spaces", value: <Phone value="+31 6 1234 5678" /> },
				{ label: "Brackets and dashes", value: <Phone value="+1 (555) 010-4417" /> },
				{ label: "No number", value: <Phone value={null} /> },
			]}
		/>
	)
}
