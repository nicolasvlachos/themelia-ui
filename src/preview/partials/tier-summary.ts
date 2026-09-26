/**
 * The tier table, read from the generated component index at build time, so the counts
 * come from the index, never prose. The tiers are the sidebar's groups.
 */
import index from "../../../docs/generated/component-index.json"

export interface TierSummary {
	/** The tier id the component index uses, e.g. `blocks`. */
	id: string
	label: string
	modules: number
	/** What lives there, in the kit's own words. */
	holds: string
}

/** Bottom to top: each tier may build on the ones before it, and never the reverse. */
const TIER_TEXT: { id: string; label: string; holds: string }[] = [
	{ id: "foundations", label: "Foundations", holds: "the theme, the provider and scopes, the form contract" },
	{ id: "primitives", label: "Primitives", holds: "one formatted value, no interaction — Money, Date, Address" },
	{ id: "base", label: "Base", holds: "one generic control or concept — text, controls, rows, passive structure" },
	{ id: "layout", label: "Layout", holds: "page and application shells" },
	{ id: "features", label: "Features", holds: "an owned interaction lifecycle — a context, a hook, a state machine" },
	{ id: "blocks", label: "Blocks", holds: "a subject-shaped composition of the tiers below" },
]

const counts = new Map<string, number>()
for (const entry of index.modules) counts.set(entry.tier, (counts.get(entry.tier) ?? 0) + 1)

export const TIERS: TierSummary[] = TIER_TEXT.filter((tier) => counts.has(tier.id)).map((tier) => ({
	...tier,
	modules: counts.get(tier.id) ?? 0,
}))

export const MODULE_COUNT = [...counts.values()].reduce((sum, count) => sum + count, 0)
