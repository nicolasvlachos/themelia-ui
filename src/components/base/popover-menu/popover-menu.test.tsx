import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { PopoverMenu, PopoverMenuPanel } from "./popover-menu"
import type { PopoverMenuItem } from "./popover-menu.types"

/* PopoverMenu tests. cmdk needs ResizeObserver and scrollIntoView, which jsdom lacks; stubbed locally. */
beforeAll(() => {
	if (!("ResizeObserver" in globalThis)) {
		Object.assign(globalThis, {
			ResizeObserver: class {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		})
	}
	if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}
})

const PEOPLE: PopoverMenuItem[] = [
	{ value: "jane", label: "Jane McDonald" },
	{ value: "raj", label: "Raj Patel" },
	{ value: "mei", label: "Mei Chen" },
]

describe("PopoverMenuPanel error", () => {
	it("stands in for the rows and the empty state, and retries", () => {
		const onRetry = vi.fn()
		render(<PopoverMenuPanel items={PEOPLE} onSelect={vi.fn()} error onRetry={onRetry} />)

		expect(screen.getByRole("alert")).toHaveTextContent("Could not load results.")
		expect(screen.queryByRole("option")).not.toBeInTheDocument()
		expect(screen.queryByText("No results.")).not.toBeInTheDocument()

		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(onRetry).toHaveBeenCalledOnce()
	})

	it("takes a node as its message, and offers no retry nobody wired", () => {
		render(<PopoverMenuPanel items={[]} onSelect={vi.fn()} error="The directory is offline." />)

		expect(screen.getByRole("alert")).toHaveTextContent("The directory is offline.")
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("gives way to loading, which is the retry answering it", () => {
		render(<PopoverMenuPanel items={[]} onSelect={vi.fn()} error loading />)

		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		expect(screen.getByText("Loading…")).toBeInTheDocument()
	})

	it("reads its copy from strings", () => {
		render(
			<PopoverMenuPanel
				items={[]}
				onSelect={vi.fn()}
				error
				onRetry={vi.fn()}
				strings={{ error: "Laden fehlgeschlagen.", retry: "Erneut versuchen" }}
			/>,
		)

		expect(screen.getByRole("alert")).toHaveTextContent("Laden fehlgeschlagen.")
		expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeInTheDocument()
	})
})

describe("PopoverMenuPanel minSearchLength", () => {
	it("keeps an empty field browsable and holds a short query back, trimmed", () => {
		const view = (searchValue: string) => (
			<PopoverMenuPanel
				items={PEOPLE}
				onSelect={vi.fn()}
				searchValue={searchValue}
				onSearchChange={vi.fn()}
				minSearchLength={3}
			/>
		)
		const { rerender } = render(view(""))
		expect(screen.getAllByRole("option")).toHaveLength(3)

		rerender(view("  ja  "))
		expect(screen.getByRole("status")).toHaveTextContent("Type at least 3 characters to search…")
		expect(screen.queryByRole("option")).not.toBeInTheDocument()
		expect(screen.queryByText("No results.")).not.toBeInTheDocument()

		/* The caller filters a controlled search, so its items come back untouched. */
		rerender(view("jan"))
		expect(screen.queryByRole("status")).not.toBeInTheDocument()
		expect(screen.getAllByRole("option")).toHaveLength(3)
	})

	it("measures an uncontrolled field too, without switching off the local matcher", async () => {
		const user = userEvent.setup()
		render(
			<PopoverMenuPanel
				items={PEOPLE}
				onSelect={vi.fn()}
				minSearchLength={2}
				strings={{ formatTypeToSearch: (minimum) => `Mindestens ${minimum} Zeichen` }}
			/>,
		)

		await user.type(screen.getByRole("combobox"), "m")
		expect(screen.getByRole("status")).toHaveTextContent("Mindestens 2 Zeichen")

		await user.type(screen.getByRole("combobox"), "e")
		expect(screen.queryByRole("status")).not.toBeInTheDocument()
		expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Mei Chen"])
	})
})

describe("PopoverMenuPanel keyboard", () => {
	// cmdk's root prevents Enter anywhere inside it; a band's button must keep its default action.
	it("leaves Enter to a button in a band or on the retry control", () => {
		const onSelect = vi.fn()
		const { rerender } = render(
			<PopoverMenuPanel items={PEOPLE} onSelect={onSelect} footer={<button type="button">Apply</button>} />,
		)
		expect(fireEvent.keyDown(screen.getByRole("button", { name: "Apply" }), { key: "Enter" })).toBe(true)

		rerender(<PopoverMenuPanel items={PEOPLE} onSelect={onSelect} error onRetry={vi.fn()} />)
		expect(fireEvent.keyDown(screen.getByRole("button", { name: "Try again" }), { key: "Enter" })).toBe(true)

		expect(onSelect).not.toHaveBeenCalled()
	})

	it("is a tab stop the arrows and Enter work on when there is no field", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		render(<PopoverMenuPanel items={PEOPLE} onSelect={onSelect} search={false} />)

		await user.tab()
		await user.keyboard("{ArrowDown}{Enter}")
		expect(onSelect).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ value: "raj" }))
	})

	it("puts focus on a named listbox that points at the highlighted row", async () => {
		const user = userEvent.setup()
		render(<PopoverMenuPanel items={PEOPLE} onSelect={vi.fn()} search={false} label="Owner" />)

		await user.tab()
		const list = screen.getByRole("listbox", { name: "Owner" })
		expect(list).toHaveFocus()
		await user.keyboard("{ArrowDown}")
		expect(list).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Raj Patel" }).id)
	})
})

describe("PopoverMenuPanel scrolling", () => {
	// cmdk's scrollIntoView would scroll the page, not just the list.
	it("keeps cmdk's reveal inside the list", async () => {
		const pageScroll = vi.spyOn(Element.prototype, "scrollIntoView")
		const user = userEvent.setup()
		render(<PopoverMenuPanel items={PEOPLE} onSelect={vi.fn()} search={false} />)
		await user.tab()
		await user.keyboard("{ArrowDown}{ArrowDown}")
		expect(screen.getByRole("option", { name: "Mei Chen" })).toHaveAttribute("data-selected", "true")
		expect(pageScroll).not.toHaveBeenCalled()
		pageScroll.mockRestore()
	})
})

describe("PopoverMenu", () => {
	const trigger = <button type="button">Owner</button>

	it("hands the new states through to its panel", () => {
		render(
			<PopoverMenu open onOpenChange={vi.fn()} trigger={trigger} items={[]} onSelect={vi.fn()} error onRetry={vi.fn()} />,
		)

		expect(screen.getByRole("alert")).toHaveTextContent("Could not load results.")
		expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
	})

	it("closes on a pick unless a footer holds the multi-pick actions", () => {
		const onOpenChange = vi.fn()
		const onSelect = vi.fn()
		const { rerender } = render(
			<PopoverMenu open onOpenChange={onOpenChange} trigger={trigger} items={PEOPLE} onSelect={onSelect} />,
		)
		fireEvent.click(screen.getByRole("option", { name: "Raj Patel" }))
		expect(onSelect).toHaveBeenCalledWith(PEOPLE[1])
		expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false)

		onOpenChange.mockClear()
		rerender(
			<PopoverMenu
				open
				onOpenChange={onOpenChange}
				trigger={trigger}
				items={PEOPLE}
				onSelect={onSelect}
				footer={<button type="button">Apply</button>}
			/>,
		)
		fireEvent.click(screen.getByRole("option", { name: "Mei Chen" }))
		expect(onOpenChange).not.toHaveBeenCalled()
	})
})
