import { MetadataList } from "themelia-ui/base/display"
import { Dimensions } from "themelia-ui/primitives"

export default function DimensionsExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Width and height", value: <Dimensions width={30} height={20} unit="cm" /> },
				{ label: "With depth", value: <Dimensions width={30} height={20} depth={12} unit="cm" /> },
				{ label: "Pixels", value: <Dimensions width={1920} height={1080} unit="px" /> },
				{ label: "No dimensions", value: <Dimensions width={null} height={null} /> },
			]}
		/>
	)
}
