/**
 * AppSidebar: the sidebar driven by navigation data. `base/sidebar` gives the parts; this
 * decides the current row, which parent expands, badges, and link rendering.
 */
import { ChevronRightIcon } from "lucide-react"
import { cx } from "@/lib/cx"
import { isPathMatch, resolveActiveHref, toPath } from "@/lib/navigation"
import { isValidElement, useMemo, useState, type ComponentType, type ReactElement, type ReactNode } from "react"

import {
	Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
	SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton,
	SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton,
	SidebarMenuSubItem, SidebarRail,
	type SidebarCollapsible, type SidebarSide, type SidebarVariant,
} from "@/components/base/sidebar"

import {
	resolveLayoutLinkRenderer,
	type LayoutIconSource, type LayoutNavigationAdapter, type LayoutUser,
} from "../layout.types"
import { SidebarLogo } from "./partials/sidebar-logo"
import { SidebarUser } from "./partials/sidebar-user"
import { SidebarWorkspace, type WorkspaceLink } from "./partials/sidebar-workspace"
import type { SidebarUserStrings, SidebarWorkspaceStrings } from "./sidebar.strings"
import styles from "./layout-sidebar.module.css"
import type { SidebarFlatNavItem, SidebarItemContext, SidebarNavItem } from "./nav.types"

export interface AppSidebarProps extends LayoutNavigationAdapter {
	/** Navigation grouped by section heading. An empty key renders an untitled group. */
	navigationGroups?: Record<string, SidebarNavItem[]>
	/** Entries pinned to the footer — support, settings, sign out. */
	footerNavItems?: SidebarFlatNavItem[]
	/** The current route. Everything active follows from this. */
	currentUrl?: string
	/** Resolves an icon name to a component, so navigation data can stay serialisable. */
	iconMap?: Record<string, ComponentType<{ className?: string }>>
	/** Counts keyed by `handle`, for values that change after the nav was defined. */
	liveBadges?: Record<string, string | number>
	loading?: boolean
	/** Rows shown while loading. */
	loadingRows?: number

	/**
	 * The product mark, and the compact one for the collapsed rail. With `workspaceLinks`
	 * the header becomes a switcher, in the same row height.
	 */
	logo?: ReactNode
	collapsedLogo?: ReactNode
	workspaceLinks?: WorkspaceLink[]
	workspaceStrings?: Partial<SidebarWorkspaceStrings>
	/** Replaces the whole header, logo and switcher included. */
	header?: ReactNode

	/** The signed-in person, rendered as the account row at the foot of the rail. */
	user?: LayoutUser
	onProfile?: () => void
	onSettings?: () => void
	onLogout?: () => void
	userStrings?: Partial<SidebarUserStrings>
	/** Replaces the whole footer, account row included. */
	footer?: ReactNode
	/** Shown when a group has no entries. */
	empty?: ReactNode

	collapsible?: SidebarCollapsible
	variant?: SidebarVariant
	side?: SidebarSide
	className?: string
	surfaceClassName?: string

	/** Replaces a row entirely, for a shape this component does not cover. */
	renderItem?: (item: SidebarNavItem, context: SidebarItemContext) => ReactNode
}

/**
 * Resolves an icon that may be a name (looked up in `iconMap`), a component or a node.
 * Exported for `renderItem` callers.
 */
export function SidebarIcon({
	icon,
	iconMap,
}: {
	icon?: LayoutIconSource
	iconMap?: Record<string, ComponentType<{ className?: string }>>
}) {
	if (!icon) return null
	if (typeof icon === "string") {
		const Resolved = iconMap?.[icon]
		return Resolved ? <Resolved /> : null
	}
	if (isValidElement(icon)) return icon
	const Icon = icon as ComponentType<{ "aria-hidden"?: boolean }>
	return <Icon aria-hidden />
}

/** `handle` first, then `href`, then a string label — an index is the last resort. */
function navKey(item: SidebarNavItem, index: number) {
	if (item.handle) return item.handle
	if (item.href) return item.href
	return typeof item.label === "string" ? item.label : `nav-${index}`
}

export function AppSidebar({
	navigationGroups = {},
	footerNavItems = [],
	currentUrl = "/",
	iconMap,
	liveBadges,
	loading = false,
	loadingRows = 5,
	logo,
	collapsedLogo,
	workspaceLinks,
	workspaceStrings,
	header,
	user,
	onProfile,
	onSettings,
	onLogout,
	userStrings,
	footer,
	empty,
	collapsible = "icon",
	variant = "sidebar",
	side = "left",
	className,
	surfaceClassName,
	renderItem,
	renderLink,
}: AppSidebarProps) {
	const link = resolveLayoutLinkRenderer({ renderLink })

	/* One pass over the tree for the single current entry; a per-row prefix test would light every ancestor. */
	const activeHref = useMemo(() => {
		const hrefs: (string | undefined)[] = []
		const walk = (items: SidebarNavItem[]) => {
			for (const item of items) {
				hrefs.push(item.href)
				if (item.children?.length) walk(item.children)
			}
		}
		for (const items of Object.values(navigationGroups)) walk(items)
		walk(footerNavItems)
		return resolveActiveHref(currentUrl, hrefs)
	}, [currentUrl, footerNavItems, navigationGroups])

	const isCurrent = (href?: string) => !!href && !!activeHref && toPath(href) === toPath(activeHref)

	/** A parent is "in scope" when the current entry lives inside it — lit, but not the page. */
	const containsCurrent = (href?: string) => !!href && !!activeHref && isPathMatch(activeHref, toPath(href))

	/* A live badge overrides the item's declared one. */
	const badgeFor = (item: SidebarNavItem) =>
		(item.handle && liveBadges?.[item.handle] != null ? liveBadges[item.handle] : item.badge)

	const groups = useMemo(() => Object.entries(navigationGroups), [navigationGroups])

	/*
	 * The reader's toggles, keyed by row and tagged with the URL they were made on, so a
	 * navigation falls back to the derived state in the same render (no reset effect).
	 */
	const [toggled, setToggled] = useState<{ url?: string; open: Record<string, boolean> }>({ open: {} })
	const overrides = toggled.url === currentUrl ? toggled.open : {}

	const renderRow = (item: SidebarNavItem, index: number, depth = 0): ReactNode => {
		const hasChildren = !!item.children?.length
		const key = navKey(item, index)
		/* A leaf is active when it is the current entry; a parent also when it contains it. */
		const active = isCurrent(item.href) || (hasChildren && containsCurrent(item.href))
		const badge = badgeFor(item)
		/* Derived: a parent opens when it contains the current entry; the reader's toggle wins. */
		const derived = hasChildren && (containsCurrent(item.href) || item.children!.some((child) => isCurrent(child.href)))
		const expanded = overrides[key] ?? derived
		const toggle = () => {
			if (!hasChildren) return
			setToggled((current) => ({ url: currentUrl, open: { ...(current.url === currentUrl ? current.open : {}), [key]: !expanded } }))
		}

		if (renderItem) {
			return (
				<SidebarMenuItem key={key}>
					{renderItem(item, { depth, active, expanded, badge, renderLink: link, toggle })}
				</SidebarMenuItem>
			)
		}

		const content = (
			<>
				<SidebarIcon icon={item.icon} iconMap={iconMap} />
				<span>{item.label}</span>
			</>
		)

		return (
			<SidebarMenuItem key={key}>
				{item.href ? (
					<SidebarMenuButton
						/* The row renders as the router link and supplies its own children. */
						render={link({
							href: item.href,
							children: null,
							active,
							disabled: item.disabled,
							external: item.external,
						}) as ReactElement}
						active={active}
						aria-disabled={item.disabled || undefined}
					>
						{content}
					</SidebarMenuButton>
				) : (
					<SidebarMenuButton
						active={active}
						disabled={item.disabled}
						// A parent that only discloses children must not dismiss the mobile sheet.
						closeOnSelectMobile={!hasChildren}
						/* Without an href, a click on a parent is the disclosure. */
						aria-expanded={hasChildren ? expanded : undefined}
						onClick={hasChildren ? toggle : undefined}
					>
						{content}
						{hasChildren && <ChevronRightIcon aria-hidden className={styles.disclosure} data-expanded={expanded || undefined} />}
					</SidebarMenuButton>
				)}

				{badge != null && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}

				{hasChildren && expanded && (
					<SidebarMenuSub>
						{item.children!.map((child, childIndex) => (
							<SidebarMenuSubItem key={navKey(child, childIndex)}>
								<SidebarMenuSubButton
									render={link({
										href: child.href,
										children: null,
										active: isCurrent(child.href),
										disabled: child.disabled,
										external: child.external,
									}) as ReactElement}
									active={isCurrent(child.href)}
								>
									<span>{child.label}</span>
								</SidebarMenuSubButton>
							</SidebarMenuSubItem>
						))}
					</SidebarMenuSub>
				)}
			</SidebarMenuItem>
		)
	}

	return (
		<Sidebar
			collapsible={collapsible}
			variant={variant}
			side={side}
			className={cx("app-sidebar--component", className)}
			surfaceClassName={surfaceClassName}
		>
			{(header != null || !!logo) && (
				<SidebarHeader>
					{header ??
						(workspaceLinks && workspaceLinks.length > 0 ? (
							<SidebarWorkspace
								logo={logo}
								collapsedLogo={collapsedLogo}
								workspaceLinks={workspaceLinks}
								strings={workspaceStrings}
								renderLink={renderLink}
							/>
						) : (
							<SidebarLogo logo={logo} collapsedLogo={collapsedLogo} />
						))}
				</SidebarHeader>
			)}

			<SidebarContent>
				{loading
					? Array.from({ length: loadingRows }, (_, index) => (
							<SidebarGroup key={`skeleton-${index}`}>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuSkeleton showIcon />
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroup>
						))
					: groups.map(([label, items]) => (
							<SidebarGroup key={label || "ungrouped"}>
								{!!label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
								<SidebarGroupContent>
									{items.length === 0 && empty != null ? (
										empty
									) : (
										<SidebarMenu>{items.map((item, index) => renderRow(item, index))}</SidebarMenu>
									)}
								</SidebarGroupContent>
							</SidebarGroup>
						))}
			</SidebarContent>

			{(footerNavItems.length > 0 || footer != null || !!user) && (
				<SidebarFooter>
					{footerNavItems.length > 0 && (
						<SidebarMenu>{footerNavItems.map((item, index) => renderRow(item, index))}</SidebarMenu>
					)}
					{footer ??
						(!!user && (
							<SidebarUser
								user={user}
								onProfile={onProfile}
								onSettings={onSettings}
								onLogout={onLogout}
								strings={userStrings}
							/>
						))}
				</SidebarFooter>
			)}

			<SidebarRail />
		</Sidebar>
	)
}
