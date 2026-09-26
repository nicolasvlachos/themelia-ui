import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { WorkspaceNav } from "./workspace-nav"

describe("WorkspaceNav navigation", () => {
	it("makes onSelect rows keyboard-operable buttons without submitting a surrounding form", async () => {
		const user = userEvent.setup()
		const selected = vi.fn()
		const submitted = vi.fn((event) => event.preventDefault())
		const item = { id: "billing", label: "Billing" }
		render(
			<form onSubmit={submitted}>
				<WorkspaceNav groups={[{ id: "settings", items: [item] }]} onSelect={selected} />
			</form>,
		)
		const button = screen.getByRole("button", { name: "Billing" })
		expect(button.closest('[role="listitem"]')).toBeInTheDocument()
		await user.tab()
		expect(button).toHaveFocus()
		await user.keyboard("{Enter}")
		expect(selected).toHaveBeenCalledExactlyOnceWith(item)
		expect(submitted).not.toHaveBeenCalled()
	})

	it("renders href rows as links and marks the active destination", () => {
		render(<WorkspaceNav activeId="billing" groups={[{ id: "settings", items: [{ id: "billing", label: "Billing", href: "/billing" }] }]} />)
		const link = screen.getByRole("link", { name: /Billing/ })
		expect(link).toHaveAttribute("href", "/billing")
		expect(link).toHaveAttribute("aria-current", "page")
		expect(link.closest('[role="listitem"]')).toBeInTheDocument()
	})

	it("uses the router adapter without losing row selection when navigation prevents the default", () => {
		const selected = vi.fn()
		const routed = vi.fn()
		const item = { id: "billing", label: "Billing", href: "/billing" }
		render(
			<WorkspaceNav
				groups={[{ id: "settings", items: [item] }]}
				onSelect={selected}
				renderLink={({ href, children }) => <a href={href} data-router-link onClick={(event) => {
					event.preventDefault()
					routed(href)
				}}>{children}</a>}
			/>,
		)
		const link = screen.getByRole("link", { name: "Billing" })
		expect(link).toHaveAttribute("data-router-link")
		fireEvent.click(link)
		expect(routed).toHaveBeenCalledExactlyOnceWith("/billing")
		expect(selected).toHaveBeenCalledExactlyOnceWith(item)
	})

	it.each([{ disabled: true }, { status: "disabled" as const }])("prevents selection and routing of a disabled entry (%j)", async (disabledProps) => {
		const user = userEvent.setup()
		const selected = vi.fn()
		const routed = vi.fn()
		render(
			<WorkspaceNav
				groups={[{ id: "settings", items: [{ id: "billing", label: "Billing", href: "/billing", ...disabledProps }] }]}
				onSelect={selected}
				renderLink={({ href, children }) => <a href={href} onClick={routed}>{children}</a>}
			/>,
		)
		expect(screen.queryByRole("link")).not.toBeInTheDocument()
		expect(screen.getByRole("listitem")).toHaveAttribute("aria-disabled", "true")
		await user.click(screen.getByText("Billing"))
		expect(selected).not.toHaveBeenCalled()
		expect(routed).not.toHaveBeenCalled()
	})

	it("keeps rows without href or onSelect noninteractive", () => {
		render(<WorkspaceNav groups={[{ id: "settings", items: [{ id: "billing", label: "Billing" }] }]} />)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
		expect(screen.queryByRole("link")).not.toBeInTheDocument()
		expect(screen.getByRole("listitem")).toHaveTextContent("Billing")
	})
})
