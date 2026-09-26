import { MetadataList } from "themelia-ui/base/display"
import { Quantity } from "themelia-ui/primitives"

import { ITEM, PERSON } from "./data"

export default function QuantityExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "One", value: <Quantity value={1} unit={ITEM} /> },
				{ label: "Several", value: <Quantity value={3} unit={ITEM} /> },
				{ label: "Fraction", value: <Quantity value={1.5} unit={ITEM} /> },
				{ label: "One person", value: <Quantity value={1} unit={PERSON} /> },
				{ label: "Several people", value: <Quantity value={4} unit={PERSON} /> },
				{ label: "Zero in words", value: <Quantity value={0} unit={ITEM} zeroLabel="no items" /> },
				{ label: "No count", value: <Quantity value={null} unit={ITEM} /> },
			]}
		/>
	)
}
