import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OrderTransactions } from "./commerce/order-transactions"

/**
 * Empty states: the admin blocks render the kit's `Empty` (with `role="status"`), a branch
 * no preview route shows.
 */
describe("empty states use the canonical component", () => {
	it("announces an empty transaction ledger through a live region", () => {
		render(<OrderTransactions transactions={[]} />)

		const empty = screen.getByRole("status")
		expect(empty).toHaveAttribute("data-slot", "empty")
		expect(empty).toHaveTextContent(/no transactions/i)
	})

	it("renders the ledger itself once there is something in it", () => {
		/* The populated branch is unaffected. */
		render(
			<OrderTransactions
				transactions={[
					{
						id: "t1",
						kind: "sale",
						status: "success",
						amount: "£42.00",
						processedAt: "2 May 2026",
						method: "Visa ending 4417",
					},
				]}
			/>,
		)

		expect(screen.queryByRole("status")).toBeNull()
		expect(screen.getByText("Visa ending 4417")).toBeInTheDocument()
	})
})
