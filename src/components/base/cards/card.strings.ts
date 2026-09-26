export interface CardStrings {
	/** Accessible name for the info glyph beside the title. */
	tooltip: string
	/** Accessible name for the overflow trigger in the header. */
	actions: string
	/** The disclosure control's name in each state, when the card is expandable. */
	expand: string
	collapse: string
}

export const defaultCardStrings: CardStrings = {
	tooltip: "More information",
	actions: "More actions",
	expand: "Show more",
	collapse: "Show less",
}
