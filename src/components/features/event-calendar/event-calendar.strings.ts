export interface EventCalendarStrings {
	today: string
	previous: string
	next: string
	loading: string
	/** Names the month/year jump control, which draws no label of its own. */
	jumpToMonth: string
	/** Names the legend when it filters, so a screen reader knows the chips do something. */
	filterCategories: string
	/** The overflow line under a day's chips. */
	moreEvents: (count: number) => string
	emptyDay: string
	viewMode: {
		/** The accessible name of the view switcher itself, not of the current view. */
		label: string
		month: string
		week: string
		agenda: string
	}
	/** Sunday first. The calendar rotates them to match `weekStartsOn`. */
	weekdaysShort: [string, string, string, string, string, string, string]
}

export const defaultEventCalendarStrings: EventCalendarStrings = {
	today: "Today",
	previous: "Previous",
	next: "Next",
	loading: "Loading…",
	jumpToMonth: "Jump to month",
	filterCategories: "Filter event categories",
	moreEvents: (count) => `${count} more`,
	emptyDay: "Nothing scheduled.",
	viewMode: {
		label: "Calendar view",
		month: "Month",
		week: "Week",
		agenda: "Agenda",
	},
	weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}

export interface EventCalendarEventCardStrings {
	guest: string
	guests: string
	/** Names one event chip from its title and start time; one function so word order is translatable. */
	eventAt: (title: string, time: string) => string
}

export const defaultEventCalendarEventCardStrings: EventCalendarEventCardStrings = {
	guest: "guest",
	guests: "guests",
	eventAt: (title, time) => `${title} at ${time}`,
}
