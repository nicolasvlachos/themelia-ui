import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DateBlockPage() {
	return (
		<ComponentPage
			title="Date block"
			summary="A date set as a date: a leaf with the month across its top and the day as its subject, for a row whose subject is WHEN something happens — an agenda, a booking, an event. Everywhere else a date is a value, and the date primitives format it inline."
			importPath="@/components/base/display"
			exports={["DateBlock"]}
		>
			<Example
				example="date-block/date-block"
				title="DateBlock"
				description="The month is a band, the day sits under it, the weekday under that. The markup keeps the spoken order — a screen reader hears “Sun 16 Aug” — and a machine-readable dateTime rides on the native time element, so the value stays parseable whatever the leaf shows."
				stacked
			/>

			<Example
				example="date-block/date-block-parts"
				title="Parts"
				description="Each fragment can be dropped. Without the month there is no band, and the day takes its inset instead; a leaf in a list of this month's bookings rarely needs the weekday, and a leaf outside the current year needs the year."
				stacked
			/>

			<Example
				example="date-block/date-block-in-a-list"
				title="In a list"
				description="Where the leaf earns its space: a column of them down a list's leading edge, so the reader scans dates first and titles second. The leaf is the row's media, and sits in the media slot."
				stacked
			/>

			<Example
				example="date-block/date-block-unboxed"
				title="Unboxed and inline"
				description="`boxed={false}` keeps the leaf's stack without its box, for a surface that already frames it. `layout=&quot;inline&quot;` turns the leaf into a phrase at the size of the line around it — every part the same size, the day weighted."
				stacked
			/>

			<Example id="date-block-api" title="API">
				<PropTable owner="DateBlock"
					rows={[
						{ name: "date", type: "Date | string | number | null", description: "A Date, an ISO string or a timestamp. Nothing parseable renders nothing — an empty leaf would be a claim." },
						{ name: "layout", type: '"stacked" | "inline"', default: '"stacked"', description: "A leaf, or a phrase at the size of the line it sits in." },
						{ name: "boxed", type: "boolean", default: "true when stacked", description: "The leaf's box and month band. Off for a surface that already frames it." },
						{ name: "showWeekday / showMonth / showYear", type: "boolean", default: "true / true / false", description: "Which fragments to show. Without the month there is no band." },
						{ name: "time", type: "ReactNode", description: "An already-formatted time or range, under the weekday — “09:00 – 10:30”." },
						{ name: "weekdayFormat / dayFormat / monthFormat / yearFormat", type: "string", default: '"EEE" / "d" / "MMM" / "yyyy"', description: "date-fns patterns. The names come from the UIProvider's date-fns locale, so a Greek scope reads “Κυρ” without a strings object." },
						{ name: "dateTime", type: "string", description: "Overrides the machine-readable value, which is otherwise the date's ISO string." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
