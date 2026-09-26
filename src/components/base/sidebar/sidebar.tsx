/**
 * Sidebar — the application shell's navigation column.
 *
 * The desktop rail and the mobile sheet are different trees, not one tree at two widths,
 * so the choice is made in JS (`useSidebar().isMobile`) rather than in CSS.
 */
import { mergeProps } from "@base-ui/react/merge-props"
import { resolveStrings } from "@/lib/strings"

import type { SidebarStrings } from "./sidebar.strings"
import { useRender } from "@base-ui/react/use-render"
import { PanelLeftIcon } from "lucide-react"
import type * as React from "react"
import { useId, type ComponentProps, type CSSProperties } from "react"

import { Button } from "@/components/base/buttons"
import { Separator } from "@/components/base/display"
import { Overlay, OverlayDescription, OverlayTitle } from "@/components/base/overlay"
import { SheetContent } from "@/components/base/sheet"
import { Skeleton } from "@/components/base/skeleton"
import { Input } from "@/components/base/text-inputs"
import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"
import { Text } from "@/components/base/typography"

import { useSidebar } from "./sidebar-store"
import styles from "./sidebar.module.css"
import { renderWithChildren } from "@/lib/render-with-children"

/** Which edge the panel is docked to. */
export type SidebarSide = "left" | "right"

/**
 * `sidebar` sits against the shell edge with a border; `floating` is a rounded panel
 * inset from it; `inset` additionally lifts the page content into a rounded card.
 */
export type SidebarVariant = "sidebar" | "floating" | "inset"

/** `icon` collapses to a glyph rail; `offcanvas` slides away; `none` never collapses. */
export type SidebarCollapsible = "offcanvas" | "icon" | "none"

export interface SidebarProps extends ComponentProps<"div"> {
	/** Which edge the panel occupies, for the rail and the mobile sheet alike. */
	side?: SidebarSide
	/**
	 * `sidebar` sits against the shell's edge with a border. `floating` and `inset` detach it,
	 * so the panel reads as a card inside the page rather than as the page's own edge;
	 * `inset` also lifts the page into a card of its own.
	 */
	variant?: SidebarVariant
	/**
	 * How it gets out of the way: slid away entirely (`offcanvas`), reduced to a rail of
	 * glyphs (`icon`), or pinned open, never collapsing (`none`). On a narrow viewport a
	 * collapsible panel becomes a sheet.
	 */
	collapsible?: SidebarCollapsible
	/** Class for the visible panel surface, separate from the positioning container. */
	surfaceClassName?: string
	/** Accessible name for the mobile sheet. */
	mobileTitle?: string
	mobileDescription?: string
	/** Overrides this sidebar's own copy, including the two above. */
	strings?: Partial<SidebarStrings>
}

/** The panel: a header, scrolling content and a footer, against one edge of the shell. */
export function Sidebar({
	side = "left",
	variant = "sidebar",
	collapsible = "offcanvas",
	className,
	surfaceClassName,
	mobileTitle,
	mobileDescription,
	strings,
	children,
	...props
}: SidebarProps) {
	const { isMobile, state, openMobile, setOpenMobile, strings: providerStrings } = useSidebar()
	const copy = resolveStrings(providerStrings, strings)
	const mobileTitleId = useId()
	const mobileDescriptionId = useId()

	if (collapsible === "none") {
		return (
			<div
				data-slot="sidebar"
				className={cx("sidebar--component", styles.static, className)}
				{...props}
			>
				{children}
			</div>
		)
	}

	if (isMobile) {
		return (
			<Overlay open={openMobile} onOpenChange={setOpenMobile}>
				<SheetContent
					side={side === "left" ? "inline-start" : "inline-end"}
					showCloseButton={false}
					aria-label={props["aria-label"]}
					aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] ? undefined : mobileTitleId)}
					aria-describedby={props["aria-describedby"] ?? mobileDescriptionId}
					data-slot="sidebar"
					data-mobile="true"
					className={cx("sidebar--component", styles.mobile, className)}
				>
					{/* The sheet needs an accessible name even when no heading is shown. */}
					<VisuallyHidden>
						<OverlayTitle id={mobileTitleId}>{mobileTitle ?? copy.mobileTitle}</OverlayTitle>
						<OverlayDescription id={mobileDescriptionId}>{mobileDescription ?? copy.mobileDescription}</OverlayDescription>
					</VisuallyHidden>
					<div className={styles.mobileInner}>{children}</div>
				</SheetContent>
			</Overlay>
		)
	}

	return (
		<div
			data-slot="sidebar"
			data-state={state}
			data-collapsible={state === "collapsed" ? collapsible : ""}
			data-variant={variant}
			data-side={side}
			className={cx("sidebar--component", styles.root)}
		>
			{/* Reserves the in-flow column the fixed panel cannot (see the module CSS). */}
			<div data-slot="sidebar-gap" className={styles.gap} />
			<div
				data-slot="sidebar-container"
				data-side={side}
				className={cx(styles.container, className)}
				{...props}
			>
				<div
					data-slot="sidebar-inner"
					className={cx("sidebar--surface", styles.inner, surfaceClassName)}
				>
					{children}
				</div>
			</div>
		</div>
	)
}

/**
 * The button that toggles the panel. It reads the provider, so it works from anywhere
 * inside it; pair it with the rail, which does the same job from the panel's edge.
 */
export function SidebarTrigger({
	className,
	onClick,
	tone = "neutral",
	buttonStyle = "ghost",
	iconOnly = true,
	...props
}: ComponentProps<typeof Button>) {
	const { isMobile, openMobile, toggleSidebar, strings: copy } = useSidebar()

	return (
		<Button
			data-slot="sidebar-trigger"
			tone={tone}
			buttonStyle={buttonStyle}
			iconOnly={iconOnly}
			aria-label={copy.toggle}
			className={cx("sidebar-trigger--component", className)}
			onClick={(event) => {
				onClick?.(event)
				if (event.defaultPrevented) return
				// The detached mobile sheet restores the element focused at opening.
				if (isMobile && !openMobile) event.currentTarget.focus({ preventScroll: true })
				toggleSidebar()
			}}
			{...props}
		>
			<PanelLeftIcon />
		</Button>
	)
}

/**
 * The strip along the panel's edge, which toggles it too. It reads the provider, so it works
 * from anywhere inside it. Not a tab stop: it duplicates the trigger.
 */
export function SidebarRail({ className, ...props }: ComponentProps<"button">) {
	const { toggleSidebar, strings: copy } = useSidebar()

	return (
		<button
			type="button"
			data-slot="sidebar-rail"
			aria-label={copy.toggle}
			title={copy.toggle}
			tabIndex={-1}
			onClick={toggleSidebar}
			className={cx("sidebar-rail--component", styles.rail, className)}
			// Drawn under 24px; the TARGET must not be. See styles/targets.css.
			data-hit-area
			{...props}
		/>
	)
}

/**
 * The page beside the panel. Renders `<main>`, so it is the document's main landmark rather
 * than another div; a shell embedded in a host page that already has one should pass
 * `render={<div />}`.
 */
export function SidebarInset({ className, render, ...props }: useRender.ComponentProps<"main">) {
	return useRender({
		defaultTagName: "main",
		props: mergeProps<"main">({ className: cx(styles.inset, className) }, props),
		render,
		state: { slot: "sidebar-inset" },
	})
}

/**
 * The panel's top region. It holds its edge while the content scrolls, so a long navigation
 * never scrolls its own search box away.
 */
export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="sidebar-header" className={cx("sidebar-header--component", styles.header, className)} {...props} />
}

/** The panel's bottom region. It holds its edge while the content scrolls. */
export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="sidebar-footer" className={cx("sidebar-footer--component", styles.footer, className)} {...props} />
}

/** The scrolling region between the header and the footer. */
export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="sidebar-content" className={cx("sidebar-content--component", styles.content, className)} {...props} />
}

export function SidebarSeparator({ className, ...props }: ComponentProps<typeof Separator>) {
	return (
		<Separator data-slot="sidebar-separator" className={cx("sidebar-separator--component", styles.separator, className)} {...props} />
	)
}

export function SidebarInput({ className, ...props }: ComponentProps<typeof Input>) {
	return <Input data-slot="sidebar-input" className={cx("sidebar-input--component", styles.input, className)} {...props} />
}

/**
 * A titled section of the panel, with an optional control on the label's line — an add, a
 * filter.
 */
export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="sidebar-group" className={cx("sidebar-group--component", styles.group, className)} {...props} />
}

/** The section's title. */
export function SidebarGroupLabel({ className, ...props }: ComponentProps<"div">) {
	return (
		<Text
			tag="div"
			size="inherit"
			type="secondary"
			weight="medium"
			data-slot="sidebar-group-label"
			className={cx("sidebar-group-label--component", styles.groupLabel, className)}
			{...props}
		/>
	)
}

/** A control on the section title's line — an add, a filter. */
export function SidebarGroupAction({ className, ...props }: ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="sidebar-group-action"
			className={cx("sidebar-group-action--component", styles.groupAction, className)}
			{...props}
		/>
	)
}

/** The section's body, under its label. */
export function SidebarGroupContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div data-slot="sidebar-group-content" className={cx("sidebar-group-content--component", styles.groupContent, className)} {...props} />
	)
}

/**
 * The rows: a real `<ul>`, so the navigation announces as a list and its length is
 * spoken.
 */
export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
	return <ul data-slot="sidebar-menu" className={cx("sidebar-menu--component", styles.menu, className)} {...props} />
}

/** One row: a real `<li>`, holding the row's button and anything beside it. */
export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
	return <li data-slot="sidebar-menu-item" className={cx("sidebar-menu-item--component", styles.menuItem, className)} {...props} />
}

/**
 * Row shape, not density: `lg` is an account or workspace switcher (avatar over two lines),
 * `sm` a secondary row.
 */
export type SidebarMenuButtonSize = "sm" | "md" | "lg"

export interface SidebarMenuButtonProps extends Omit<ComponentProps<"button">, "size"> {
	/**
	 * The row's height, as a shape rather than a density: `lg` is the workspace switcher, `sm`
	 * a secondary row. A size prop here, because a navigation row is not on the control
	 * ladder that density scales.
	 */
	size?: SidebarMenuButtonSize
	/** Marks the row as the current page. */
	active?: boolean
	/** `outline` gives the row its own frame — for a switcher that must read as a control. */
	variant?: "default" | "outline"
	/**
	 * The element this row becomes instead of a `button` — usually a router link, so the row
	 * navigates the app's own way. `children` stays the row's content.
	 */
	render?: React.ReactElement
	/**
	 * Dismisses the mobile sheet when the row is activated. Turn it off for a row that opens
	 * something else (a switcher, a submenu toggle).
	 */
	closeOnSelectMobile?: boolean
	/**
	 * The row's name, shown beside it while the sidebar is collapsed to its icon rail, where
	 * the label is clipped away. Ignored while expanded and on phones.
	 */
	tooltip?: React.ReactNode
}

const BUTTON_SIZE = {
	sm: styles.menuButtonSm,
	md: undefined,
	lg: styles.menuButtonLg,
} satisfies Record<SidebarMenuButtonSize, string | undefined>

/** The row's control: a button, or through `render` a router link. */
export function SidebarMenuButton({
	size = "md",
	active = false,
	variant = "default",
	render,
	closeOnSelectMobile = true,
	tooltip,
	className,
	children,
	onClick,
	...props
}: SidebarMenuButtonProps): React.JSX.Element {
	const { isMobile, setOpenMobile, state } = useSidebar()
	const classes = cx(
		"sidebar-menu-button--component",
		styles.menuButton,
		BUTTON_SIZE[size],
		variant === "outline" && styles.menuButtonOutline,
		className,
	)

	// A router link's own onClick composes with sheet dismissal via mergeProps.
	const row = useRender({
		defaultTagName: "button",
		render: render ? renderWithChildren(render, children) : undefined,
		props: {
			"data-slot": "sidebar-menu-button",
			"data-size": size,
			"data-active": active || undefined,
			/* The current page is announced, not only drawn. */
			"aria-current": active ? ("page" as const) : undefined,
			...mergeProps<"button">(
				{
					...(render ? {} : { type: "button" as const }),
					className: classes,
					children,
					onClick: () => {
						if (closeOnSelectMobile && isMobile) setOpenMobile(false)
					},
				},
				{ onClick, ...props },
			),
		},
	})

	if (tooltip === undefined || tooltip === null || tooltip === false) return row

	// Always mounted (disabled when expanded), so collapsing never remounts the row and drops focus.
	return (
		<Tooltip disabled={state !== "collapsed" || isMobile}>
			<TooltipTrigger render={row} />
			<TooltipContent side="inline-end">{tooltip}</TooltipContent>
		</Tooltip>
	)
}

export interface SidebarMenuActionProps extends ComponentProps<"button"> {
	/**
	 * Reveals the action on hover or keyboard focus rather than showing it always. Focus
	 * counts through `focus-within`, so the action stays reachable without a pointer.
	 */
	showOnHover?: boolean
}

/**
 * A secondary control on a row, positioned so it neither displaces the label nor steals the
 * row's press target.
 */
export function SidebarMenuAction({ showOnHover = false, className, ...props }: SidebarMenuActionProps) {
	return (
		<button
			type="button"
			data-slot="sidebar-menu-action"
			className={cx("sidebar-menu-action--component", styles.menuAction, showOnHover && styles.menuActionOnHover, className)}
			{...props}
		/>
	)
}

export interface SidebarMenuBadgeProps extends ComponentProps<"div"> {
	/** Renders in normal flow instead of over the row — for a button laying out its own parts. */
	inline?: boolean
}

/**
 * A count on a row, positioned so it neither displaces the label nor steals the row's press
 * target.
 */
export function SidebarMenuBadge({ inline = false, className, ...props }: SidebarMenuBadgeProps) {
	return (
		<div
			data-slot="sidebar-menu-badge"
			className={cx("sidebar-menu-badge--component", styles.menuBadge, inline && styles.menuBadgeInline, className)}
			{...props}
		/>
	)
}

export interface SidebarMenuSkeletonProps extends ComponentProps<"div"> {
	/** Reserves the row's icon as well as its label. */
	showIcon?: boolean
}

/**
 * Reserves a row's exact box while the navigation loads, so the panel does not reflow when
 * it lands.
 */
export function SidebarMenuSkeleton({ showIcon = false, className, style, ...props }: SidebarMenuSkeletonProps) {
	return (
		<div data-slot="sidebar-menu-skeleton" className={cx("sidebar-menu-skeleton--component", styles.menuSkeleton, className)} style={style as CSSProperties} {...props}>
			{showIcon && <Skeleton className={styles.menuSkeletonIcon} />}
			<Skeleton className={styles.menuSkeletonText} />
		</div>
	)
}

/** A nested level under a row, indented against the parent's rail. */
export function SidebarMenuSub({ className, ...props }: ComponentProps<"ul">) {
	return <ul data-slot="sidebar-menu-sub" className={cx("sidebar-menu-sub--component", styles.menuSub, className)} {...props} />
}

/** One row of a nested level. */
export function SidebarMenuSubItem({ className, ...props }: ComponentProps<"li">) {
	return <li data-slot="sidebar-menu-sub-item" className={cx("sidebar-menu-sub-item--component", styles.menuSubItem, className)} {...props} />
}

export interface SidebarMenuSubButtonProps extends ComponentProps<"a"> {
	/** The nested row's height. */
	size?: "sm" | "md"
	/** Marks the row as the current page. */
	active?: boolean
	/** Dismisses the mobile sheet when the row is activated. See SidebarMenuButton. */
	closeOnSelectMobile?: boolean
	/**
	 * The element this row becomes instead of an `a` or `button` — usually a router link, so
	 * the row navigates the app's own way. `children` stays the row's content.
	 */
	render?: React.ReactElement
}

/**
 * A nested row's control: a link when it has an `href`, otherwise a button, or through
 * `render` a router link.
 */
export function SidebarMenuSubButton({
	size = "md",
	active = false,
	closeOnSelectMobile = true,
	render,
	className,
	onClick,
	children,
	...props
}: SidebarMenuSubButtonProps): React.JSX.Element {
	const { isMobile, setOpenMobile } = useSidebar()
	// An <a> only with an `href`; otherwise a button, so it stays focusable.
	const isLink = typeof (props as { href?: unknown }).href === "string"
	return useRender({
		defaultTagName: isLink ? "a" : "button",
		render: render ? renderWithChildren(render, children) : undefined,
		props: {
			"data-slot": "sidebar-menu-sub-button",
			"data-size": size,
			"data-active": active || undefined,
			"aria-current": active ? ("page" as const) : undefined,
			...mergeProps<"a">(
				{
					...(render || isLink ? {} : { type: "button" }),
					className: cx("sidebar-menu-sub-button--component", styles.menuSubButton, size === "sm" && styles.menuSubButtonSm, className),
					children,
					onClick: () => {
						if (closeOnSelectMobile && isMobile) setOpenMobile(false)
					},
				},
				{ onClick, ...props },
			),
		},
	})
}
