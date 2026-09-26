import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Tab, TabList, TabPanel, Tabs } from "./tabs"

/** Tabs: `aria-controls` must always resolve, including when Tabs has no panels. */
describe("Tabs", () => {
	it("points the selected tab at its panel", () => {
		render(
			<Tabs defaultValue="one">
				<TabList label="Example">
					<Tab value="one">One</Tab>
					<Tab value="two">Two</Tab>
				</TabList>
				<TabPanel value="one">first</TabPanel>
				<TabPanel value="two">second</TabPanel>
			</Tabs>,
		)

		const selected = screen.getByRole("tab", { selected: true })
		const target = selected.getAttribute("aria-controls")
		expect(target).toBeTruthy()
		expect(document.getElementById(target!)).toHaveTextContent("first")
	})

	it("claims no panel when the tabs drive content elsewhere", () => {
		render(
			<Tabs defaultValue="light">
				<TabList label="Mode">
					<Tab value="light">Light</Tab>
					<Tab value="dark">Dark</Tab>
				</TabList>
			</Tabs>,
		)

		for (const tab of screen.getAllByRole("tab")) {
			expect(tab).not.toHaveAttribute("aria-controls")
		}
	})

	it("never references a panel that is not in the document", () => {
		/* The rule, stated once: every reference resolves, selected or not. */
		render(
			<Tabs defaultValue="one">
				<TabList label="Example">
					<Tab value="one">One</Tab>
					<Tab value="two">Two</Tab>
				</TabList>
				<TabPanel value="one">first</TabPanel>
				<TabPanel value="two">second</TabPanel>
			</Tabs>,
		)

		for (const tab of screen.getAllByRole("tab")) {
			const target = tab.getAttribute("aria-controls")
			if (target !== null) expect(document.getElementById(target)).not.toBeNull()
		}
	})
})
