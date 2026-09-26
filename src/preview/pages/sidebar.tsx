import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SidebarPage() {
	return (
		<ComponentPage>
			<Example
				example="sidebar/sidebar-anatomy"
				title="Anatomy"
				description="Provider, panel, inset. Everything inside the panel is a slot: a header that holds its edge, a scrolling content region, groups with their own label and action, menu rows that take a badge, a secondary action and a nested sub-menu, and a footer. The rail is the drag edge."
			/>

			<Example
				example="sidebar/sidebar-variant"
				title="variant"
				description="`sidebar` sits against the shell's edge. `floating` and `inset` detach it, so the panel reads as a card inside the page rather than as the page's own edge — which is what a shell with a coloured ground wants."
			/>

			<Example
				example="sidebar/sidebar-collapsible"
				title="collapsible"
				description="`offcanvas` slides the panel away entirely; `icon` keeps a rail of glyphs, so the navigation is still reachable at a glance; `none` pins it open, for a layout where the panel is not optional. Press the trigger in the inset to collapse."
			/>

			<Example
				example="sidebar/sidebar-controlled"
				title="Controlled"
				description="`open` and `onOpenChange` on the provider, for a shell that persists the panel's state or opens it from a route. The trigger and the rail both go through the same state, so nothing can disagree about whether the panel is open."
			/>

			<Example id="sidebar-rule" title="Primitive, not shell">
				<Callout label="Rule">
					This module is the panel and its parts. A whole application shell — the panel, the
					header, the content column and the routing that lights the active row — is{" "}
					<code>layout/app-shell</code>, which assembles these. Reach here when you are
					building a shell; reach there when you want one.
				</Callout>
			</Example>

			<Example id="sidebar-api" title="API">
				<PropTable
					owners={[
						"SidebarProvider",
						"Sidebar",
						"SidebarInset",
						"SidebarTrigger",
						"SidebarRail",
						"SidebarHeader",
						"SidebarContent",
						"SidebarFooter",
						"SidebarGroup",
						"SidebarGroupLabel",
						"SidebarGroupAction",
						"SidebarGroupContent",
						"SidebarMenu",
						"SidebarMenuItem",
						"SidebarMenuButton",
						"SidebarMenuAction",
						"SidebarMenuBadge",
						"SidebarMenuSub",
						"SidebarMenuSubItem",
						"SidebarMenuSubButton",
						"SidebarMenuSkeleton",
					]}
				/>
				<PropTable symbols={["useSidebar", "useOptionalSidebar"]} />
			</Example>
		</ComponentPage>
	)
}
