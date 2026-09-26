/**
 * LoadingState and ErrorState — a whole region that is working or has failed. Distinct
 * from `Empty` ("nothing here"): the three are different answers and must look different.
 */
import { Loader2Icon, TriangleAlertIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import type { StringsProp } from "@/lib/strings"

import {
	defaultErrorStateStrings,
	defaultLoadingStateStrings,
	type ErrorStateStrings,
	type LoadingStateStrings,
} from "./states.strings"
import styles from "./feedback.module.css"

export interface LoadingStateProps extends ComponentProps<"div"> {
	/** Copy for the wait, replacing the default. */
	label?: ReactNode
	/** Overrides the default copy. */
	strings?: StringsProp<LoadingStateStrings>
}

/**
 * A whole region that is working. A region, not an overlay — it occupies what the content
 * will occupy. Distinct from `Empty` and `ErrorState`: the three are different answers and
 * must look different.
 */
export function LoadingState({ label, strings, className, ...props }: LoadingStateProps) {
	const copy = { ...defaultLoadingStateStrings, ...strings }

	return (
		<div
			// `status`: a progress report, not an interruption.
			role="status"
			aria-live="polite"
			className={cx("loading-state--component", styles.state, className)}
			{...props}
		>
			<Loader2Icon aria-hidden className={cx(styles.stateIcon, styles.stateSpinner)} />
			<Text type="secondary" size="sm">
				{label ?? copy.label}
			</Text>
		</div>
	)
}

export interface ErrorStateProps extends Omit<ComponentProps<"div">, "title"> {
	title?: ReactNode
	description?: ReactNode
	/**
	 * Renders the retry control when set. With neither this nor `action`, the state reports
	 * the failure without offering a dead button.
	 */
	onRetry?: () => void
	/** Replaces the retry control entirely. */
	action?: ReactNode
	strings?: StringsProp<ErrorStateStrings>
}

/** A whole region that has failed, announced at once. */
export function ErrorState({
	title,
	description,
	onRetry,
	action,
	strings,
	className,
	...props
}: ErrorStateProps) {
	const copy = { ...defaultErrorStateStrings, ...strings }

	return (
		<div
			// `alert`: a failure is announced immediately.
			role="alert"
			className={cx("error-state--component", styles.state, className)}
			{...props}
		>
			<TriangleAlertIcon aria-hidden className={cx(styles.stateIcon, styles.stateIconError)} />
			<Text weight="medium">{title ?? copy.title}</Text>
			<Text type="secondary" size="sm">
				{description ?? copy.description}
			</Text>
			{action ??
				(onRetry ? (
					<Button tone="neutral" buttonStyle="outline" onClick={onRetry}>
						{copy.retry}
					</Button>
				) : null)}
		</div>
	)
}
