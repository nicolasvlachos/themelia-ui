import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Stepper, type StepperStep } from "./stepper"

const STEPS: StepperStep[] = [
	{ id: "account", label: "Account", hint: "Who you are", status: "completed" },
	{ id: "billing", label: "Billing", status: "current" },
	{ id: "review", label: "Review", status: "upcoming" },
]

/* Every list in this file has three steps; the tuple says so to the type checker. */
const items = () =>
	within(screen.getByRole("list")).getAllByRole("listitem") as [HTMLElement, HTMLElement, HTMLElement]
const marker = (item: HTMLElement) => item.querySelector(".stepper--marker")

describe("Stepper", () => {
	it("renders an ordered list with a marker, a label and an optional hint per step", () => {
		render(<Stepper steps={STEPS} />)

		const list = screen.getByRole("list")
		expect(list.tagName).toBe("OL")
		expect(list).toHaveClass("stepper--component")
		expect(list).toHaveAttribute("data-variant", "bar")

		const [account, billing, review] = items()
		expect(items()).toHaveLength(3)

		/* A tick once the step is done, the numeral until then. */
		expect(marker(account)?.querySelector("svg")).not.toBeNull()
		expect(marker(billing)).toHaveTextContent("2")
		expect(marker(review)).toHaveTextContent("3")

		expect(account.querySelector(".stepper--label")).toHaveTextContent("Account")
		expect(account.querySelector(".stepper--hint")).toHaveTextContent("Who you are")
		expect(billing.querySelector(".stepper--hint")).toBeNull()

		/* The rail is decoration: the numeral and the tick are said in words instead. */
		expect(marker(account)?.closest("[aria-hidden='true']")).not.toBeNull()
	})

	it("draws two half-connectors per step in the bar, filled by the step they leave", () => {
		const { container } = render(<Stepper steps={STEPS} />)
		const [account, billing, review] = items()
		const halves = (item: HTMLElement) => item.querySelectorAll("[aria-hidden='true'] > span:not(.stepper--marker)")

		expect(halves(account)).toHaveLength(2)
		/* The first step's leading half and the last step's trailing half connect nothing. */
		expect(halves(account)[0]).toHaveAttribute("data-hidden")
		expect(halves(review)[1]).toHaveAttribute("data-hidden")
		/* Account is done, so the stretch out of it — on both sides of the seam — is travelled. */
		expect(halves(account)[1]).toHaveAttribute("data-filled")
		expect(halves(billing)[0]).toHaveAttribute("data-filled")
		expect(halves(billing)[1]).not.toHaveAttribute("data-filled")
		expect(container.querySelectorAll("li > [aria-hidden='true']")).toHaveLength(0)
	})

	it("draws one rule between steps in the trail, and none after the last", () => {
		render(<Stepper variant="trail" steps={STEPS} />)
		const [account, billing, review] = items()
		const rule = (item: HTMLElement) => item.querySelector(":scope > [aria-hidden='true']")

		expect(rule(account)).toHaveAttribute("data-filled")
		expect(rule(billing)).not.toHaveAttribute("data-filled")
		expect(rule(review)).toBeNull()
	})

	it("marks only the current step with aria-current", () => {
		render(<Stepper steps={STEPS} />)
		const [account, billing, review] = items()

		expect(billing).toHaveAttribute("aria-current", "step")
		expect(account).not.toHaveAttribute("aria-current")
		expect(review).not.toHaveAttribute("aria-current")
	})

	it("says the position and the state in words, not only in colour", () => {
		render(<Stepper steps={STEPS} />)
		const [account, billing, review] = items()

		expect(account).toHaveTextContent("Step 1 of 3 Account Who you are Completed")
		expect(billing).toHaveTextContent("Step 2 of 3 Billing Current step")
		/* Upcoming is an absence; there is nothing to announce beyond the position. */
		expect(review).toHaveTextContent(/^3Step 3 of 3 Review$/)
	})

	it("takes its copy from strings", () => {
		render(
			<Stepper
				steps={STEPS}
				strings={{ position: (index, total) => `Étape ${index} sur ${total}`, completed: "Terminé" }}
			/>,
		)
		const [account, billing] = items()

		expect(account).toHaveTextContent("Étape 1 sur 3 Account Who you are Terminé")
		/* A partial override keeps the keys it did not name. */
		expect(billing).toHaveTextContent("Current step")
	})

	it("accepts both `completed` and `complete` as the same state", () => {
		render(
			<Stepper
				steps={[
					{ id: "a", label: "Canonical", status: "completed" },
					{ id: "b", label: "Alias", status: "complete" },
					{ id: "c", label: "Unset" },
				]}
			/>,
		)
		const [canonical, alias, unset] = items()

		for (const item of [canonical, alias]) {
			/* Normalised on the way in: the DOM only ever says one word. */
			expect(item).toHaveAttribute("data-status", "completed")
			expect(marker(item)?.querySelector("svg")).not.toBeNull()
			expect(item).toHaveTextContent(/Completed$/)
		}
		expect(unset).toHaveAttribute("data-status", "upcoming")
	})

	it("makes completed and current steps pressable, and upcoming ones unreachable", () => {
		const onStepClick = vi.fn()
		render(<Stepper steps={STEPS} onStepClick={onStepClick} />)

		const account = screen.getByRole("button", { name: "Step 1 of 3 Account Who you are Completed" })
		const billing = screen.getByRole("button", { name: "Step 2 of 3 Billing Current step" })
		const review = screen.getByRole("button", { name: "Step 3 of 3 Review" })

		/* On the button, which is what focus lands on — not on the item around it. */
		expect(billing).toHaveAttribute("aria-current", "step")
		expect(items()[1]).not.toHaveAttribute("aria-current")

		expect(review).toBeDisabled()
		fireEvent.click(review)
		expect(onStepClick).not.toHaveBeenCalled()

		fireEvent.click(account)
		fireEvent.click(billing)
		expect(onStepClick.mock.calls).toEqual([
			["account", 0],
			["billing", 1],
		])
	})

	it("renders plain list items, not disabled buttons, when nothing is pressable", () => {
		render(<Stepper steps={STEPS} />)
		expect(screen.queryAllByRole("button")).toHaveLength(0)
	})

	it("lets a caller word a step's whole accessible name", () => {
		render(
			<Stepper
				variant="trail"
				onStepClick={() => {}}
				steps={[
					{ id: "a", label: "Account", hint: "Who you are", status: "completed", accessibleName: "Step 1: Account" },
					{ id: "b", label: "Billing", status: "current", accessibleName: "Step 2: Billing" },
				]}
			/>,
		)

		/* The caller's name replaces position, label, hint and state — nothing is said twice. */
		expect(screen.getByRole("button", { name: "Step 1: Account" })).toBeEnabled()
		expect(screen.getByRole("button", { name: "Step 2: Billing" })).toHaveAttribute("aria-current", "step")
	})
})
