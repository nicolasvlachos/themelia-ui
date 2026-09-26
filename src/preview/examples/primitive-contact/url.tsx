import { MetadataList } from "themelia-ui/base/display"
import { Url } from "themelia-ui/primitives"

export default function UrlExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Default", value: <Url value="https://northwind.example/invoices/4417" /> },
				{ label: "Opens in a new tab", value: <Url value="https://northwind.example/invoices/4417" external /> },
				{ label: "Display text", value: <Url value="https://northwind.example" display="Northwind" /> },
				{ label: "No address", value: <Url value={null} /> },
			]}
		/>
	)
}
