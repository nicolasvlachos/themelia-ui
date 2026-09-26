/**
 * Form workflow — chrome around a form rather than a field: section, actions bar, error
 * summary, dirty-state banner, submit-state button.
 */
import { useEffect, useId, useRef, type ReactNode } from "react"
import { CheckIcon, Loader2Icon } from "lucide-react"

import { Button, type ButtonProps } from "@/components/base/buttons"
import { Card, type CardSurface } from "@/components/base/cards"
import { Alert, AlertAction, AlertDescription, AlertTitle, type AlertTone } from "@/components/base/feedback"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import type { StringsProp } from "@/lib/strings"

import styles from "./forms.module.css"
import { defaultDirtyStateBannerStrings, defaultErrorSummaryStrings, defaultSubmitStateButtonStrings, type DirtyStateBannerStrings, type ErrorSummaryStrings, type SubmitStateButtonStrings } from "./workflow.strings"

function isSimpleText(value: ReactNode): value is string | number | bigint {
	return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
}

/* ── Section ──────────────────────────────────────────────────────────────────── */

export interface FormSectionProps {
	title?: ReactNode
	description?: ReactNode
	/** Controls in the section header. */
	actions?: ReactNode
	children?: ReactNode
	footer?: ReactNode
	/** Outer chrome. Use `flat` when the section already sits inside a card. */
	surface?: CardSurface
	className?: string
}

export function FormSection({
	title,
	description,
	actions,
	children,
	footer,
	surface = "bordered",
	className,
}: FormSectionProps) {
	return (
		<Card
			surface={surface}
			title={title}
			description={description}
			headerEnd={actions}
			footerSlot={footer}
			className={cx("form-section--component", className)}
		>
			<div className={styles.section}>{children}</div>
		</Card>
	)
}

/* ── Actions bar ──────────────────────────────────────────────────────────────── */

export interface FormActionsBarProps {
	/** The actions. `trailing` wins when both are given. */
	children?: ReactNode
	/** Status or context before the actions — "Last saved 2 minutes ago". */
	leading?: ReactNode
	trailing?: ReactNode
	/** Pins the bar to the bottom of its nearest scrolling ancestor. */
	sticky?: boolean
	className?: string
}

export function FormActionsBar({ children, leading, trailing, sticky = false, className }: FormActionsBarProps) {
	const actions = trailing ?? children

	return (
		<div
			className={cx("form-actions-bar--component", styles.actionsBar, sticky && styles.actionsBarSticky, className)}
		>
			<div data-slot="form-actions-bar" className={styles.actionsRow}>
				<div className={styles.actionsLayout}>
					{leading != null && (
						<div className={styles.actionsLeading}>
							{isSimpleText(leading) ? (
								<Text tag="span" size="xs" type="secondary">
									{leading}
								</Text>
							) : (
								leading
							)}
						</div>
					)}
					{actions != null && <div className={styles.actionsTrailing}>{actions}</div>}
				</div>
			</div>
		</div>
	)
}

/* ── Error summary ────────────────────────────────────────────────────────────── */

export interface ErrorSummaryProps {
	/** Overrides the counted heading. */
	title?: ReactNode
	description?: ReactNode
	errors?: readonly ReactNode[]
	/** A control beside the summary — "Review the first problem". */
	action?: ReactNode
	/**
	 * Moves focus to the summary when it has problems, and again whenever the count changes —
	 * what a failed submit wants. Items may be links to their fields
	 * (`<a href="#email">Email is not valid.</a>`).
	 */
	autoFocus?: boolean
	strings?: StringsProp<ErrorSummaryStrings>
	className?: string
}

/**
 * Collects what failed into one place at the top of a form. The count is in the heading
 * because it tells the reader how much there is to fix.
 */
export function ErrorSummary({
	title,
	description,
	errors = [],
	action,
	autoFocus = false,
	strings,
	className,
}: ErrorSummaryProps) {
	const copy = { ...defaultErrorSummaryStrings, ...strings }
	const ref = useRef<HTMLDivElement>(null)
	const titleId = useId()
	const count = errors.length

	useEffect(() => {
		if (autoFocus && count > 0) ref.current?.focus()
	}, [autoFocus, count])

	// Nothing to summarise renders nothing.
	if (count === 0 && !title && !description) return null

	return (
		// Focusable (`tabIndex={-1}`) and named by its heading, so callers can focus it on submit.
		<Alert
			ref={ref}
			tone="destructive"
			tabIndex={-1}
			aria-labelledby={titleId}
			className={cx("error-summary--component", styles.errorSummary, className)}
		>
			<AlertTitle id={titleId}>{title ?? copy.title(count)}</AlertTitle>
			{!!description && <AlertDescription>{description}</AlertDescription>}
			{errors.length > 0 && (
				<ul className={styles.summaryList}>
					{errors.map((error, index) => (
						<li key={index}>{error}</li>
					))}
				</ul>
			)}
			{!!action && <AlertAction>{action}</AlertAction>}
		</Alert>
	)
}

/* ── Dirty state ──────────────────────────────────────────────────────────────── */

export interface DirtyStateBannerProps {
	title?: ReactNode
	description?: ReactNode
	/** Save and discard, usually. */
	actions?: ReactNode
	tone?: Extract<AlertTone, "neutral" | "info" | "warning">
	strings?: StringsProp<DirtyStateBannerStrings>
	className?: string
}

export function DirtyStateBanner({
	title,
	description,
	actions,
	tone = "warning",
	strings,
	className,
}: DirtyStateBannerProps) {
	const copy = { ...defaultDirtyStateBannerStrings, ...strings }

	return (
		<Alert tone={tone} className={cx("dirty-state-banner--component", className)}>
			<AlertTitle>{title ?? copy.title}</AlertTitle>
			<AlertDescription>{description ?? copy.description}</AlertDescription>
			{!!actions && <AlertAction>{actions}</AlertAction>}
		</Alert>
	)
}

/* ── Submit ───────────────────────────────────────────────────────────────────── */

export type SubmitState = "idle" | "submitting" | "succeeded"

export interface SubmitStateButtonProps extends Omit<ButtonProps, "loading" | "children"> {
	state?: SubmitState
	strings?: StringsProp<SubmitStateButtonStrings>
}

/**
 * A submit button that says what it is doing. The label stays visible beside the spinner
 * (unlike Button's `loading`). While submitting it is `aria-disabled`, keeping focus while
 * blocking a second submission; "Saved" carries a check.
 */
export function SubmitStateButton({ state = "idle", strings, disabled, onClick, className, ...props }: SubmitStateButtonProps) {
	const copy = { ...defaultSubmitStateButtonStrings, ...strings }
	const submitting = state === "submitting"

	return (
		<Button
			type="submit"
			disabled={disabled}
			aria-disabled={submitting || undefined}
			aria-busy={submitting || undefined}
			data-submit-state={state}
			className={cx("submit-state-button--component", className)}
			onClick={(event) => {
				if (submitting) {
					event.preventDefault()
					return
				}
				onClick?.(event)
			}}
			{...props}
		>
			{submitting && <Loader2Icon aria-hidden className={styles.submitSpinner} />}
			{state === "succeeded" && <CheckIcon aria-hidden />}
			{copy[state]}
		</Button>
	)
}
