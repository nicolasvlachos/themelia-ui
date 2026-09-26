/** Generic fallback copy for the shells; screens usually override it ("No invoices found"). */
export interface ResourceStrings {
	loadingLabel: string
	emptyTitle: string
	emptyDescription: string
	errorTitle: string
	errorDescription: string
	retryLabel: string
	/** Names the tab row for a screen reader: "Resource sections", "Invoice sections". */
	tabsLabel: string
}

export const defaultResourceStrings: ResourceStrings = {
	loadingLabel: "Loading resources",
	emptyTitle: "No resources found",
	emptyDescription: "There are no records available for this view.",
	errorTitle: "Resources unavailable",
	errorDescription: "The resource data could not be loaded.",
	retryLabel: "Try again",
	tabsLabel: "Resource sections",
}
