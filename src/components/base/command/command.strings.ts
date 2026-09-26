export interface CommandStrings {
	/** Names the dialog (visually hidden; the search field is the visible cue). */
	title: string
	/** Describes it to assistive technology, also hidden. */
	description: string
}

export const defaultCommandStrings: CommandStrings = {
	title: "Command palette",
	description: "Search for a command to run",
}
