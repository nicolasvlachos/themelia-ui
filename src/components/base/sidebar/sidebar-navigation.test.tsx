import { fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SidebarProvider } from "./sidebar-context"
import { Sidebar, SidebarMenuButton, SidebarMenuSubButton, SidebarTrigger } from "./sidebar"
import { useSidebar } from "./sidebar-store"

function MobileState() {
	const { openMobile, setOpenMobile } = useSidebar()
	return (
		<>
			<button type="button" onClick={() => setOpenMobile(true)}>Open navigation</button>
			<output aria-label="Mobile navigation">{openMobile ? "open" : "closed"}</output>
		</>
	)
}

const nativeShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal")

beforeEach(() => {
	Object.defineProperty(window, "innerWidth", { value: 400, configurable: true })
	vi.stubGlobal("matchMedia", () => ({ addEventListener() {}, removeEventListener() {} }))
	// jsdom has no dialog top layer. Expose the real sheet DOM for its ARIA assertions.
	Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
		configurable: true,
		value(this: HTMLDialogElement) { this.open = true },
	})
})

afterEach(() => {
	vi.unstubAllGlobals()
	if (nativeShowModal) Object.defineProperty(HTMLDialogElement.prototype, "showModal", nativeShowModal)
	else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal")
})

it("focuses the mobile sidebar trigger when a pointer click does not focus it natively", () => {
	const onClick = vi.fn()
	const ref = createRef<HTMLButtonElement>()
	render(
		<SidebarProvider persist={false}>
			<MobileState />
			<SidebarTrigger ref={ref} onClick={onClick} />
		</SidebarProvider>,
	)
	const trigger = screen.getByRole("button", { name: "Toggle navigation" })
	fireEvent.click(trigger)
	expect(trigger).toHaveFocus()
	expect(screen.getByLabelText("Mobile navigation")).toHaveTextContent("open")
	expect(onClick).toHaveBeenCalledOnce()
	expect(ref.current).toBe(trigger)
})

it("lets the sidebar trigger callback prevent opening and focus changes", () => {
	render(
		<SidebarProvider persist={false}>
			<input aria-label="Previous focus" />
			<MobileState />
			<SidebarTrigger onClick={(event) => event.preventDefault()} />
		</SidebarProvider>,
	)
	const previous = screen.getByRole("textbox", { name: "Previous focus" })
	previous.focus()
	fireEvent.click(screen.getByRole("button", { name: "Toggle navigation" }))
	expect(screen.getByLabelText("Mobile navigation")).toHaveTextContent("closed")
	expect(previous).toHaveFocus()
})

it("names and describes the mobile sheet with the sidebar's localized strings", () => {
	render(
		<SidebarProvider persist={false} strings={{ mobileTitle: "Account navigation", mobileDescription: "Browse your account." }}>
			<MobileState />
			<Sidebar strings={{ mobileTitle: "Project navigation", mobileDescription: "Browse the current project." }}>
				<SidebarMenuButton>Billing</SidebarMenuButton>
			</Sidebar>
		</SidebarProvider>,
	)
	fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
	const dialog = screen.getByRole("dialog")
	expect(dialog).toHaveAccessibleName("Project navigation")
	expect(dialog).toHaveAccessibleDescription("Browse the current project.")
})

it("inherits the provider's translated mobile title and description", () => {
	render(
		<SidebarProvider persist={false} strings={{ mobileTitle: "Navigation du projet", mobileDescription: "Parcourir le projet." }}>
			<MobileState />
			<Sidebar />
		</SidebarProvider>,
	)
	fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
	const dialog = screen.getByRole("dialog")
	expect(dialog).toHaveAccessibleName("Navigation du projet")
	expect(dialog).toHaveAccessibleDescription("Parcourir le projet.")
})

it("uses explicit mobile title and description in preference to localized defaults", () => {
	render(
		<SidebarProvider persist={false}>
			<MobileState />
			<Sidebar
				mobileTitle="Account navigation"
				mobileDescription="Browse your account."
				strings={{ mobileTitle: "Project navigation", mobileDescription: "Browse the current project." }}
			/>
		</SidebarProvider>,
	)
	fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
	const dialog = screen.getByRole("dialog")
	expect(dialog).toHaveAccessibleName("Account navigation")
	expect(dialog).toHaveAccessibleDescription("Browse your account.")
})

it("preserves an explicit aria-label on the mobile sheet", () => {
	render(
		<SidebarProvider persist={false}>
			<MobileState />
			<Sidebar aria-label="Quick navigation" mobileTitle="Account navigation" />
		</SidebarProvider>,
	)
	fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
	expect(screen.getByRole("dialog")).toHaveAccessibleName("Quick navigation")
})

it("preserves explicit label and description references on the mobile sheet", () => {
	render(
		<SidebarProvider persist={false}>
			<MobileState />
			<Sidebar aria-label="Quick navigation" aria-labelledby="custom-title" aria-describedby="custom-description">
				<h2 id="custom-title">Project shortcuts</h2>
				<p id="custom-description">Choose a project area.</p>
			</Sidebar>
		</SidebarProvider>,
	)
	fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
	const dialog = screen.getByRole("dialog")
	expect(dialog).toHaveAccessibleName("Project shortcuts")
	expect(dialog).toHaveAccessibleDescription("Choose a project area.")
})

it("does not submit a surrounding form from a native SidebarMenuButton", () => {
	const selected = vi.fn()
	const submitted = vi.fn((event) => event.preventDefault())
	render(
		<SidebarProvider persist={false}>
			<form onSubmit={submitted}>
				<SidebarMenuButton onClick={selected}>Billing</SidebarMenuButton>
			</form>
		</SidebarProvider>,
	)
	fireEvent.click(screen.getByRole("button", { name: "Billing" }))
	expect(selected).toHaveBeenCalledOnce()
	expect(submitted).not.toHaveBeenCalled()
})

describe.each([
	["SidebarMenuButton", SidebarMenuButton],
	["SidebarMenuSubButton", SidebarMenuSubButton],
] as const)("%s link composition", (_name, MenuButton) => {
	it("runs router and row callbacks and closes mobile navigation after a prevented native navigation", () => {
		const selected = vi.fn()
		const routed = vi.fn()
		render(
			<SidebarProvider persist={false}>
				<MobileState />
				<MenuButton
					onClick={selected}
					className="consumer-row"
					render={<a href="/billing" className="router-link" onClick={(event) => {
						event.preventDefault()
						routed()
					}}>Original</a>}
				>
					Billing
				</MenuButton>
			</SidebarProvider>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
		expect(screen.getByLabelText("Mobile navigation")).toHaveTextContent("open")
		const link = screen.getByRole("link", { name: "Billing" })
		fireEvent.click(link)
		expect(routed).toHaveBeenCalledOnce()
		expect(selected).toHaveBeenCalledOnce()
		expect(screen.getByLabelText("Mobile navigation")).toHaveTextContent("closed")
		expect(link).toHaveClass("consumer-row", "router-link")
	})

	it("keeps the mobile navigation open when closeOnSelectMobile is false", () => {
		render(
			<SidebarProvider persist={false}>
				<MobileState />
				<MenuButton closeOnSelectMobile={false} render={<a href="/billing" onClick={(event) => event.preventDefault()} />}>
					Billing
				</MenuButton>
			</SidebarProvider>,
		)
		fireEvent.click(screen.getByRole("button", { name: "Open navigation" }))
		fireEvent.click(screen.getByRole("link", { name: "Billing" }))
		expect(screen.getByLabelText("Mobile navigation")).toHaveTextContent("open")
	})
})
