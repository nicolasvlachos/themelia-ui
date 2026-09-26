/**
 * NativeSelect — a native `<select>` on the shared field surface. Prefer `Select`
 * (`base/choice-inputs`); use this when the native picker is wanted (long lists on mobile,
 * no-JS forms).
 */
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./text-inputs.module.css"

export interface NativeSelectProps extends Omit<React.ComponentProps<"select">, "size"> {
	/** Shown as a disabled first option when the value is empty. */
	placeholder?: string
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
	{ className, placeholder, children, ...props },
	ref,
) {
	return (
		/*
		 * The wrapper holds the chevron; the surface stays on the select. An inline icon, not
		 * a background image, so `currentColor` follows the theme.
		 */
		<span data-slot="native-select-frame" className={styles.selectFrame}>
			<select
				ref={ref}
				data-slot="native-select"
				data-field-control=""
				className={cx("native-select--component", styles.select, className)}
				{...props}
			>
				{!!placeholder && (
					<option value="" disabled>
						{placeholder}
					</option>
				)}
				{children}
			</select>
			<ChevronDownIcon aria-hidden className={styles.selectChevron} />
		</span>
	)
})
