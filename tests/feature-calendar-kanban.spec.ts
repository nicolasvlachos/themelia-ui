/** Event calendar selection, filters across views and empty agenda; kanban keyboard drag and narrow layout. */
import { expect, test } from "@playwright/test"

import { url } from "./routes"

async function openEventCalendar(page: import("@playwright/test").Page) {
	await page.goto(url("/event-calendar"))
	await page.locator("#month .event-calendar--component").waitFor()
	return page.locator("#month")
}

async function chooseCalendarView(
	page: import("@playwright/test").Page,
	example: import("@playwright/test").Locator,
	view: "Month" | "Week" | "Agenda",
) {
	const switcher = example.getByRole("combobox", { name: "Calendar view", exact: true })
	await switcher.click()
	await page.getByRole("option", { name: view, exact: true }).click()
	await expect(switcher).toContainText(view)
}

async function openKanban(page: import("@playwright/test").Page) {
	await page.goto(url("/kanban"))
	await page.locator("#kanban .kanban--component").waitFor()
	return page.locator("#kanban")
}

test("calendar activates days and events, preserves filters across views, and recovers from an empty agenda", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	const example = await openEventCalendar(page)
	const overflow = example.locator('[data-slot="event-calendar-overflow"]')
	await expect(overflow.getByText("+2", { exact: true })).toBeVisible()
	await expect(overflow.locator('[data-overflow-label="full"]')).toHaveText("2 more")
	await expect(overflow.locator('[data-overflow-label="full"]')).toBeHidden()

	await example.getByRole("button", { name: "Sat Sep 05 2026", exact: true }).click()
	await expect(example.getByText("picked: Sat Sep 05 2026 — 4 events", { exact: true })).toBeVisible()

	await example.getByRole("button", { name: "Deep clean at 07:00", exact: true }).click()
	await expect(example.getByText("picked: Deep clean", { exact: true })).toBeVisible()

	const maintenance = example.getByRole("button", { name: "Maintenance", exact: true })
	await expect(maintenance).toHaveAttribute("aria-pressed", "true")
	await maintenance.click()
	await expect(maintenance).toHaveAttribute("aria-pressed", "false")
	await expect(example.getByRole("button", { name: "Boiler service at 08:00", exact: true })).toHaveCount(0)

	await chooseCalendarView(page, example, "Week")
	await expect(maintenance).toHaveAttribute("aria-pressed", "false")
	await chooseCalendarView(page, example, "Agenda")
	await expect(maintenance).toHaveAttribute("aria-pressed", "false")
	await expect(example.getByRole("heading", { name: "Okonkwo wedding", exact: true })).toBeVisible()
	await expect(example.getByRole("heading", { name: "Floor resurfacing", exact: true })).toHaveCount(0)

	await example.getByRole("button", { name: "Next", exact: true }).click()
	await expect(example.getByText("Nothing scheduled.", { exact: true })).toBeVisible()
	await example.getByRole("button", { name: "Previous", exact: true }).click()
	await expect(example.getByRole("heading", { name: "Okonkwo wedding", exact: true })).toBeVisible()
	await expect(maintenance).toHaveAttribute("aria-pressed", "false")
})

test("kanban keyboard drag moves a card to its requested final position", async ({ page }) => {
	const example = await openKanban(page)
	const backlog = example.locator('[data-column-id="backlog"]')
	const handles = backlog.getByRole("button", { name: "Drag handle" })
	const firstCard = backlog.locator('[data-slot="kanban-item"]').first()

	await handles.first().focus()
	await page.keyboard.press("Space")
	await expect(firstCard).toHaveAttribute("data-dragging", "true")
	await expect(handles.first()).toHaveAttribute("aria-pressed", "true")
	await expect(page.getByRole("status")).toHaveText("Moving c1 to c1.")

	await page.keyboard.press("ArrowDown")
	await expect(page.getByRole("status")).toHaveText("Moving c1 to c2.")

	await page.keyboard.press("Space")

	await expect(backlog.locator('[data-slot="kanban-item"]')).toHaveCount(2)
	await expect(backlog.locator('[data-slot="kanban-item"]').first()).toContainText("Chase the Marlow deposit")
	await expect(backlog.locator('[data-slot="kanban-item"]').nth(1)).toContainText("Reconcile August payouts")
	await expect(example).toContainText("Reconcile August payouts: backlog → backlog @ 1")
})

test("kanban keeps usable columns in a narrow preview without widening the document", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	const example = await openKanban(page)
	const board = example.locator('[data-slot="kanban-board"]')
	const columns = board.locator('[data-slot="kanban-column"]')

	const geometry = await board.evaluate((element) => ({
		clientWidth: element.clientWidth,
		scrollWidth: element.scrollWidth,
		documentWidth: document.documentElement.scrollWidth,
		viewportWidth: window.innerWidth,
	}))
	const widths = await columns.evaluateAll((elements) =>
		elements.map((element) => element.getBoundingClientRect().width),
	)

	/* Columns keep a usable width and scroll inside the board rather than widening the page. */
	expect(widths).toHaveLength(3)
	for (const width of widths) expect(width).toBeGreaterThanOrEqual(250)
	expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth)
	expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth)
})
