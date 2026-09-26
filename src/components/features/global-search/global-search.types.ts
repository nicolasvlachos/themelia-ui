/**
 * GlobalSearch: the command palette's data shapes. One result shape with optional parts
 * (avatar or thumbnail, badge, meta, trailing value) across all kinds, bucketed by the
 * plain-string `group`, since the list renders every result the same way.
 */
import type { ReactNode } from "react"

import type { IconBadgeTone } from "@/components/base/display"

import type { GlobalSearchStrings } from "./global-search.strings"

/** The subtle fills available to a thumbnail or avatar. */
export type GlobalSearchTone = IconBadgeTone

/** One inline fact on the secondary line. */
export interface GlobalSearchMeta {
	icon?: ReactNode
	label: ReactNode
	/** Monospace and tabular figures: SKUs, order ids, reference codes. */
	mono?: boolean
}

export interface GlobalSearchBadge {
	label: ReactNode
	tone: "neutral" | "primary" | "success" | "warning" | "destructive" | "info"
}

export interface GlobalSearchResult<TGroup extends string = string> {
	id: string
	/** The only line guaranteed to render. */
	title: string
	subtitle?: string
	/**
	 * The bucket this lands in. Tabs and group headings are both generated from the groups that
	 * actually returned something, unless `tabs` says otherwise.
	 */
	group: TGroup
	avatar?: { src?: string; initials: string; tone?: GlobalSearchTone }
	thumbnail?: { src?: string; icon?: ReactNode; tone?: GlobalSearchTone }
	meta?: GlobalSearchMeta[]
	tags?: string[]
	badge?: GlobalSearchBadge
	/** The prominent trailing figure: a total, a count. */
	rightValue?: ReactNode
	/** Names the figure above it. */
	rightLabel?: ReactNode
	timestamp?: ReactNode
	/** Free-form payload, handed back to `onResultSelect`. */
	data?: unknown
}

/** A static section shown while the query is too short to search on. */
export interface GlobalSearchIdleSection {
	id: string
	label: ReactNode
	icon?: ReactNode
	items: Array<{
		id: string
		label: ReactNode
		icon?: ReactNode
		onSelect?: () => void
	}>
}

export interface GlobalSearchTab<TGroup extends string = string> {
	/** "all" is the unfiltered tab; anything else is a group key. */
	value: "all" | TGroup
	label: ReactNode
}

export interface GlobalSearchRenderResultContext {
	isActive: boolean
	query: string
	onSelect: () => void
}

/** Every replaceable region. */
export interface GlobalSearchSlots<TGroup extends string = string> {
	input?: ReactNode
	tabs?: ReactNode
	/** Above the list while `query.trim().length <= 1`. */
	idle?: ReactNode
	empty?: ReactNode
	loading?: ReactNode
	footer?: ReactNode
	renderResult?: (
		result: GlobalSearchResult<TGroup>,
		context: GlobalSearchRenderResultContext,
	) => ReactNode
}

export interface GlobalSearchProps<TGroup extends string = string> {
	/**
	 * One shape for every kind, with optional parts: avatar OR thumbnail, a badge, meta, tags, a
	 * timestamp, a trailing figure. A union per kind would be honest about the data and useless
	 * for a list that renders them all the same way.
	 */
	results?: readonly GlobalSearchResult<TGroup>[]
	/** Controlled, always. The palette never searches; it renders what it is given. */
	query: string
	/** Receives every edit to `query`. */
	onQueryChange: (query: string) => void
	/** Fires on click and on Enter, with the whole result including its free-form `data`. */
	onResultSelect?: (result: GlobalSearchResult<TGroup>) => void
	/**
	 * Fires on Escape. The dialog presentation wires this to closing itself; a panel embedded in
	 * a page usually wants it too.
	 */
	onClose?: () => void
	/**
	 * Swaps the input's clear control for a spinner and shows the loading region. Hidden results
	 * cannot be selected while the loading region is visible.
	 */
	loading?: boolean
	/**
	 * Recent queries and curated suggestions. The palette has no memory of its own — whose
	 * recents these are is a question only the app can answer.
	 */
	idleSections?: readonly GlobalSearchIdleSection[]
	/**
	 * Names a group in the tab strip and above its results. Without it the raw key shows, which
	 * is a useful default only while you are wiring it up.
	 */
	groupLabels?: Partial<Record<TGroup, ReactNode>>
	autoFocus?: boolean
	strings?: Partial<GlobalSearchStrings>
	/**
	 * `input`, `tabs`, `idle`, `empty`, `loading`, `footer`, and `renderResult` — every region,
	 * replaceable one at a time.
	 */
	slots?: GlobalSearchSlots<TGroup>
	/**
	 * Replaces the auto-generated "All + one per group" strip, for a fixed set of tabs that
	 * should not appear and disappear with the results.
	 */
	tabs?: readonly GlobalSearchTab<TGroup>[]
	className?: string
}
