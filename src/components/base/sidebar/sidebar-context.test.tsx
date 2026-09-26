import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SidebarProvider } from "./sidebar-context"
import { useSidebar } from "./sidebar-store"

/** SidebarProvider: the mobile sheet's open state across a breakpoint change. */
let listeners: Array<() => void>

beforeEach(() => {
	listeners = []
	vi.stubGlobal("matchMedia", () => ({
		addEventListener: (_: string, fn: () => void) => listeners.push(fn),
		removeEventListener: (_: string, fn: () => void) => {
			listeners = listeners.filter((l) => l !== fn)
		},
	}))
	/* The provider persists its desktop open state; each test starts without one. */
	globalThis.localStorage?.clear()
})

const setWidth = (width: number) => {
	Object.defineProperty(window, "innerWidth", { value: width, configurable: true })
	act(() => listeners.forEach((fn) => fn()))
}

function Probe() {
	const { isMobile, openMobile, setOpenMobile } = useSidebar()
	return (
		<>
			<span data-testid="mobile">{String(isMobile)}</span>
			<span data-testid="open">{String(openMobile)}</span>
			<button type="button" onClick={() => setOpenMobile(true)}>
				open
			</button>
		</>
	)
}

const mount = () =>
	render(
		<SidebarProvider>
			<Probe />
		</SidebarProvider>,
	)

describe("SidebarProvider", () => {
	it("knows it is mobile on the first render, not after an effect", () => {
		// Records every render: `render` flushes effects, so a DOM assertion cannot see the first.
		Object.defineProperty(window, "innerWidth", { value: 400, configurable: true })
		const seen: boolean[] = []
		function Recorder() {
			seen.push(useSidebar().isMobile)
			return null
		}
		render(
			<SidebarProvider>
				<Recorder />
			</SidebarProvider>,
		)

		expect(seen[0]).toBe(true)
	})

	it("cannot leave an invisible sheet open when the viewport widens", () => {
		Object.defineProperty(window, "innerWidth", { value: 400, configurable: true })
		mount()
		act(() => screen.getByRole("button", { name: "open" }).click())
		expect(screen.getByTestId("open")).toHaveTextContent("true")

		/* Rotating a tablet, or dragging a desktop window wider. */
		setWidth(1200)
		expect(screen.getByTestId("open")).toHaveTextContent("false")
	})

	it("does not reopen the sheet when the viewport narrows again", () => {
		Object.defineProperty(window, "innerWidth", { value: 400, configurable: true })
		mount()
		act(() => screen.getByRole("button", { name: "open" }).click())
		setWidth(1200)
		setWidth(400)

		expect(screen.getByTestId("open")).toHaveTextContent("false")
	})
})

function State({ name }: { name: string }) {
	const { state } = useSidebar()
	return (
		<>
			<span data-testid={name}>{state}</span>
			<button type="button">focus {name}</button>
		</>
	)
}

describe("the ⌘B shortcut", () => {
	it("toggles only the sidebar around the focus, or the first one on the page", () => {
		setWidth(1440)
		render(
			<>
				<SidebarProvider persist={false}>
					<State name="shell" />
				</SidebarProvider>
				<SidebarProvider persist={false}>
					<State name="demo" />
				</SidebarProvider>
			</>,
		)

		screen.getByRole("button", { name: "focus demo" }).focus()
		fireEvent.keyDown(document.activeElement!, { key: "b", metaKey: true })
		expect(screen.getByTestId("demo")).toHaveTextContent("collapsed")
		expect(screen.getByTestId("shell")).toHaveTextContent("expanded")

		;(document.activeElement as HTMLElement).blur()
		fireEvent.keyDown(document.body, { key: "b", ctrlKey: true })
		expect(screen.getByTestId("shell")).toHaveTextContent("collapsed")
		expect(screen.getByTestId("demo")).toHaveTextContent("collapsed")
	})
})
