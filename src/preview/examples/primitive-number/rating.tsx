import { MetadataList } from "themelia-ui/base/display"
import { Rating } from "themelia-ui/primitives"

export default function RatingExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Decimal score", value: <Rating value={4.5} /> },
				{ label: "Whole score", value: <Rating value={4} /> },
				{ label: "Out of ten", value: <Rating value={8.5} max={10} /> },
				{ label: "Scale hidden", value: <Rating value={4.5} hideMax /> },
				{ label: "No rating", value: <Rating value={null} /> },
			]}
		/>
	)
}
