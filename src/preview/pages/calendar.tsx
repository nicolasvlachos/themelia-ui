import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CalendarPage() {
	return (
		<ComponentPage
			title="Calendar"
			summary="The grid on its own, for a page that shows a month rather than asking for a date. Built on date-fns, not a calendar library."
			importPath="@/components/base/date-pickers"
			exports={["Calendar"]}
		>
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
				<PropTable owner="Calendar"
					rows={[
						{ name: "mode", type: '"single" | "range" | "multiple"', description: "Selection behaviour, same as DatePicker." },
						{ name: "numberOfMonths", type: "number", default: "1", description: "Months side by side. Each grid keeps its own caption so the second month is not anonymous." },
						{ name: "disabledDates", type: "(date: Date) => boolean", description: "Which days cannot be chosen." },
						{ name: "month / onMonthChange", type: "Date / (month) => void", description: "The page being shown, for a calendar whose position is driven from outside." },
						{ name: "weekStartsOn", type: "0–6", description: "Which day begins the week. Falls back to the provider's locale setting rather than assuming Monday." },
						{ name: "strings", type: "Partial<CalendarStrings>", description: "Overrides this calendar's own copy — the three caption controls, which are icon-only and have no other name. DatePicker passes its own strings straight through, so one override names both." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
