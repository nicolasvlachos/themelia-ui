/**
 * Toggle and ToggleGroup — a button that stays pressed (`aria-pressed`): bold in an editor
 * toolbar, a view mode. For a setting use Switch; for a form value, Checkbox.
 */
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { cx } from "@/lib/cx"

import styles from "./toggle.module.css"

export interface ToggleProps extends TogglePrimitive.Props {
	/** Sunk when engaged, or outlined. Match whatever sits beside it in the row. */
	variant?: "ghost" | "outline"
}

export function Toggle({ variant = "ghost", className, ...props }: ToggleProps) {
	return (
		<TogglePrimitive
			data-slot="toggle"
			data-variant={variant}
			className={cx("toggle--component", styles.toggle, className)}
			{...props}
		/>
	)
}

export interface ToggleGroupProps extends ToggleGroupPrimitive.Props {
	/** Joins the toggles into one framed control. Defaults to true. */
	attached?: boolean
}

/**
 * A set of `Toggle`s (each given a `value`) sharing one value. `multiple` makes it a
 * checkbox set rather than one-at-a-time.
 */
export function ToggleGroup({ attached = true, className, ...props }: ToggleGroupProps) {
	return (
		<ToggleGroupPrimitive
			data-slot="toggle-group"
			data-attached={attached || undefined}
			className={cx("toggle-group--component", styles.group, className)}
			{...props}
		/>
	)
}
