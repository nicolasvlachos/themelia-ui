import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AppShellPage() {
	return (
		<ComponentPage>
			<Example
				example="app-shell/sidebar-shell"
				title="The shell"
				description="SidebarInsetLayout mounts the provider itself — it is the thing that owns the open state, and asking every consumer to remember the wrapper is how half a product's screens end up without it. AppSidebar takes navigation data and a currentUrl; everything active follows from those."
			/>

			<Example
				example="app-shell/topbar-sidebar-layout"
				title="TopbarSidebarLayout"
				description="A full-width header with navigation and independently scrolling content below it. Move the navigation to either side, collapse it to icons, and try it on a phone. Search and filter the sample invoices."
			/>

			<Example
				example="app-shell/stacked-shell"
				title="StackedLayout"
				description="Navigation across the top leaves the page its full width. The header wraps on narrow screens. Switch sections and save a workspace name; changes stay in this local demo."
			/>

			<Example example="app-shell/composed-workspace" title="A workspace inside a shell" description="Compose record navigation and forms inside the same full-width shell. The shell owns scrolling; WorkspaceLayout owns the inner columns." />

			<Example id="sidebar-routing" title="The router seam">
				<Callout label="Rule">
					This tier never imports a router. Navigation goes through{" "}
					<code>renderLink</code>, so the same shell works under React Router, Next,
					Inertia, TanStack, or plain anchors — and the kit does not pick one. What it
					does own is the matching: <code>isPathMatch</code> keeps a parent lit while a
					child route is current, which is what opens the nested list on arrival rather
					than after a click.
				</Callout>
			</Example>

			<Example id="sidebar-two-boxes" title="Why the panel is two elements">
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
					owners={[
						"SidebarInsetLayout",
						"TopbarSidebarLayout",
						"StackedLayout",
						"AppSidebar",
						"SidebarProvider",
						"Sidebar",
						"SidebarMenuButton",
						"SidebarMenuAction",
					]}
				/>
				<PropTable symbols={["useSidebar", "SidebarLogo", "SidebarWorkspace", "SidebarUser", "SidebarIcon"]} />
			</Example>
		</ComponentPage>
	)
}
