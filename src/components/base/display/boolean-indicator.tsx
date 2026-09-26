/** BooleanIndicator — a yes/no state as a dot and a word; the word is required, since colour alone fails. */
import * as React from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultBooleanIndicatorStrings, type BooleanIndicatorStrings } from "./boolean-indicator.strings"
import styles from "./display.module.css"

export interface BooleanIndicatorProps extends Omit<React.ComponentProps<"span">, "children"> {
	/** The state, drawn as a dot and a word so it does not rely on colour alone. */
	value?: boolean | null
	/**
	 * Overrides what each state is called: `strings.true` and `strings.false`, the two words.
	 * Yes/No, Enabled/Disabled, Paid/Unpaid — "Active"/"Paused" beats "true"/"false".
	 */
	strings?: Partial<BooleanIndicatorStrings>
}

/** A yes/no state as a dot and a word. The word is required, since colour alone fails. */
export function BooleanIndicator({
	value,
	strings,
	className,
	...props
}: BooleanIndicatorProps) {
	const copy = { ...defaultBooleanIndicatorStrings, ...strings }
	return (
		<span
			data-slot="boolean-indicator"
			data-value={value ? "true" : "false"}
			className={cx("boolean-indicator--component", styles.indicator, className)}
			{...props}
		>
			<span
				className={cx(styles.indicatorDot, value && styles.indicatorDotTrue)}
				aria-hidden
			/>
			<Text tag="span" size="inherit">
				{value ? copy.true : copy.false}
			</Text>
		</span>
	)
}
