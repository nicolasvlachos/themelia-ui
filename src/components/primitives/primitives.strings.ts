/** Copy owned by the value primitives, kept apart from components (fast refresh). */

export interface UrlStrings {
	/** Announced after an external link's label, since it opens a new tab (WCAG 3.2.5). */
	opensInNewTab: string
}

export const defaultUrlStrings: UrlStrings = {
	opensInNewTab: "(opens in a new tab)",
}

export interface RatioStrings {
	/** Joins the two numbers. "3 of 10". */
	of: string
	/** The separator for `format="fraction"`. */
	fraction: string
}

export const defaultRatioStrings: RatioStrings = {
	of: "of",
	fraction: "/",
}

export interface RatingStrings {
	/** Joins the score to the scale. "4.5 out of 5". */
	outOf: string
}

export const defaultRatingStrings: RatingStrings = {
	outOf: "out of",
}

export interface InlineListStrings {
	/** Names the items not shown when `max` truncates. Receives the count. */
	more: (count: number) => string
}

export const defaultInlineListStrings: InlineListStrings = {
	more: (count) => `${count} more`,
}

export interface CoordinatesStrings {
	north: string
	south: string
	east: string
	west: string
}

export const defaultCoordinatesStrings: CoordinatesStrings = {
	north: "N",
	south: "S",
	east: "E",
	west: "W",
}
