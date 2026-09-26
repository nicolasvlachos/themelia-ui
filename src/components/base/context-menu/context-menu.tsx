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

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
	return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

/** The region a right-click opens the menu over. */
function ContextMenuTrigger({ ...props }: ContextMenuPrimitive.Trigger.Props) {
	return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
}

/** The portal, for a caller placing the surface itself. The content portals already. */
const ContextMenuPortal = ContextMenuPrimitive.Portal

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
const ContextMenuItem = DropdownMenuItem
const ContextMenuCheckboxItem = DropdownMenuCheckboxItem
const ContextMenuRadioGroup = DropdownMenuRadioGroup
const ContextMenuRadioItem = DropdownMenuRadioItem
const ContextMenuLabel = DropdownMenuLabel
const ContextMenuGroup = DropdownMenuGroup
const ContextMenuSeparator = DropdownMenuSeparator
const ContextMenuShortcut = DropdownMenuShortcut
const ContextMenuSub = DropdownMenuSub
const ContextMenuSubTrigger = DropdownMenuSubTrigger
const ContextMenuSubContent = DropdownMenuSubContent

export type ContextMenuProps = React.ComponentProps<typeof ContextMenu>

export {
	ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuPortal, ContextMenuItem,
	ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel,
	ContextMenuGroup, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub,
	ContextMenuSubTrigger, ContextMenuSubContent,
}
