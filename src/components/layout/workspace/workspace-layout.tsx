/**
 * WorkspaceLayout: the frame a single record is edited in, inside an app shell: its own
 * header, section navigation and an optional context rail.
 */
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { CSSProperties, ComponentProps, ReactNode } from "react"

import { cx } from "@/lib/cx"

import styles from "./workspace.module.css"

/** How wide the content column is allowed to get. */
export type WorkspaceContentWidth = "default" | "wide" | "full"

export interface WorkspaceLayoutProps extends Omit<ComponentProps<"div">, "children"> {
	header?: ReactNode
	/** The section navigation — usually a `<WorkspaceNav />`. */
	sidebar?: ReactNode
	/** A second, wider column of context beside the content. */
	rail?: ReactNode
	children: ReactNode
	contentWidth?: WorkspaceContentWidth
	/** Names the region, for a page holding more than one. */
	label?: string
	sidebarWidth?: string
	railWidth?: string
	headerClassName?: string
	bodyClassName?: string
	sidebarClassName?: string
	contentClassName?: string
	/**
	 * Replaces the element the content region is drawn as (`<main>` by default). Pass
	 * `contentRender={<div />}` when embedded in a page that owns the main landmark.
	 */
	contentRender?: useRender.ComponentProps<"main">["render"]
	railClassName?: string
}

export function WorkspaceLayout({
	header,
	sidebar,
	rail,
	children,
	contentWidth = "wide",
	label,
	sidebarWidth,
	railWidth,
	className,
	headerClassName,
	bodyClassName,
	sidebarClassName,
	contentClassName,
	contentRender,
	railClassName,
	style,
	...props
}: WorkspaceLayoutProps) {
	return (
		<div
			data-slot="workspace-layout"
			data-content-width={contentWidth}
			data-has-sidebar={!!sidebar || undefined}
			data-has-rail={!!rail || undefined}
			aria-label={label}
			className={cx("workspace-layout--component", styles.layout, className)}
			style={
				{
					...(sidebarWidth ? { "--sidebar-width": sidebarWidth } : null),
					...(railWidth ? { "--workspace-rail-w": railWidth } : null),
					...style,
				} as CSSProperties
			}
			{...props}
		>
			{!!header && (
				<div data-slot="workspace-header" className={cx(styles.layoutHeader, headerClassName)}>
					{header}
				</div>
			)}

			<div data-slot="workspace-body" className={cx(styles.layoutBody, bodyClassName)}>
				{!!sidebar && (
					<div data-slot="workspace-sidebar" className={cx(styles.layoutSidebar, sidebarClassName)}>
						{sidebar}
					</div>
				)}
				<WorkspaceContent
					data-slot="workspace-content"
					className={cx(styles.layoutContent, contentClassName)}
					render={contentRender}
				>
					{/* An inner measure, so the scrollbar stays at the frame's edge. */}
					<div className={styles.layoutMeasure}>{children}</div>
				</WorkspaceContent>
				{!!rail && (
					<aside data-slot="workspace-rail" className={cx(styles.layoutRail, railClassName)}>
						{rail}
					</aside>
				)}
			</div>
		</div>
	)
}

/* The content region, split out to take a `render`. Private: consumers use `contentRender`. */
function WorkspaceContent({ className, render, ...props }: useRender.ComponentProps<"main">) {
	return useRender({
		defaultTagName: "main",
		props: mergeProps<"main">({ className }, props),
		render,
		state: {},
	})
}
