export interface BreadcrumbProgressStrings {
	/**
	 * Names each step — "Step 2: Billing", and "Step 1: Account, completed" for one already
	 * walked past. The current step is marked by `aria-current`, so it needs no word here.
	 */
	step: (index: number, label: string, status?: "completed" | "current" | "upcoming") => string
	/** The summary above the trail — "Step 2 of 4". */
	position: (current: number, total: number) => string
}

export const defaultBreadcrumbProgressStrings: BreadcrumbProgressStrings = {
	step: (index, label, status) => (status === "completed" ? `Step ${index}: ${label}, completed` : `Step ${index}: ${label}`),
	position: (current, total) => `Step ${current} of ${total}`,
}

export interface SectionNavStrings {
	label: string
}

export const defaultSectionNavStrings: SectionNavStrings = {
	label: "On this page",
}

export interface SideNavStrings {
	/** Names the region for assistive technology. */
	label: string
}

export const defaultSideNavStrings: SideNavStrings = {
	label: "Section navigation",
}
