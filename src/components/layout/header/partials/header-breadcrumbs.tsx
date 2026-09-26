/**
 * HeaderBreadcrumbs: the sidebar trigger, a rule, and the trail. The trigger stays fixed
 * while the trail truncates.
 */
import { useMemo } from "react"

import { Separator } from "@/components/base/display"
import { Breadcrumbs, type Crumb } from "@/components/base/navigation"
import { SidebarTrigger, useOptionalSidebar } from "@/components/base/sidebar"
import { cx } from "@/lib/cx"

import type { HeaderBreadcrumbsProps } from "../header.types"
import { defaultHeaderBreadcrumbsStrings } from "../header.strings"
import styles from "../header.module.css"

/**
 * The sidebar trigger, a rule, and the trail. The three travel together because their
 * arrangement is the part that goes wrong — a trail without the rule reads as the first
 * crumb, and a trigger placed after it reads as part of the path. The trigger stays fixed
 * while the trail truncates.
 */
export function HeaderBreadcrumbs({
	breadcrumbs = [],
	homeCrumb = null,
	strings,
	showSidebarTrigger = true,
	triggerSlot,
	className,
}: HeaderBreadcrumbsProps) {
	const copy = { ...defaultHeaderBreadcrumbsStrings, ...strings }

	/* Optional: with no sidebar provider there is no trigger, rather than an error. */
	const sidebar = useOptionalSidebar()
	const showTrigger = showSidebarTrigger && (!!triggerSlot || !!sidebar)

	const items = useMemo<Crumb[]>(
		() => (homeCrumb ? [homeCrumb, ...breadcrumbs] : breadcrumbs),
		[homeCrumb, breadcrumbs],
	)

	return (
		<div data-slot="header-breadcrumbs" className={cx("header-breadcrumbs--component", styles.crumbBar, className)}>
			{!!showTrigger && (
				<div className={styles.crumbTrigger}>{triggerSlot ?? <SidebarTrigger />}</div>
			)}
			{items.length > 0 && (
				<>
					{/* The rule only sits between trigger and trail. */}
					{!!showTrigger && <Separator orientation="vertical" />}
					<div className={styles.crumbTrail}>
						<Breadcrumbs items={items} label={copy.label} />
					</div>
				</>
			)}
		</div>
	)
}
