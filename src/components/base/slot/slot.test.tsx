import { fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { Slot } from "./slot"

describe("Slot", () => {
	it("joins classes, runs both handlers, merges styles and composes refs", () => {
		const slotClick = vi.fn()
		const childClick = vi.fn()
		const slotRef = createRef<HTMLAnchorElement>()
		const childRef = createRef<HTMLAnchorElement>()
		render(
			<Slot
				ref={slotRef}
				className="from-slot"
				data-state="slot"
				style={{ color: "red", margin: 1 }}
				onClick={slotClick}
			>
				<a ref={childRef} href="/x" className="from-child" data-state="child" style={{ color: "blue" }} onClick={childClick}>
					Go
				</a>
			</Slot>,
		)
		const link = screen.getByRole("link", { name: "Go" })
		expect(link).toHaveClass("from-slot", "from-child")
		expect(link).toHaveAttribute("data-state", "child")
		expect(link.style.color).toBe("blue")
		expect(link.style.margin).toBe("1px")
		fireEvent.click(link)
		expect(childClick).toHaveBeenCalledOnce()
		expect(slotClick).toHaveBeenCalledOnce()
		expect(slotRef.current).toBe(link)
		expect(childRef.current).toBe(link)
	})
})
