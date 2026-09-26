/**
 * Resource: index and show screen shells. They own the skeleton (header, toolbar, body,
 * aside) and the loading, error and empty states; the table, form and fetch stay the screen's.
 */
import type { ComponentType, ReactNode } from "react"

import type { ContentBlockSurface, IconBadgeTone, MetadataListItem } from "@/components/base/display"
import type { OverflowTabItem } from "@/components/base/navigation"
import type { EmptyPadding, EmptyProps } from "@/components/base/feedback"

import type { ResourceStrings } from "./resource.strings"

export type ResourceBlockPadding = EmptyPadding
export type ResourceBlockSurface = ContentBlockSurface

/**
 * Regions a screen can replace outright. Each has a generated default; replace it when the
 * header or empty state is not the generated shape.
 */
export interface ResourceShellSlots {
	/** Replaces the generated identity header. */
	header?: ReactNode
	/** Replaces the toolbar region, including a tabbed shell's own tab row. */
	toolbar?: ReactNode
	/** Related context beside the primary column, when the container is wide enough. */
	aside?: ReactNode
	/** After the body. */
	footer?: ReactNode
	loading?: ReactNode
	empty?: ReactNode
	error?: ReactNode
}

export interface ResourceIndexShellProps {
	/** The screen's own content. Replaced while loading, failed, or empty. */
	children?: ReactNode
	/** Generated header title. Omit when supplying `slots.header`. */
	title?: ReactNode
	description?: ReactNode
	/** Generated header actions. */
	actions?: ReactNode
	/** Between the header and the body. */
	toolbar?: ReactNode
	/**
	 * Replaces the body with the empty state. Explicit rather than inferred from `children`:
	 * only the screen knows "no records" from "no records matching".
	 */
	empty?: boolean
	loading?: boolean
	/**
	 * Anything truthy replaces the body. An `Error`, string or number becomes the generated error
	 * state's description; any other node is rendered as the error state itself.
	 */
	error?: ReactNode | Error
	/** Wiring this puts a retry control on the generated error state. */
	onRetry?: () => void
	slots?: ResourceShellSlots
	className?: string
	headerClassName?: string
	contentClassName?: string
	strings?: Partial<ResourceStrings>
}

export interface ResourceShowShellProps extends ResourceIndexShellProps {
	asideClassName?: string
}

export interface ResourceHeaderProps {
	title: ReactNode
	description?: ReactNode
	/** Quiet context above the title: the parent record, the section. */
	eyebrow?: ReactNode
	/** The media, in full. Takes precedence over `avatarUrl`, which takes precedence over `icon`. */
	media?: ReactNode
	avatarUrl?: string
	avatarAlt?: string
	/** Defaults to initials derived from a string title. */
	avatarFallback?: ReactNode
	/** Rendered in an IconBadge when there is no media and no avatar. */
	icon?: ComponentType<{ className?: string }>
	iconTone?: IconBadgeTone
	/** Status or identity chips beside the title. */
	badges?: ReactNode
	/** Compact facts below the description. */
	metadata?: ReactNode
	actions?: ReactNode
	className?: string
	contentClassName?: string
	mediaClassName?: string
}

export interface ResourceActionBarProps {
	/** Leading content, when `leading` is not given. */
	children?: ReactNode
	/** Filters, a selection summary, the controls that act on the body. */
	leading?: ReactNode
	trailing?: ReactNode
	/** Pins the bar below the shell header as the body scrolls, for selection counts and bulk actions. */
	sticky?: boolean
	className?: string
}

export interface ResourceEmptyStateProps extends EmptyProps {}

interface ResourceSectionFrameProps {
	title?: ReactNode
	description?: ReactNode
	/** Controls at the end of the title line. */
	headerEnd?: ReactNode
	/** After the title, on the same line: a badge, a count. */
	titleSuffix?: ReactNode
	icon?: ReactNode
	children?: ReactNode
	/** After the body. */
	footer?: ReactNode
	padding?: ResourceBlockPadding
	/** `plain` when this sits inside a frame that already has chrome. */
	surface?: ResourceBlockSurface
	className?: string
	contentClassName?: string
}

export interface ResourceDetailsSectionProps extends ResourceSectionFrameProps {
	/** Structured facts, before any free-form body content. */
	metadata?: MetadataListItem[]
	/** A ceiling. The list steps down at narrow widths on its own. */
	metadataColumns?: 1 | 2 | 3 | 4
	metadataDense?: boolean
	/** Structured content after the facts. */
	body?: ReactNode
	/** Quiet guidance after everything else. */
	help?: ReactNode
}

export interface TabbedResourceShellProps extends ResourceShowShellProps {
	tabs: OverflowTabItem[]
	/** Controlled active tab. */
	activeTab?: string
	onTabChange?: (id: string) => void
	tabsClassName?: string
}
