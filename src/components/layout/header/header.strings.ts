export interface HeaderBreadcrumbsStrings {
	/** Names the trail's navigation landmark; override it when a page carries two headers. */
	label: string
}

export const defaultHeaderBreadcrumbsStrings: HeaderBreadcrumbsStrings = {
	label: "Breadcrumb",
}

export interface HeaderSearchStrings {
	/** Shown in the trigger, and announced as its name. */
	placeholder: string
	/** The shortcut hint. Two, because the modifier differs by platform. */
	shortcutMac: string
	shortcutPc: string
}

export const defaultHeaderSearchStrings: HeaderSearchStrings = {
	placeholder: "Search…",
	shortcutMac: "⌘K",
	shortcutPc: "Ctrl K",
}

export interface HeaderNotificationsStrings {
	/** Names the bell, which is icon-only. */
	trigger: string
	/** Heading inside the surface. */
	heading: string
	markAllRead: string
	empty: string
	viewAll: string
	/** Announced count on the trigger, so the badge is not read as a bare number. */
	unread: (count: number) => string
	/** Announced on an unread row, whose tint and dot are visual only. */
	unreadItem: string
}

export const defaultHeaderNotificationsStrings: HeaderNotificationsStrings = {
	trigger: "Notifications",
	heading: "Notifications",
	markAllRead: "Mark all as read",
	empty: "No new notifications",
	viewAll: "View all notifications",
	unread: (count) => `${count} unread`,
	unreadItem: "Unread",
}

export interface HeaderUserMenuStrings {
	profile: string
	settings: string
	logout: string
	/** Names the trigger when the caller hides the name — an avatar alone has none. */
	trigger: string
}

export const defaultHeaderUserMenuStrings: HeaderUserMenuStrings = {
	profile: "Profile",
	settings: "Settings",
	logout: "Log out",
	trigger: "Account",
}
