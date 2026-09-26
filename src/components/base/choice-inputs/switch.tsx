/**
 * Switch — an immediate on/off (a checkbox means "include when I submit"). The same hidden
 * native checkbox as Checkbox, refined with `role="switch"`.
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./choice.module.css"

export interface SwitchProps extends Omit<React.ComponentProps<"input">, "type" | "size"> {
	label?: React.ReactNode
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
	{ label, className, ...props },
	ref,
) {
	return (
		<label className={cx("switch--component", styles.field, className)}>
			<input
				ref={ref}
				type="checkbox"
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
