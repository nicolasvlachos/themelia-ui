import { MetricMicroGrid } from "themelia-ui/patterns/analytics"

const MICRO = [
	{ label: "Sessions", value: "18.2k", data: [4, 9, 6, 12, 10, 17] },
	{ label: "Signups", value: "412", data: [2, 5, 4, 8, 7, 11] },
	{ label: "Activation", value: "63%", data: [3, 6, 5, 9, 8, 12] },
	{ label: "Seats used", value: "84 / 120", data: [84, 120] },
	{ label: "Retention", value: "91%", data: [6, 7, 7, 9, 10, 12] },
	{ label: "Plan mix", value: "3 tiers", data: [5, 3, 2] },
]

export default function AnalyticsMicro() {
	return (
		<MetricMicroGrid cells={MICRO} />
	)
}
