/**
 * The message surfaces: the shimmer, the bubble, the reasoning disclosure, and the step
 * timeline. "Thinking…" shimmers rather than spins: it signals text being written.
 */
import { useState, type CSSProperties, type ReactNode } from "react"
import {
	AlertCircleIcon, BotIcon, BrainIcon, CheckIcon, ChevronDownIcon, CircleIcon,
	CopyIcon, Loader2Icon, RotateCcwIcon, UserIcon,
} from "lucide-react"

import { Button } from "@/components/base/buttons"
import { useCopyToClipboard } from "@/components/base/copyable"
import { DisplayLabel, Text } from "@/components/base/typography"
import { Duration, SecondaryValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import {
	defaultAiChainOfThoughtStrings, defaultAiMessageBubbleStrings, defaultAiReasoningStrings,
} from "./ai-chat.strings"
import type {
	AiChainOfThoughtProps, AiChainStepStatus, AiMessageBubbleProps, AiMessageRole,
	AiReasoningProps, AiShimmerProps,
} from "./ai-chat.types"
import styles from "./ai-chat.module.css"

/** How long "Copied" stays up. */
const COPIED_MS = 1500

export function AiShimmer({
	children = "Thinking…",
	paused = false,
	duration,
	className,
}: AiShimmerProps) {
	/* `paused` is an explicit opt-out; reduced motion is handled in CSS. */
	if (paused) {
		return (
			<Text tag="span" type="secondary" weight="medium" className={className}>
				{children}
			</Text>
		)
	}

	/* `CSSProperties` has no index signature for custom properties; widen it for this one. */
	const style: CSSProperties & Partial<Record<"--ai-shimmer-duration", string>> =
		duration === undefined ? {} : { "--ai-shimmer-duration": `${duration}s` }

	return (
		<Text
			tag="span"
			type="inherit"
			weight="medium"
			role="status"
			aria-live="polite"
			style={style}
			className={cx("ai-shimmer--component", styles.shimmer, className)}
		>
			{children}
		</Text>
	)
}

const ROLE_ICON = {
	assistant: BotIcon,
	user: UserIcon,
	system: BotIcon,
} satisfies Record<AiMessageRole, typeof BotIcon>

export function AiMessageBubble({
	role = "assistant",
	avatar,
	avatarLabel,
	authorName,
	timestamp,
	children,
	plainText,
	loading = false,
	onCopy,
	onRegenerate,
	className,
	strings,
}: AiMessageBubbleProps) {
	const copy = { ...defaultAiMessageBubbleStrings, ...strings }
	const { copied, copy: writeCopy } = useCopyToClipboard({ confirmMs: COPIED_MS, onCopy })

	const FallbackIcon = ROLE_ICON[role]
	const body = plainText ?? (typeof children === "string" ? children : "")

	/* Copy and regenerate appear on assistant turns only; copy also needs something to write. */
	const canCopy = onCopy !== undefined || !!body
	const showActions = role === "assistant" && (canCopy || !!onRegenerate)

	return (
		<div data-role={role} className={cx("ai-message-bubble--component", styles.turn, className)}>
			{avatar ?? (
				<span aria-label={avatarLabel} data-role={role} className={styles.avatar}>
					<FallbackIcon aria-hidden />
				</span>
			)}

			<div className={styles.turnBody}>
				{(!!authorName || !!timestamp) && (
					<div className={styles.turnMeta}>
						{!!authorName && <Text tag="span" weight="medium">{authorName}</Text>}
						{!!timestamp && (
							<SecondaryValue size="xs" className={styles.numeric}>{timestamp}</SecondaryValue>
						)}
					</div>
				)}

				<div data-role={role} data-loading={loading || undefined} className={styles.bubble}>
					{typeof children === "string" || typeof children === "number" ? (
						<Text type="inherit" lineHeight="relaxed">{children}</Text>
					) : (
						children
					)}
				</div>

				{showActions && (
					<div className={styles.turnActions}>
						{canCopy && (
							<Button
								type="button"
								tone="neutral"
								buttonStyle="ghost"
								iconOnly
								aria-label={copy.copyAria}
								onClick={() => void writeCopy(body)}
							>
								<CopyIcon />
							</Button>
						)}
						{copied && <Text size="xs" type="success">{copy.copied}</Text>}
						{!!onRegenerate && (
							<Button
								type="button"
								tone="neutral"
								buttonStyle="ghost"
								iconOnly
								aria-label={copy.regenerateAria}
								onClick={onRegenerate}
							>
								<RotateCcwIcon />
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

/** `{{duration}}` becomes a real Duration, so the elapsed time is formatted, not printed. */
function thoughtForLabel(template: string, seconds: number): ReactNode {
	const parts = template.split(/\{\{\s*duration\s*\}\}/)
	if (parts.length === 1) return template

	return (
		<>
			{parts[0]}
			<Duration value={seconds} maxParts={1} />
			{parts.slice(1).join("{{duration}}")}
		</>
	)
}

export function AiReasoning({
	children,
	streaming = false,
	durationSeconds,
	expandWhileStreaming = true,
	defaultExpanded = false,
	expanded: expandedProp,
	onExpandedChange,
	className,
	strings,
}: AiReasoningProps) {
	const copy = { ...defaultAiReasoningStrings, ...strings }

	/* Open on mount too: a turn that mounts already streaming never crosses the edge. */
	const [internalExpanded, setInternalExpanded] = useState(
		() => defaultExpanded || (streaming && expandWhileStreaming),
	)
	const expanded = expandedProp ?? internalExpanded

	const setExpanded = (next: boolean) => {
		if (expandedProp === undefined) setInternalExpanded(next)
		onExpandedChange?.(next)
	}

	/*
	 * Reacts to the streaming edge only, so it never fights a reader's own toggle. Tracked in
	 * state (not a render-time ref) so the panel opens in the same commit streaming starts.
	 */
	const [wasStreaming, setWasStreaming] = useState(streaming)
	if (wasStreaming !== streaming) {
		setWasStreaming(streaming)
		if (expandWhileStreaming && expandedProp === undefined) {
			if (streaming) setInternalExpanded(true)
			else if (!defaultExpanded) setInternalExpanded(false)
		}
	}

	const header = streaming ? (
		<AiShimmer className={styles.grow}>{copy.thinking}</AiShimmer>
	) : (
		<Text tag="span" weight="medium" className={styles.grow}>
			{durationSeconds === undefined
				? copy.thoughtDone
				: thoughtForLabel(copy.thoughtFor, durationSeconds)}
		</Text>
	)

	return (
		<div className={cx("ai-reasoning--component", styles.disclosure, className)}>
			<button
				type="button"
				aria-expanded={expanded}
				aria-label={expanded ? copy.collapseAria : copy.expandAria}
				onClick={() => setExpanded(!expanded)}
				className={styles.disclosureTrigger}
			>
				<BrainIcon aria-hidden className={styles.disclosureIcon} />
				{header}
				<ChevronDownIcon
					aria-hidden
					data-expanded={expanded || undefined}
					className={styles.disclosureChevron}
				/>
			</button>

			{expanded && (
				<div className={styles.disclosureBody}>
					{typeof children === "string" ? (
						<Text type="secondary" lineHeight="relaxed" className={styles.preWrap}>
							{children}
						</Text>
					) : (
						<div className={styles.preWrap}>{children}</div>
					)}
				</div>
			)}
		</div>
	)
}

const STEP_ICON = {
	pending: CircleIcon,
	active: Loader2Icon,
	completed: CheckIcon,
	failed: AlertCircleIcon,
} satisfies Record<AiChainStepStatus, typeof CircleIcon>

export function AiChainOfThought({
	steps,
	hideHeader = false,
	streaming = false,
	className,
	strings,
}: AiChainOfThoughtProps) {
	const copy = { ...defaultAiChainOfThoughtStrings, ...strings }

	return (
		<div className={cx("ai-chain-of-thought--component", styles.chain, className)}>
			{!hideHeader && (
				<div className={styles.chainHeader}>
					<DisplayLabel>{copy.title}</DisplayLabel>
					{streaming && <AiShimmer className={styles.chainHint}>{copy.streamingHint}</AiShimmer>}
				</div>
			)}

			<ol className={styles.chainSteps}>
				{steps.map((step) => {
					const status = step.status ?? "pending"
					const Icon = step.icon ?? STEP_ICON[status]

					return (
						<li key={step.id} data-status={status} className={styles.chainStep}>
							{/* The rail is the step's ::before (CSS), omitted on the last step. */}
							<span aria-hidden data-status={status} className={styles.chainMarker}>
								<Icon data-spin={status === "active" || undefined} />
							</span>
							<div className={styles.chainStepBody}>
								<Text
									weight={status === "active" ? "semibold" : "medium"}
									type={status === "pending" ? "secondary" : "main"}
								>
									{step.title}
								</Text>
								{!!step.description && (
									<Text size="xs" type="secondary">{step.description}</Text>
								)}
								{!!step.body && <div className={styles.chainStepExtra}>{step.body}</div>}
							</div>
						</li>
					)
				})}
			</ol>
		</div>
	)
}
