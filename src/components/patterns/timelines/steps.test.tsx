import { render, screen, within } from "@testing-library/react"
import { expect, it } from "vitest"

import { StepsBar, type Step } from "./steps"

const STEPS: Step[] = [
	{ id: "workspace", title: "Create your workspace", description: "Name it", status: "completed" },
	{ id: "team", title: "Invite your team", status: "current" },
	{ id: "publish", title: "Publish", status: "upcoming" },
]

it("draws the bar through Stepper, keeping its scroller and its numbering", () => {
	const { container } = render(<StepsBar steps={STEPS} data-testid="bar" />)

	const root = screen.getByTestId("bar")
	expect(root).toBe(container.firstChild)
	expect(root).toHaveClass("steps-bar--component")
	/* The scroller is reachable by keyboard, or an overflowing bar could not be scrolled. */
	expect(root).toHaveAttribute("tabindex", "0")

	const list = within(root).getByRole("list")
	expect(list).toHaveClass("stepper--component")
	expect(list).toHaveAttribute("data-variant", "bar")

	const [workspace, team, publish] = within(list).getAllByRole("listitem") as [HTMLElement, HTMLElement, HTMLElement]
	expect(workspace).toHaveAttribute("data-status", "completed")
	expect(workspace.querySelector(".stepper--label")).toHaveTextContent("Create your workspace")
	expect(workspace.querySelector(".stepper--hint")).toHaveTextContent("Name it")
	expect(team.querySelector(".stepper--marker")).toHaveTextContent("2")
	expect(team).toHaveAttribute("aria-current", "step")
	expect(publish).not.toHaveAttribute("aria-current")
	/* A static bar: nothing in it is a control. */
	expect(within(root).queryAllByRole("button")).toHaveLength(0)
})

it("says each step's position and state through its own strings", () => {
	render(
		<StepsBar
			steps={STEPS}
			strings={{ stepLabel: (index, total) => `Schritt ${index} von ${total}`, completed: "Erledigt" }}
		/>,
	)
	const [workspace, team] = screen.getAllByRole("listitem") as [HTMLElement, HTMLElement]

	expect(workspace).toHaveTextContent("Schritt 1 von 3 Create your workspace Name it Erledigt")
	/* `current` was not overridden, so the default fills in. */
	expect(team).toHaveTextContent("Schritt 2 von 3 Invite your team Current step")
})
