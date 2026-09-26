import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { OtpInput } from "./otp-input"

/** OtpInput names every box; the first (the field itself) takes its name via `aria-labelledby`. */
describe("OtpInput", () => {
	it("names the field on the first box and the position on the rest", () => {
		render(<OtpInput length={4} />)

		expect(screen.getByLabelText("One-time code")).toBeInTheDocument()
		expect(screen.getByLabelText("Character 2 of 4")).toBeInTheDocument()
		expect(screen.getByLabelText("Character 4 of 4")).toBeInTheDocument()
		expect(screen.getAllByRole("textbox")).toHaveLength(4)
	})

	it("leaves no box unnamed", () => {
		/* The rule axe was actually reporting, stated directly rather than box by box. */
		render(<OtpInput length={6} />)

		for (const input of screen.getAllByRole("textbox")) {
			expect(input).toHaveAccessibleName()
		}
	})

	it("keeps counting across groups rather than restarting", () => {
		// Positions count across the whole code, not within a group.
		render(<OtpInput length={6} groupSize={3} />)

		expect(screen.getByLabelText("Character 4 of 6")).toBeInTheDocument()
		expect(screen.queryAllByLabelText("Character 2 of 6")).toHaveLength(1)
	})

	it("lets a caller's own name replace the default without duplicating it", () => {
		render(<OtpInput length={2} aria-label="Verification code" />)

		expect(screen.getByLabelText("Verification code")).toBeInTheDocument()
		expect(screen.queryByLabelText("One-time code")).toBeNull()
	})

	it("takes an override for a numeric-only code", () => {
		render(<OtpInput length={2} strings={{ slotLabel: (n, of) => `Digit ${n} of ${of}` }} />)
		expect(screen.getByLabelText("Digit 2 of 2")).toBeInTheDocument()
	})

	it("provokes no warning from the field about how it is labelled", () => {
		// Base UI warns when `aria-label` lands on the first input; the label would go nowhere.
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
		const error = vi.spyOn(console, "error").mockImplementation(() => {})

		render(<OtpInput length={3} />)

		expect(warn).not.toHaveBeenCalled()
		expect(error).not.toHaveBeenCalled()
		warn.mockRestore()
		error.mockRestore()
	})
})
