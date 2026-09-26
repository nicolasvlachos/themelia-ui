import { MetadataList } from "themelia-ui/base/display"
import { FileSize } from "themelia-ui/primitives"

export default function FileSizeBaseExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Binary", value: <FileSize value={85_800_000} /> },
				{ label: "Decimal", value: <FileSize value={85_800_000} base="decimal" /> },
				{ label: "IEC", value: <FileSize value={85_800_000} base="iec" /> },
			]}
		/>
	)
}
