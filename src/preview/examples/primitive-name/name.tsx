import { MetadataList } from "themelia-ui/base/display"
import { Name } from "themelia-ui/primitives"

export default function NameExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Deliberate casing", value: <Name value="Jane McDonald" /> },
				{ label: "Lower case, extra spaces", value: <Name value="  jane   mcdonald " /> },
				{ label: "All capitals, forced", value: <Name value="JANE MCDONALD" force /> },
				{ label: "No name", value: <Name value={null} /> },
			]}
		/>
	)
}
