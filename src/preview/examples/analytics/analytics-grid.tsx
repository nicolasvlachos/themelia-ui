import { MetricGrid } from "themelia-ui/blocks/analytics"

import { METRICS } from "./data"

export default function AnalyticsGrid() {
	return (
		<MetricGrid metrics={METRICS} variant="card" />
	)
}
