import { MetricBar } from "themelia-ui/patterns/analytics"

import { METRICS } from "./data"

export default function AnalyticsBar() {
	return (
		<MetricBar
			metrics={METRICS}
			period={{ label: "Last 30 days", value: "30d" }}
			footerText="Updated 10 minutes ago"
		/>
	)
}
