import { ChevronRightIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"

import { ScrollArea } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { ROUTE_GROUPS, type Route } from "../routes"
import styles from "../preview.module.css"

/**
 * The groups the reader has opened. Groups start closed; the one holding the current page
 * opens itself.
 */
const STORAGE_KEY = "themelia-ui:open-nav-groups"

function readOpen(): Set<string> {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		return new Set(raw ? (JSON.parse(raw) as string[]) : [])
	} catch {
		return new Set()
	}
}

function writeOpen(groups: Set<string>) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...groups]))
	} catch {
		/* Storage unavailable: keep working without remembering. */
	}
}

export function SiteSidebar({ onNavigate }: { onNavigate?: () => void }) {
	const { pathname } = useLocation()
	const [opened, setOpened] = useState(readOpen)

	const toggle = useCallback((label: string) => {
		setOpened((current) => {
			const next = new Set(current)
			if (next.has(label)) next.delete(label)
			else next.add(label)
			writeOpen(next)
			return next
		})
	}, [])

	const renderRoute = (route: Route) => {
		return (
			<NavLink
				key={route.path}
				to={route.path}
				end={route.path === "/"}
				onClick={onNavigate}
				className={({ isActive }) =>
					cx(styles.navLink, isActive && styles.navLinkActive)
				}
			>
				<Text tag="span" size="sm">
					{route.label}
				</Text>
				{!!route.badge && (
					<Text tag="span" size="xs" type="primary" weight="medium" className={styles.navBadge}>
						{route.badge}
					</Text>
				)}
			</NavLink>
		)
	}

	return (
		/* Sticky on a wrapper: ScrollArea's own `position: relative` would override it. */
		<div className={styles.sidebarSticky}>
			<ScrollArea className={styles.sidebarScroll}>
				<nav className={styles.sidebar} aria-label="Documentation">
				{ROUTE_GROUPS.map((group) => {
					const routes = group.routes
					/* A collapsed group holding the current page opens anyway. */
					const holdsCurrent = routes.some((route) => route.path === pathname)
					const open = holdsCurrent || opened.has(group.label)
					const region = `nav-group-${group.label.toLowerCase().replace(/\W+/g, "-")}`

					return (
						<div key={group.label} className={styles.navGroup}>
							{/* The heading is the disclosure button; it out-ranks the entries under it. */}
							<button
								type="button"
								className={styles.navGroupToggle}
								aria-expanded={open}
								aria-controls={region}
								onClick={() => toggle(group.label)}
							>
								<Text tag="span" size="xs" weight="semibold" className={styles.navGroupLabel}>
									{group.label.toUpperCase()}
								</Text>
								{/* Page count, so a closed group says how much it holds. */}
								<Text tag="span" size="xs" type="secondary" numeric aria-hidden className={styles.navGroupCount}>
									{routes.length}
								</Text>
								{/* After the label, so the heading stays flush with the rail. */}
								<ChevronRightIcon
									aria-hidden
									className={styles.navGroupChevron}
									data-open={open ? "" : undefined}
								/>
							</button>

							<div id={region} hidden={!open}>
								{/* A module with several pages is a labelled run; the label is text, not a control. */}
								{group.sections.map((section, index) => (
									<div key={section.label ?? index} className={styles.navSection}>
										{section.label && (
											<Text tag="span" size="xs" type="secondary" weight="medium" className={styles.navSectionLabel}>
												{section.label}
											</Text>
										)}
										{section.routes.map(renderRoute)}
									</div>
								))}
							</div>
						</div>
					)
				})}
				</nav>
			</ScrollArea>
		</div>
	)
}
