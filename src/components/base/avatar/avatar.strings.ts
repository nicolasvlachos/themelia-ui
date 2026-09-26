/**
 * What a stack of avatars announces. Plurals are functions a consumer replaces whole:
 * most languages have more than two forms.
 */
export interface StackedAvatarsStrings {
	/** Names the group, by how many people are in it. */
	people: (count: number) => string
	/** The overflow chip at the end of the stack ("+3"). `overflowFormatter` replaces it. */
	overflow: (count: number) => string
}

export const defaultStackedAvatarsStrings: StackedAvatarsStrings = {
	people: (count) => `${count} ${count === 1 ? "person" : "people"}`,
	overflow: (count) => `+${count}`,
}
