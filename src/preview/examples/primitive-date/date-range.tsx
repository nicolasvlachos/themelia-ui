import { MetadataList } from "themelia-ui/base/display"
import { DateRange } from "themelia-ui/primitives"

import { APRIL_2, MARCH_3, MARCH_7, NEXT_JAN } from "./data"

export default function DateRangeExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Same month", value: <DateRange start={MARCH_3} end={MARCH_7} /> },
				{ label: "Same year", value: <DateRange start={MARCH_3} end={APRIL_2} /> },
				{ label: "Across years", value: <DateRange start={MARCH_3} end={NEXT_JAN} /> },
				{ label: "Custom separator", value: <DateRange start={MARCH_3} end={APRIL_2} separator=" to " /> },
				{ label: "No end date", value: <DateRange start={MARCH_3} end={null} /> },
			]}
		/>
	)
}
