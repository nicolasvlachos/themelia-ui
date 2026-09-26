export interface CalendarStrings {
	previousMonth: string
	nextMonth: string
	/** Describes what the caption button does (switch to the month grid); the month is its name. */
	chooseMonth: string
	previousYear: string
	nextYear: string
}

export const defaultCalendarStrings: CalendarStrings = {
	previousMonth: "Previous month",
	nextMonth: "Next month",
	chooseMonth: "Choose a month",
	previousYear: "Previous year",
	nextYear: "Next year",
}

export interface DatePickerStrings extends CalendarStrings {
	/** Accessible name for the control that empties the field. */
	clear: string
	/** Shown in the trigger while there is no date. */
	placeholder: string
	/**
	 * The trigger's text once more than two dates are chosen. Optional so older complete
	 * strings objects still type-check.
	 */
	dateCount?: (count: number) => string
}

export const defaultDatePickerStrings: DatePickerStrings = {
	...defaultCalendarStrings,
	clear: "Clear date",
	placeholder: "Choose a date",
	dateCount: (count) => `${count} dates`,
}

/** The seven range shortcuts; separate from `DatePickerStrings` because presets are the caller's list. */
export interface RangePresetStrings {
	last7Days: string
	last30Days: string
	thisWeek: string
	thisMonth: string
	lastMonth: string
	thisYear: string
	lastYear: string
}

export const defaultRangePresetStrings: RangePresetStrings = {
	last7Days: "Last 7 days",
	last30Days: "Last 30 days",
	thisWeek: "This week",
	thisMonth: "This month",
	lastMonth: "Last month",
	thisYear: "This year",
	lastYear: "Last year",
}
