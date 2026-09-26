// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { HeaderNotifications } from "./partials/header-notifications"

/* The list lives in a dropdown, so nothing renders until the bell is pressed. */
const openBell = async () => {
	await userEvent.click(screen.getByRole("button", { name: /notification/i }))
	await screen.findByText("Invoice paid")
}

const notifications = [
	{ id: "1", title: "Invoice paid", read: false },
	{ id: "2", title: "Backup finished", read: true },
]

describe("HeaderNotifications", () => {
	it("says 'unread' through the strings contract, not in English", async () => {
		/* The unread word is announced, and overridable through `strings`. */
		render(
			<HeaderNotifications
				notifications={notifications}
				unreadCount={1}
				strings={{ unreadItem: "Non lu" }}
			/>,
		)

		await openBell()
		expect(screen.getByText("Non lu")).toBeTruthy()
		expect(screen.queryByText("Unread")).toBeNull()
	})

	it("marks only the unread row", async () => {
		/* Non-vacuity: a row that never renders the word would pass the override test too. */
		render(<HeaderNotifications notifications={notifications} unreadCount={1} />)
		await openBell()
		expect(screen.getAllByText("Unread")).toHaveLength(1)
	})
})
