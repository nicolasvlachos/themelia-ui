/**
 * MilestonesTimeline: a project's milestones on the shared rail. An in-flight milestone's
 * percentage renders through `base/feedback`'s Progress.
 */
import { CheckIcon, CircleIcon, ClockIcon, XIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import type { BadgeTone } from "@/components/base/badge"
import { Badge } from "@/components/base/badge"
import { Progress } from "@/components/base/feedback"
import { Timeline, type TimelineItem, type TimelineStatus } from "@/components/base/timeline"
import { Text } from "@/components/base/typography"
import { Percent } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultMilestonesStrings, type MilestonesStrings } from "./timelines.strings"
import styles from "./timelines.module.css"

export type MilestoneStatus = "completed" | "inProgress" | "upcoming" | "blocked"

export interface Milestone {
	id: string
	title: ReactNode
	description?: ReactNode
	/** Already formatted. */
	dueDate?: string
	status: MilestoneStatus
	/** 0–100. Drawn only while the milestone is in flight. */
	progress?: number
}

export interface MilestonesTimelineProps extends Omit<ComponentProps<"div">, "children"> {
	milestones: Milestone[]
	strings?: Partial<MilestonesStrings>
}

const STATUS: Record<MilestoneStatus, TimelineStatus> = {
	completed: "completed",
	inProgress: "current",
	upcoming: "pending",
	blocked: "destructive",
}

const TONE: Record<MilestoneStatus, BadgeTone> = {
	completed: "success",
	inProgress: "primary",
	upcoming: "secondary",
	blocked: "destructive",
}

const ICON = {
	completed: CheckIcon,
	inProgress: ClockIcon,
	upcoming: CircleIcon,
	blocked: XIcon,
} as const

export function MilestonesTimeline({
	milestones,
	strings,
	className,
	...props
}: MilestonesTimelineProps) {
	const copy = { ...defaultMilestonesStrings, ...strings }
	const label: Record<MilestoneStatus, string> = {
		completed: copy.completed,
		inProgress: copy.inProgress,
		upcoming: copy.upcoming,
		blocked: copy.blocked,
	}

	const items: TimelineItem[] = milestones.map((milestone) => {
		const inFlight = milestone.status === "inProgress" && typeof milestone.progress === "number"
		const percent = inFlight ? Math.min(Math.max(milestone.progress!, 0), 100) : 0

		return {
			id: milestone.id,
			status: STATUS[milestone.status],
			icon: ICON[milestone.status],
			timestamp: milestone.dueDate != null ? copy.dueOn(milestone.dueDate) : undefined,
			title: (
				<span className={styles.titleRow}>
					<Text tag="span" weight="medium" lineHeight="tight">
						{milestone.title}
					</Text>
					<Badge tone={TONE[milestone.status]}>{label[milestone.status]}</Badge>
				</span>
			),
			description: milestone.description,
			children: inFlight ? (
				<div className={styles.progressGroup}>
					<Progress
						value={percent}
						/* The bar has no visible label; name it after the milestone. */
						label={
							typeof milestone.title === "string"
								? copy.progressLabel(milestone.title)
								: copy.progressLabel(label[milestone.status])
						}
					/>
					<Percent value={Math.round(percent)} scaled size="xs" type="secondary" />
				</div>
			) : undefined,
		}
	})

	return (
		<div className={cx("milestones-timeline--component", className)} {...props}>
			<Timeline items={items} />
		</div>
	)
}
