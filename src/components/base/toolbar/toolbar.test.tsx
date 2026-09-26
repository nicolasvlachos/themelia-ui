import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarInput,
	ToolbarLink,
	ToolbarSeparator,
} from "./toolbar"

describe("Toolbar", () => {
	it("provides a named toolbar with stable public hooks and kit-styled controls", () => {
		render(
			<Toolbar aria-label="Formatting">
				<ToolbarGroup>
					<ToolbarButton>Bold</ToolbarButton>
					<ToolbarButton>Italic</ToolbarButton>
				</ToolbarGroup>
				<ToolbarSeparator />
				<ToolbarLink href="/help">Help</ToolbarLink>
				<ToolbarInput aria-label="Size" defaultValue="14" />
			</Toolbar>,
		)

		const toolbar = screen.getByRole("toolbar", { name: "Formatting" })
		expect(toolbar).toHaveClass("toolbar--component")
		expect(toolbar.querySelector(".toolbar--group")).not.toBeNull()
		expect(toolbar.querySelector(".toolbar--separator")).not.toBeNull()
		expect(screen.getByRole("button", { name: "Bold" })).toHaveClass(
			"toolbar--button",
			"button--component",
		)
		expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("data-tone", "neutral")
		expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("data-style", "ghost")
		expect(screen.getByRole("link", { name: "Help" })).toHaveClass("toolbar--link")
		expect(screen.getByRole("textbox", { name: "Size" })).toHaveClass("toolbar--input")
	})

	it("uses one tab stop and moves focus with the toolbar arrow key", async () => {
		render(
			<Toolbar aria-label="Formatting">
				<ToolbarButton>Bold</ToolbarButton>
				<ToolbarButton>Italic</ToolbarButton>
				<ToolbarButton>Quote</ToolbarButton>
			</Toolbar>,
		)

		const bold = screen.getByRole("button", { name: "Bold" })
		const italic = screen.getByRole("button", { name: "Italic" })
		const items = screen.getAllByRole("button")
		expect(items.filter((item) => item.tabIndex === 0)).toHaveLength(1)

		bold.focus()
		await userEvent.keyboard("{ArrowRight}")
		expect(italic).toHaveFocus()
		expect(items.filter((item) => item.tabIndex === 0)).toHaveLength(1)
	})

	it("uses the orientation-specific arrow key", async () => {
		render(
			<Toolbar aria-label="Arrange" orientation="vertical">
				<ToolbarButton>Up</ToolbarButton>
				<ToolbarButton>Down</ToolbarButton>
			</Toolbar>,
		)

		const up = screen.getByRole("button", { name: "Up" })
		up.focus()
		await userEvent.keyboard("{ArrowDown}")
		expect(screen.getByRole("button", { name: "Down" })).toHaveFocus()
	})

	it("blocks disabled controls", () => {
		const onClick = vi.fn()
		render(
			<Toolbar aria-label="Formatting">
				<ToolbarButton disabled onClick={onClick}>
					Bold
				</ToolbarButton>
			</Toolbar>,
		)

		fireEvent.click(screen.getByRole("button", { name: "Bold" }))
		expect(onClick).not.toHaveBeenCalled()
	})

	it("keeps loading controls non-activating and in roving focus", async () => {
		const onClick = vi.fn()
		render(
			<Toolbar aria-label="Formatting">
				<ToolbarButton>Cancel</ToolbarButton>
				<ToolbarButton loading onClick={onClick}>
					Save
				</ToolbarButton>
			</Toolbar>,
		)

		const save = screen.getByRole("button", { name: "Save" })
		const cancel = screen.getByRole("button", { name: "Cancel" })
		expect(save).toHaveAttribute("aria-disabled", "true")
		expect(save).toHaveAttribute("data-disabled")
		expect(save).toHaveAttribute("aria-busy", "true")
		cancel.focus()
		await userEvent.keyboard("{ArrowRight}")
		expect(save).toHaveFocus()
		fireEvent.click(save)
		expect(onClick).not.toHaveBeenCalled()
	})
})
