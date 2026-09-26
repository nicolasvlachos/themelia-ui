import { MetadataList } from "themelia-ui/base/display"
import { FileSize } from "themelia-ui/primitives"

export default function FileSizeExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Bytes", value: <FileSize value={512} /> },
				{ label: "About a megabyte", value: <FileSize value={1_100_000} /> },
				{ label: "Tens of megabytes", value: <FileSize value={85_800_000} /> },
				{ label: "Gigabytes", value: <FileSize value={4_100_000_000} /> },
				{ label: "No size", value: <FileSize value={null} /> },
			]}
		/>
	)
}
