/** Submit and reset. Reset renders only when there is an `onReset` for it to reach. */
import type { ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

export interface SchemaFormActionsProps {
	submitLabel: ReactNode
	resetLabel: ReactNode
	showReset?: boolean
	disabled?: boolean
	submitDisabled?: boolean
	resetDisabled?: boolean
	submitting?: boolean
	onReset?: () => void
	className?: string
}

/**
 * The form's submit row, generated from the same schema; reset renders only when there is an
 * `onReset` for it to reach. Exported so a screen can place it somewhere the generated layout
 * does not — a drawer footer, a sticky bar.
 */
export function SchemaFormActions({
	submitLabel,
	resetLabel,
	showReset = false,
	disabled = false,
	submitDisabled = false,
	resetDisabled = false,
	submitting = false,
	onReset,
	className,
}: SchemaFormActionsProps) {
	return (
		<Stack
			direction="horizontal"
			align="center"
			justify="end"
			gap="sm"
			className={cx("schema-form-actions--component", className)}
		>
			{showReset && (
				<Button
					type="button"
					tone="neutral"
					appearance="outline"
					// Also while submitting: a mid-write reset would hide which values the server got.
					disabled={disabled || resetDisabled || submitting}
					onClick={onReset}
				>
					{resetLabel}
				</Button>
			)}
			<Button type="submit" loading={submitting} disabled={disabled || submitDisabled}>
				{submitLabel}
			</Button>
		</Stack>
	)
}
