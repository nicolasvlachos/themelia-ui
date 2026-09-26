export interface LoadingStateStrings {
	label: string
}

export const defaultLoadingStateStrings: LoadingStateStrings = {
	label: "Loading…",
}

export interface ErrorStateStrings {
	title: string
	description: string
	retry: string
}

export const defaultErrorStateStrings: ErrorStateStrings = {
	title: "Something went wrong",
	description: "The data could not be loaded.",
	retry: "Try again",
}
