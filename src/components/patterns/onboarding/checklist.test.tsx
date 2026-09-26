import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { Checklist } from "./checklist"
import type { ChecklistStep } from "./checklist"

/** Checklist: which step opens, including steps that arrive after mount, and when it stops choosing. */
const STEPS: ChecklistStep[] = [
	{ id: "a", title: "Connect", status: "completed" },
	{ id: "b", title: "Invite", status: "pending" },
	{ id: "c", title: "Publish", status: "pending" },
]

const isOpen = (title: string) =>
	screen.getByRole("button", { name: new RegExp(title) }).getAttribute("aria-expanded") === "true"

describe("Checklist", () => {
	it("opens the first unfinished step", () => {
		render(<Checklist steps={STEPS} />)

		expect(isOpen("Invite")).toBe(true)
		expect(isOpen("Publish")).toBe(false)
	})

	it("opens the next step when steps arrive after mount", async () => {
		/* Nothing to choose from on the first render. */
		function Late() {
			const [steps, setSteps] = useState<ChecklistStep[]>([])
			return (
				<>
					<button type="button" onClick={() => setSteps(STEPS)}>
						load
					</button>
					<Checklist steps={steps} />
				</>
			)
		}
		const user = userEvent.setup()
		render(<Late />)

		await user.click(screen.getByRole("button", { name: "load" }))

		expect(isOpen("Invite")).toBe(true)
	})

	it("stops choosing once the reader has touched it", async () => {
		const user = userEvent.setup()
		render(<Checklist steps={STEPS} />)

		/* Closing the step it opened must keep it closed. */
		await user.click(screen.getByRole("button", { name: /Invite/ }))

		expect(isOpen("Invite")).toBe(false)
		expect(isOpen("Publish")).toBe(false)
	})

	it("honours an explicit defaultExpanded instead of choosing", () => {
		render(<Checklist steps={STEPS} defaultExpanded={["c"]} />)

		expect(isOpen("Publish")).toBe(true)
		expect(isOpen("Invite")).toBe(false)
	})

	it("never chooses when controlled", () => {
		render(<Checklist steps={STEPS} expanded={[]} onExpandedChange={() => {}} />)

		expect(isOpen("Invite")).toBe(false)
	})

	it("reports the transition into open, and not the step that started open", async () => {
		/* The step open at mount is not an event; only a step the reader opens is. */
		const onStepOpen = vi.fn()
		const user = userEvent.setup()
		const { rerender } = render(<Checklist steps={STEPS} onStepOpen={onStepOpen} />)

		rerender(<Checklist steps={STEPS} onStepOpen={onStepOpen} />)
		expect(onStepOpen, "the initially open step is not an event").not.toHaveBeenCalled()

		await user.click(screen.getByRole("button", { name: /Publish/ }))

		expect(onStepOpen).toHaveBeenCalledWith("c")
	})
})
