export interface ErrorSummaryStrings {
	/** Heading, given the number of failures. */
	title: (count: number) => string
}

export const defaultErrorSummaryStrings: ErrorSummaryStrings = {
	title: (count) => (count === 1 ? "1 problem to fix" : `${count} problems to fix`),
}

export interface DirtyStateBannerStrings {
	title: string
	description: string
}

export const defaultDirtyStateBannerStrings: DirtyStateBannerStrings = {
	title: "You have unsaved changes",
	description: "Leaving this page will discard them.",
}

export interface SubmitStateButtonStrings {
	idle: string
	submitting: string
	succeeded: string
}

export const defaultSubmitStateButtonStrings: SubmitStateButtonStrings = {
	idle: "Save",
	submitting: "Saving…",
	succeeded: "Saved",
}
