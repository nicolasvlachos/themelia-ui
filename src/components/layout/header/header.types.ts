/**
 * Header part types. Framework-neutral: destinations enter through `renderLink`, app
 * behaviour through slots and callbacks. No part fetches, routes or signs out.
 */
import type { ComponentType, ReactNode } from "react"

import type { SemanticTone } from "@/lib/component-vocabulary"

import type { Crumb } from "@/components/base/navigation"
import type { LayoutNavigationAdapter, LayoutUser } from "../layout.types"
import type {
	HeaderBreadcrumbsStrings, HeaderNotificationsStrings, HeaderSearchStrings,
	HeaderUserMenuStrings,
} from "./header.strings"

/** The four a notification can be. Not the full tone set: a notice is not "primary". */
export type NotificationTone = Extract<
	SemanticTone,
	"info" | "success" | "warning" | "destructive"
>

export interface HeaderNotification {
	id: string | number
	title: ReactNode
	description?: ReactNode
	/** Already formatted: a date or "2h ago". */
	time?: ReactNode
	read?: boolean
	tone?: NotificationTone
	/** Makes the row a link. Without it the row is a button. */
	href?: string
}

export interface HeaderNotificationsProps extends LayoutNavigationAdapter {
	/** Newest first; shown in the order given, never sorted. */
	notifications?: HeaderNotification[]
	/**
	 * Shown on the trigger. Separate from the unread entries in `notifications`, which are
	 * only the most recent page.
	 */
	unreadCount?: number
	onNotificationClick?: (notification: HeaderNotification) => void
	onMarkAllRead?: () => void
	onViewAll?: () => void
	viewAllHref?: string
	align?: "start" | "center" | "end"
	side?: "top" | "right" | "bottom" | "left"
	strings?: Partial<HeaderNotificationsStrings>
	className?: string
	contentClassName?: string
	/** Replaces the row entirely, for a product whose notices are not title-and-body. */
	renderNotification?: (notification: HeaderNotification) => ReactNode
}

export interface HeaderSearchProps {
	onOpen?: () => void
	/**
	 * Which modifier the hint names. Detected from the platform on the client when omitted
	 * (the server renders the non-Mac hint).
	 */
	shortcutModifier?: "meta" | "control"
	/** Binds ⌘/Ctrl+K. Off for a page that already uses it. */
	enableShortcut?: boolean
	strings?: Partial<HeaderSearchStrings>
	className?: string
	/** Replaces the hint — for a product whose palette opens on something else. */
	shortcutSlot?: ReactNode
}

export interface HeaderGlobalSearchTriggerProps extends HeaderSearchProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export interface HeaderToolButtonProps {
	/** The accessible name. Icon-only controls have no other. */
	label: string
	icon: ComponentType<{ className?: string }>
	/** Marks it engaged — reported as `aria-pressed`, not just coloured. */
	active?: boolean
	disabled?: boolean
	/** A count on the glyph. A number, a dot, anything short. */
	badge?: ReactNode
	onClick?: () => void
	className?: string
}

export interface HeaderToolPopoverProps
	extends Omit<HeaderToolButtonProps, "onClick" | "className"> {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	align?: "start" | "center" | "end"
	side?: "top" | "right" | "bottom" | "left"
	sideOffset?: number
	className?: string
	triggerClassName?: string
	contentClassName?: string
	children?: ReactNode
}

export interface HeaderUserMenuProps {
	user: LayoutUser
	/** Shows the name and email beside the avatar. Off leaves an avatar-only trigger. */
	showIdentity?: boolean
	showEmail?: boolean
	/**
	 * Replaces the menu body wholesale, for content that is not a list of commands (a
	 * workspace switcher, a theme row). Otherwise the three callbacks build the menu.
	 */
	customContent?: ReactNode
	onProfile?: () => void
	onSettings?: () => void
	onLogout?: () => void
	align?: "start" | "center" | "end"
	side?: "top" | "right" | "bottom" | "left"
	strings?: Partial<HeaderUserMenuStrings>
	className?: string
	contentClassName?: string
	/** Replaces the trigger, keeping the menu. */
	renderTrigger?: (user: LayoutUser) => ReactNode
}

export interface HeaderBreadcrumbsProps extends LayoutNavigationAdapter {
	breadcrumbs?: Crumb[]
	homeCrumb?: Crumb | null
	strings?: Partial<HeaderBreadcrumbsStrings>
	/** Renders the sidebar collapse control before the trail. */
	showSidebarTrigger?: boolean
	/** Replaces that control — for a shell whose navigation opens some other way. */
	triggerSlot?: ReactNode
	className?: string
}
