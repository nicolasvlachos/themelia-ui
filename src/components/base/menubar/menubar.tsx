/**
 * Menubar — a desktop application menu bar: with one menu open, moving sideways opens the
 * next. For an editor with many commands; admin screens usually want a toolbar instead.
 * Each menu is a `DropdownMenu` holding a `MenubarTrigger` and a `DropdownMenuContent`.
 */
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./menubar.module.css"

export interface MenubarProps extends MenubarPrimitive.Props {}

/**
 * The bar. Its menus are `DropdownMenu` roots, each holding a `MenubarTrigger` and a
 * `DropdownMenuContent` with every row the dropdown menu offers.
 *
 * The menu itself is the dropdown menu module's, not a copy under a second name — so
 * groups, labels, checkbox and radio items, submenus and the portal are the dropdown
 * menu's parts too, and a reader who has learned one has learned the other.
 */
export function Menubar({ className, ...props }: MenubarProps) {
	return (
		<MenubarPrimitive
			data-slot="menubar"
			className={cx("menubar--component", styles.bar, className)}
			{...props}
		/>
	)
}

/**
 * One menu's word in the bar, placed inside a `DropdownMenu` beside its
 * `DropdownMenuContent`. Once a menu is open, moving along the bar opens the next without
 * a second click — which is what makes a menubar a menubar rather than a row of dropdowns.
 */
export function MenubarTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
	return (
		<MenuPrimitive.Trigger
			data-slot="menubar-trigger"
			className={cx("menubar-menu--component", styles.trigger, textClassName({ size: "sm", weight: "medium" }), className)}
			{...props}
		/>
	)
}
