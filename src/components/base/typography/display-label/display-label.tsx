/**
 * DisplayLabel — a non-form label for a value or a group of controls, in one fixed style.
 * Use `Label` for a form control.
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./display-label.module.css"

export function DisplayLabel({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-typography="display-label"
			className={cx("display-label--component", styles.root, className)}
			{...props}
		/>
	)
}
