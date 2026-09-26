import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "./button"

/**
 * The polymorphic contract (docs/adr/0005): `render` takes the element as a value and
 * `children` stays the content, so the label wrapper still applies.
 */
describe("Button polymorphism", () => {
	it("renders a button by default, with type=button", () => {
		render(<Button>Save</Button>)

		const button = screen.getByRole("button", { name: "Save" })
		expect(button.tagName).toBe("BUTTON")
		expect(button).toHaveAttribute("type", "button")
	})

	it("becomes the element given to `render`, keeping the children as content", () => {
		render(<Button render={<a href="/settings" />}>Settings</Button>)

		const link = screen.getByRole("link", { name: "Settings" })
		expect(link.tagName).toBe("A")
		expect(link).toHaveAttribute("href", "/settings")
		/* A button's attributes come with it. */
		expect(link).toHaveAttribute("data-slot", "button")
		expect(link).toHaveClass("button--component")
		/* And `type` is not forced onto an anchor. */
		expect(link).not.toHaveAttribute("type")
	})

	it("keeps the label wrapper under `render`", () => {
		/* The label span gives a loading button a stable width, so a polymorphic button keeps it. */
		const { container } = render(<Button render={<a href="/x" />}>Go</Button>)
		expect(container.querySelector("a > span")).not.toBeNull()
	})

	it("keeps a render element's own content when the button has none", () => {
		/* A finished element with its own children comes through untouched. */
		render(<Button render={<a href="/x">Complete</a>} />)

		const link = screen.getByRole("link", { name: "Complete" })
		expect(link).toHaveAttribute("data-slot", "button")
		expect(link).toHaveTextContent("Complete")
	})

	it("carries tone and style onto the rendered element", () => {
		render(
			<Button render={<a href="/x" />} tone="destructive">
				Delete
			</Button>,
		)

		expect(screen.getByRole("link", { name: "Delete" })).toHaveAttribute("data-tone", "destructive")
	})

	it("marks a loading button busy in every shape", () => {
		const { rerender } = render(<Button loading>Save</Button>)
		expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true")

		rerender(
			<Button render={<a href="/x" />} loading>
				Save
			</Button>,
		)
		expect(screen.getByRole("link")).toHaveAttribute("aria-busy", "true")
	})

	it("keeps keyboard focus and blocks the action while loading", () => {
		const onClick = vi.fn()
		const { rerender } = render(<Button onClick={onClick}>Save</Button>)
		const button = screen.getByRole("button", { name: "Save" })
		button.focus()
		rerender(<Button onClick={onClick} loading>Save</Button>)
		expect(button).toHaveFocus()
		expect(button).not.toBeDisabled()
		expect(button).toHaveAttribute("aria-disabled", "true")
		fireEvent.click(button)
		expect(onClick).not.toHaveBeenCalled()
		rerender(<Button onClick={onClick}>Save</Button>)
		fireEvent.click(button)
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it("blocks a disabled button rendered as a link", () => {
		const onClick = vi.fn()
		render(<Button render={<a href="/x" />} disabled onClick={onClick}>Delete</Button>)
		const link = screen.getByRole("link", { name: "Delete" })
		expect(link).toHaveAttribute("aria-disabled", "true")
		fireEvent.click(link)
		expect(onClick).not.toHaveBeenCalled()
	})
})
