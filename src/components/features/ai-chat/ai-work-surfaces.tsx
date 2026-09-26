/**
 * The surfaces that report what an agent is doing: a tool call, a plan of tasks, the
 * identity strip, and the approval prompt. A tool call header is a disclosure button only
 * when there are arguments or a result to show.
 */
import { resolveStrings } from "@/lib/strings"
import { useState, type ReactNode } from "react"
import {
	AlertCircleIcon, BotIcon, CheckIcon, ChevronDownIcon, CircleDotIcon, CircleIcon,
	Loader2Icon, MinusCircleIcon, ShieldCheckIcon, WrenchIcon, XCircleIcon, XIcon,
	type LucideIcon,
} from "lucide-react"

import { Badge, type BadgeTone } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { IconBadge } from "@/components/base/display"
import { DisplayLabel, Text } from "@/components/base/typography"
import { Duration, MonoValue, SecondaryValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import {
	defaultAiAgentStrings, defaultAiConfirmationStrings, defaultAiTaskStrings,
	defaultAiToolCallStrings, type AiTaskStrings,
} from "./ai-chat.strings"
import type {
	AiAgentProps, AiAgentStatus, AiConfirmationProps, AiTaskItem, AiTaskProps, AiTaskStatus,
	AiToolCallProps, AiToolCallStatus,
} from "./ai-chat.types"
import styles from "./ai-chat.module.css"

const TOOL_STATUS = {
	pending: { tone: "neutral", icon: CircleDotIcon },
	running: { tone: "primary", icon: Loader2Icon },
	success: { tone: "success", icon: CheckIcon },
	error: { tone: "destructive", icon: AlertCircleIcon },
} satisfies Record<AiToolCallStatus, { tone: BadgeTone; icon: LucideIcon }>

/** Tenths of a second below ten seconds only. */
function ToolDuration({ label, ms }: { label: string; ms: number }) {
	return (
		<span className={styles.toolDuration}>
			<SecondaryValue size="xs">{label}</SecondaryValue>
			<Duration
				value={ms}
				from="milliseconds"
				maxParts={1}
				size="xs"
				type="secondary"
				maximumFractionDigits={ms < 10_000 ? 1 : 0}
			/>
		</span>
	)
}

function ToolDetail({
	label,
	tone,
	children,
}: {
	label: string
	tone?: "destructive"
	children: ReactNode
}) {
	return (
		<div className={styles.toolDetail}>
			<DisplayLabel>{label}</DisplayLabel>
			{/* Focusable, so keyboard readers can scroll it. */}
			<pre tabIndex={0} data-tone={tone} className={styles.pre}>{children}</pre>
		</div>
	)
}

export function AiToolCall({
	name,
	status,
	icon = WrenchIcon,
	args,
	result,
	error,
	durationMs,
	expanded: expandedProp,
	defaultExpanded = false,
	onExpandedChange,
	className,
	strings,
}: AiToolCallProps) {
	const copy = { ...defaultAiToolCallStrings, ...strings }

	const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
	const expanded = expandedProp ?? internalExpanded

	const setExpanded = (next: boolean) => {
		if (expandedProp === undefined) setInternalExpanded(next)
		onExpandedChange?.(next)
	}

	const label: Record<AiToolCallStatus, string> = {
		pending: copy.pending,
		running: copy.running,
		success: copy.success,
		error: copy.error,
	}
	const StatusIcon = TOOL_STATUS[status].icon
	const ToolIcon = icon
	const hasDetails = !!(args || result || error)

	const header = (
		<>
			<ToolIcon aria-hidden className={styles.disclosureIcon} />
			<MonoValue className={styles.toolName}>{name}</MonoValue>
			<span className={styles.toolMeta}>
				<Badge tone={TOOL_STATUS[status].tone}>
					<StatusIcon aria-hidden data-spin={status === "running" || undefined} />
					{label[status]}
				</Badge>
				{!!durationMs && <ToolDuration label={copy.durationLabel} ms={durationMs} />}
			</span>
			{hasDetails && (
				<ChevronDownIcon
					aria-hidden
					data-expanded={expanded || undefined}
					className={styles.disclosureChevron}
				/>
			)}
		</>
	)

	return (
		<div data-status={status} className={cx("ai-tool-call--component", styles.tool, className)}>
			{hasDetails ? (
				<button
					type="button"
					aria-expanded={expanded}
					aria-label={expanded ? copy.collapse : copy.expand}
					onClick={() => setExpanded(!expanded)}
					className={styles.toolHeader}
				>
					{header}
				</button>
			) : (
				<div className={styles.toolHeader}>{header}</div>
			)}

			{expanded && hasDetails && (
				<div className={styles.toolBody}>
					{!!args && <ToolDetail label={copy.args}>{args}</ToolDetail>}
					{status === "error" && !!error ? (
						<ToolDetail label={copy.error} tone="destructive">{error}</ToolDetail>
					) : (
						!!result && <ToolDetail label={copy.result}>{result}</ToolDetail>
					)}
				</div>
			)}
		</div>
	)
}

const TASK_STATUS = {
	queued: { icon: CircleIcon, tone: "neutral" },
	running: { icon: Loader2Icon, tone: "primary" },
	completed: { icon: CheckIcon, tone: "success" },
	failed: { icon: AlertCircleIcon, tone: "destructive" },
	cancelled: { icon: XCircleIcon, tone: "neutral" },
	skipped: { icon: MinusCircleIcon, tone: "neutral" },
} satisfies Record<AiTaskStatus, { icon: LucideIcon; tone: BadgeTone }>

function TaskRow({
	item,
	depth,
	density,
	indent,
	copy,
}: {
	item: AiTaskItem
	depth: number
	density: "compact" | "expanded"
	indent: number
	copy: AiTaskStrings
}) {
	const status = item.status ?? "queued"
	const Icon = item.icon ?? TASK_STATUS[status].icon
	const hasChildren = !!item.children?.length

	/* The top level opens even in compact density. */
	const [open, setOpen] = useState(density === "expanded" || depth === 0)

	return (
		<>
			<div
				data-nested={depth > 0 || undefined}
				style={{ "--ai-task-depth": depth * indent } as React.CSSProperties}
				className={styles.taskRow}
			>
				<div className={styles.taskTitleRow}>
					{hasChildren ? (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="ghost"
							iconOnly
							aria-expanded={open}
							aria-label={open ? copy.collapseSubtasks : copy.expandSubtasks}
							onClick={() => setOpen((current) => !current)}
							className={styles.taskToggle}
						>
							<ChevronDownIcon data-expanded={open || undefined} />
						</Button>
					) : (
						/* Holds the column, so titles line up whether or not a row has children. */
						<span aria-hidden className={styles.taskToggleSpacer} />
					)}

					<Icon
						aria-hidden
						data-status={status}
						data-spin={status === "running" || undefined}
						className={styles.taskIcon}
					/>

					<Text
						weight={status === "running" ? "semibold" : "medium"}
						type={status === "queued" || status === "cancelled" ? "secondary" : "main"}
						data-status={status}
						className={styles.taskTitle}
					>
						{item.title}
					</Text>
					<Badge tone={TASK_STATUS[status].tone}>{copy.statusLabels[status]}</Badge>
					{!!item.rightSlot && (
						<SecondaryValue size="xs" className={styles.numeric}>
							{item.rightSlot}
						</SecondaryValue>
					)}
				</div>
				{!!item.body && <div className={styles.taskExtra}>{item.body}</div>}
			</div>

			{hasChildren &&
				open &&
				item.children?.map((child) => (
					<TaskRow
						key={child.id}
						item={child}
						depth={depth + 1}
						density={density}
						indent={indent}
						copy={copy}
					/>
				))}
		</>
	)
}

export function AiTask({
	task,
	density = "compact",
	indent = 1.125,
	className,
	strings,
}: AiTaskProps) {
	const copy = resolveStrings(defaultAiTaskStrings, strings)

	return (
		<div className={cx("ai-task--component", styles.task, className)}>
			<TaskRow item={task} depth={0} density={density} indent={indent} copy={copy} />
		</div>
	)
}

const AGENT_STATUS = {
	idle: "neutral",
	thinking: "primary",
	working: "primary",
	done: "success",
	error: "destructive",
	offline: "neutral",
} satisfies Record<AiAgentStatus, BadgeTone>

export function AiAgent({
	name,
	icon,
	avatar,
	subtitle,
	tone = "primary",
	status,
	variant = "inline",
	trailing,
	className,
	strings,
}: AiAgentProps) {
	const copy = resolveStrings(defaultAiAgentStrings, strings)
	const Icon = icon ?? BotIcon

	const renderedAvatar = avatar ?? (
		<span aria-hidden data-tone={tone} data-variant={variant} className={styles.avatar}>
			<Icon />
		</span>
	)

	/* The badge's own dot, pulsing only while running. */
	const statusPill = !!status && (
		<Badge tone={AGENT_STATUS[status]} dot pulse={status === "thinking" || status === "working"}>
			{copy.statusLabels[status]}
		</Badge>
	)

	return (
		<div
			data-variant={variant}
			className={cx("ai-agent--component", styles.agent, className)}
		>
			{renderedAvatar}
			<div className={styles.agentText}>
				<div className={styles.agentNameRow}>
					<Text
						tag="span"
						weight={variant === "card" ? "semibold" : "medium"}
						truncate
					>
						{name}
					</Text>
					{variant === "card" && statusPill}
				</div>
				{!!subtitle && (
					<Text tag="span" size="xs" type="secondary" truncate>
						{subtitle}
					</Text>
				)}
			</div>
			{variant === "inline" && statusPill}
			{!!trailing && <div className={styles.agentTrailing}>{trailing}</div>}
		</div>
	)
}

export function AiConfirmation({
	title,
	description,
	icon = ShieldCheckIcon,
	tone = "neutral",
	status = "pending",
	onApprove,
	onReject,
	approveLabel,
	rejectLabel,
	details,
	className,
	strings,
}: AiConfirmationProps) {
	const copy = { ...defaultAiConfirmationStrings, ...strings }

	return (
		<div
			/* A live region: it appears mid-stream and blocks the agent. */
			role="region"
			aria-live="polite"
			data-tone={tone}
			className={cx("ai-confirmation--component", styles.confirmation, className)}
		>
			<div className={styles.confirmationHeader}>
				<IconBadge icon={icon} tone={tone} shape="rounded" />
				<div className={styles.confirmationText}>
					<Text weight="medium">{title}</Text>
					{!!description && <Text type="secondary">{description}</Text>}
					{/* A labelled group, so the details being confirmed are announced as a unit. */}
					{!!details && (
						<div role="group" aria-label={copy.detailsLabel} className={styles.confirmationDetails}>
							{details}
						</div>
					)}
				</div>
			</div>

			<div className={styles.confirmationFooter}>
				{status === "pending" ? (
					<>
						<Text size="xs" type="secondary">{copy.pending}</Text>
						<div className={styles.confirmationActions}>
							<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onReject}>
								<XIcon />
								{rejectLabel ?? copy.reject}
							</Button>
							<Button
								type="button"
								tone={tone === "destructive" ? "destructive" : "primary"}
								onClick={onApprove}
							>
								<CheckIcon />
								{approveLabel ?? copy.approve}
							</Button>
						</div>
					</>
				) : status === "approved" ? (
					<Text size="xs" type="success" weight="medium" className={styles.outcome}>
						<CheckIcon aria-hidden />
						{copy.approved}
					</Text>
				) : (
					<Text size="xs" type="secondary" weight="medium" className={styles.outcome}>
						<XIcon aria-hidden />
						{copy.rejected}
					</Text>
				)}
			</div>
		</div>
	)
}
