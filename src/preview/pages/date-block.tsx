import { Badge } from "@/components/base/badge"
import { DateBlock } from "@/components/base/display"
import {
	Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
} from "@/components/base/item"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const EVENTS = [
	{ id: "kickoff", date: "2026-09-28", title: "Quarterly kickoff", meta: "09:00 – 10:30 · Main hall", tone: "info" as const, badge: "All hands" },
	{ id: "review", date: "2026-10-02", title: "Design review", meta: "14:00 – 15:00 · Room 4", tone: "neutral" as const, badge: "Team" },
	{ id: "release", date: "2026-10-09", title: "2.0 release", meta: "All day", tone: "success" as const, badge: "Milestone" },
]

export function DateBlockPage() {
	return (
		<ComponentPage
			title="Date block"
			summary="A date set as a date: a leaf with the month across its top and the day as its subject, for a row whose subject is WHEN something happens — an agenda, a booking, an event. Everywhere else a date is a value, and the date primitives format it inline."
			importPath="@/components/base/display"
			exports={["DateBlock"]}
		>
			<Example
				id="date-block"
				title="DateBlock"
				description="The month is a band, the day sits under it, the weekday under that. The markup keeps the spoken order — a screen reader hears “Sun 16 Aug” — and a machine-readable dateTime rides on the native time element, so the value stays parseable whatever the leaf shows."
				stacked
				code={`<DateBlock date="2026-08-16" />`}
			>
				<Stack direction="horizontal" gap="lg" wrap align="start">
					<DateBlock date="2026-08-16" />
					<DateBlock date="2026-12-31" />
					<DateBlock date="2027-01-04" showYear />
					<DateBlock date="2026-09-28" time="09:00" />
				</Stack>
			</Example>

			<Example
				id="date-block-parts"
				title="Parts"
				description="Each fragment can be dropped. Without the month there is no band, and the day takes its inset instead; a leaf in a list of this month's bookings rarely needs the weekday, and a leaf outside the current year needs the year."
				stacked
				code={`<DateBlock date={date} showWeekday={false} />
<DateBlock date={date} showMonth={false} />
<DateBlock date={date} showYear />
<DateBlock date={date} time="09:00 – 10:30" />`}
			>
				<Stack direction="horizontal" gap="lg" wrap align="start">
					<DateBlock date="2026-09-02" showWeekday={false} />
					<DateBlock date="2026-09-02" showMonth={false} />
					<DateBlock date="2026-09-02" showYear />
					<DateBlock date="2026-09-02" time="09:00 – 10:30" />
				</Stack>
			</Example>

			<Example
				id="date-block-in-a-list"
				title="In a list"
				description="Where the leaf earns its space: a column of them down a list's leading edge, so the reader scans dates first and titles second. The leaf is the row's media, and sits in the media slot."
				stacked
				code={`<Item>
  <ItemMedia><DateBlock date={event.date} /></ItemMedia>
  <ItemContent>
    <ItemTitle>{event.title}</ItemTitle>
    <ItemDescription>{event.meta}</ItemDescription>
  </ItemContent>
</Item>`}
			>
				<Stack maxWidth="36rem" gap="none">
					<ItemGroup ruled>
						{EVENTS.map((event) => (
							<Item key={event.id}>
								<ItemMedia>
									<DateBlock date={event.date} />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{event.title}</ItemTitle>
									<ItemDescription>{event.meta}</ItemDescription>
								</ItemContent>
								<ItemActions>
									<Badge tone={event.tone}>{event.badge}</Badge>
								</ItemActions>
							</Item>
						))}
					</ItemGroup>
				</Stack>
			</Example>

			<Example
				id="date-block-unboxed"
				title="Unboxed and inline"
				description="`boxed={false}` keeps the leaf's stack without its box, for a surface that already frames it. `layout=&quot;inline&quot;` turns the leaf into a phrase at the size of the line around it — every part the same size, the day weighted."
				stacked
				code={`<DateBlock date={date} boxed={false} />
<DateBlock date={date} layout="inline" time="09:00" />`}
			>
				<Stack gap="lg">
					<Stack direction="horizontal" gap="xl" wrap align="start">
						<DateBlock date="2026-08-27" boxed={false} />
						<DateBlock date="2026-08-27" boxed={false} showWeekday={false} />
					</Stack>
					<Stack direction="horizontal" gap="sm" align="baseline">
						<Text size="sm" type="secondary">Next session</Text>
						<DateBlock date="2026-08-27" layout="inline" time="· 09:00" />
					</Stack>
				</Stack>
			</Example>

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
