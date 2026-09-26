/**
 * Checkbox — a visually hidden native input drives a styled sibling, so form, keyboard and
 * label behaviour are the platform's. No `size` prop (styles/tokens/foundation.css).
 * `indeterminate` is a DOM property, so it is set through a ref. Marks are Lucide icons,
 * the kit's one icon vocabulary.
 */
import { CheckIcon, MinusIcon } from "lucide-react"
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./choice.module.css"

export interface CheckboxProps
	extends Omit<React.ComponentProps<"input">, "type" | "size">,
		Pick<React.ComponentProps<"input">, "checked" | "defaultChecked" | "onChange"> {
	/** Rendered beside the box and wired to it, so the text is part of the target. */
	label?: React.ReactNode
	/**
	 * The dash state, for a parent whose children are partly checked: neither on nor off.
	 * Independent of `checked`, which it outranks visually.
	 */
	indeterminate?: boolean
}

/**
 * A native checkbox under the kit's styling, so form, keyboard and label behaviour are the
 * platform's. `checked` and `defaultChecked` are its controlled and uncontrolled state, and
 * `onChange` receives the native change event: read `event.target.checked` for the next
 * state.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
	{ label, indeterminate = false, className, ...props },
	forwardedRef,
) {
	const innerRef = React.useRef<HTMLInputElement>(null)
	React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement)

	React.useEffect(() => {
		if (innerRef.current) innerRef.current.indeterminate = indeterminate
	}, [indeterminate])

	return (
		<label className={cx("checkbox--component", styles.field, className)}>
			<input ref={innerRef} type="checkbox" data-slot="checkbox" className={styles.input} {...props} />
			<span className={cx(styles.control, styles.checkbox)}>
				<CheckIcon aria-hidden className={cx(styles.mark, styles.checkMark)} />
				<MinusIcon aria-hidden className={cx(styles.mark, styles.dashMark)} />
			</span>
			{!!label && <span className={styles.label}>{label}</span>}
		</label>
	)
})
