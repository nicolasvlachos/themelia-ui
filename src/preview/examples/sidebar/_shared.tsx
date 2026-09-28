import { BellIcon, PlusIcon, SettingsIcon } from "lucide-react"

import {
	Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction,
	SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset,
	SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem,
	SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
	SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger,
	type SidebarCollapsible, type SidebarVariant,
} from "themelia-ui/base/sidebar"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

import { NAV } from "./data"

/** One panel, so each example differs only by the prop it is demonstrating. */
export function Panel({
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
					<Stack gap="sm" style={{ padding: "var(--padding)" }}>
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
