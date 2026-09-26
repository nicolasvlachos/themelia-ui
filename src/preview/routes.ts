import type { ComponentType } from "react"

import data from "./routes.json"

/** One import line a page shows: `import { names } from "from"`. `title` names a merged page's further module. */
export type RouteImport = { from: string; names: string[]; title?: string }

export type Route = {
	path: string
	/** The page's one name: sidebar entry, breadcrumb and heading. */
	label: string
	/** One or two sentences under the heading. */
	summary?: string
	/** The import lines the page shows; absent on a page about a concept. */
	imports?: RouteImport[]
	component: ComponentType
	/** The tier the page's module sits in: the sidebar group. */
	group: string
	/** The module, when it has several pages: a labelled run inside the tier. */
	section?: string
	/** The published module the page documents, e.g. `base/choice-inputs`. */
	module?: string
	/** Search terms — a reader looking for "modal" should find Dialog. Includes the page's topic. */
	keywords?: string[]
	badge?: string
}

/** A labelled run of pages inside a tier: one module's pages. */
export type RouteSection = { label: string | null; routes: Route[] }
/** What the rail collapses. `routes` is every page in it, in order, for search and paging. */
export type RouteGroup = { label: string; sections: RouteSection[]; routes: Route[] }

/** One row of routes.json, the route table every script and test reads too. */
type RouteData = {
	path: string
	label: string
	summary?: string
	imports?: RouteImport[]
	page: string
	component: string
	module?: string
	tier?: string
	topic?: string
	keywords?: string[]
	badge?: string
}

const pages = import.meta.glob<Record<string, ComponentType>>("./pages/*.tsx", { eager: true })

function componentOf(entry: RouteData): ComponentType {
	const component = pages[`./pages/${entry.page}.tsx`]?.[entry.component]
	if (!component) throw new Error(`routes.json: pages/${entry.page}.tsx exports no ${entry.component}`)
	return component
}

/* The package's tiers in dependency order, after the site's own entry pages. */
const TIERS = ["Get started", "Foundations", "Primitives", "Base", "Layout", "Features", "Blocks"]
const FOUNDATION_MODULES = new Set(["ui-provider", "theming", "forms", "forms-rhf"])
const TIER_OF_PREFIX: Record<string, string> = { base: "Base", layout: "Layout", features: "Features", patterns: "Blocks", admin: "Blocks" }

function tierOf(entry: RouteData): string {
	if (entry.tier) return entry.tier
	const module = entry.module ?? ""
	if (module === "primitives") return "Primitives"
	if (FOUNDATION_MODULES.has(module)) return "Foundations"
	const tier = TIER_OF_PREFIX[module.split("/")[0] ?? ""]
	if (!tier) throw new Error(`routes.json: ${entry.path} has no tier for module "${module}"`)
	return tier
}

const moduleLabels: Record<string, string> = data.modules

function toRoute(entry: RouteData, group: string, section?: string): Route {
	return {
		path: entry.path,
		label: entry.label,
		summary: entry.summary,
		imports: entry.imports,
		component: componentOf(entry),
		group,
		section,
		module: entry.module,
		keywords: [...(entry.keywords ?? []), ...(entry.topic ? [entry.topic] : [])],
		badge: entry.badge,
	}
}

/*
 * A tier lists its modules alphabetically: a module with one page is a plain entry, a module
 * with several is a labelled run of its pages. A tier that is one module lists its pages.
 */
function tierGroup(label: string, entries: RouteData[]): RouteGroup {
	const byModule = new Map<string, RouteData[]>()
	for (const entry of entries) {
		const key = entry.module ?? entry.path
		byModule.set(key, [...(byModule.get(key) ?? []), entry])
	}
	const grouped = byModule.size > 1
	const units = [...byModule].map(([module, rows]) => ({
		rows,
		label: grouped && rows.length > 1 ? (moduleLabels[module] ?? module) : (rows[0]?.label ?? module),
	}))
	if (label !== "Get started") units.sort((a, b) => a.label.localeCompare(b.label))

	const sections: RouteSection[] = []
	for (const unit of units) {
		if (grouped && unit.rows.length > 1) {
			sections.push({ label: unit.label, routes: unit.rows.map((row) => toRoute(row, label, unit.label)) })
			continue
		}
		const routes = unit.rows.map((row) => toRoute(row, label))
		const last = sections.at(-1)
		if (last && last.label === null) last.routes.push(...routes)
		else sections.push({ label: null, routes })
	}
	return { label, sections, routes: sections.flatMap((section) => section.routes) }
}

const rows = data.routes as RouteData[]

export const ROUTE_GROUPS: RouteGroup[] = TIERS.map((tier) => tierGroup(tier, rows.filter((row) => tierOf(row) === tier))).filter(
	(group) => group.routes.length > 0,
)

/* Reachable by address, never listed: the kitchen sink renders everything at once. */
const INTERNAL_ROUTES: Route[] = (data.internal as RouteData[]).map((row) => toRoute(row, "Get started"))

export const ROUTES: Route[] = [...ROUTE_GROUPS.flatMap((group) => group.routes), ...INTERNAL_ROUTES]

/** Pages merged into another, so an old address still lands on the merged page. */
export const MOVED_ROUTES: Record<string, string> = data.moved
