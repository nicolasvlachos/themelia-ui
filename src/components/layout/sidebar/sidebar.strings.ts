export interface SidebarWorkspaceStrings {
	/** Names the trigger, which is a logo and a chevron with no text of its own. */
	select: string
	/** Captions the group of destinations in the menu. */
	label: string
}

export const defaultSidebarWorkspaceStrings: SidebarWorkspaceStrings = {
	select: "Switch workspace",
	label: "Workspaces",
}

export interface SidebarUserStrings {
	profile: string
	settings: string
	logout: string
	/** Names the trigger when the rail is collapsed to icons and the name is hidden. */
	trigger: string
}

export const defaultSidebarUserStrings: SidebarUserStrings = {
	profile: "Profile",
	settings: "Settings",
	logout: "Log out",
	trigger: "Account",
}
