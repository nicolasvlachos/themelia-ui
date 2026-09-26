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

export interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type" | "size"> {
	label?: React.ReactNode
	/** Partially-selected: neither on nor off. Outranks `checked` visually. */
	indeterminate?: boolean
}

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
