export interface AsyncPreviewStrings {
	loading: string
	errorTitle: string
	errorDescription: string
	retry: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultAsyncPreviewStrings: AsyncPreviewStrings = {
	loading: "Loading preview…",
	errorTitle: "Could not load preview",
	errorDescription: "Try again, or open the full record.",
	retry: "Retry",
	emptyTitle: "Nothing to preview",
	emptyDescription: "There is nothing to show for this record yet.",
}
