import { useState } from "react"

import {
	Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarInset, SidebarMenu,
	SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "themelia-ui/base/sidebar"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

import { NAV } from "./data"

export default function SidebarControlled() {
	const [open, setOpen] = useState(true)

	return (
		<Stack gap="sm">
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
						<Stack gap="sm" style={{ padding: "var(--padding)" }}>
							<SidebarTrigger />
						</Stack>
					</SidebarInset>
				</SidebarProvider>
			</div>
		</Stack>
	)
}
