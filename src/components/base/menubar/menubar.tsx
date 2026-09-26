/**
 * Menubar — a desktop application menu bar: with one menu open, moving sideways opens the
 * next. For an editor with many commands; admin screens usually want a toolbar instead.
 * Each menu is a `DropdownMenu` holding a `MenubarTrigger` and a `DropdownMenuContent`.
 */
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cx } from "@/lib/cx"

import styles from "./menubar.module.css"

export interface MenubarProps extends MenubarPrimitive.Props {}

export function Menubar({ className, ...props }: MenubarProps) {
	return (
		<MenubarPrimitive
			data-slot="menubar"
			className={cx("menubar--component", styles.bar, className)}
			{...props}
		/>
	)
}

/** One menu's word in the bar. Place it inside a `DropdownMenu`, beside its content. */
export function MenubarTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
	return (
		<MenuPrimitive.Trigger
			data-slot="menubar-trigger"
			className={cx("menubar-menu--component", styles.trigger, className)}
			{...props}
		/>
	)
}
