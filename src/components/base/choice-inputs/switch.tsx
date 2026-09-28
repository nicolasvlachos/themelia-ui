/**
 * Switch — an immediate on/off (a checkbox means "include when I submit"). The same hidden
 * native checkbox as Checkbox, refined with `role="switch"`.
 */
import * as React from "react"

import { textClassName } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./choice.module.css"

export interface SwitchProps
	extends Omit<React.ComponentProps<"input">, "type" | "size">,
		Pick<React.ComponentProps<"input">, "checked" | "defaultChecked" | "onChange"> {
	/** Rendered beside the track and wired to it. */
	label?: React.ReactNode
}

/**
 * An immediate on/off; a checkbox means "include when I submit". The same hidden native
 * checkbox as `Checkbox`, announced as a switch. `checked` and `defaultChecked` are its
 * controlled and uncontrolled state, and `onChange` receives the native change event: read
 * `event.target.checked` for the next state.
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
	{ label, className, ...props },
	ref,
) {
	return (
		<label className={cx("switch--component", styles.field, textClassName({ size: "sm" }), className)}>
			<input
				ref={ref}
				type="checkbox"
				// oxlint-disable-next-line jsx-a11y/role-has-required-aria-props -- a native checkbox exposes its checked state to the switch role
				role="switch"
				data-slot="switch"
				className={styles.input}
				{...props}
			/>
			<span className={cx(styles.control, styles.switch)}>
				<span className={styles.thumb} />
			</span>
			{!!label && <span className={styles.label}>{label}</span>}
		</label>
	)
})
