/*
 * architecture/manifest.json must match the source. Fails on: undeclared-edge / stale-edge
 * (manifest vs actual imports), layer-edge, profile-edge (general → admin), barrel-import,
 * peer-drift (optional peers, transitively), unowned-peer, cycle, unaccounted / orphan
 * (package.json exports vs families), duplicate, missing-source, and judgement — a misspelled
 * or unknown key in the hand-edited fields, which regeneration would carry or drop silently.
 * Generators read this manifest, so an undeclared edge means they emit the wrong thing.
 */
import { existsSync, readFileSync } from 'node:fs'
import { ALLOWED_EDGES, actualEdges, readManifest, specifiers } from './lib/read-architecture-manifest.mjs'

const manifest = readManifest()
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const OPTIONAL_PEERS = Object.keys(pkg.peerDependenciesMeta ?? {})
const failures = []

/* ── judgement: profile, status and nonFamilyExports are the hand-edited fields ───── */
const ROOT_KEYS = ['profileDefinition', 'families', 'nonFamilyExports', 'byId', 'topological']
const FAMILY_KEYS = ['id', 'profile', 'layer', 'source', 'export', 'cssExport', 'optionalPeers', 'dependsOnFamilies', 'documentationRoute', 'status']
const PROFILES = ['admin', 'general']
const STATUSES = ['stable', 'experimental', 'deprecated']
for (const key of Object.keys(manifest).filter((key) => !ROOT_KEYS.includes(key))) failures.push(`judgement         unknown top-level key "${key}"`)
if (Object.keys(manifest.profileDefinition).sort().join() !== PROFILES.join()) failures.push(`judgement         profileDefinition must define exactly ${PROFILES.join(' and ')}`)
for (const family of manifest.families) {
  for (const key of Object.keys(family).filter((key) => !FAMILY_KEYS.includes(key))) failures.push(`judgement         ${family.id} has unknown key "${key}"`)
  if (!PROFILES.includes(family.profile)) failures.push(`judgement         ${family.id} has profile "${family.profile}", not ${PROFILES.join(' or ')}`)
  if (!STATUSES.includes(family.status)) failures.push(`judgement         ${family.id} has status "${family.status}", not ${STATUSES.join(', ')}`)
  /* The router resolves a bare segment against the current page: a relative route 404s. */
  const route = family.documentationRoute
  if (route && (!route.path?.startsWith('/') || !route.label)) failures.push(`judgement         ${family.id} documentation route needs a root-relative path and a label`)
}
for (const entry of manifest.nonFamilyExports) if (!entry.reason) failures.push(`judgement         ${entry.export} is published outside a family with no reason`)

/* ── edges, peers ────────────────────────────────────────────────────────────────── */
for (const family of manifest.families) {
  const specs = specifiers(family, manifest.families)
  const actual = actualEdges(family, manifest.byId, manifest.families)
  const declared = new Set(family.dependsOnFamilies)

  for (const edge of actual) {
    if (!declared.has(edge)) failures.push(`undeclared-edge   ${family.id} → ${edge}`)
  }
  for (const edge of declared) {
    if (!actual.has(edge)) failures.push(`stale-edge        ${family.id} → ${edge} is declared but not imported`)
    const target = manifest.byId.get(edge)
    if (!target) {
      failures.push(`stale-edge        ${family.id} → ${edge} names no family`)
      continue
    }
    const allowed = ALLOWED_EDGES[family.layer] ?? []
    if (target.layer !== family.layer && !allowed.includes(target.layer)) {
      failures.push(`layer-edge        ${family.id} (${family.layer}) → ${edge} (${target.layer}) is not an allowed direction`)
    }
    if (family.profile === 'general' && target.profile === 'admin') {
      failures.push(`profile-edge      ${family.id} is general but depends on admin ${edge}`)
    }
  }

  /*
   * A bare layer barrel names no family, so it records no edge and escapes the layer rule.
   * `primitives` is exempt: that barrel IS a family's entry.
   */
  for (const spec of specs) {
    if (/^@\/components\/(base|features|layout|patterns|admin|admin\/patterns)(\/index)?$/.test(spec)) {
      failures.push(`barrel-import     ${family.id} imports the layer barrel "${spec}", which names no family — import the family subpath`)
    }
  }

  const directPeers = OPTIONAL_PEERS.filter((peer) => specs.some((s) => s === peer || s.startsWith(`${peer}/`)))
  for (const peer of directPeers) {
    if (!family.optionalPeers.includes(peer)) failures.push(`peer-drift        ${family.id} reaches ${peer}, unrecorded`)
  }
  for (const edge of declared) {
    for (const peer of manifest.byId.get(edge)?.optionalPeers ?? []) {
      if (!family.optionalPeers.includes(peer)) {
        failures.push(`peer-drift        ${family.id} reaches ${peer} through ${edge}, unrecorded`)
      }
    }
  }
}

/* An optional peer no family reaches is a stale install instruction for every consumer. */
for (const peer of OPTIONAL_PEERS) {
  if (!manifest.families.some((family) => family.optionalPeers.includes(peer))) failures.push(`unowned-peer      ${peer} is an optional peer no family reaches`)
}

/* ── cycles ──────────────────────────────────────────────────────────────────────── */
const sorted = manifest.topological()
if (sorted.cycle) failures.push(`cycle             ${sorted.cycle.join(' → ')}`)

/* ── export map accounted for ────────────────────────────────────────────────────── */
/* A family accounts for its JS subpath and, when present, its stylesheet subpath. */
const accounted = new Set([
  ...manifest.families.flatMap((f) => [f.export, f.cssExport].filter(Boolean)),
  ...manifest.nonFamilyExports.map((e) => e.export),
])
for (const subpath of Object.keys(pkg.exports ?? {})) {
  if (!accounted.has(subpath)) failures.push(`unaccounted       ${subpath} is published but not in the manifest`)
}
for (const family of manifest.families) {
  if (!(family.export in (pkg.exports ?? {}))) failures.push(`orphan            ${family.id} declares ${family.export}, which is not published`)
}

/* ── classification ──────────────────────────────────────────────────────────────── */
const seen = new Set()
for (const family of manifest.families) {
  if (seen.has(family.id)) failures.push(`duplicate         ${family.id} appears twice`)
  seen.add(family.id)
  if (!existsSync(family.source)) failures.push(`missing-source    ${family.id} → ${family.source}`)
}

if (failures.length) {
  console.log(`FAIL verify architecture — ${failures.length} problem(s)\n`)
  for (const line of failures.sort()) console.log(`  ${line}`)
  process.exit(1)
}

const edges = manifest.families.reduce((sum, f) => sum + f.dependsOnFamilies.length, 0)
console.log(
  `PASS verify architecture — ${manifest.families.length} families, one profile and layer each; ` +
    `${edges} declared edges, acyclic; every published subpath accounted for.`,
)
