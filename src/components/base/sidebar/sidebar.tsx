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
	side?: SidebarSide
	variant?: SidebarVariant
	collapsible?: SidebarCollapsible
	/** Class for the visible panel surface, separate from the positioning container. */
	surfaceClassName?: string
	/** Accessible name for the mobile sheet. */
	mobileTitle?: string
	mobileDescription?: string
	/** Overrides this sidebar's own copy, including the two above. */
	strings?: Partial<SidebarStrings>
}

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

/** The toggle. Pair it with the rail, which does the same job from the panel's edge. */
export function SidebarTrigger({ className, onClick, ...props }: ComponentProps<typeof Button>) {
	const { isMobile, openMobile, toggleSidebar, strings: copy } = useSidebar()

	return (
		<Button
			data-slot="sidebar-trigger"
			tone="neutral"
			buttonStyle="ghost"
			iconOnly
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

/** The strip on the panel's edge. Not a tab stop: it duplicates the trigger. */
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
 * The page beside the panel. Renders `<main>`; a shell embedded in a host page that already
 * has one should pass `render={<div />}`.
 */
export function SidebarInset({ className, render, ...props }: useRender.ComponentProps<"main">) {
	return useRender({
		defaultTagName: "main",
		props: mergeProps<"main">({ className: cx(styles.inset, className) }, props),
		render,
		state: { slot: "sidebar-inset" },
	})
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="sidebar-header" className={cx("sidebar-header--component", styles.header, className)} {...props} />
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="sidebar-footer" className={cx("sidebar-footer--component", styles.footer, className)} {...props} />
}

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

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="sidebar-group" className={cx("sidebar-group--component", styles.group, className)} {...props} />
}

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

export function SidebarGroupContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div data-slot="sidebar-group-content" className={cx("sidebar-group-content--component", styles.groupContent, className)} {...props} />
	)
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
	return <ul data-slot="sidebar-menu" className={cx("sidebar-menu--component", styles.menu, className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
	return <li data-slot="sidebar-menu-item" className={cx("sidebar-menu-item--component", styles.menuItem, className)} {...props} />
}

/**
 * Row shape, not density: `lg` is an account or workspace switcher (avatar over two lines),
 * `sm` a secondary row.
 */
export type SidebarMenuButtonSize = "sm" | "md" | "lg"

export interface SidebarMenuButtonProps extends Omit<ComponentProps<"button">, "size"> {
	size?: SidebarMenuButtonSize
	/** Marks the row as the current page. */
	active?: boolean
	/** `outline` gives the row its own frame — for a switcher that must read as a control. */
	variant?: "default" | "outline"
	/**
	 * The element this row becomes instead of a `button` — usually a router link
	 * (docs/adr/0005); `children` stays the row's content.
	 */
	render?: React.ReactElement
	/**
	 * Dismisses the mobile sheet when the row is activated. Defaults to true; turn it off for
	 * a row that opens something else (a switcher, a submenu toggle).
	 */
	closeOnSelectMobile?: boolean
	/**
	 * Shown beside the row while the sidebar is collapsed to its icon rail, usually the row's
	 * label. Ignored while expanded and on phones.
	 */
	tooltip?: React.ReactNode
}

const BUTTON_SIZE = {
	sm: styles.menuButtonSm,
	md: undefined,
	lg: styles.menuButtonLg,
} satisfies Record<SidebarMenuButtonSize, string | undefined>

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
	/** Reveals the action on hover or keyboard focus rather than showing it always. */
	showOnHover?: boolean
}

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
	showIcon?: boolean
}

export function SidebarMenuSkeleton({ showIcon = false, className, style, ...props }: SidebarMenuSkeletonProps) {
	return (
		<div data-slot="sidebar-menu-skeleton" className={cx("sidebar-menu-skeleton--component", styles.menuSkeleton, className)} style={style as CSSProperties} {...props}>
			{showIcon && <Skeleton className={styles.menuSkeletonIcon} />}
			<Skeleton className={styles.menuSkeletonText} />
		</div>
	)
}

export function SidebarMenuSub({ className, ...props }: ComponentProps<"ul">) {
	return <ul data-slot="sidebar-menu-sub" className={cx("sidebar-menu-sub--component", styles.menuSub, className)} {...props} />
}

export function SidebarMenuSubItem({ className, ...props }: ComponentProps<"li">) {
	return <li data-slot="sidebar-menu-sub-item" className={cx("sidebar-menu-sub-item--component", styles.menuSubItem, className)} {...props} />
}

export interface SidebarMenuSubButtonProps extends ComponentProps<"a"> {
	size?: "sm" | "md"
	active?: boolean
	/** Dismisses the mobile sheet when the row is activated. See SidebarMenuButton. */
	closeOnSelectMobile?: boolean
	/**
	 * The element this row becomes instead of an `a` or `button` — usually a router link
	 * (docs/adr/0005); `children` stays the row's content.
	 */
	render?: React.ReactElement
}

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
