import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/base/context-menu"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"

import { mergeUIConfig } from "./context"
import { DEFAULT_UI_CONFIG } from "./defaults"
import { UIProvider } from "./provider"
import { UIScope } from "./ui-scope"

/**
 * Menus render dark by default; `overlay.darkMenus` decides. Only the scheme class changes;
 * rows, spacing and radius stay the menu's own.
 */
const MENUS = [
	{
		name: "DropdownMenu",
		slot: "dropdown-menu-content",
		render: () => (
			<DropdownMenu open>
				<DropdownMenuTrigger>open</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>row</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
	{
		name: "ContextMenu",
		slot: "context-menu-content",
		render: () => (
			<ContextMenu open>
				<ContextMenuTrigger>target</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem>row</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		),
	},
] as const

function popup(slot: string) {
	const node = document.querySelector(`[data-slot='${slot}']`)
	if (!node) throw new Error(`no ${slot} rendered`)
	return node
}

describe("overlay.darkMenus", () => {
	it("defaults to true and survives a scope that sets another overlay field", () => {
		expect(DEFAULT_UI_CONFIG.overlay.darkMenus).toBe(true)
		expect(mergeUIConfig(DEFAULT_UI_CONFIG, { overlay: { backdropBlur: 4 } }).overlay).toEqual({
			darkMenus: true,
			backdropBlur: 4,
		})
	})

	for (const menu of MENUS) {
		it(`${menu.name} renders dark with no config`, () => {
			render(<UIProvider>{menu.render()}</UIProvider>)
			expect(popup(menu.slot).classList.contains("dark")).toBe(true)
		})

		it(`${menu.name} follows the page when the provider turns it off`, () => {
			render(<UIProvider config={{ overlay: { darkMenus: false } }}>{menu.render()}</UIProvider>)
			expect(popup(menu.slot).classList.contains("dark")).toBe(false)
		})

		it(`${menu.name} takes the nearest scope's answer`, () => {
			render(
				<UIProvider config={{ overlay: { darkMenus: false } }}>
					<UIScope config={{ overlay: { darkMenus: true } }}>{menu.render()}</UIScope>
				</UIProvider>,
			)
			expect(popup(menu.slot).classList.contains("dark")).toBe(true)
		})
	}
})
