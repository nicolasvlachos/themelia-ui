/*
 * Writes dist/profiles/{general,admin}.json, where the package exports point, from
 * architecture/manifest.json: the exact JS/CSS subpaths and optional peers available below
 * each profile. A profile is a dependency ceiling, not a subject-matter split.
 * Fails if a listed subpath is not in package.json exports.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

import { expandExports } from './lib/export-targets.mjs'

const manifest = JSON.parse(readFileSync('architecture/manifest.json', 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const OUT_DIR = 'dist/profiles'

const byId = new Map(manifest.families.map((family) => [family.id, family]))

/** The given families plus everything they depend on, transitively. */
function withDependencies(ids) {
  const out = new Set()
  const walk = (id) => {
    if (out.has(id)) return
    out.add(id)
    for (const next of byId.get(id)?.dependsOnFamilies ?? []) walk(next)
  }
  for (const id of ids) walk(id)
  return out
}

const records = {}
for (const id of Object.keys(manifest.profileDefinition ?? {}).sort()) {
  const own = manifest.families.filter((family) => family.profile === id).map((family) => family.id)
  /* `general` is just its own modules; `admin` also carries the general modules it reaches. */
  const modules = [...(id === 'general' ? new Set(own) : withDependencies(own))].sort()
  records[id] = {
    id,
    definition: manifest.profileDefinition[id],
    modules,
    javascriptSubpaths: modules.map((m) => byId.get(m)?.export).filter(Boolean).sort(),
    cssSubpaths: modules.map((m) => byId.get(m)?.cssExport).filter(Boolean).sort(),
    optionalPeers: [...new Set(modules.flatMap((m) => byId.get(m)?.optionalPeers ?? []))].sort(),
  }
}

/* A subpath that is not published would send a tool to an import that cannot resolve. */
/* Expanded against dist/, so a family whose JavaScript or stylesheet was not emitted is missing. */
const published = new Set(Object.keys(expandExports(pkg.exports)))
const missing = Object.values(records).flatMap((record) =>
  [...record.javascriptSubpaths, ...record.cssSubpaths].filter((subpath) => !published.has(subpath)),
)
if (missing.length > 0) {
  console.error(`FAIL gen-profile-manifests — ${missing.length} subpath(s) are not published:\n  ${[...new Set(missing)].join('\n  ')}`)
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })
for (const [id, record] of Object.entries(records)) {
  writeFileSync(`${OUT_DIR}/${id}.json`, `${JSON.stringify(record, null, 2)}\n`)
}

console.log(
  `profile metadata: ${Object.entries(records)
    .map(([id, r]) => `${id} ${r.modules.length} modules / ${r.javascriptSubpaths.length} subpaths`)
    .join(', ')}`,
)
