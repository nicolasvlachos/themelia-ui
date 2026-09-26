import {
	ActivityHeatmap, type ActivityHeatmapDay, type ActivityLevel,
} from "themelia-ui/patterns/analytics"

/* A fixed, cyclic pattern, not random data, for stable visual baselines. */
const HEATMAP: ActivityHeatmapDay[] = Array.from({ length: 182 }, (_, index) => {
	const date = new Date("2026-03-02T00:00:00")
	date.setDate(date.getDate() + index)
	const weekday = date.getDay()
	const level = (weekday === 0 || weekday === 6 ? index % 2 : (index % 5) + 1) as ActivityLevel
	return { date: date.toISOString().slice(0, 10), level: Math.min(level, 4) as ActivityLevel }
})

export default function AnalyticsHeatmap() {
	return (
		<ActivityHeatmap data={HEATMAP} />
	)
}
