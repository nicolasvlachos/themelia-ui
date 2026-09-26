/**
 * OtpInput — a one-time code, one box per character, built on Base UI's OTPField so paste
 * and SMS autofill fill every box.
 */
import { OTPField } from "@base-ui/react/otp-field"
import * as React from "react"

import { VisuallyHidden } from "@/components/base/display"

import { cx } from "@/lib/cx"

import styles from "./otp-input.module.css"
import { defaultOtpInputStrings, type OtpInputStrings } from "./otp-input.strings"

export interface OtpInputProps extends Omit<OTPField.Root.Props, "length"> {
	/** How many characters. Six is the near-universal length. */
	length?: number
	/** Splits the boxes into groups, for a code written as "123 456". */
	groupSize?: number
	invalid?: boolean
	strings?: Partial<OtpInputStrings>
}

export function OtpInput({
	length = 6,
	groupSize,
	invalid,
	className,
	strings,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	...props
}: OtpInputProps) {
	const copy = { ...defaultOtpInputStrings, ...strings }

	/*
	 * The first box (the field itself, to Base UI) accepts only `aria-labelledby`, so its name
	 * lives in a hidden span; a caller's `aria-labelledby` is used as given, and an `aria-label`
	 * becomes the span's text. The other boxes take `aria-label` directly.
	 */
	const fallbackId = React.useId()
	const ownName = ariaLabelledBy ? null : (ariaLabel ?? copy.fieldLabel)
	const labelledBy = ariaLabelledBy ?? fallbackId
	// Base UI indexes inputs by DOM order; grouping only decides how many go in each wrapper.
	const groups = groupSize
		? Array.from({ length: Math.ceil(length / groupSize) }, (_, group) =>
				Math.min(groupSize, length - group * groupSize),
			)
		: [length]

	return (
		<OTPField.Root
			length={length}
			data-slot="otp-input"
			data-invalid={invalid || undefined}
			className={cx("otp-input--component", styles.root, className)}
			{...props}
		>
			{!!ownName && <VisuallyHidden id={fallbackId}>{ownName}</VisuallyHidden>}
			{groups.map((count, group) => (
				<div key={group} className={styles.group}>
					{Array.from({ length: count }, (_, index) => {
						// Counted across the whole code, not within the group.
						const position = groups.slice(0, group).reduce((sum, n) => sum + n, 0) + index + 1

						return (
							<OTPField.Input
								key={index}
								{...(position === 1
									? { "aria-labelledby": labelledBy }
									: { "aria-label": copy.slotLabel(position, length) })}
								className={styles.slot}
							/>
						)
					})}
				</div>
			))}
		</OTPField.Root>
	)
}
