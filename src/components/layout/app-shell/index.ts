/**
 * The application shells: sidebar inset, stacked, and topbar-with-sidebar. This barrel is
 * what `gen-architecture-manifest` finds the family by, and so what gets it published.
 */
export {
	SidebarInsetLayout,
	StackedLayout,
	type SidebarInsetLayoutProps,
	type StackedLayoutProps,
} from "./app-shell"
export {
	TopbarSidebarLayout,
	type TopbarSidebarLayoutProps,
	type TopbarSidebarLayoutSlots,
	type TopbarSidebarSide,
	type TopbarSidebarMobileMode,
} from "./topbar-sidebar-layout"
