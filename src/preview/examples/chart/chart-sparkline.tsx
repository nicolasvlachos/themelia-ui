import { Sparkline } from "themelia-ui/base/chart"
import { Grid, GridCell } from "themelia-ui/base/structure"

const SPARK_UP = [4, 9, 6, 12, 10, 17, 15, 22]
const SPARK_DOWN = [22, 19, 20, 14, 15, 9, 11, 5]
const SPARK_FLAT = [11, 12, 11, 13, 12, 12, 13, 12]

export default function ChartSparkline() {
	return (
		<Grid columns={3} gap="xl">
			<GridCell>
				<Sparkline data={SPARK_UP} tone="success" label="Revenue, trending up" />
			</GridCell>
			<GridCell>
				<Sparkline data={SPARK_DOWN} tone="destructive" label="Churn, trending down" />
			</GridCell>
			<GridCell>
				<Sparkline data={SPARK_FLAT} label="Sessions, flat" />
			</GridCell>
		</Grid>
	)
}
