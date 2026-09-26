// @vitest-environment jsdom
import { createRef } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LoaderButton } from "./loader-button"

/* LoaderButton also shows busy for a React 19 form action (`<form action>`), not only its own promise. */
const deferred = () => {
	let resolve!: () => void
	const promise = new Promise<void>((r) => { resolve = r })
	return { promise, resolve }
}

describe("LoaderButton inside a React 19 form action", () => {
	it("goes busy while the action is in flight, and idle again after", async () => {
		const gate = deferred()
		const action = vi.fn(async () => { await gate.promise })

		render(
			<form action={action}>
				<LoaderButton type="submit">Save</LoaderButton>
			</form>,
		)

		const button = screen.getByRole("button", { name: /save/i })
		expect(button.getAttribute("aria-busy")).toBe(null)

		await userEvent.click(button)
		await waitFor(() => expect(button.getAttribute("aria-busy")).toBe("true"))
		expect(action).toHaveBeenCalled()

		gate.resolve()
		await waitFor(() => expect(button.getAttribute("aria-busy")).toBe(null))
	})

	it("an explicit `loading` still wins over the form", async () => {
		/* Controlled `loading={false}` wins. */
		const gate = deferred()
		render(
			<form action={async () => { await gate.promise }}>
				<LoaderButton type="submit" loading={false}>Save</LoaderButton>
			</form>,
		)
		const button = screen.getByRole("button", { name: /save/i })
		await userEvent.click(button)
		await new Promise((r) => setTimeout(r, 30))
		expect(button.getAttribute("aria-busy")).toBe(null)
		gate.resolve()
	})

	it("a non-submit button in the same form does not go busy", async () => {
		/* Form status belongs to the form: a non-submit button beside the submit stays idle. */
		const gate = deferred()
		render(
			<form action={async () => { await gate.promise }}>
				<LoaderButton type="submit">Save</LoaderButton>
				<LoaderButton type="button">Cancel</LoaderButton>
			</form>,
		)
		await userEvent.click(screen.getByRole("button", { name: /save/i }))
		await waitFor(() => expect(screen.getByRole("button", { name: /save/i }).getAttribute("aria-busy")).toBe("true"))
		expect(screen.getByRole("button", { name: /cancel/i }).getAttribute("aria-busy")).toBe(null)
		gate.resolve()
	})

	it("still works outside a form, from its own onClick promise", async () => {
		/* Outside a form, the onClick-promise contract still holds. */
		const gate = deferred()
		render(<LoaderButton onClick={() => gate.promise}>Run</LoaderButton>)
		const button = screen.getByRole("button", { name: /run/i })
		await userEvent.click(button)
		await waitFor(() => expect(button.getAttribute("aria-busy")).toBe("true"))
		gate.resolve()
		await waitFor(() => expect(button.getAttribute("aria-busy")).toBe(null))
	})
})

describe("LoaderButton's accessible name while busy", () => {
	it("keeps its name and announces separately", async () => {
		const gate = deferred()
		const ref = createRef<HTMLButtonElement>()
		render(<LoaderButton ref={ref} onClick={() => gate.promise} strings={{ loading: "Enregistrement…" }}>Save</LoaderButton>)

		const button = screen.getByRole("button", { name: "Save" })
		expect(ref.current).toBe(button)
		await userEvent.click(button)

		await waitFor(() => expect(button.getAttribute("aria-busy")).toBe("true"))
		// Exact matching catches loading copy accidentally included in the button name.
		expect(button).toHaveAccessibleName("Save")
		expect(screen.getByRole("button", { name: "Save" })).toBe(button)
		const announcement = screen.getByRole("status")
		expect(announcement).toHaveTextContent("Enregistrement…")
		expect(announcement.closest('[aria-busy="true"]')).toBeNull()
		expect(button).not.toContainElement(announcement)
		/* Unavailable without being natively disabled, which would blur the focused button. */
		expect(button).toHaveAttribute("aria-disabled", "true")

		gate.resolve()
		await waitFor(() => expect(button.getAttribute("aria-busy")).toBe(null))
		expect(screen.getByRole("status")).toBe(announcement)
		expect(announcement).toBeEmptyDOMElement()
		expect(button).toHaveAccessibleName("Save")
		expect(button).toBeEnabled()
		expect(ref.current).toBe(button)
	})

	it("keeps an empty live region mounted before controlled loading starts", () => {
		const { rerender } = render(<LoaderButton loading={false} aria-label="Create report">Create</LoaderButton>)
		const announcement = screen.getByRole("status")
		expect(announcement).toBeEmptyDOMElement()
		rerender(<LoaderButton loading aria-label="Create report">Create</LoaderButton>)
		expect(screen.getByRole("status")).toBe(announcement)
		expect(announcement).toHaveTextContent("Working…")
		expect(screen.getByRole("button", { name: "Create report" })).toHaveAttribute("aria-busy", "true")
		expect(announcement.closest('[aria-busy="true"]')).toBeNull()
	})
})
