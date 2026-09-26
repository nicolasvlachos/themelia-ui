import { MetricGradient } from "themelia-ui/patterns/analytics"

import { SERIES } from "./data"

const HERO = SERIES.map((point) => ({ label: point.month, value: point.sessions }))

export default function AnalyticsHero() {
	return (
		<MetricGradient
			title="Sessions this quarter"
			value="18,204"
			subtitle="Across every channel"
			change={{ value: "9.2%", direction: "up" }}
			data={HERO}
			theme="ocean"
		/>
	)
}
