/*
 * The six tiers that group modules in the documentation and in the published component index,
 * in dependency order. The architecture manifest's `layer` names split them more finely:
 * `typography` is the Base module `base/typography`, and `patterns` and `admin` together are
 * Blocks.
 */
export const TIERS = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'primitives', label: 'Primitives' },
  { id: 'base', label: 'Base' },
  { id: 'layout', label: 'Layout' },
  { id: 'features', label: 'Features' },
  { id: 'blocks', label: 'Blocks' },
]

const TIER_OF_LAYER = {
  foundation: 'foundations',
  primitives: 'primitives',
  typography: 'base',
  base: 'base',
  layout: 'layout',
  features: 'features',
  patterns: 'blocks',
  admin: 'blocks',
}

/** The tier id a manifest layer belongs to. */
export function tierOfLayer(layer) {
  const tier = TIER_OF_LAYER[layer]
  if (!tier) throw new Error(`no tier for the manifest layer "${layer}"`)
  return tier
}

/** A tier id's display name: `blocks` → `Blocks`. */
export const tierLabel = (id) => TIERS.find((tier) => tier.id === id)?.label ?? id
