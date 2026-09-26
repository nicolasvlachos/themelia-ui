import { MetadataList } from "themelia-ui/base/display"
import { Coordinates } from "themelia-ui/primitives"

export default function CoordinatesExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Default", value: <Coordinates latitude={48.85837} longitude={2.29448} /> },
				{ label: "With hemispheres", value: <Coordinates latitude={48.85837} longitude={2.29448} showHemisphere /> },
				{ label: "Degrees, minutes, seconds", value: <Coordinates latitude={48.85837} longitude={2.29448} format="dms" /> },
				{ label: "Southern hemisphere", value: <Coordinates latitude={-33.8688} longitude={151.2093} format="dms" /> },
				{ label: "Three decimals", value: <Coordinates latitude={48.85837} longitude={2.29448} precision={3} /> },
				{ label: "No decimals", value: <Coordinates latitude={48.85837} longitude={2.29448} precision={0} /> },
				{ label: "No coordinates", value: <Coordinates latitude={null} longitude={null} /> },
			]}
		/>
	)
}
