import { fireEvent, render, screen, within } from "@testing-library/react"
import { expect, it, vi } from "vitest"

import { BreadcrumbProgress, type BreadcrumbProgressStep } from "./breadcrumb-progress"

const STEPS: BreadcrumbProgressStep[] = [
	{ id: "account", label: "Account", hint: "Who you are" },
	{ id: "billing", label: "Billing" },
	{ id: "review", label: "Review" },
]

it("keeps its summary and draws the trail through Stepper", () => {
	const { container } = render(<BreadcrumbProgress steps={STEPS} currentIndex={1} />)

	const root = container.firstChild as HTMLElement
	expect(root).toHaveClass("breadcrumb-progress--component")
	expect(root).toHaveTextContent("Step 2 of 3")

	const list = within(root).getByRole("list")
	expect(list).toHaveClass("stepper--component")
	expect(list).toHaveAttribute("data-variant", "trail")

	const [account, billing, review] = within(list).getAllByRole("listitem") as [HTMLElement, HTMLElement, HTMLElement]
	expect(account).toHaveAttribute("data-status", "completed")
	expect(billing).toHaveAttribute("data-status", "current")
	expect(review).toHaveAttribute("data-status", "upcoming")
})

it("names each step through strings.step and marks the current one", () => {
	const onStepClick = vi.fn()
	render(
		<BreadcrumbProgress
			steps={STEPS}
			currentIndex={1}
			onStepClick={onStepClick}
			strings={{ step: (index, label) => `Schritt ${index}: ${label}` }}
		/>,
	)

	const account = screen.getByRole("button", { name: "Schritt 1: Account" })
	const billing = screen.getByRole("button", { name: "Schritt 2: Billing" })
	const review = screen.getByRole("button", { name: "Schritt 3: Review" })

	expect(billing).toHaveAttribute("aria-current", "step")
	expect(account).not.toHaveAttribute("aria-current")

	/* Backwards and in place only: a wizard does not let you skip ahead. */
	expect(review).toBeDisabled()
	fireEvent.click(review)
	fireEvent.click(account)
	fireEvent.click(billing)
	expect(onStepClick.mock.calls).toEqual([
		["account", 0],
		["billing", 1],
	])
})

it("falls back to the id for a label that is not text", () => {
	render(
		<BreadcrumbProgress
			steps={[{ id: "shipping", label: <strong>Shipping</strong> }]}
			currentIndex={0}
			onStepClick={() => {}}
		/>,
	)
	expect(screen.getByRole("button", { name: "Step 1: shipping" })).toHaveAttribute("aria-current", "step")
})

it("renders list items rather than disabled buttons when no step is reachable", () => {
	render(<BreadcrumbProgress steps={STEPS} currentIndex={1} />)

	expect(screen.queryAllByRole("button")).toHaveLength(0)
	const [, billing] = screen.getAllByRole("listitem") as [HTMLElement, HTMLElement]
	expect(billing).toHaveAttribute("aria-current", "step")
	/* The trail's own wording still names the step, at every width. */
	expect(billing).toHaveTextContent("Step 2: Billing")
})

it("says a finished step is done in its default name", () => {
	render(<BreadcrumbProgress steps={STEPS} currentIndex={1} onStepClick={() => {}} />)
	expect(screen.getByRole("button", { name: "Step 1: Account, completed" })).toBeInTheDocument()
	expect(screen.getByRole("button", { name: "Step 2: Billing" })).toHaveAttribute("aria-current", "step")
})
