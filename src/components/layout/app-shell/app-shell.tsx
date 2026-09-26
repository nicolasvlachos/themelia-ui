/**
 * App shells. `SidebarInsetLayout`: a full-height panel and a content column with a slim
 * toolbar; it mounts `SidebarProvider` itself. `StackedLayout`: a header over a centred
 * column, with no panel.
 */
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { ComponentProps, ReactNode } from "react"

import { SidebarInset, SidebarProvider, SidebarTrigger, type SidebarProviderProps } from "@/components/base/sidebar"
import { cx } from "@/lib/cx"

import styles from "./app-shell.module.css"

export interface SidebarInsetLayoutProps extends Omit<ComponentProps<"div">, "children"> {
	/** The navigation panel — usually an `<AppSidebar />`. */
	sidebar: ReactNode
	children: ReactNode
	/** The row above the content. `false` removes it, for a shell with no chrome at all. */
	toolbar?: ReactNode | false
	/** Rendered at the toolbar's trailing edge — a search field, an account menu. */
	toolbarEnd?: ReactNode
	/**
	 * Shows the panel toggle, the toolbar's collapse control. On mobile it is the only way to
	 * open the panel; turn it off for a shell whose navigation is opened from somewhere else.
	 */
	showTrigger?: boolean
	/**
	 * Caps the content at a reading measure instead of letting it run the shell's full width,
	 * so a wide monitor does not stretch prose across the page.
	 */
	boundContent?: boolean
	/**
	 * Bounds the shell to its parent instead of the viewport. The panel is fixed by default,
	 * which is right for a shell that owns the screen and wrong everywhere else.
	 */
	contained?: boolean
	defaultOpen?: boolean
	/**
	 * Passes `open`/`onOpenChange`, `persist`, `keyboardShortcut` and `strings` to the
	 * shell's provider: controlled state, persistence, shortcuts and translated sidebar
	 * controls. Disable persistence and shortcuts in independent embedded examples.
	 */
	sidebarProviderProps?: Pick<SidebarProviderProps, "open" | "onOpenChange" | "persist" | "keyboardShortcut" | "strings">
	/**
	 * Styles the toolbar without wrapping it. The shell owns the grid, so a wrapper around a
	 * region would break the sticky rows.
	 */
	toolbarClassName?: string
	/**
	 * Styles the content region without wrapping it. The shell owns the grid, so a wrapper
	 * around a region would break the sticky rows.
	 */
	contentClassName?: string
	/**
	 * Replaces the element the content region is drawn as (`<main>` by default). Pass
	 * `contentRender={<div />}` when embedded in a page that owns the main landmark.
	 */
	contentRender?: useRender.ComponentProps<"main">["render"]
	/** `false` when the content below sits on its own plane — an inset sidebar. */
	ruledToolbar?: boolean
}

export function SidebarInsetLayout({
	sidebar,
	children,
	toolbar,
	toolbarEnd,
	showTrigger = true,
	boundContent = true,
	contained = false,
	defaultOpen,
	sidebarProviderProps,
	ruledToolbar = true,
	className,
	toolbarClassName,
	contentClassName,
	contentRender,
	...props
}: SidebarInsetLayoutProps) {
	return (
		<SidebarProvider {...sidebarProviderProps} contained={contained} defaultOpen={defaultOpen} className={cx("app-shell--component", className)} {...props}>
			{sidebar}
			<SidebarInset render={contentRender}>
				{toolbar !== false && (
					<header className={cx(styles.toolbar, ruledToolbar && styles.toolbarRuled, toolbarClassName)}>
						<div className={styles.toolbarStart}>
							{showTrigger && <SidebarTrigger />}
							{toolbar}
						</div>
						{toolbarEnd != null && <div className={styles.toolbarEnd}>{toolbarEnd}</div>}
					</header>
				)}
				<div className={cx(styles.content, contentClassName)}>
					<div className={boundContent ? styles.contentBounded : undefined}>{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

export interface StackedLayoutProps extends Omit<ComponentProps<"div">, "children"> {
	/** The header row — a mark, navigation, an account menu. */
	header?: ReactNode
	headerEnd?: ReactNode
	/** Fit a parent with a definite height and scroll the content below the header. */
	contained?: boolean
	/**
	 * Caps the reading width. Set false for wide tables and composed workspaces that use the
	 * full content width.
	 */
	boundContent?: boolean
	children: ReactNode
	/**
	 * Styles the header row without wrapping it. The shell owns the grid, so a wrapper around
	 * a region would break the sticky rows.
	 */
	headerClassName?: string
	contentClassName?: string
	/**
	 * Replaces the element the content region is drawn as (`<main>` by default). Pass
	 * `contentRender={<div />}` when embedded in a page that owns the main landmark.
	 */
	contentRender?: useRender.ComponentProps<"main">["render"]
}

export function StackedLayout({
	header,
	headerEnd,
	contained = false,
	boundContent = true,
	children,
	className,
	headerClassName,
	contentClassName,
	contentRender,
	...props
}: StackedLayoutProps) {
	return (
		<div data-slot="stacked-layout" data-contained={contained || undefined} data-bounded={boundContent || undefined} className={cx("stacked-shell--component", styles.stacked, className)} {...props}>
			{(header != null || headerEnd != null) && (
				<header className={cx(styles.stackedHeader, headerClassName)}>
					<div className={styles.toolbarStart}>{header}</div>
					{headerEnd != null && <div className={styles.toolbarEnd}>{headerEnd}</div>}
				</header>
			)}
			<StackedContent className={contentClassName} render={contentRender}>
				{children}
			</StackedContent>
		</div>
	)
}

/* The content region, split out to take a `render`. Private: consumers use `contentRender`. */
function StackedContent({ className, render, ...props }: useRender.ComponentProps<"main">) {
	return useRender({
		defaultTagName: "main",
		props: mergeProps<"main">({ className: cx(styles.stackedContent, className) }, props),
		render,
		state: {},
	})
}
