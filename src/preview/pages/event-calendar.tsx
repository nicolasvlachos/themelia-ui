import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function EventCalendarPage() {
	return (
		<ComponentPage>
			<Example
				example="event-calendar/month"
				title="The grid"
				description="Switch the view from the header, jump to a month with the calendar button beside the heading, and press a chip to open its event. The legend filters: press a category and it leaves the grid, which is the same data pipeline running with one category dropped."
			/>

			<Example
				example="event-calendar/agenda"
				title="The agenda"
				description="Only the days that have something on them, each with its full cards. An agenda is a list, not a grid — drawn as seven columns it would look exactly like the month view."
			/>

			<Example
				example="event-calendar/week"
				title="A week, and a range"
				description="`minDate` and `maxDate` stop the navigation and grey out the days beyond them; `disabledDates` takes dates, a predicate, or both. A disabled day still draws — a hole in a calendar reads as a loading failure."
			/>

			<Example id="calendar-rules" title="What the calendar decides">
				<Callout label="Rule">
					An event names a <code>category</code> and the category names a{" "}
					<code>colorToken</code> — two indirections where one would do, and both earn it. A
					calendar whose events carried colours directly would need every row of a query to say
					“blue”, and changing what blue means would mean rewriting the data. The token set is
					closed at eight names, because a calendar that accepted <code>#7c3aed</code> would put
					a colour outside the theme onto a surface that has one.
				</Callout>
				<Text size="sm" type="secondary">
					The day key is <strong>local</strong>, not UTC. The obvious key —{" "}
					<code>date.toISOString().slice(0, 10)</code> — is wrong for half the world: local
					midnight in any timezone ahead of UTC serialises to the previous day, so every event
					in Athens would land on the cell before its own.
				</Text>
				<Text size="sm" type="secondary">
					A day cell is not a button. It holds the event chips, which are real buttons, and a
					button may not contain focusable descendants — so the day <strong>number</strong> is
					the keyboard affordance and the cell's click handler only widens the pointer target.
				</Text>
			</Example>

			<Example id="calendar-api" title="API">
				<PropTable owner="EventCalendar" />
				<PropTable
					symbols={[
						"useEventCalendar",
						"EventCalendarHeader",
						"EventCalendarDayCell",
						"EventCalendarEventBadge",
						"EventCalendarEventCard",
						"EventCalendarLegend",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
