import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Item, ItemGroup, ItemSeparator } from "./item"

/**
 * Item list semantics: rows inside `ItemGroup` (`role="list"`) are list items via context;
 * a row outside a group stays roleless.
 */
describe("Item list semantics", () => {
	it("is a list item inside a group", () => {
		render(
			<ItemGroup>
				<Item>row</Item>
			</ItemGroup>,
		)

		expect(screen.getByRole("list")).toBeInTheDocument()
		expect(screen.getByRole("listitem")).toHaveTextContent("row")
	})

	it("has no role standing on its own", () => {
		render(<Item>row</Item>)
		expect(screen.queryByRole("listitem")).toBeNull()
	})

	it("lets a caller's own role win", () => {
		/* A caller's `role` is the escape hatch for a row that is really something else. */
		render(
			<ItemGroup>
				<Item role="presentation">row</Item>
			</ItemGroup>,
		)

		expect(screen.queryByRole("listitem")).toBeNull()
	})

	it("wraps a rendered control in a list item rather than relabelling it", () => {
		/* A `<button>` can't be a `listitem`: assert the wrapper exists and the button stays a button. */
		render(
			<ItemGroup>
				<Item render={<button type="button" />}>press</Item>
			</ItemGroup>,
		)

		const listItem = screen.getByRole("listitem")
		expect(listItem).toContainElement(screen.getByRole("button", { name: "press" }))
	})

	it("adds no wrapper for a rendered control outside a group", () => {
		const { container } = render(<Item render={<button type="button" />}>press</Item>)
		expect(container.firstElementChild?.tagName).toBe("BUTTON")
	})

	it("drops the separator's role inside a list but keeps it outside", () => {
		const { unmount } = render(
			<ItemGroup>
				<Item>a</Item>
				<ItemSeparator />
				<Item>b</Item>
			</ItemGroup>,
		)

		/* A separator isn't a legal list child; the rows already convey the break. */
		expect(screen.queryByRole("separator")).toBeNull()
		unmount()

		render(<ItemSeparator />)
		expect(screen.getByRole("separator")).toBeInTheDocument()
	})
})
