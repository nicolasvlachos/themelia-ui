import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AppShellPage() {
	return (
		<ComponentPage
			title="App shell"
			summary="The outermost layout a signed-in product lives in: a collapsing navigation column with the page in the inset beside it, or a stacked shell with the navigation across the top."
			importPath="@/components/layout/app-shell"
			exports={["SidebarInsetLayout", "StackedLayout", "AppSidebar", "useActivePath", "isPathMatch",
				"SidebarLogo", "SidebarWorkspace", "SidebarUser", "SidebarIcon", "TopbarSidebarLayout"
			]}
		>
			<Example
				example="app-shell/sidebar-shell"
				title="The shell"
				description="SidebarInsetLayout mounts the provider itself — it is the thing that owns the open state, and asking every consumer to remember the wrapper is how half a product's screens end up without it. AppSidebar takes navigation data and a currentUrl; everything active follows from those."
				stacked
			/>

			<Example
				example="app-shell/topbar-sidebar-layout"
				title="TopbarSidebarLayout"
				description="A full-width header with navigation and independently scrolling content below it. Move the navigation to either side, collapse it to icons, and try it on a phone. Search and filter the sample invoices."
				stacked
			/>

			<Example
				example="app-shell/stacked-shell"
				title="StackedLayout"
				description="Navigation across the top leaves the page its full width. The header wraps on narrow screens. Switch sections and save a workspace name; changes stay in this local demo."
				stacked
			/>

			<Example example="app-shell/composed-workspace" title="A workspace inside a shell" description="Compose record navigation and forms inside the same full-width shell. The shell owns scrolling; WorkspaceLayout owns the inner columns." stacked />

			<Example id="sidebar-routing" title="The router seam" stacked>
				<Callout label="Rule">
					This layer never imports a router. Navigation goes through{" "}
					<code>renderLink</code>, so the same shell works under React Router, Next,
					Inertia, TanStack, or plain anchors — and the kit does not pick one. What it
					does own is the matching: <code>isPathMatch</code> keeps a parent lit while a
					child route is current, which is what opens the nested list on arrival rather
					than after a click.
				</Callout>
			</Example>

			<Example id="sidebar-two-boxes" title="Why the panel is two elements" stacked>
				<Callout label="Rule">
					The desktop shell renders a <code>gap</code> element and a fixed{" "}
					<code>container</code>. The container is out of flow so it can span the viewport
					and slide off-canvas; the gap is the in-flow element that reserves the column
					beside it. One element cannot do both — fixed positioning removes it from the
					very flow the page content needs to be pushed by. Both animate their width
					together, which is what makes collapsing read as the column closing rather than
					the content jumping.
				</Callout>
			</Example>

			<Example id="sidebar-api" title="API">
				<PropTable
					rows={[
						{ name: "SidebarProvider defaultOpen", api: "@/components/base/sidebar#SidebarProvider.defaultOpen", type: "boolean", default: "true", description: "Initial expanded state when uncontrolled." },
						{ name: "SidebarProvider persist", api: "@/components/base/sidebar#SidebarProvider.persist", type: "boolean", default: "true", description: "Remembers the state in localStorage, read during the initial render so the shell does not flash open then snap shut." },
						{ name: "SidebarProvider keyboardShortcut", api: "@/components/base/sidebar#SidebarProvider.keyboardShortcut", type: "boolean", default: "true", description: "Binds ⌘B / Ctrl-B to the toggle." },
						{ name: "SidebarProvider contained", api: "@/components/base/sidebar#SidebarProvider.contained", type: "boolean", default: "false", description: "Bounds the shell to its wrapper instead of the viewport. The panel is fixed by default, which is right for a shell that owns the screen and wrong everywhere else." },
						{ name: "SidebarInsetLayout showTrigger", type: "boolean", default: "true", description: "The toolbar's collapse control. Off for a shell whose navigation is opened from somewhere else." },
						{ name: "SidebarInsetLayout boundContent", type: "boolean", description: "Caps the inset's content at a reading measure instead of letting it run the shell's full width." },
						{ name: "Sidebar variant", api: "@/components/base/sidebar#Sidebar.variant", type: '"sidebar" | "floating" | "inset"', default: '"sidebar"', description: "Against the edge with a border; a rounded inset panel; or inset with the page lifted into a card." },
						{ name: "Sidebar collapsible", api: "@/components/base/sidebar#Sidebar.collapsible", type: '"offcanvas" | "icon" | "none"', default: '"offcanvas"', description: "Slides away; collapses to a glyph rail; or never collapses." },
						{ name: "Sidebar side", api: "@/components/base/sidebar#Sidebar.side", type: '"left" | "right"', default: '"left"', description: "Docking edge, for the rail and the mobile sheet alike." },
						{ name: "SidebarMenuButton size", api: "@/components/base/sidebar#SidebarMenuButton.size", type: '"sm" | "md" | "lg"', default: '"md"', description: "A shape, not a density: lg is the workspace switcher, sm a secondary row. The one place in the kit that keeps a size prop." },
						{ name: "SidebarMenuButton render", api: "@/components/base/sidebar#SidebarMenuButton.render", type: "ReactElement", description: "The element the row becomes — a router link, most often. The row's content stays in `children`, so the link keeps its own navigation and the row keeps its icon and label." },
						{ name: "SidebarMenuAction showOnHover", api: "@/components/base/sidebar#SidebarMenuAction.showOnHover", type: "boolean", default: "false", description: "Reveals on hover or keyboard focus — focus-within, so it is reachable without a pointer." },
						{ name: "AppSidebar navigationGroups", type: "Record<string, SidebarNavItem[]>", description: "Navigation as data, grouped by heading. An item with children renders as a disclosure." },
						{ name: "AppSidebar currentUrl", type: "string", description: "The current route. Active rows, and which parent is expanded, follow from this alone." },
						{ name: "AppSidebar renderLink", type: "LayoutLinkRenderer", description: "The router seam. Without it, entries render as plain anchors." },
						{ name: "AppSidebar liveBadges", type: "Record<string, string | number>", description: "Counts keyed by handle, overriding an item's declared badge — for a number that changes after the nav was defined." },
						{ name: "AppSidebar iconMap", type: "Record<string, ComponentType>", description: "Resolves an icon NAME to a component, so navigation data stays serialisable." },
						{ name: "SidebarMenuButton closeOnSelectMobile", api: "@/components/base/sidebar#SidebarMenuButton.closeOnSelectMobile", type: "boolean", default: "true", description: "Dismisses the mobile sheet on activation. Off for a row that opens something else, like a switcher." },
						{ name: "useSidebar()", api: "@/components/base/sidebar#useSidebar", type: "{ state, open, setOpen, isMobile, toggleSidebar, … }", description: "The shell's state, for anything that needs to react to it." },
						{ name: "headerClassName / toolbarClassName / contentClassName", api: ["StackedLayout.headerClassName", "SidebarInsetLayout.toolbarClassName", "SidebarInsetLayout.contentClassName"], type: "string", description: "Style one region without wrapping it. The shell owns the grid, so a wrapper around any of the three would break the sticky rows." },
						{ name: "SidebarLogo", api: "@/components/layout/sidebar#SidebarLogo", type: "component", description: "The product mark in the rail\u2019s header. It swaps to the compact mark when the rail collapses to icons rather than scaling the full one down, because a squeezed wordmark is unreadable at rail width." },
						{ name: "SidebarWorkspace", api: "@/components/layout/sidebar#SidebarWorkspace", type: "component", description: "The rail\u2019s header as a workspace switcher. The whole header row is the trigger, not a chevron beside a decorative name \u2014 the name is what a reader aims at." },
						{ name: "SidebarUser", api: "@/components/layout/sidebar#SidebarUser", type: "component", description: "The account row at the foot of the rail. Its menu opens to the RIGHT when the rail is collapsed and BELOW when it is not, because a menu that always drops down is off-screen at the bottom of a full-height panel." },
						{ name: "SidebarIcon", api: "@/components/layout/sidebar#SidebarIcon", type: "component", description: "Resolves an icon that may be a NAME. Exported because a caller supplying renderItem still wants the same resolution — a row rendered by hand should not need its own copy of \u201cstring means look it up, component means render it, node means use it\u201d." },
						{ name: "TopbarSidebarLayout contained", type: "boolean", default: "false", description: "Fits a parent with a definite height. The default owns the viewport; sidebar and content scroll below the header." },
						{ name: "TopbarSidebarLayout sidebar / sidebarSide", api: ["TopbarSidebarLayout.sidebar", "TopbarSidebarLayout.sidebarSide"], type: "ReactNode / left | right", description: "Use Sidebar or AppSidebar with icon/offcanvas collapse for a mobile drawer. Match the Sidebar side to sidebarSide. Omit the sidebar for a full-width body." },
						{ name: "TopbarSidebarLayout mobileSidebarMode", type: '"drawer" | "inline"', default: '"drawer"', description: "Drawer mode uses the Sidebar mobile sheet. Inline mode stacks static navigation above content; pair it with collapsible=none and sidebarTrigger=false." },
						{ name: "sidebarProviderProps", api: ["SidebarInsetLayout.sidebarProviderProps", "TopbarSidebarLayout.sidebarProviderProps"], type: "Pick<SidebarProviderProps, …>", description: "Pass open/onOpenChange, persist, keyboardShortcut and strings to the shell's provider. Disable persistence and shortcuts in independent embedded examples." },
						{ name: "StackedLayout contained", type: "boolean", default: "false", description: "Fits a parent with a definite height and scrolls content below the header." },
						{ name: "StackedLayout boundContent", type: "boolean", default: "true", description: "Caps the reading width. Set false for wide tables and composed workspaces." },
						{ name: "TopbarSidebarLayout", type: "component", description: "The header-first admin shell. The header spans the full width and owns the brand, the search and the account; the sidebar and the content share the height below it. The only difference from SidebarInsetLayout is where the LOGO lives — and that decides the whole frame, which is why it is two components rather than a boolean." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
