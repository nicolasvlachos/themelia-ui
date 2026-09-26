import { ChevronRightIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"

import { ScrollArea } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { ROUTE_GROUPS, type Route } from "../routes"
import routeLayers from "../generated/route-layers.json"
import styles from "../preview.module.css"

const LAYERS: Record<string, string> = routeLayers.layers

/** A group's most common layer; a row shows its layer only when it differs. */
function dominantLayer(paths: string[]): string | null {
	const counts = new Map<string, number>()
	for (const path of paths) {
		const layer = LAYERS[path]
		if (layer) counts.set(layer, (counts.get(layer) ?? 0) + 1)
	}
	if (counts.size === 0) return null
	return [...counts].sort((a, b) => b[1] - a[1])[0]![0]
}

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

	const renderRoute = (route: Route, groupLayer: string | null) => {
		const layer = LAYERS[route.path]
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
				{/* Only when it differs from the group's layer. */}
				{!route.badge && !!layer && layer !== groupLayer && (
					<Text tag="span" size="xs" type="secondary" className={styles.navLayer}>
						{layer}
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
					/* Route-table order, which ranks by significance; deliberately not alphabetical. */
					const routes = group.routes

					const groupLayer = dominantLayer(routes.map((route) => route.path))
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
								{/* Optional labelled runs inside long groups; the label is text, not a control. */}
								{group.sections.map((section, index) => (
									<div key={section.label ?? index} className={styles.navSection}>
										{section.label && (
											<Text tag="span" size="xs" type="secondary" weight="medium" className={styles.navSectionLabel}>
												{section.label}
											</Text>
										)}
										{section.routes.map((route) => renderRoute(route, groupLayer))}
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
