/**
 * Steps: a sequence a reader is partway through. Two components, not an `orientation`
 * prop: the vertical rail with hanging content and the numbered horizontal bar differ.
 */
import { CheckIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import type { BadgeTone } from "@/components/base/badge"
import { Badge } from "@/components/base/badge"
import { Stepper, Timeline, type TimelineItem } from "@/components/base/timeline"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { resolveStrings } from "@/lib/strings"

import { defaultStepsStrings, type StepsStrings } from "./timelines.strings"
import styles from "./timelines.module.css"

export type StepStatus = "completed" | "current" | "upcoming"

export interface Step {
	id: string
	title: string
	description?: string
	status: StepStatus
	/** Already formatted. */
	timestamp?: string
	badge?: string
	badgeTone?: BadgeTone
	/** Hangs under the step in the vertical form. */
	content?: ReactNode
}

export interface StepsProps extends Omit<ComponentProps<"div">, "children"> {
	steps: Step[]
	strings?: Partial<StepsStrings>
}

/** The vertical form: the shared rail, with each step's content hanging under it. */
export function Steps({ steps, className, ...props }: Omit<StepsProps, "strings">) {
	const items: TimelineItem[] = steps.map((step) => ({
		id: step.id,
		/*
		 * `completed` maps to the rail's `progress`, not its `completed`: a passed step is a
		 * position, not an outcome. `upcoming` is the rail's `pending`.
		 */
		status:
			step.status === "upcoming"
				? "pending"
				: step.status === "completed"
					? "progress"
					: step.status,
		icon: step.status === "completed" ? CheckIcon : undefined,
		timestamp: step.timestamp,
		title: (
			<span className={styles.titleRow}>
				<Text tag="span" weight="semibold" lineHeight="tight">
					{step.title}
				</Text>
				{step.badge != null && <Badge tone={step.badgeTone ?? "secondary"}>{step.badge}</Badge>}
			</span>
		),
		description: step.description,
		children: step.content,
	}))

	return (
		<div className={cx("steps--component", className)} {...props}>
			<Timeline items={items} />
		</div>
	)
}

/**
 * The horizontal form: numbered markers with connectors, over base's `Stepper`. Scrolls
 * rather than clipping.
 */
export function StepsBar({ steps, strings, className, ...props }: StepsProps) {
	const copy = resolveStrings(defaultStepsStrings, strings)

	return (
		<div tabIndex={0} className={cx("steps-bar--component", styles.stepsBar, className)} {...props}>
			<Stepper
				variant="bar"
				steps={steps.map((step) => ({
					id: step.id,
					label: step.title,
					hint: step.description,
					status: step.status,
				}))}
				strings={{ position: copy.stepLabel, completed: copy.completed, current: copy.current }}
			/>
		</div>
	)
}
