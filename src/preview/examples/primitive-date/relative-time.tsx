import { MetadataList } from "themelia-ui/base/display"
import { RelativeTime } from "themelia-ui/primitives"

import { DAYS_AGO, HOURS_AGO, MONTHS_AGO, NOW } from "./data"

export default function RelativeTimeExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Hours ago", value: <RelativeTime value={HOURS_AGO} now={NOW} /> },
				{ label: "Days ago", value: <RelativeTime value={DAYS_AGO} now={NOW} /> },
				{ label: "Months ago", value: <RelativeTime value={MONTHS_AGO} now={NOW} /> },
				{ label: "No date", value: <RelativeTime value={null} /> },
			]}
		/>
	)
}
