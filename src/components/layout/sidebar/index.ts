export { AppSidebar, SidebarIcon, type AppSidebarProps } from "./app-sidebar"
export { SidebarLogo, type SidebarLogoProps } from "./partials/sidebar-logo"
export {
	SidebarWorkspace, type SidebarWorkspaceProps, type WorkspaceLink,
} from "./partials/sidebar-workspace"
export { SidebarUser, type SidebarUserProps } from "./partials/sidebar-user"
export {
	defaultSidebarWorkspaceStrings, defaultSidebarUserStrings,
	type SidebarWorkspaceStrings, type SidebarUserStrings,
} from "./sidebar.strings"
export type {
	SidebarFlatNavItem, SidebarItemContext, SidebarNavItem,
} from "./nav.types"
/* Path matching lives in `@/lib/navigation`; re-exported under its published names. */
export { isPathMatch, resolveActiveHref, toPath } from "@/lib/navigation"
