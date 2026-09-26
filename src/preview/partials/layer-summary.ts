/**
 * The layer table, read from the generated component index at build time. Counts come
 * from the index, never prose: no freshness check covers a React page.
 */
import index from "../../../docs/generated/component-index.json"

export interface LayerSummary {
	id: string
	families: number
	/** What lives there, in the kit's own words. */
	holds: string
}

/** Bottom to top: each layer may build on the ones before it, and never the reverse. */
const HOLDS: Record<string, string> = {
	typography: "text in a role — Text, Heading, Label, TextLink",
	primitives: "one formatted value, no interaction — Money, Date, Address",
	base: "one generic concept: controls, rows, passive structure",
	layout: "page and application shells",
	features: "an owned interaction lifecycle — a context, a hook, a state machine",
	patterns: "an arrangement rendering a subject",
	admin: "the admin profile, built only on general families",
	foundation: "the provider, the form contract, the root export",
}

const ORDER = ["typography", "primitives", "base", "layout", "features", "patterns", "admin", "foundation"]

const counts = new Map<string, number>()
for (const family of index.families) {
	counts.set(family.layer, (counts.get(family.layer) ?? 0) + 1)
}

export const LAYERS: LayerSummary[] = ORDER.filter((id) => counts.has(id)).map((id) => ({
	id,
	families: counts.get(id) ?? 0,
	holds: HOLDS[id] ?? "",
}))

export const LAYER_COUNT = LAYERS.length
export const FAMILY_COUNT = index.families.length
