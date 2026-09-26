/** VisuallyHidden — hidden from view but kept in the accessibility tree. */
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./display.module.css"

export interface VisuallyHiddenProps extends React.ComponentProps<"span"> {
	/**
	 * An element to render instead of the span, taking the hidden styles — e.g. a real
	 * `<button>` that a Base UI trigger requires.
	 */
	render?: React.ReactElement<{ className?: string }>
}

export function VisuallyHidden({ className, render, ...props }: VisuallyHiddenProps) {
	const merged = cx(styles.visuallyHidden, className)

	if (render) {
		return React.cloneElement(render, {
			...props,
			...render.props,
			className: cx(merged, render.props.className),
		})
	}

	return <span className={cx("visually-hidden--component", merged)} {...props} />
}
