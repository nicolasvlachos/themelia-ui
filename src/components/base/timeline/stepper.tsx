/**
 * Stepper — a numbered sequence the reader is partway through, rendered as an `<ol>`: a
 * marker per step (numeral, then a tick), connectors, and a label with an optional hint.
 * In base because its callers (`StepsBar`, `BreadcrumbProgress`) sit in different layers.
 */
import { CheckIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { VisuallyHidden } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { resolveStrings } from "@/lib/strings"

import { defaultStepperStrings, type StepperStrings } from "./stepper.strings"
import styles from "./stepper.module.css"

/**
 * Where a step stands: a position, not an outcome (a failed step is a Timeline entry).
 * `complete` is accepted as an alias and normalised to `completed`.
 */
export type StepperStatus = "completed" | "complete" | "current" | "upcoming"

/**
 * `bar`: labels under ringed markers, a connector through the marker row, equal columns.
 * `trail`: labels beside filled markers and a rule filling the row; below `lg` only the
 * markers show.
 */
export type StepperVariant = "bar" | "trail"

export interface StepperStep {
	/** Stable identity for the step, handed back to `onStepClick`. */
	id: string
	label: ReactNode
	/** A second, quieter line under the label. */
	hint?: ReactNode
	/** Where the step stands. Defaults to `upcoming`. */
	status?: StepperStatus
	/**
	 * The step's whole accessible name, replacing its announced position, label, hint and
	 * state. `aria-current` still marks the current step.
	 */
	accessibleName?: string
}

export interface StepperProps extends Omit<ComponentProps<"ol">, "children"> {
	steps: StepperStep[]
	/** Which drawing. Defaults to `bar`. */
	variant?: StepperVariant
	/**
	 * Makes each step a button: completed steps and the current one are reachable, upcoming
	 * ones disabled. Without it the steps are plain list items.
	 */
	onStepClick?: (id: string, index: number) => void
	strings?: Partial<StepperStrings>
}

const canonical = (status: StepperStatus | undefined) =>
	status === "complete" ? "completed" : (status ?? "upcoming")

export function Stepper({
	steps,
	variant = "bar",
	onStepClick,
	strings,
	className,
	...props
}: StepperProps) {
	const copy = resolveStrings(defaultStepperStrings, strings)
	const statuses = steps.map((step) => canonical(step.status))
	const bar = variant === "bar"
	const pressable = onStepClick != null

	return (
		<ol
			data-variant={variant}
			className={cx("stepper--component", styles.stepper, className)}
			{...props}
		>
			{steps.map((step, index) => {
				const status = statuses[index]
				const completed = status === "completed"
				const current = status === "current"
				const last = index === steps.length - 1
				const named = step.accessibleName != null
				const state = completed ? copy.completed : current ? copy.current : undefined
				// On the button when there is one (it takes focus), otherwise on the list item.
				const ariaCurrent = current ? ("step" as const) : undefined

				const content = (
					<>
						{/* Decoration: the position and state are announced in text below. */}
						<span className={styles.stepRail} aria-hidden="true">
							{bar && (
								/* The half behind a step takes the previous step's state. */
								<span
									data-filled={statuses[index - 1] === "completed" || undefined}
									data-hidden={index === 0 || undefined}
									className={styles.stepLine}
								/>
							)}
							<span className={cx("stepper--marker", styles.stepMarker)}>
								{completed ? (
									<CheckIcon className={styles.stepCheck} />
								) : (
									/* `type="inherit"`: the colour belongs to the marker. */
									<Text
										tag="span"
										size="xs"
										weight={bar ? "bold" : "semibold"}
										numeric
										type="inherit"
									>
										{index + 1}
									</Text>
								)}
							</span>
							{bar && (
								<span
									data-filled={completed || undefined}
									data-hidden={last || undefined}
									className={styles.stepLine}
								/>
							)}
						</span>

						{/*
						 * Spans, since this may sit inside a button; the explicit spaces keep the
						 * announced words apart.
						 */}
						<span className={styles.stepText}>
							<VisuallyHidden>
								{named ? step.accessibleName : copy.position(index + 1, steps.length)}
							</VisuallyHidden>{" "}
							<Text
								tag="span"
								weight="semibold"
								lineHeight={bar ? "snug" : undefined}
								truncate={!bar}
								/* Set on the Text itself: a colour on a wrapper never reaches it. */
								type={status === "upcoming" ? "secondary" : "main"}
								aria-hidden={named || undefined}
								className={cx("stepper--label", styles.stepLabel)}
							>
								{step.label}
							</Text>
							{step.hint != null && (
								<>
									{" "}
									<Text
										tag="span"
										size="xs"
										type="secondary"
										lineHeight={bar ? "snug" : undefined}
										truncate={!bar}
										aria-hidden={named || undefined}
										className={cx("stepper--hint", styles.stepHint)}
									>
										{step.hint}
									</Text>
								</>
							)}
							{/* Colour and a tick are not the only signal of where a step stands. */}
							{!named && state != null && (
								<>
									{" "}
									<VisuallyHidden>{state}</VisuallyHidden>
								</>
							)}
						</span>
					</>
				)

				const reachable = pressable && (completed || current)

				return (
					<li
						key={step.id}
						data-status={status}
						aria-current={pressable ? undefined : ariaCurrent}
						className={cx("stepper--step", styles.step)}
					>
						{pressable ? (
							<button
								type="button"
								aria-current={ariaCurrent}
								disabled={!reachable}
								onClick={() => reachable && onStepClick?.(step.id, index)}
								className={cx("stepper--target", styles.stepTarget, styles.stepButton)}
							>
								{content}
							</button>
						) : (
							<span className={cx("stepper--target", styles.stepTarget)}>{content}</span>
						)}

						{/* The trail's rule sits outside the target and takes the leftover width. */}
						{!bar && !last && (
							<span
								aria-hidden="true"
								data-filled={completed || undefined}
								className={styles.stepLine}
							/>
						)}
					</li>
				)
			})}
		</ol>
	)
}
