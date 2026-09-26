import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { EventCalendar } from "./event-calendar"
import { EventCalendarDayCell } from "./event-calendar-day-cell"

describe("EventCalendar", () => {
	it("keeps the minimum calendar day selectable when the boundary has a time", () => {
		const onDayClick = vi.fn()
		render(
			<EventCalendar
				events={[]}
				categories={[]}
				defaultDate={new Date(2026, 8, 16)}
				minDate={new Date(2026, 8, 16, 14, 30)}
				onDayClick={onDayClick}
				showHeader={false}
				showLegend={false}
			/>,
		)

		const day = screen.getByRole("button", { name: new Date(2026, 8, 16).toDateString() })
		fireEvent.click(day)

		expect(day.closest("[aria-disabled]")) .not.toBeInTheDocument()
		expect(onDayClick).toHaveBeenCalledWith(new Date(2026, 8, 16), [])
	})

	it("keeps localized overflow meaning while exposing a compact count for narrow cells", () => {
		const date = new Date(2026, 8, 5)
		render(
			<EventCalendarDayCell
				data={{
					date,
					isCurrentMonth: true,
					isToday: false,
					isWeekend: true,
					events: [
						{ id: "a", title: "A", category: "events", startDate: date },
						{ id: "b", title: "B", category: "events", startDate: date },
						{ id: "c", title: "C", category: "events", startDate: date },
					],
					eventCount: 3,
					hasMultipleEvents: true,
				}}
				categories={[{ id: "events", label: "Events", colorToken: "info" }]}
				maxEvents={1}
				onClick={vi.fn()}
				strings={{ moreEvents: (count) => `${count} hidden appointments` }}
			/>,
		)

		const overflow = document.querySelector('[data-slot="event-calendar-overflow"]')
		expect(overflow).not.toBeNull()
		expect(overflow).toHaveTextContent("2 hidden appointments")
		expect(overflow).toHaveTextContent("+2")
	})
})
