import { createRef } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "@/components/base/buttons"
import { Overlay, OverlayTrigger } from "./overlay"

describe("OverlayTrigger focus before opening", () => {
	it("focuses a pointer-activated trigger before notifying the dialog to open", () => {
		let activeWhenOpening: Element | null = null
		render(
			<Overlay onOpenChange={() => { activeWhenOpening = document.activeElement }}>
				<OverlayTrigger>Open details</OverlayTrigger>
			</Overlay>,
		)
		const trigger = screen.getByRole("button", { name: "Open details" })
		// A click dispatched without preceding focus reproduces Safari pointer activation.
		fireEvent.click(trigger)
		expect(activeWhenOpening).toBe(trigger)
	})

	it("composes rendered and wrapper callbacks and refs before opening", () => {
		const wrapperRef = createRef<HTMLButtonElement>()
		const childRef = createRef<HTMLButtonElement>()
		const events: string[] = []
		let activeWhenOpening: Element | null = null
		render(
			<Overlay onOpenChange={() => { events.push("open"); activeWhenOpening = document.activeElement }}>
				<OverlayTrigger
					ref={wrapperRef}
					onClick={() => events.push("wrapper")}
					render={<Button ref={childRef} onClick={() => events.push("child")} />}
				>
					Open details
				</OverlayTrigger>
			</Overlay>,
		)
		const trigger = screen.getByRole("button", { name: "Open details" })
		fireEvent.click(trigger)
		expect(events).toEqual(["child", "wrapper", "open"])
		expect(activeWhenOpening).toBe(trigger)
		expect(wrapperRef.current).toBe(trigger)
		expect(childRef.current).toBe(trigger)
	})

	it.each(["wrapper", "rendered"])("honors preventDefault from the %s callback without moving focus", (source) => {
		const onOpenChange = vi.fn()
		const prevent = (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault()
		render(
			<Overlay onOpenChange={onOpenChange}>
				<input aria-label="Previous focus" />
				<OverlayTrigger
					onClick={source === "wrapper" ? prevent : undefined}
					render={<Button onClick={source === "rendered" ? prevent : undefined} />}
				>
					Open details
				</OverlayTrigger>
			</Overlay>,
		)
		const previous = screen.getByRole("textbox", { name: "Previous focus" })
		previous.focus()
		fireEvent.click(screen.getByRole("button", { name: "Open details" }))
		expect(onOpenChange).not.toHaveBeenCalled()
		expect(previous).toHaveFocus()
	})
})
