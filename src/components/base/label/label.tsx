"use client"

import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./label.module.css"

interface LabelProps extends React.ComponentProps<"label"> {
	/**
	 * The control's id. Without it the label is decoration: clicking it does nothing and
	 * nothing is announced.
	 */
	htmlFor?: string
}

/**
 * A form label: a real `<label>`, so clicking it focuses the control it names. Takes
 * everything a native label takes.
 */
function Label({ className, ...props }: LabelProps) {
	/* Composed from Text for the type scale; a real <label>, so clicking it focuses the control. */
	return (
		<Text
			tag="label"
			size="sm"
			weight="medium"
			data-slot="label"
			className={cx("label--component", styles.root, className)}
			{...props}
		/>
	)
}

export { Label }
