import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function EventCalendarPage() {
	return (
		<ComponentPage
			title="Event calendar"
			summary="A month grid, a week strip, or an agenda over one list of events. The view decides only the range of days and how they are laid out — placing events onto days is the same code every time, so switching view can never move an event."
			importPath="@/components/features/event-calendar"
			exports={["EventCalendar", "useEventCalendar", "useEventCalendarData",
				"EventCalendarHeader", "EventCalendarDayCell", "EventCalendarEventBadge", "EventCalendarEventCard", "EventCalendarLegend",
			]}
		>
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
				<PropTable owner="EventCalendar"
					rows={[
						{ name: "events / categories", type: "CalendarEvent[] / EventCategory[]", required: true, description: "The calendar does no fetching of its own. An event with an endDate appears on every day it spans, not only its first." },
						{ name: "viewMode / defaultViewMode", type: "month | week | agenda", description: "Controlled or not — the switcher works either way. Week steps by weeks; month and agenda step by months." },
						{ name: "date / defaultDate", type: "Date", description: "Where the calendar is looking. Controlled or not, like the view." },
						{ name: "onEventClick / onDayClick", type: "(event) / (date, events)", description: "A chip press calls the first and stops there; anywhere else in the cell calls the second, with everything on that day." },
						{ name: "enableCategoryFilter / visibleCategories", type: "boolean / string[]", description: "An EMPTY list means all are shown — a filter nobody has touched hides nothing." },
						{ name: "maxEventsPerDay", type: "number", description: "Chips per day before the rest collapse. The overflow dots are the categories of the HIDDEN events, not the first three in the list." },
						{ name: "weekStartsOn", type: "0–6", description: "Falls back to the provider's dates config, then Monday — the same source the kit's own pickers read." },
						{ name: "minDate / maxDate / disabledDates", type: "Date / DateRule", description: "Navigation stops at the bounds; days beyond them are drawn but not clickable. DateRule takes dates, a predicate, or both, combined with OR." },
						{ name: "filterEvent", type: "(event) => boolean", description: "Hides events at render time without touching `events`. Counts and the overflow line follow it, so what is drawn and what is counted agree." },
						{ name: "renderEvent / renderDayCell", type: "render props", description: "renderDayCell receives defaultRender, so decorating is as easy as replacing." },
						{ name: "useEventCalendar", type: "hook", description: "The date, the view, and the days — for a calendar whose surface is entirely yours." },
						{ name: "EventCalendarHeader", type: "component", description: "The period and the controls that move it. The month jump is icon-only because the label beside it already names the month \u2014 spelling it on the button too is the same word twice." },
						{ name: "EventCalendarDayCell", type: "component", description: "One day in the grid. Deliberately not a button: a cell holds events that are themselves pressable, and nesting controls makes both unreachable by keyboard." },
						{ name: "EventCalendarEventBadge / EventCalendarEventCard", type: "component", description: "One event as a chip in a cell, and in full for an agenda row or a popover. The card reads its metadata by name, so a consumer\u2019s own fields appear without a mapping step." },
						{ name: "EventCalendarLegend", type: "component", description: "The category key, and the filter when one is wired. The WHOLE chip toggles rather than a checkbox beside a swatch \u2014 the swatch is the target a reader aims at anyway." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
