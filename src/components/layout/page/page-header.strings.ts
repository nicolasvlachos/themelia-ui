export interface PageHeaderStrings {
	/** Names the back control, which is icon-only when it has no visible text. */
	back: string
	/** Names the title icon when it is a link or a button. */
	titleIcon: string
}

export const defaultPageHeaderStrings: PageHeaderStrings = {
	back: "Back",
	titleIcon: "Open",
}
