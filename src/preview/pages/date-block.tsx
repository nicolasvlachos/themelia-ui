import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DateBlockPage() {
	return (
		<ComponentPage>
			<Example
				example="date-block/date-block"
				title="DateBlock"
				description="The month is a band, the day sits under it, the weekday under that. The markup keeps the spoken order — a screen reader hears “Sun 16 Aug” — and a machine-readable dateTime rides on the native time element, so the value stays parseable whatever the leaf shows."
			/>

			<Example
				example="date-block/date-block-parts"
				title="Parts"
				description="Each fragment can be dropped. Without the month there is no band, and the day takes its inset instead; a leaf in a list of this month's bookings rarely needs the weekday, and a leaf outside the current year needs the year."
			/>

			<Example
				example="date-block/date-block-in-a-list"
				title="In a list"
				description="Where the leaf earns its space: a column of them down a list's leading edge, so the reader scans dates first and titles second. The leaf is the row's media, and sits in the media slot."
			/>

			<Example
				example="date-block/date-block-unboxed"
				title="Unboxed and inline"
				description="`boxed={false}` keeps the leaf's stack without its box, for a surface that already frames it. `layout=&quot;inline&quot;` turns the leaf into a phrase at the size of the line around it — every part the same size, the day weighted."
			/>

			<Example id="date-block-api" title="API">
				<PropTable owner="DateBlock" />
			</Example>
		</ComponentPage>
	)
}
