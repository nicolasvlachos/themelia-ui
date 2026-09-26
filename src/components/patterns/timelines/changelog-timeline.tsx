/**
 * ChangelogTimeline: releases on the shared rail. A mapping only: an entry's kind picks a
 * tone and a label; `base/timeline` draws the rest.
 */
import type { ComponentProps, ReactNode } from "react"

import type { BadgeTone } from "@/components/base/badge"
import { Badge } from "@/components/base/badge"
import { Timeline, type TimelineItem, type TimelineStatus } from "@/components/base/timeline"
import { Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { defaultChangelogStrings, type ChangelogStrings } from "./timelines.strings"
import styles from "./timelines.module.css"

export type ChangelogKind = "added" | "removed" | "modified" | "fixed"

export interface ChangelogEntry {
	id: string
	kind: ChangelogKind
	title: ReactNode
	description?: ReactNode
	/** Shown in mono beside the title — it is an identifier, not prose. */
	version?: string
	/** Already formatted. */
	timestamp?: string
	author?: string
}

export interface ChangelogTimelineProps extends Omit<ComponentProps<"div">, "children"> {
	entries: ChangelogEntry[]
	strings?: Partial<ChangelogStrings>
}

/* `removed` is destructive rather than `error` — the kit has one word for that tone. */
const STATUS: Record<ChangelogKind, TimelineStatus> = {
	added: "success",
	removed: "destructive",
	modified: "warning",
	fixed: "current",
}

const TONE: Record<ChangelogKind, BadgeTone> = {
	added: "success",
	removed: "destructive",
	modified: "warning",
	fixed: "info",
}

/* No icon on the dot: the badge names the kind and carries its colour. */

export function ChangelogTimeline({ entries, strings, className, ...props }: ChangelogTimelineProps) {
	const copy = { ...defaultChangelogStrings, ...strings }
	const label: Record<ChangelogKind, string> = {
		added: copy.added,
		removed: copy.removed,
		modified: copy.modified,
		fixed: copy.fixed,
	}

	const items: TimelineItem[] = entries.map((entry) => ({
		id: entry.id,
		status: STATUS[entry.kind],
		timestamp: entry.timestamp,
		title: (
			<span className={styles.titleRow}>
				<Badge tone={TONE[entry.kind]}>{label[entry.kind]}</Badge>
				<Text tag="span" weight="medium" lineHeight="tight">
					{entry.title}
				</Text>
				{entry.version != null && <MonoValue size="xs" type="secondary">{entry.version}</MonoValue>}
			</span>
		),
		description:
			entry.author != null ? (
				<>
					{entry.description}
					<Text tag="span" size="xs" type="secondary" className={styles.byline}>
						{copy.byline(entry.author)}
					</Text>
				</>
			) : (
				entry.description
			),
	}))

	return (
		<div className={cx("changelog-timeline--component", className)} {...props}>
			<Timeline items={items} />
		</div>
	)
}
