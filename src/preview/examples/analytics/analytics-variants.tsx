import { Stack } from "themelia-ui/base/structure"
import { Metric, MetricGrid } from "themelia-ui/blocks/analytics"

import { CHURN, FULFILMENT, ORDERS, REVENUE } from "./data"

export default function AnalyticsVariants() {
	return (
		<Stack>
			<MetricGrid metrics={[REVENUE, CHURN]} variant="bordered" columns={2} />
			<MetricGrid metrics={[ORDERS, FULFILMENT]} variant="compact" columns={2} />
			<MetricGrid metrics={[REVENUE, CHURN]} variant="accent" columns={2} />
			<Metric data={ORDERS} variant="colored" tone="primary" progress={62} />
			<Metric data={REVENUE} variant="minimal" />
		</Stack>
	)
}
