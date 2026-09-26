/**
 * ActivityHeadline — the sentence, assembled from typed segments.
 *
 * Without segments, the plain headline is split on the actor's name (first occurrence
 * only) so the actor is still clickable.
 */
import { Fragment, type ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { ActivityResourceTag } from "./activity-parts"
import type {
	ActivityActor, ActivityHeadlineSegment, ActivityItem, ActivityResourceConfig,
	ActivityResourceRef,
} from "./activities.types"
import styles from "./activities.module.css"

export interface ActivityHeadlineProps<TData = unknown> {
	activity: ActivityItem<TData>
	/** Matched against a segment's `actorId` to render "You". */
	currentUserId?: string
	youLabel: string
	onActorClick?: (actor: ActivityActor, activity: ActivityItem<TData>) => void
	onResourceClick?: (
		resource: ActivityResourceRef,
		config: ActivityResourceConfig | undefined,
		activity: ActivityItem<TData>,
	) => void
	getResourceConfig?: (ref: ActivityResourceRef) => ActivityResourceConfig | undefined
}

function Actor<TData>({
	actorId,
	text,
	href,
	activity,
	youLabel,
	currentUserId,
	onActorClick,
}: {
	actorId?: string
	text: string
	href?: string
	activity: ActivityItem<TData>
	youLabel: string
	currentUserId?: string
	onActorClick?: (actor: ActivityActor, activity: ActivityItem<TData>) => void
}) {
	/* Both must be defined, or `undefined === undefined` makes every actor "You". */
	const isYou = currentUserId !== undefined && actorId !== undefined && currentUserId === actorId
	const display = isYou ? youLabel : text
	const actor: ActivityActor = activity.actor ?? { id: actorId, name: text }

	if (href) {
		return (
			<a
				href={href}
				className={styles.actor}
				onClick={(event) => {
					// A handler means the consumer routes it; the href stays for middle-click.
					if (!onActorClick) return
					event.preventDefault()
					event.stopPropagation()
					onActorClick(actor, activity)
				}}
			>
				<Text tag="span" size="inherit" type="inherit" weight="semibold">{display}</Text>
			</a>
		)
	}

	if (onActorClick) {
		return (
			<button
				type="button"
				className={styles.actor}
				onClick={(event) => {
					event.stopPropagation()
					onActorClick(actor, activity)
				}}
			>
				<Text tag="span" size="inherit" type="inherit" weight="semibold">{display}</Text>
			</button>
		)
	}

	return (
		<Text tag="span" size="inherit" weight="semibold">
			{display}
		</Text>
	)
}

function Segments<TData>({ segments, props }: {
	segments: readonly ActivityHeadlineSegment[]
	props: ActivityHeadlineProps<TData>
}) {
	return (
		<>
			{segments.map((segment, index) => {
				const key = `${index}-${segment.type}`

				switch (segment.type) {
					case "actor":
						return (
							<Fragment key={key}>
								<Actor<TData>
									actorId={segment.actorId}
									text={segment.text}
									href={segment.href}
									activity={props.activity}
									youLabel={props.youLabel}
									currentUserId={props.currentUserId}
									onActorClick={props.onActorClick}
								/>{" "}
							</Fragment>
						)

					// A field name and a value are both the emphasised half of the sentence.
					case "field":
					case "value":
						return (
							<Fragment key={key}>
								<Text tag="span" size="inherit" weight="semibold">
									{segment.text}
								</Text>{" "}
							</Fragment>
						)

					case "status":
						return (
							<Fragment key={key}>
								<Badge tone={segment.tone ?? "neutral"}>{segment.text}</Badge>{" "}
							</Fragment>
						)

					case "resource": {
						const config = props.getResourceConfig?.(segment.resource)
						return (
							<Fragment key={key}>
								<ActivityResourceTag
									showDetails={false}
									resource={segment.resource}
									config={config}
									fallbackText={segment.text}
									onClick={
										props.onResourceClick
											? () => props.onResourceClick?.(segment.resource, config, props.activity)
											: undefined
									}
								/>{" "}
							</Fragment>
						)
					}

					default:
						return (
							<Fragment key={key}>
								<Text tag="span" size="inherit">{segment.text}</Text>{" "}
							</Fragment>
						)
				}
			})}
		</>
	)
}

function Fallback<TData>(props: ActivityHeadlineProps<TData>): ReactNode {
	const { activity } = props
	// The event key is the last resort — better than a blank line.
	const sentence = activity.headline ?? activity.event
	const name = activity.actor?.name

	if (!name || !sentence.includes(name)) {
		return <Text tag="span" size="inherit">{sentence}</Text>
	}

	const [before, ...rest] = sentence.split(name)
	return (
		<>
			{!!before && <Text tag="span" size="inherit">{before}</Text>}
			<Actor<TData>
				actorId={activity.actor?.id}
				text={name}
				href={activity.actor?.href}
				activity={activity}
				youLabel={props.youLabel}
				currentUserId={props.currentUserId}
				onActorClick={props.onActorClick}
			/>
			{/* Rejoined on the name, so a second occurrence stays as words. */}
			{rest.length > 0 && <Text tag="span" size="inherit">{rest.join(name)}</Text>}
		</>
	)
}

export function ActivityHeadline<TData = unknown>(props: ActivityHeadlineProps<TData>) {
	const segments = props.activity.segments
	return (
		<span className={cx("activity-headline--component", styles.headline)}>
			{segments && segments.length > 0 ? (
				<Segments<TData> segments={segments} props={props} />
			) : (
				<Fallback<TData> {...props} />
			)}
		</span>
	)
}
