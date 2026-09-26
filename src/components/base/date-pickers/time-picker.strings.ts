export interface TimePickerStrings {
	/** Names the group of segments. The three boxes are one value. */
	label: string
	/** Each segment. They are unlabelled boxes, so this is the only name they have. */
	hours: string
	minutes: string
	seconds: string
}

export const defaultTimePickerStrings: TimePickerStrings = {
	label: "Time",
	hours: "Hours",
	minutes: "Minutes",
	seconds: "Seconds",
}
