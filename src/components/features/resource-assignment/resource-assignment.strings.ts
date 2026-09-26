export interface SharedResourceCardStrings {
	currentlySelected: string
	/** Shown when a resource is assigned but the consumer supplied no content for it. */
	noResourceContent: string
	noResourceSelected: string
	changeAction: string
	assignAction: string
}

export const defaultSharedResourceCardStrings: SharedResourceCardStrings = {
	currentlySelected: "Currently selected",
	noResourceContent: "No content configured for this resource.",
	noResourceSelected: "Nothing assigned.",
	changeAction: "Change",
	assignAction: "Assign",
}
