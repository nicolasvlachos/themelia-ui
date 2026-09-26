/**
 * The tier table, read from the generated component index at build time, so the counts
 * come from the index, never prose. The tiers are the sidebar's groups.
 */
import index from "../../../docs/generated/component-index.json"

export interface TierSummary {
	id: string
	modules: number
	/** What lives there, in the kit's own words. */
	holds: string
}

/* The index names each module's folder; the tier is what a reader navigates by. */
const TIER_OF_LAYER: Record<string, string> = {
	foundation: "Foundations",
	primitives: "Primitives",
	typography: "Base",
	base: "Base",
	layout: "Layout",
	features: "Features",
	patterns: "Blocks",
	admin: "Blocks",
}

/** Bottom to top: each tier may build on the ones before it, and never the reverse. */
const HOLDS: Record<string, string> = {
	Foundations: "the theme, the provider and scopes, the form contract",
	Primitives: "one formatted value, no interaction — Money, Date, Address",
	Base: "one generic control or concept — text, controls, rows, passive structure",
	Layout: "page and application shells",
	Features: "an owned interaction lifecycle — a context, a hook, a state machine",
	Blocks: "a subject-shaped composition of the tiers below",
}

const ORDER = ["Foundations", "Primitives", "Base", "Layout", "Features", "Blocks"]

const counts = new Map<string, number>()
for (const family of index.families) {
	const tier = TIER_OF_LAYER[family.layer]
	if (tier) counts.set(tier, (counts.get(tier) ?? 0) + 1)
}

export const TIERS: TierSummary[] = ORDER.filter((id) => counts.has(id)).map((id) => ({
	id,
	modules: counts.get(id) ?? 0,
	holds: HOLDS[id] ?? "",
}))

export const MODULE_COUNT = [...counts.values()].reduce((sum, count) => sum + count, 0)
