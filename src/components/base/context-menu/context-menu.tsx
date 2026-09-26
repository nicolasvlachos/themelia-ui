/**
 * ContextMenu — the dropdown's menu opened by right-click, reusing its rows. Every entry
 * must also be reachable another way (toolbar, ActionMenu): right-click is undiscoverable,
 * absent on touch and awkward from a keyboard.
 */
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import type * as React from "react"

import {
	DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
	DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut,
	DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "@/components/base/dropdown-menu"
import { cx } from "@/lib/cx"
import { useOverlayConfig, useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"

import styles from "@/components/base/dropdown-menu/dropdown-menu.module.css"

/**
 * The dropdown's menu opened by right-click over a region, reusing its rows. The trigger is
 * not a button — the whole area is the target. Every entry must also be reachable another
 * way (a toolbar, an `ActionMenu`): right-click is undiscoverable, absent on touch and
 * awkward from a keyboard.
 */
function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
	return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

/** The region a right-click opens the menu over. */
function ContextMenuTrigger({ ...props }: ContextMenuPrimitive.Trigger.Props) {
	return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
}

/** The portal, for a caller placing the surface itself. The content portals already. */
const ContextMenuPortal = ContextMenuPrimitive.Portal

/**
 * The menu's surface. It portals already, escaping an ancestor that clips or transforms — a
 * card with overflow hidden, a scrolling pane.
 */
function ContextMenuContent({
	container,
	className,
	...props
}: MenuPrimitive.Popup.Props & {
	className?: string
	/**
	 * Where the popup renders. Defaults to the nearest `UIPortalHost`, else the primitive's
	 * own target.
	 */
	container?: UIPortalContainer
}) {
	const portalContainer = useUIPortalContainer(container)
	const { darkMenus } = useOverlayConfig()

	return (
		<ContextMenuPrimitive.Portal container={portalContainer}>
			<ContextMenuPrimitive.Positioner className={styles.positioner}>
				{/* The dropdown's scheme rule: dark unless the provider sets `overlay.darkMenus: false`. */}
				<ContextMenuPrimitive.Popup
					data-slot="context-menu-content"
					className={cx("context-menu-content--component", darkMenus && "dark", styles.content, className)}
					{...props}
				/>
			</ContextMenuPrimitive.Positioner>
		</ContextMenuPrimitive.Portal>
	)
}

/* Base UI's context menu renders the same Menu parts, so the dropdown's rows are reused as-is. */
/**
 * The dropdown's row, unchanged: `icon`, `description`, `shortcut`, `trailing` and
 * `variant="destructive"` all apply.
 */
const ContextMenuItem = DropdownMenuItem
/** A row that toggles rather than closing. */
const ContextMenuCheckboxItem = DropdownMenuCheckboxItem
/** A set of rows that behaves as one choice. */
const ContextMenuRadioGroup = DropdownMenuRadioGroup
/** One choice inside a `ContextMenuRadioGroup`; it toggles rather than closing. */
const ContextMenuRadioItem = DropdownMenuRadioItem
/**
 * A group's caption. It must sit inside a group — Base UI throws otherwise — and is not an
 * item: arrow keys skip it.
 */
const ContextMenuLabel = DropdownMenuLabel
/** A titled run of items. */
const ContextMenuGroup = DropdownMenuGroup
/** The rule between runs of items. */
const ContextMenuSeparator = DropdownMenuSeparator
/**
 * The key hint on an item's trailing edge. Presentational: the item already carries the
 * accessible name.
 */
const ContextMenuShortcut = DropdownMenuShortcut
/**
 * A nested menu, opening sideways. It holds the open state, so trigger and panel cannot
 * disagree.
 */
const ContextMenuSub = DropdownMenuSub
/** The row that opens a nested menu. */
const ContextMenuSubTrigger = DropdownMenuSubTrigger
/** The panel a nested menu opens, sideways. */
const ContextMenuSubContent = DropdownMenuSubContent

export type ContextMenuProps = React.ComponentProps<typeof ContextMenu>

export {
	ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuPortal, ContextMenuItem,
	ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel,
	ContextMenuGroup, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub,
	ContextMenuSubTrigger, ContextMenuSubContent,
}
