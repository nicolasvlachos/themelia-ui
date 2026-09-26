import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Popover, PopoverTrigger } from "./popover"

/** PopoverTrigger infers `nativeButton`, so an `<a>` trigger never gets `type="button"`. */
describe("PopoverTrigger nativeButton inference", () => {
	it("does not force a button type onto an anchor", () => {
		render(
			<Popover>
				<PopoverTrigger render={<a href="/x">Open</a>} />
			</Popover>,
		)

		const trigger = screen.getByRole("button", { name: "Open" })
		expect(trigger.tagName).toBe("A")
		expect(trigger).not.toHaveAttribute("type")
		expect(trigger).toHaveAttribute("role", "button")
	})

	it("leaves a real button alone", () => {
		render(
			<Popover>
				<PopoverTrigger render={<button type="button">Open</button>} />
			</Popover>,
		)

		const trigger = screen.getByRole("button", { name: "Open" })
		expect(trigger.tagName).toBe("BUTTON")
		expect(trigger).not.toHaveAttribute("role")
	})

	it("honours an explicit nativeButton over the inference", () => {
		render(
			<Popover>
				<PopoverTrigger nativeButton={false} render={<span>Open</span>} />
			</Popover>,
		)

		expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("tabindex", "0")
	})
})
