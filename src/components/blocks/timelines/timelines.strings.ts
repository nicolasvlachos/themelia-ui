/** Copy owned by the timeline blocks. Labels are copy, separate from the data keys (`added` vs "Added"). */
export interface ChangelogStrings {
	added: string
	removed: string
	modified: string
	fixed: string
	/** Precedes the author — "— Alice Mercer". */
	byline: (author: string) => string
}

export const defaultChangelogStrings: ChangelogStrings = {
	added: "Added",
	removed: "Removed",
	modified: "Modified",
	fixed: "Fixed",
	byline: (author) => `— ${author}`,
}

export interface MilestonesStrings {
	completed: string
	inProgress: string
	upcoming: string
	blocked: string
	/** Precedes the due date. */
	dueOn: (date: string) => string
	/** Names the progress bar for a screen reader. */
	progressLabel: (title: string) => string
}

export const defaultMilestonesStrings: MilestonesStrings = {
	completed: "Completed",
	inProgress: "In progress",
	upcoming: "Upcoming",
	blocked: "Blocked",
	dueOn: (date) => `Due ${date}`,
	progressLabel: (title) => `${title} progress`,
}

export interface StepsStrings {
	/** Names each dot in the horizontal bar, which shows a numeral rather than a word. */
	stepLabel: (index: number, total: number) => string
	/**
	 * Said with a finished step in the horizontal bar, so the tick is not the only sign of
	 * it. Optional for existing complete translations; the stepper's default fills in.
	 */
	completed?: string
	/** Said with the step the reader is on in the horizontal bar. Optional, as above. */
	current?: string
}

export const defaultStepsStrings: StepsStrings = {
	stepLabel: (index, total) => `Step ${index} of ${total}`,
	completed: "Completed",
	current: "Current step",
}
