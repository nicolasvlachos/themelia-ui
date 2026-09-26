export interface SidebarStrings {
	/** Names the collapse control in both states — it is icon-only in both. */
	toggle: string
	/** Title and description of the off-canvas sheet the rail becomes on a phone. */
	mobileTitle: string
	mobileDescription: string
}

export const defaultSidebarStrings: SidebarStrings = {
	toggle: "Toggle navigation",
	mobileTitle: "Navigation",
	mobileDescription: "The application's main navigation.",
}
