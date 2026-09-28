/**
 * Toggle and ToggleGroup — a button that stays pressed (`aria-pressed`): bold in an editor
 * toolbar, a view mode. For a setting use Switch; for a form value, Checkbox.
 */
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./toggle.module.css"

export interface ToggleProps
	extends TogglePrimitive.Props,
		Pick<TogglePrimitive.Props, "pressed" | "defaultPressed" | "onPressedChange" | "value"> {
	/**
	 * Sunk when engaged, or outlined. Match whatever sits beside it in the row — `outline`
	 * for a lone control, `ghost` inside a group.
	 */
	appearance?: "ghost" | "outline"
}

/**
 * A control that stays engaged, reported with `aria-pressed`: `pressed` and
 * `defaultPressed` hold its state, controlled and uncontrolled, and `onPressedChange` fires
 * with the next one. Inside a `ToggleGroup`, `value` names the toggle, and the group reads it
 * into its own value; outside a group it is unused.
 */
export function Toggle({ appearance = "ghost", className, ...props }: ToggleProps) {
	return (
		<TogglePrimitive
			data-slot="toggle"
			data-appearance={appearance}
			className={cx("toggle--component", styles.toggle, textClassName({ size: "sm", weight: "medium" }), className)}
			{...props}
		/>
	)
}

export interface ToggleGroupProps
	extends ToggleGroupPrimitive.Props,
		Pick<ToggleGroupPrimitive.Props, "multiple" | "value" | "onValueChange"> {
	/**
	 * Joins the toggles into one framed control with internal rules. Off leaves them as
	 * separate buttons in a row.
	 */
	attached?: boolean
}

/**
 * A set of `Toggle`s (each given a `value`) sharing one value. `multiple` allows several at
 * once rather than one: a view switch is one, text styles are several. The value is always
 * an array, even when only one may be pressed, so switching `multiple` does not change its
 * shape.
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
