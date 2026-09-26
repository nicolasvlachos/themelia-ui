import { MetadataList } from "themelia-ui/base/display"
import { RelativeTime } from "themelia-ui/primitives"

import { DAYS_AGO, NOW, SECONDS_AGO } from "./data"

export default function RelativeTimeShape() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "With suffix", value: <RelativeTime value={DAYS_AGO} now={NOW} /> },
				{ label: "No suffix", value: <RelativeTime value={DAYS_AGO} now={NOW} addSuffix={false} /> },
				{ label: "With seconds", value: <RelativeTime value={SECONDS_AGO} now={NOW} includeSeconds /> },
				{ label: "Without seconds", value: <RelativeTime value={SECONDS_AGO} now={NOW} /> },
			]}
		/>
	)
}
