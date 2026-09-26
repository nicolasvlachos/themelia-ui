/**
 * TopbarSidebarLayout: the header-first admin shell. A full-width header owns the brand,
 * search and account; sidebar and content share the height below. In `SidebarInsetLayout`
 * the sidebar owns the full height and the brand instead.
 */
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { CSSProperties, ComponentProps, ReactNode } from "react"

import { SidebarProvider, SidebarTrigger, type SidebarProviderProps } from "@/components/base/sidebar"
import { cx } from "@/lib/cx"

import styles from "./app-shell.module.css"

export type TopbarSidebarSide = "left" | "right"
/** `drawer` hides the sidebar column below md, so the trigger opens the sheet instead. */
export type TopbarSidebarMobileMode = "drawer" | "inline"

export interface TopbarSidebarLayoutSlots {
	/** Replaces the header's whole inner row. */
	header?: ReactNode
	/** Before the logo — the sidebar trigger, usually. */
	sidebarTrigger?: ReactNode
	logo?: ReactNode
	/** After the logo. */
	headerStart?: ReactNode
	/** The middle, usually search. Hidden below md, where there is no room for it. */
	headerCenter?: ReactNode
	/** Before the trailing cluster. */
	headerActions?: ReactNode
	/** The trailing cluster — notifications, account. */
	headerEnd?: ReactNode
	sidebar?: ReactNode
	/** Replaces `children`. */
	content?: ReactNode
}

export interface TopbarSidebarLayoutProps
	extends Omit<ComponentProps<"div">, "children" | "title"> {
	children?: ReactNode
	sidebarSide?: TopbarSidebarSide
	mobileSidebarMode?: TopbarSidebarMobileMode
	/** Any CSS length. Falls back to the shell's own token. */
	headerHeight?: string
	sidebarWidth?: string
	/** Shorthands for the matching `slots` entry, for a shell with only a few regions. */
	sidebarTrigger?: ReactNode
	logo?: ReactNode
	headerActions?: ReactNode
	sidebar?: ReactNode
	slots?: TopbarSidebarLayoutSlots
	/**
	 * Replaces the content column's element (`<main>` by default). Pass
	 * `contentRender={<div />}` when embedded in a page that owns the main landmark.
	 */
	contentRender?: useRender.ComponentProps<"main">["render"]
	/** The sidebar's initial uncontrolled open state. */
	defaultOpen?: boolean
	/** Fit the height of a parent instead of owning the viewport. */
	contained?: boolean
	/** Configure controlled state, persistence, shortcuts and translated sidebar controls. */
	sidebarProviderProps?: Pick<SidebarProviderProps, "open" | "onOpenChange" | "persist" | "keyboardShortcut" | "strings">
	headerClassName?: string
	bodyClassName?: string
	sidebarClassName?: string
	contentClassName?: string
}

export function TopbarSidebarLayout({
	children,
	sidebarSide = "left",
	mobileSidebarMode = "drawer",
	headerHeight,
	sidebarWidth,
	sidebarTrigger,
	logo,
	headerActions,
	sidebar,
	slots,
	contentRender,
	defaultOpen,
	contained = false,
	sidebarProviderProps,
	className,
	headerClassName,
	bodyClassName,
	sidebarClassName,
	contentClassName,
	style,
	...props
}: TopbarSidebarLayoutProps) {
	const trigger = slots?.sidebarTrigger ?? sidebarTrigger
	const brand = slots?.logo ?? logo
	const actions = slots?.headerActions ?? headerActions
	const rail = slots?.sidebar ?? sidebar
	const content = slots?.content ?? children

	const contentRegion = useRender({
		defaultTagName: "main",
		props: mergeProps<"main">(
			{ className: cx(styles.topbarContent, contentClassName) },
			{ children: content },
		),
		render: contentRender,
		state: { slot: "topbar-content" },
	})

	return (
		<SidebarProvider {...sidebarProviderProps} defaultOpen={defaultOpen} contained>
			<div
				data-slot="topbar-sidebar-layout"
				data-contained={contained || undefined}
				data-sidebar-side={sidebarSide}
				data-mobile-sidebar={mobileSidebarMode}
				className={cx("topbar-sidebar-layout--component", styles.topbar, className)}
				style={
					{
						...(headerHeight ? { "--shell-header-h": headerHeight } : null),
						...(sidebarWidth ? { "--sidebar-width": sidebarWidth } : null),
						...style,
					} as CSSProperties
				}
				{...props}
			>
				<header
					data-slot="topbar-header"
					className={cx(styles.topbarHeader, headerClassName)}
				>
					{slots?.header ?? (
						<>
							{/* Present by default whenever there is a sidebar: below md it is the only way in. */}
							{(!!trigger || !!rail) && (
								<div className={styles.topbarTrigger}>{trigger ?? <SidebarTrigger />}</div>
							)}
							{!!brand && <div className={styles.topbarLogo}>{brand}</div>}
							{!!slots?.headerStart && (
								<div className={styles.topbarStart}>{slots.headerStart}</div>
							)}
							{!!slots?.headerCenter && (
								<div className={styles.topbarCenter}>{slots.headerCenter}</div>
							)}
							{(!!actions || !!slots?.headerEnd) && (
								<div className={styles.topbarEnd}>
									{actions}
									{slots?.headerEnd}
								</div>
							)}
						</>
					)}
				</header>

				<div data-slot="topbar-body" className={cx(styles.topbarBody, bodyClassName)}>
					{!!rail && (
						<div data-slot="topbar-sidebar" className={cx(styles.topbarSidebar, sidebarClassName)}>
							{rail}
						</div>
					)}
					{contentRegion}
				</div>
			</div>
		</SidebarProvider>
	)
}
