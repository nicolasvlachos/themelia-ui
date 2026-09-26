import { useState } from "react"
import {
	BellIcon, ChartLineIcon, InboxIcon, PlusIcon, SettingsIcon, ShoppingBagIcon,
} from "lucide-react"

import {
	Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction,
	SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset,
	SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
	SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
	SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger,
	type SidebarCollapsible, type SidebarVariant,
} from "@/components/base/sidebar"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const NAV = [
	{ label: "Inbox", icon: InboxIcon, badge: "12" },
	{ label: "Orders", icon: ShoppingBagIcon },
	{ label: "Analytics", icon: ChartLineIcon },
]

/** One panel, so each example differs only by the prop it is demonstrating. */
function Panel({
	variant,
	collapsible,
}: {
	variant?: SidebarVariant
	collapsible?: SidebarCollapsible
}) {
	return (
		/* `contained`: the panel is `position: fixed` by default and would pin to the window. */
		<div
			style={{
				height: "22rem",
				width: "100%",
				overflow: "hidden",
				border: "var(--border-width) solid var(--border)",
				borderRadius: "var(--radius)",
			}}
		>
			<SidebarProvider contained>
				<Sidebar variant={variant} collapsible={collapsible}>
					<SidebarHeader>
						<SidebarInput placeholder="Search" aria-label="Search" />
					</SidebarHeader>

					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Workspace</SidebarGroupLabel>
							<SidebarGroupAction aria-label="Add">
								<PlusIcon aria-hidden="true" />
							</SidebarGroupAction>
							<SidebarGroupContent>
								<SidebarMenu>
									{NAV.map((item, index) => (
										<SidebarMenuItem key={item.label}>
											<SidebarMenuButton active={index === 0} tooltip={item.label}>
												<item.icon aria-hidden="true" />
												<span>{item.label}</span>
											</SidebarMenuButton>
											{item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
											{index === 1 && (
												<SidebarMenuAction aria-label="More">
													<BellIcon aria-hidden="true" />
												</SidebarMenuAction>
											)}
											{index === 1 && (
												<SidebarMenuSub>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton>Unfulfilled</SidebarMenuSubButton>
													</SidebarMenuSubItem>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton>Refunded</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												</SidebarMenuSub>
											)}
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>

						<SidebarSeparator />

						<SidebarGroup>
							<SidebarGroupLabel>Loading</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuSkeleton showIcon />
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuSkeleton showIcon />
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					<SidebarFooter>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton tooltip="Settings">
									<SettingsIcon aria-hidden="true" />
									<span>Settings</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>

					<SidebarRail />
				</Sidebar>

				{/* embedded in a docs page, so the page's own <main> stays the only one */}
				<SidebarInset render={<div />}>
					<Stack gap="md" style={{ padding: "var(--space-xl)" }}>
						<SidebarTrigger />
						<Text size="xs" type="secondary">
							SidebarInset renders the page beside the panel — as a real{" "}
							<code>&lt;main&gt;</code>, so it is the document's main landmark rather than
							another div.
						</Text>
					</Stack>
				</SidebarInset>
			</SidebarProvider>
		</div>
	)
}

export function SidebarPage() {
	const [open, setOpen] = useState(true)

	return (
		<ComponentPage
			title="Sidebar"
			summary="The navigation panel and the page beside it. A provider holds the open state so a trigger anywhere on the page can reach it, the panel collapses to icons or off-canvas, and the inset is the document's main landmark. base/sidebar is the primitive; layout/app-shell assembles it into a shell."
			importPath="@/components/base/sidebar"
			exports={[
				"SidebarProvider", "Sidebar", "SidebarTrigger", "SidebarRail", "SidebarInset",
				"SidebarHeader", "SidebarContent", "SidebarFooter", "SidebarSeparator",
				"SidebarInput", "SidebarGroup", "SidebarGroupLabel", "SidebarGroupAction",
				"SidebarGroupContent", "SidebarMenu", "SidebarMenuItem", "SidebarMenuButton",
				"SidebarMenuAction", "SidebarMenuBadge", "SidebarMenuSkeleton", "SidebarMenuSub",
				"SidebarMenuSubItem", "SidebarMenuSubButton", "useSidebar", "useOptionalSidebar"
			]}
		>
			<Example
				id="sidebar-anatomy"
				title="Anatomy"
				description="Provider, panel, inset. Everything inside the panel is a slot: a header that holds its edge, a scrolling content region, groups with their own label and action, menu rows that take a badge, a secondary action and a nested sub-menu, and a footer. The rail is the drag edge."
				stacked
				code={`<SidebarProvider>
  <Sidebar>
    <SidebarHeader>…</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton active>…</SidebarMenuButton>
              <SidebarMenuBadge>12</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>…</SidebarFooter>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>…</SidebarInset>
</SidebarProvider>`}
			>
				<Panel />
			</Example>

			<Example
				id="sidebar-variant"
				title="variant"
				description="`sidebar` sits against the shell's edge. `floating` and `inset` detach it, so the panel reads as a card inside the page rather than as the page's own edge — which is what a shell with a coloured ground wants."
				stacked
				code={`<Sidebar variant="floating" />`}
			>
				<Stack gap="xl">
					<Panel variant="floating" />
					<Panel variant="inset" />
				</Stack>
			</Example>

			<Example
				id="sidebar-collapsible"
				title="collapsible"
				description="`offcanvas` slides the panel away entirely; `icon` keeps a rail of glyphs, so the navigation is still reachable at a glance; `none` pins it open, for a layout where the panel is not optional. Press the trigger in the inset to collapse."
				stacked
				code={`<Sidebar collapsible="icon" />`}
			>
				<Panel collapsible="icon" />
			</Example>

			<Example
				id="sidebar-controlled"
				title="Controlled"
				description="`open` and `onOpenChange` on the provider, for a shell that persists the panel's state or opens it from a route. The trigger and the rail both go through the same state, so nothing can disagree about whether the panel is open."
				stacked
				code={`<SidebarProvider open={open} onOpenChange={setOpen}>…</SidebarProvider>`}
			>
				<Stack gap="md">
					<Text size="xs" type="secondary">
						open: {String(open)}
					</Text>
					<div
						style={{
							height: "16rem",
							width: "100%",
							overflow: "hidden",
							border: "var(--border-width) solid var(--border)",
							borderRadius: "var(--radius)",
						}}
					>
						<SidebarProvider contained open={open} onOpenChange={setOpen}>
							<Sidebar collapsible="icon">
								<SidebarContent>
									<SidebarGroup>
										<SidebarGroupContent>
											<SidebarMenu>
												{NAV.map((item) => (
													<SidebarMenuItem key={item.label}>
														<SidebarMenuButton tooltip={item.label}>
															<item.icon aria-hidden="true" />
															<span>{item.label}</span>
														</SidebarMenuButton>
													</SidebarMenuItem>
												))}
											</SidebarMenu>
										</SidebarGroupContent>
									</SidebarGroup>
								</SidebarContent>
							</Sidebar>
							{/* embedded in a docs page, so the page's own <main> stays the only one */}
							<SidebarInset render={<div />}>
								<Stack style={{ padding: "var(--space-xl)" }}>
									<SidebarTrigger />
								</Stack>
							</SidebarInset>
						</SidebarProvider>
					</div>
				</Stack>
			</Example>

			<Example id="sidebar-rule" title="Primitive, not shell" stacked>
				<Callout label="Rule">
					This family is the panel and its parts. A whole application shell — the panel, the
					header, the content column and the routing that lights the active row — is{" "}
					<code>layout/app-shell</code>, which assembles these. Reach here when you are
					building a shell; reach there when you want one.
				</Callout>
			</Example>

			<Example id="sidebar-api" title="API">
				<PropTable
					rows={[
						{ name: "SidebarProvider open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "The panel's state, held above both the trigger and the rail so the two cannot disagree." },
						{ name: "SidebarProvider contained", type: "boolean", default: "false", description: "Bounds the shell by its parent instead of the viewport. The panel is position: fixed by default — correct for a real shell, and the reason a demo of one has to opt out." },
						{ name: "Sidebar side", type: '"left" | "right"', default: '"left"', description: "Which edge the panel occupies." },
						{ name: "Sidebar variant", type: '"sidebar" | "floating" | "inset"', default: '"sidebar"', description: "Against the shell's edge, or detached from it so the panel reads as a card inside the page." },
						{ name: "Sidebar collapsible", type: '"offcanvas" | "icon" | "none"', default: '"offcanvas"', description: "How it gets out of the way: slid away entirely, reduced to a rail of glyphs, or pinned open. On a narrow viewport the panel becomes a sheet regardless." },
						{ name: "SidebarInset", type: "component", description: "The page beside the panel. Renders <main>, so it is the document's main landmark — not another div." },
						{ name: "SidebarTrigger / SidebarRail", type: "component", description: "The button that toggles the panel, and the drag edge along its border. Both read the provider, so either works from anywhere inside it." },
						{ name: "SidebarHeader / SidebarContent / SidebarFooter", type: "component", description: "Header and footer hold their edges while the content scrolls, so a long navigation never scrolls its own search box away." },
						{ name: "SidebarGroup / SidebarGroupLabel / SidebarGroupAction / SidebarGroupContent", type: "component", description: "A titled section of the panel, with an optional control on the label's line — an add, a filter." },
						{ name: "SidebarMenu / SidebarMenuItem / SidebarMenuButton", type: "component", description: "The rows. Renders a real <ul>/<li>, so the navigation announces as a list and its length is spoken." },
						{ name: "SidebarMenuButton active / size", type: 'boolean / "sm" | "md" | "lg"', description: "The current row, and the row's height. One of the four places a size prop survives, because a navigation row is not on the control ladder." },
						{ name: "SidebarMenuButton tooltip", type: "ReactNode", description: "The row's name beside it while the sidebar is collapsed to the icon rail, where the label is clipped away. Ignored while expanded and on phones." },
						{ name: "SidebarMenuAction / SidebarMenuBadge", type: "component", description: "A secondary control and a count on a row, positioned so neither displaces the label or steals its press target." },
						{ name: "SidebarMenuSub / SidebarMenuSubItem / SidebarMenuSubButton", type: "component", description: "A nested level under a row, indented against the parent's rail." },
						{ name: "SidebarMenuSkeleton showIcon", type: "boolean", description: "Reserves a row's exact box while navigation loads, so the panel does not reflow when it lands." },
						{ name: "useSidebar / useOptionalSidebar", type: "hook", description: "The panel\u2019s state from anywhere inside the provider. The optional form is for the parts a shell renders whether or not it HAS a sidebar \u2014 a header above a plain page still wants its breadcrumbs, and throwing there takes the page down over a toggle that has nothing to toggle." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
