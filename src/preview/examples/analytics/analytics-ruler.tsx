import { TimeRuler } from "themelia-ui/patterns/analytics"

const HOURS = [
	0, 0, 0, 0, 1, 2, 5, 9, 14, 18, 22, 25,
	24, 19, 21, 23, 20, 16, 12, 9, 6, 4, 2, 1,
]

export default function AnalyticsRuler() {
	return (
		<TimeRuler hours={HOURS} currentHour={14} />
	)
}
