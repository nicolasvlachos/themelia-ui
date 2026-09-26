"use client"

import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./label.module.css"

function Label({ className, ...props }: React.ComponentProps<"label">) {
	/* Composed from Text for the type scale; a real <label>, so clicking it focuses the control. */
	return (
		<Text
			tag="label"
			size="inherit"
			weight="medium"
			data-slot="label"
			className={cx("label--component", styles.root, className)}
			{...props}
		/>
	)
}

export { Label }
