import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CalendarPage() {
	return (
		<ComponentPage>
			<Example
				example="calendar/calendar"
				title="Calendar"
				description="The grid on its own. Days are real buttons in a role=grid, so arrow keys walk the month and only one day is a tab stop — forty-two stops per month is what makes a calendar unusable from the keyboard."
			/>

			<Example
				example="calendar/calendar-locale"
				title="Another language, another week"
				description="The month name, the weekday headings, and every day's accessible name come from the scope's date-fns locale. The week start is separate: it is a regional convention rather than a translation, so a Sunday-first calendar in German is a real combination and each is set on its own."
			/>

			<Example id="dates-rule" title="Fixed cells">
				<Callout label="Rule">
					The grid is seven columns of fixed square cells and always six whole weeks.
					Content-width columns resize between months — February beside a 31-day month is
					a different shape — and the whole popup jumps as the reader pages through.
				</Callout>
			</Example>

			<Example id="calendar-api" title="API">
				<PropTable owner="Calendar" />
			</Example>
		</ComponentPage>
	)
}
