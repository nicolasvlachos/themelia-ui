import { MetadataList } from "themelia-ui/base/display"
import { Duration } from "themelia-ui/primitives"

export default function DurationExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Seconds", value: <Duration value={45} /> },
				{ label: "Hours, minutes, seconds", value: <Duration value={4520} /> },
				{ label: "Given in minutes", value: <Duration value={90} from="minutes" /> },
				{ label: "Largest unit only", value: <Duration value={4520} maxParts={1} /> },
				{ label: "Short units", value: <Duration value={4520} unitDisplay="short" /> },
				{ label: "No duration", value: <Duration value={null} /> },
			]}
		/>
	)
}
