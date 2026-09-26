import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"

import { SelectPopupContent, SelectPopupItem, SelectRoot } from "@/components/base/choice-inputs"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/base/context-menu"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/base/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/base/tooltip"

import { UIPortalHost } from "./portal-host"
import { UIScope } from "./ui-scope"

/**
 * A scope survives a portal: under `UIPortalHost`, each popup renders inside the scope's
 * DOM subtree. Asserts the DOM relationship only (jsdom does not resolve inherited custom
 * properties; the browser suite checks those), plus the no-host fallback.
 */

/** Each popup, by the `data-slot` its own component writes. */
const POPUPS = [
	{
		name: "DropdownMenu",
		slot: "dropdown-menu-content",
		render: (children: ReactNode) => (
			<DropdownMenu open>
				<DropdownMenuTrigger>open</DropdownMenuTrigger>
				<DropdownMenuContent>{children}</DropdownMenuContent>
			</DropdownMenu>
		),
		child: <DropdownMenuItem>row</DropdownMenuItem>,
	},
	{
		name: "ContextMenu",
		slot: "context-menu-content",
		render: (children: ReactNode) => (
			<ContextMenu open>
				<ContextMenuTrigger>target</ContextMenuTrigger>
				<ContextMenuContent>{children}</ContextMenuContent>
			</ContextMenu>
		),
		child: <ContextMenuItem>row</ContextMenuItem>,
	},
	{
		name: "Tooltip",
		slot: "tooltip-content",
		render: (children: ReactNode) => (
			<TooltipProvider>
				<Tooltip open>
					<TooltipTrigger>hover</TooltipTrigger>
					<TooltipContent>{children}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		child: <span>tip</span>,
	},
	{
		name: "HoverCard",
		slot: "hover-card-content",
		render: (children: ReactNode) => (
			<HoverCard open>
				<HoverCardTrigger>hover</HoverCardTrigger>
				<HoverCardContent>{children}</HoverCardContent>
			</HoverCard>
		),
		child: <span>card</span>,
	},
	{
		name: "Popover",
		slot: "popover-content",
		render: (children: ReactNode) => (
			<Popover open>
				<PopoverTrigger>open</PopoverTrigger>
				<PopoverContent>{children}</PopoverContent>
			</Popover>
		),
		child: <span>body</span>,
	},
	{
		name: "Select",
		slot: "select-content",
		render: (children: ReactNode) => (
			<SelectRoot open>
				<SelectPopupContent>{children}</SelectPopupContent>
			</SelectRoot>
		),
		child: <SelectPopupItem value="a">row</SelectPopupItem>,
	},
] as const

const popupFor = (slot: string) => document.body.querySelector(`[data-slot="${slot}"]`)

describe("portals inside a UIPortalHost", () => {
	for (const popup of POPUPS) {
		it(`${popup.name} renders inside the scope`, () => {
			const { container } = render(
				<UIScope config={{ density: "compact", colorScheme: "dark" }} transparent={false}>
					<UIPortalHost>{popup.render(popup.child)}</UIPortalHost>
				</UIScope>,
			)

			const scope = container.querySelector("[data-ui-scope]")
			const element = popupFor(popup.slot)

			expect(scope, "the scope element itself").not.toBeNull()
			expect(element, `${popup.name} popup`).not.toBeNull()
			expect(scope?.contains(element as Node)).toBe(true)
		})

		it(`${popup.name} inherits the scope's attributes`, () => {
			/* Under the element that carries the scope attributes, not just any descendant. */
			render(
				<UIScope config={{ density: "compact", colorScheme: "dark" }} transparent={false}>
					<UIPortalHost>{popup.render(popup.child)}</UIPortalHost>
				</UIScope>,
			)

			expect(popupFor(popup.slot)?.closest("[data-density]")).not.toBeNull()
			expect(popupFor(popup.slot)?.closest("[data-theme]")).not.toBeNull()
		})

		it(`${popup.name} keeps the primitive's default with no host`, () => {
			/* Opt-in: without a host the popup portals outside the scope, as before. */
			const { container } = render(
				<UIScope config={{ density: "compact" }} transparent={false}>
					{popup.render(popup.child)}
				</UIScope>,
			)

			const scope = container.querySelector("[data-ui-scope]")
			const element = popupFor(popup.slot)

			expect(element, `${popup.name} popup`).not.toBeNull()
			expect(scope?.contains(element as Node)).toBe(false)
		})
	}

	it("an explicit container wins over the scoped host", () => {
		const explicit = document.createElement("div")
		explicit.id = "explicit"
		document.body.append(explicit)

		try {
			render(
				<UIScope config={{ density: "compact" }} transparent={false}>
					<UIPortalHost>
						<DropdownMenu open>
							<DropdownMenuTrigger>open</DropdownMenuTrigger>
							<DropdownMenuContent container={explicit}>
								<DropdownMenuItem>row</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</UIPortalHost>
				</UIScope>,
			)

			expect(explicit.contains(popupFor("dropdown-menu-content") as Node)).toBe(true)
		} finally {
			explicit.remove()
		}
	})

	it("a host given an element of its own renders no element", () => {
		const provided = document.createElement("div")
		document.body.append(provided)

		try {
			const { container } = render(
				<UIPortalHost container={provided}>
					<DropdownMenu open>
						<DropdownMenuTrigger>open</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>row</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</UIPortalHost>,
			)

			expect(container.querySelector('[data-slot="ui-portal-host"]')).toBeNull()
			expect(provided.contains(popupFor("dropdown-menu-content") as Node)).toBe(true)
		} finally {
			provided.remove()
		}
	})
})
