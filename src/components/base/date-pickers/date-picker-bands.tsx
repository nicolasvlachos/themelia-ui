/**
 * DatePickerHeader and DatePickerFooter — bands for the picker's `header` and `footer`
 * slots. Composed with children rather than configured; they own the rule, the padding and
 * trailing-edge actions.
 */
import type { ComponentProps, ReactNode } from "react"

import { Separator } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./calendar.module.css"

export interface DatePickerHeaderProps extends Omit<ComponentProps<"div">, "title"> {
	title?: ReactNode
	/** A second line — the range's length, the constraint in force. */
	description?: ReactNode
	/** A control at the trailing edge — a mode switch, a clear. */
	action?: ReactNode
}

export function DatePickerHeader({
	title,
	description,
	action,
	className,
	children,
	...props
}: DatePickerHeaderProps) {
	// Nothing to show renders no band.
	if (!title && !description && !action && !children) return null

	return (
		<>
			<div
				data-slot="date-picker-header"
				className={cx("date-picker-header--component", styles.band, className)}
				{...props}
			>
				{children ?? (
					<>
						<div className={styles.bandText}>
							{!!title && <Text weight="medium">{title}</Text>}
							{!!description && (
								<Text size="xs" type="secondary">
									{description}
								</Text>
							)}
						</div>
						{!!action && <div className={styles.bandActions}>{action}</div>}
					</>
				)}
			</div>
			<Separator />
		</>
	)
}

export interface DatePickerFooterProps extends ComponentProps<"div"> {
	/** A summary of what is chosen — "3 – 7 March, 5 days". */
	summary?: ReactNode
	/** Controls at the trailing edge. */
	actions?: ReactNode
}

export function DatePickerFooter({
	summary,
	actions,
	className,
	children,
	...props
}: DatePickerFooterProps) {
	if (!summary && !actions && !children) return null

	return (
		<>
			<Separator />
			<div
				data-slot="date-picker-footer"
				className={cx("date-picker-footer--component", styles.band, className)}
				{...props}
			>
				{children ?? (
					<>
						{!!summary && (
							<Text size="sm" type="secondary" className={styles.bandText}>
								{summary}
							</Text>
						)}
						{!!actions && <div className={styles.bandActions}>{actions}</div>}
					</>
				)}
			</div>
		</>
	)
}
