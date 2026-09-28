/** SidebarWorkspace: the rail's header as a workspace switcher; the whole row is the trigger. */
import type { ReactElement, ReactNode } from "react"
import { ChevronsUpDownIcon, ExternalLinkIcon } from "lucide-react"

import { ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import {
	SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/base/sidebar"
import { VisuallyHidden } from "@/components/base/display"

import { resolveLinkRenderer } from "@/lib/navigation"

import type { LayoutIconSource, LayoutNavigationAdapter } from "../../layout.types"
import { defaultSidebarWorkspaceStrings, type SidebarWorkspaceStrings } from "../sidebar.strings"
import styles from "../layout-sidebar.module.css"

export interface WorkspaceLink {
	label: ReactNode
	url: string
	icon?: LayoutIconSource
	/** Defaults to true — a workspace link usually leaves this application. */
	external?: boolean
}

export interface SidebarWorkspaceProps extends LayoutNavigationAdapter {
	logo: ReactNode
	collapsedLogo?: ReactNode
	/** The destinations. With none, use SidebarLogo — a menu of nothing is a dead control. */
	workspaceLinks: WorkspaceLink[]
	strings?: Partial<SidebarWorkspaceStrings>
	contentClassName?: string
}

/**
 * The rail’s header as a workspace switcher. The whole header row is the trigger, not a
 * chevron beside a decorative name — the name is what a reader aims at.
 */
export function SidebarWorkspace({
	logo,
	collapsedLogo,
	workspaceLinks,
	renderLink,
	strings,
	contentClassName,
}: SidebarWorkspaceProps) {
	const copy = { ...defaultSidebarWorkspaceStrings, ...strings }
	const link = resolveLinkRenderer(renderLink)
	const { state } = useSidebar()
	const isCollapsed = state === "collapsed"
	const mark = isCollapsed ? (collapsedLogo ?? logo) : logo

	const actions: ActionDefinition[] = workspaceLinks.map((entry, index) => ({
		id: entry.url || String(index),
		label: entry.label,
		icon: (entry.icon ?? ExternalLinkIcon) as ActionDefinition["icon"],
		href: entry.url,
		external: entry.external ?? true,
		group: copy.label,
	}))

	return (
		<SidebarMenu className="sidebar-workspace--component">
			<SidebarMenuItem>
				<ActionMenu
					actions={actions}
					align="start"
					side="right"
					contentClassName={contentClassName}
					/* Keep the product's order; no destructive-last reordering. */
					preserveOrder
					renderLink={({ children, ...rest }) =>
						link({ ...rest, children: children ?? null }) as ReactElement
					}
					renderTrigger={
						<SidebarMenuButton className={styles.workspaceTrigger}>
							<span className={styles.workspaceMark}>{mark}</span>
							{/* The mark is an image, so name the control's action. */}
							<VisuallyHidden>{copy.select}</VisuallyHidden>
							{!isCollapsed && <ChevronsUpDownIcon aria-hidden className={styles.workspaceChevron} />}
						</SidebarMenuButton>
					}
				/>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
