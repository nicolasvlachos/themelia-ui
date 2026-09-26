export {
	defaultRenderLink, resolveLayoutLinkRenderer,
	type LayoutIconSource, type LayoutLinkRenderProps, type LayoutLinkRenderer,
	type LayoutNavigationAdapter, type LayoutSlotAttributes, type LayoutUser, type NavLink,
} from "./layout.types"
export { useActivePath } from "./hooks/use-active-path"
export {
	AppSidebar, SidebarIcon, SidebarLogo, SidebarWorkspace, SidebarUser,
	defaultSidebarWorkspaceStrings, defaultSidebarUserStrings,
	isPathMatch, resolveActiveHref, toPath,
	type AppSidebarProps, type SidebarLogoProps, type SidebarWorkspaceProps,
	type SidebarUserProps, type SidebarWorkspaceStrings, type SidebarUserStrings,
	type WorkspaceLink,
	type SidebarFlatNavItem, type SidebarItemContext, type SidebarNavItem,
} from "./sidebar"
/* Through the family barrel, so the internal aggregate and the published subpath agree. */
export {
	SidebarInsetLayout, StackedLayout, TopbarSidebarLayout,
	type SidebarInsetLayoutProps, type StackedLayoutProps,
	type TopbarSidebarLayoutProps, type TopbarSidebarLayoutSlots,
	type TopbarSidebarSide, type TopbarSidebarMobileMode,
} from "./app-shell"
export {
	PageViewport, Container, Section, TwoColumnLayout,
	type PageViewportProps, type ContainerProps, type ContainerMaxWidth, type ContainerGutter,
	type SectionProps, type TwoColumnLayoutProps,
} from "./containers"
export {
	SideNav, SectionNav, defaultSideNavStrings, defaultSectionNavStrings,
	type SideNavProps, type SideNavItem, type SideNavGroup, type SideNavStrings,
	type SectionNavProps, type SectionNavItem, type SectionNavStrings,
	CategoryNav, BreadcrumbProgress, defaultBreadcrumbProgressStrings,
	type CategoryNavProps, type CategoryNavItem,
	type BreadcrumbProgressProps, type BreadcrumbProgressStep, type BreadcrumbProgressStrings,
} from "./navigation"
export { Page, type PageProps } from "./page"
export { PageHeader, type PageHeaderProps, type PageHeaderSlots } from "./page"
export {
	PageActions, defaultPageActionsStrings,
	type PageActionsProps, type PageAction, type PageActionsDisplay, type PageActionsStrings,
} from "./page"
export {
	Header, HeaderBreadcrumbs, HeaderSearch, HeaderGlobalSearchTrigger,
	HeaderToolButton, HeaderToolPopover, HeaderNotifications, HeaderUserMenu,
	defaultHeaderNotificationsStrings, defaultHeaderSearchStrings, defaultHeaderUserMenuStrings,
	type HeaderProps, type HeaderSlots, type HeaderBreadcrumbsProps,
	type HeaderGlobalSearchTriggerProps, type HeaderNotification, type HeaderNotificationsProps,
	type HeaderNotificationsStrings, type HeaderSearchProps, type HeaderSearchStrings,
	type HeaderToolButtonProps, type HeaderToolPopoverProps, type HeaderUserMenuProps,
	type HeaderUserMenuStrings, type NotificationTone,
} from "./header"
export {
	AsideNavShell,
	type AsideNavShellProps,
	type AsideNavGroup, type AsideNavItem,
} from "./settings"
export {
	WorkspaceRecordHeader, WorkspaceLayout, WorkspaceNav, WorkspaceLocaleStrip,
	defaultWorkspaceNavStrings, defaultWorkspaceLocaleStripStrings,
	defaultWorkspaceRecordHeaderStrings,
	type WorkspaceRecordHeaderProps, type WorkspaceRecordMetadataItem,
	type WorkspaceLayoutProps, type WorkspaceContentWidth,
	type WorkspaceNavProps, type WorkspaceNavItem, type WorkspaceNavGroup,
	type WorkspaceNavStatus, type WorkspaceNavRenderContext, type WorkspaceNavStrings,
	type WorkspaceLocaleStripProps, type WorkspaceLocaleItem, type WorkspaceLocaleStripStrings,
	type WorkspaceRecordHeaderStrings,
} from "./workspace"
export {
	AuthShell, AuthSplitPanel, AuthCard, AuthFooterLinks,
	defaultAuthShellStrings,
} from "./auth"
export type {
	AuthShellProps, AuthSplitPanelProps, AuthCardProps, AuthFooterLinksProps,
	AuthBrand, AuthBrandConfig, AuthLink,
	AuthShellVariant, AuthShellSize, AuthSplitSide, AuthSplitMobile, AuthShellStrings,
} from "./auth"
