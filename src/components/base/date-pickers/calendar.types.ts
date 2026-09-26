export type DateSelectionMode = "single" | "multiple" | "range"

export interface DateRangeValue {
	from?: Date
	to?: Date
}

export interface CalendarConstraints {
	/** Earliest selectable day, inclusive. */
	minDate?: Date
	/** Latest selectable day, inclusive. */
	maxDate?: Date
	/** Refuses individual days — weekends, holidays, days already booked. */
	disabledDates?: (date: Date) => boolean
}

export interface DatePreset {
	label: string
	/** Returns the value the preset selects, in whatever shape the mode uses. */
	value: () => Date | Date[] | DateRangeValue
}
