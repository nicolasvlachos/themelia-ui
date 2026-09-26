import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuthCard } from "./auth-card"

describe("AuthCard", () => {
	it("is a Card whose title is the page's heading", () => {
		const { container } = render(
			<AuthCard eyebrow="Northwind" title="Sign in" description="Use your work email." banner="Your link expired." footer="Need help?">
				<p>Form</p>
			</AuthCard>,
		)
		expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument()
		const root = container.firstElementChild as HTMLElement
		expect(root).toHaveClass("auth-card--component")
		expect(root).toHaveClass("card--component")
		expect(root).toHaveAttribute("data-slot", "auth-card")
		expect(screen.getByText("Your link expired.")).toBeInTheDocument()
		expect(screen.getByText("Need help?").closest('[data-slot="card-footer"]')).not.toBeNull()
	})

	it("takes a heading level for a surface that is not the page", () => {
		render(<AuthCard title="Confirm your password" level={2} />)
		expect(screen.getByRole("heading", { level: 2, name: "Confirm your password" })).toBeInTheDocument()
	})
})
