import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SidebarProvider } from "@/components/base/sidebar"

import { AppSidebar } from "./app-sidebar"

/*
 * AppSidebar disclosure: expansion is derived from the URL, the reader can toggle any group,
 * and a navigation resets the toggles.
 */
const GROUPS = {
	"": [
		{ label: "Base", handle: "base", children: [{ label: "Button", href: "/components/button" }, { label: "Card", href: "/components/card" }] },
		{ label: "Features", handle: "features", children: [{ label: "Data table", href: "/components/data-table" }] },
	],
}

function renderSidebar(currentUrl: string) {
	return render(
		<SidebarProvider>
			<AppSidebar collapsible="none" navigationGroups={GROUPS} currentUrl={currentUrl} />
		</SidebarProvider>,
	)
}

describe("AppSidebar parent disclosure", () => {
	it("arrives with the group holding the current page open, and the others closed", () => {
		renderSidebar("/components/button")

		expect(screen.getByRole("button", { name: "Base" })).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByRole("link", { name: "Button" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Features" })).toHaveAttribute("aria-expanded", "false")
		expect(screen.queryByRole("link", { name: "Data table" })).toBeNull()
	})

	it("opens a closed group on click, and closes an open one", async () => {
		const user = userEvent.setup()
		renderSidebar("/components/button")

		await user.click(screen.getByRole("button", { name: "Features" }))
		expect(screen.getByRole("button", { name: "Features" })).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByRole("link", { name: "Data table" })).toBeInTheDocument()

		await user.click(screen.getByRole("button", { name: "Base" }))
		expect(screen.getByRole("button", { name: "Base" })).toHaveAttribute("aria-expanded", "false")
		expect(screen.queryByRole("link", { name: "Button" })).toBeNull()
	})

	it("forgets the reader's toggles when the current page changes", async () => {
		const user = userEvent.setup()
		const { rerender } = renderSidebar("/components/button")

		await user.click(screen.getByRole("button", { name: "Base" }))
		expect(screen.queryByRole("link", { name: "Button" })).toBeNull()

		rerender(
			<SidebarProvider>
				<AppSidebar collapsible="none" navigationGroups={GROUPS} currentUrl="/components/data-table" />
			</SidebarProvider>,
		)
		/* The new page's group is open; the group closed by hand is back to its derived state. */
		expect(screen.getByRole("button", { name: "Features" })).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByRole("button", { name: "Base" })).toHaveAttribute("aria-expanded", "false")
	})

	it("hands the effective expansion to renderItem", async () => {
		const user = userEvent.setup()
		render(
			<SidebarProvider>
				<AppSidebar
					collapsible="none"
					navigationGroups={GROUPS}
					currentUrl="/components/button"
					renderItem={(item, context) => (
						<button type="button" onClick={() => context.toggle?.()} aria-expanded={context.expanded}>
							{item.label}
						</button>
					)}
				/>
			</SidebarProvider>,
		)

		expect(screen.getByRole("button", { name: "Features" })).toHaveAttribute("aria-expanded", "false")
		await user.click(screen.getByRole("button", { name: "Features" }))
		expect(screen.getByRole("button", { name: "Features" })).toHaveAttribute("aria-expanded", "true")
	})
})
