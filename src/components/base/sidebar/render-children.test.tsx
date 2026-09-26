// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"

import { Sidebar, SidebarMenuButton, SidebarProvider } from "./index"

/* Kept beside the sidebar: importing its graph from the button suite timed out under load. */
it("keeps a render element's own content in SidebarMenuButton", () => {
	render(
		<SidebarProvider>
			<Sidebar>
				<SidebarMenuButton render={<a href="/x">Go</a>} />
			</Sidebar>
		</SidebarProvider>,
	)
	expect(screen.getByRole("link").textContent).toBe("Go")
})
