/**
 * OnboardingChecklist: the steps a new account works through. Opens the next unfinished
 * step by default. Built on `base/accordion`'s `items` API to reuse its canonical row.
 */
import { CheckIcon, CircleDotIcon, CircleIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ComponentProps, ReactNode } from "react"

import { Accordion, type AccordionItemData, type AccordionSurface } from "@/components/base/accordion"
import { IconBadge, type IconBadgeTone } from "@/components/base/display"
import { Progress } from "@/components/base/feedback"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultChecklistStrings, type ChecklistStrings } from "./onboarding.strings"
import styles from "./onboarding.module.css"

export type ChecklistStepStatus = "completed" | "inProgress" | "pending"

export interface ChecklistStep {
	id: string
	status: ChecklistStepStatus
	title: ReactNode
	/** Usually a `<Badge>` — "Required", "Recommended". */
	badge?: ReactNode
	/** Shown when the step is open. Forms, instructions, an action row. */
	content?: ReactNode
	disabled?: boolean
}

/* `defaultValue` is omitted: a div's is a string, which would be an invalid accordion value. */
export interface ChecklistProps
	extends Omit<ComponentProps<"div">, "children" | "onChange" | "defaultValue"> {
	steps: ChecklistStep[]
	/** Uncontrolled starting state. Defaults to the first unfinished step. */
	defaultExpanded?: string[]
	/** Controlled. */
	expanded?: string[]
	onExpandedChange?: (expanded: string[]) => void
	/** Fires when a step opens — for analytics, not for state. */
	onStepOpen?: (id: string) => void
	multiple?: boolean
	surface?: AccordionSurface
	strings?: Partial<ChecklistStrings>
}

/* A static "you are here" glyph for `inProgress`, not a spinner. */
const ICON = {
	completed: CheckIcon,
	inProgress: CircleDotIcon,
	pending: CircleIcon,
} as const

/* Paired with ICON above: one status picks both the glyph and the medallion's tone. */
const INDICATOR_TONE: Record<ChecklistStepStatus, IconBadgeTone> = {
	completed: "success",
	inProgress: "primary",
	pending: "neutral",
}

/** The next thing to do: the first step that is neither finished nor unavailable. */
function nextStepOf(steps: ChecklistStep[]): string[] {
	const next = steps.find((step) => step.status !== "completed" && !step.disabled)
	return next ? [next.id] : []
}

export function Checklist({
	steps,
	defaultExpanded,
	expanded: expandedProp,
	onExpandedChange,
	onStepOpen,
	multiple = false,
	surface = "bordered",
	strings,
	className,
	...props
}: ChecklistProps) {
	const copy = { ...defaultChecklistStrings, ...strings }
	const controlled = expandedProp !== undefined

	/* Computed once: the first open state does not follow later prop changes. */
	const [initial] = useState(() => defaultExpanded ?? nextStepOf(steps))
	const [internal, setInternal] = useState<string[]>(initial)
	/* State, not a ref: it is read during render. */
	const [touched, setTouched] = useState(false)

	/*
	 * The open step is derived, not synchronised, because steps often arrive after mount.
	 * The component stops choosing once the reader acts; `touched` keeps a closed step closed.
	 */
	const choosing =
		!controlled && !touched && defaultExpanded === undefined && internal.length === 0
	const expanded = controlled ? expandedProp : choosing ? nextStepOf(steps) : internal

	/* Reports only the transition into open, so a re-render is not a second event. */
	const previous = useRef<Set<string>>(new Set(initial))
	useEffect(() => {
		if (onStepOpen) {
			for (const id of expanded) if (!previous.current.has(id)) onStepOpen(id)
		}
		previous.current = new Set(expanded)
	}, [expanded, onStepOpen])

	const items: AccordionItemData[] = steps.map((step) => {
		const Icon = ICON[step.status]
		const label = {
			completed: copy.statusCompleted,
			inProgress: copy.statusInProgress,
			pending: copy.statusPending,
		}[step.status]

		const done = step.status === "completed"

		return {
			value: step.id,
			/* A finished step's title recedes along with its medallion. */
			title: done ? <span className={styles.titleDone}>{step.title}</span> : step.title,
			badge: step.badge,
			content: step.content,
			disabled: step.disabled,
			/* The indicator is the row's only status, so it is labelled, not hidden. */
			icon: (
				/* The kit's medallion with the status as a tone; the class only sizes it for the row. */
				<IconBadge
					icon={Icon}
					tone={INDICATOR_TONE[step.status]}
					shape="circle"
					solid={step.status === "inProgress"}
					role="img"
					aria-label={label}
					className={styles.indicator}
				/>
			),
		}
	})

	const completed = steps.filter((step) => step.status === "completed").length

	return (
		<div className={cx("checklist--component", styles.checklistRoot, className)}>
			{/* Overall progress. */}
			{steps.length > 0 && (
				<div className={styles.checklistProgress}>
					<span className={styles.checklistProgressHead}>
						<DisplayLabel>{copy.progressLabel}</DisplayLabel>
						<Text tag="span" size="xs" type="secondary" numeric>
							{copy.formatProgress(completed, steps.length)}
						</Text>
					</span>
					<Progress
						value={completed}
						max={steps.length}
						tone={completed === steps.length ? "success" : "primary"}
						label={copy.formatProgress(completed, steps.length)}
					/>
				</div>
			)}

			<Accordion
				multiple={multiple}
				surface={surface}
				value={expanded}
				onValueChange={(next) => {
					const ids = (next as string[]) ?? []
					setTouched(true)
					if (!controlled) setInternal(ids)
					onExpandedChange?.(ids)
				}}
				items={items}
				className={styles.checklist}
				{...props}
			/>
		</div>
	)
}
