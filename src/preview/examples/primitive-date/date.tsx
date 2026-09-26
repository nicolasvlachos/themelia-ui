import { MetadataList } from "themelia-ui/base/display"
import { DatePrimitive, DateTime, Time } from "themelia-ui/primitives"

import { WHEN } from "./data"

export default function DateExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Date", value: <DatePrimitive value={WHEN} /> },
				{ label: "Time", value: <Time value={WHEN} /> },
				{ label: "Date and time", value: <DateTime value={WHEN} /> },
				{ label: "Custom pattern", value: <DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" /> },
				{ label: "No date", value: <DatePrimitive value={null} /> },
			]}
		/>
	)
}
