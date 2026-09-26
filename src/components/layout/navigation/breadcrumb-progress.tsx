/**
 * BreadcrumbProgress: a wizard's position in a sequence, as a trail (not a hierarchy, so
 * not `Breadcrumbs`). Completed steps are reachable; upcoming ones are not.
 */
import type { ComponentProps, ReactNode } from "react"

import { Percent } from "@/components/primitives"
import { Stepper, type StepperStep } from "@/components/base/timeline"
import { DisplayLabel } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { resolveStrings } from "@/lib/strings"

import styles from "./navigation.module.css"
import { defaultBreadcrumbProgressStrings, type BreadcrumbProgressStrings } from "./navigation.strings"

export interface BreadcrumbProgressStep {
	id: string
	label: ReactNode
	/** A second line, shown from lg up where there is room for it. */
	hint?: ReactNode
}

export interface BreadcrumbProgressProps extends Omit<ComponentProps<"div">, "onSelect"> {
	steps: BreadcrumbProgressStep[]
	/** Zero-based. */
	currentIndex: number
	/**
	 * Makes completed steps and the current one reachable, never later ones. Without it the
	 * steps are plain list items.
	 */
	onStepClick?: (id: string, index: number) => void
	strings?: Partial<BreadcrumbProgressStrings>
}

export function BreadcrumbProgress({
	steps,
	currentIndex,
	onStepClick,
	strings,
	className,
	...props
}: BreadcrumbProgressProps) {
	const copy = resolveStrings(defaultBreadcrumbProgressStrings, strings)
	const total = steps.length || 1

	const trail: StepperStep[] = steps.map((step, index) => {
		const status = index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming"
		return {
			id: step.id,
			label: step.label,
			hint: step.hint,
			status,
			/* "Step 2: Billing" via `strings.step`: names the step at every width, and its status. */
			accessibleName: copy.step(index + 1, typeof step.label === "string" ? step.label : String(step.id), status),
		}
	})

	return (
		<div
			data-slot="breadcrumb-progress"
			className={cx("breadcrumb-progress--component", styles.progress, className)}
			{...props}
		>
			<div className={styles.progressHead}>
				<DisplayLabel>{copy.position(currentIndex + 1, total)}</DisplayLabel>
				<Percent value={Math.round(((currentIndex + 1) / total) * 100)} scaled size="xs" weight="semibold" />
			</div>

			{/* The trail is base's `Stepper`, shared with `StepsBar`. */}
			<Stepper variant="trail" steps={trail} onStepClick={onStepClick} />
		</div>
	)
}
