import { MetricComparison } from "themelia-ui/blocks/analytics"

export default function AnalyticsComparison() {
	return (
		<MetricComparison
			current={{ id: "c", label: "Revenue", value: 48_200, valueType: "currency", currency: "EUR" }}
			previous={{ id: "p", label: "Revenue", value: 42_900, valueType: "currency", currency: "EUR" }}
			currentPeriod="Aug 2026"
			previousPeriod="Jul 2026"
		/>
	)
}
