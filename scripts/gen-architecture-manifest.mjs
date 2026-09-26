/*
 * Writes `architecture/manifest.json`: every mechanical field (edges, peers, exports, CSS,
 * documentation route) is derived from source; judgement fields (profile, status,
 * profileDefinition, nonFamilyExports) carry over from the existing file.
 * Run after adding or moving a family, after a build (`cssExport` reads dist/).
 * `verify architecture` fails when the committed manifest and the source disagree, and on a
 * misspelled judgement field.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { actualEdges, specifiers } from './lib/read-architecture-manifest.mjs'
import { publicComponents } from './lib/public-symbols.mjs'
import { previewRoutes } from './lib/preview-routes.mjs'

const routeOf = previewRoutes()

const LAYERS = ['primitives', 'base', 'features', 'layout', 'patterns', 'admin/patterns']
const ROOT_ENTRIES = [
  { id: 'index', source: 'src/index.ts', export: '.', layer: 'foundation' },
  { id: 'ui-provider', source: 'src/lib/ui-provider/index.ts', export: './ui-provider', layer: 'foundation' },
  { id: 'forms', source: 'src/lib/forms/index.ts', export: './forms', layer: 'foundation' },
  { id: 'forms-rhf', source: 'src/lib/forms-rhf/index.ts', export: './forms-rhf', layer: 'foundation' },
  { id: 'theming', source: 'src/lib/theming/index.ts', export: './theming', layer: 'foundation' },
  /*
   * The TipTap engine: a sub-entry of `features/rich-text-editor` at its own subpath. Listed
   * by hand because the directory walk below reads only one level under each layer.
   */
  {
    id: 'features/rich-text-editor/tiptap',
    source: 'src/components/features/rich-text-editor/tiptap/index.ts',
    export: './features/rich-text-editor/tiptap',
    layer: 'features',
  },
  { id: 'primitives', source: 'src/components/primitives/index.ts', export: './primitives', layer: 'primitives' },
]

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const OPTIONAL_PEERS = Object.keys(pkg.peerDependenciesMeta ?? {})

/*
 * Optional peers that other optional peers require (TipTap core peers on @tiptap/pm), so the
 * consumer install table lists them even when no source imports them directly.
 */
const peerRequirements = new Map(
  OPTIONAL_PEERS.map((peer) => {
    const file = `node_modules/${peer}/package.json`
    if (!existsSync(file)) return [peer, []]
    const dependency = JSON.parse(readFileSync(file, 'utf8'))
    const required = new Set([
      ...Object.keys(dependency.dependencies ?? {}),
      ...Object.keys(dependency.peerDependencies ?? {}),
    ])
    return [peer, OPTIONAL_PEERS.filter((candidate) => required.has(candidate))]
  }),
)


/*
 * A family's optional peers are the ones it can REACH (importing `base/chart` pulls in
 * recharts): dependency edges and peer requirements walked to a fixed point.
 */
function closePeers(records) {
  const byId = new Map(records.map((r) => [r.id, r]))
  let changed = true
  while (changed) {
    changed = false
    for (const record of records) {
      for (const peer of [...record.optionalPeers]) {
        for (const required of peerRequirements.get(peer) ?? []) {
          if (!record.optionalPeers.includes(required)) {
            record.optionalPeers.push(required)
            changed = true
          }
        }
      }
      for (const dep of record.dependsOnFamilies) {
        for (const peer of byId.get(dep)?.optionalPeers ?? []) {
          if (!record.optionalPeers.includes(peer)) {
            record.optionalPeers.push(peer)
            changed = true
          }
        }
      }
    }
  }
  for (const record of records) record.optionalPeers.sort()
}

const previous = existsSync('architecture/manifest.json')
  ? JSON.parse(readFileSync('architecture/manifest.json', 'utf8'))
  : { families: [] }
const priorById = new Map((previous.families ?? []).map((f) => [f.id, f]))

/* A new family under `admin/` seeds as the admin profile, anything else as general; a prior file's profile always wins. */
const seedProfile = (layer) => (layer.startsWith('admin') ? 'admin' : 'general')

/*
 * The layer a family BELONGS to when its directory says otherwise: typography sits below
 * primitives in ALLOWED_EDGES but its directory is still under `base/`.
 */
const RELAYERED = { 'base/typography': 'typography' }
const seedLayer = (id, layer) => RELAYERED[id] ?? layer

const families = []
for (const entry of ROOT_ENTRIES) {
  if (!existsSync(entry.source)) continue
  families.push({ ...entry, dir: entry.source.replace(/\/index\.ts$/, '') })
}
for (const layer of LAYERS) {
  const root = `src/components/${layer}`
  if (!existsSync(root)) continue
  for (const item of readdirSync(root, { withFileTypes: true })) {
    if (!item.isDirectory()) continue
    const dir = `${root}/${item.name}`
    if (!existsSync(`${dir}/index.ts`)) continue
    families.push({
      id: `${layer}/${item.name}`,
      source: `${dir}/index.ts`,
      export: `./${layer}/${item.name}`,
      /* `admin/patterns/commerce` is one family in the `admin` layer, not a layer of its own. */
      layer: layer.startsWith('admin') ? 'admin' : layer,
      dir,
    })
  }
}

const ids = new Set(families.map((f) => f.id))
const records = families.map((family) => {
  const specs = specifiers(family, families)
  const dependsOnFamilies = [...actualEdges(family, ids, families)].sort()
  const direct = OPTIONAL_PEERS.filter((peer) => specs.some((s) => s === peer || s.startsWith(`${peer}/`)))
  const prior = priorById.get(family.id)
  return {
    id: family.id,
    profile: prior?.profile ?? seedProfile(family.layer),
    layer: seedLayer(family.id, family.layer),
    source: family.source,
    export: family.export,
    /* Null when the build emits no stylesheet for the family. */
    cssExport: existsSync(`dist${family.export.slice(1)}.css`) ? `${family.export}.css` : null,
    optionalPeers: direct,
    dependsOnFamilies,
    documentationRoute: routeOf(publicComponents(family.source)),
    status: prior?.status ?? 'stable',
  }
})

closePeers(records)
records.sort((a, b) => a.id.localeCompare(b.id))

/*
 * `profileDefinition` and `nonFamilyExports` cannot be derived, so they carry forward.
 * Any new hand-set top-level field must be carried here too, or regeneration drops it.
 */
writeFileSync(
  'architecture/manifest.json',
  `${JSON.stringify(
    {
      profileDefinition: previous.profileDefinition ?? {},
      families: records,
      nonFamilyExports: previous.nonFamilyExports ?? [],
    },
    null,
    2,
  )}\n`,
)

const byLayer = records.reduce((acc, r) => ({ ...acc, [r.layer]: (acc[r.layer] ?? 0) + 1 }), {})
const withPeers = records.filter((r) => r.optionalPeers.length).length
const edges = records.reduce((sum, r) => sum + r.dependsOnFamilies.length, 0)
console.log(`architecture/manifest.json — ${records.length} families`)
console.log(`  layers        ${Object.entries(byLayer).map(([k, v]) => `${k}:${v}`).join(' ')}`)
console.log(`  profiles      general:${records.filter((r) => r.profile === 'general').length} admin:${records.filter((r) => r.profile === 'admin').length}`)
console.log(`  edges         ${edges} declared cross-family dependencies`)
console.log(`  optional peers ${withPeers} families reach at least one`)
