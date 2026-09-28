/**
 * Spinner — indeterminate progress. With a `label` it is a `role="status"`; without one it
 * is decorative and hidden from the accessibility tree.
 */
import * as React from "react"

import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"
import type { ComponentScale, SemanticTone } from "@/lib/component-vocabulary"

import styles from "./spinner.module.css"

const spinnerVariants = cvm(styles.root, {
	variants: {
		size: { default: undefined, sm: styles.sizeSm },
	},
	defaultVariants: { size: "default" },
})

export interface SpinnerProps extends Omit<React.ComponentProps<"span">, "children"> {
	/**
	 * The ring's size: `default`, or `sm` inside a dense row. A spinner keeps a size prop: it
	 * has no content to scale with.
	 */
	size?: ComponentScale
	/**
	 * Borrows the button tone contract, so a spinner inside or beside an action matches it
	 * rather than sitting on it in the primary hue.
	 */
	tone?: SemanticTone
	/**
	 * Visible label beside the ring, and the announced status. Without one the spinner is
	 * decorative and hidden from assistive technology.
	 */
	label?: React.ReactNode
}

export function Spinner({ size = "default", tone = "primary", label, className, ...props }: SpinnerProps) {
	return (
		<span
			data-slot="spinner"
			data-tone={tone}
			role={label ? "status" : undefined}
			aria-hidden={label ? undefined : true}
			className={cx("spinner--component", spinnerVariants({ size }), className)}
			{...props}
		>
			<span className={styles.ring} />
			{label}
		</span>
	)
}
