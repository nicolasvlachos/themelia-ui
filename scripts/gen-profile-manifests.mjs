/*
 * Writes dist-metadata/profiles/{general,admin}.json from architecture/manifest.json: the
 * exact JS/CSS subpaths and optional peers available below each profile. A profile is a
 * dependency ceiling, not a subject-matter split. The records are committed outside dist/ so
 * they stay reviewable, and copied into dist/profiles/, where the package exports point.
 * Fails if a listed subpath is not in package.json exports.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync('architecture/manifest.json', 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const OUT_DIR = 'dist-metadata/profiles'

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
  /* `general` is just its own families; `admin` also carries the general families it reaches. */
  const families = [...(id === 'general' ? new Set(own) : withDependencies(own))].sort()
  records[id] = {
    id,
    definition: manifest.profileDefinition[id],
    families,
    javascriptSubpaths: families.map((f) => byId.get(f)?.export).filter(Boolean).sort(),
    cssSubpaths: families.map((f) => byId.get(f)?.cssExport).filter(Boolean).sort(),
    optionalPeers: [...new Set(families.flatMap((f) => byId.get(f)?.optionalPeers ?? []))].sort(),
  }
}

/* A subpath that is not published would send a tool to an import that cannot resolve. */
const published = new Set(Object.keys(pkg.exports ?? {}))
const missing = Object.values(records).flatMap((record) =>
  [...record.javascriptSubpaths, ...record.cssSubpaths].filter((subpath) => !published.has(subpath)),
)
if (missing.length > 0) {
  console.error(`FAIL gen-profile-manifests — ${missing.length} subpath(s) are not published:\n  ${[...new Set(missing)].join('\n  ')}`)
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })
if (existsSync('dist')) mkdirSync('dist/profiles', { recursive: true })
for (const [id, record] of Object.entries(records)) {
  writeFileSync(`${OUT_DIR}/${id}.json`, `${JSON.stringify(record, null, 2)}\n`)
  if (existsSync('dist')) copyFileSync(`${OUT_DIR}/${id}.json`, `dist/profiles/${id}.json`)
}

console.log(
  `profile metadata: ${Object.entries(records)
    .map(([id, r]) => `${id} ${r.families.length} families / ${r.javascriptSubpaths.length} subpaths`)
    .join(', ')}`,
)
