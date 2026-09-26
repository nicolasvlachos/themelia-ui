/*
 * Checks architecture/migrations.json and the generated migration docs against what the
 * package publishes and declares. Fails on:
 *
 *   dead-target      a `to` naming a subpath the package does not publish
 *   live-source      a `from` that is still published, so nothing needs migrating
 *   missing-action   a non-mechanical change with no instruction for the reader
 *   unmapped         a removed barrel with no entry anywhere
 *   dead-token       a token map naming a target the package does not declare
 *   live-token       a token map renaming a name the package still declares
 *   unrecorded-token a name from the last release's token surface, now gone with no mapping
 */
import { readFileSync } from 'node:fs'

import { declaredTokens } from './lib/token-surface.mjs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const recorded = JSON.parse(readFileSync('architecture/migrations.json', 'utf8'))
const name = pkg.name
const published = new Set(Object.keys(pkg.exports))

const subpathOf = (specifier) =>
  specifier.startsWith(`${name}/`) ? `.${specifier.slice(name.length)}` : specifier === name ? '.' : null

const failures = []
let checked = 0

for (const [section, entries] of Object.entries(recorded)) {
  if (section === 'note') continue
  for (const entry of entries) {
    checked++
    if (entry.kind === 'subpath') {
      const to = subpathOf(entry.to)
      if (!to || !published.has(to)) {
        failures.push(`dead-target     ${entry.from} → ${entry.to}, which the package does not publish`)
      }
      const from = subpathOf(entry.from)
      if (from && published.has(from)) {
        failures.push(`live-source     ${entry.from} is still published — nothing to migrate`)
      }
    }
    if (entry.kind === 'css') {
      /* The `to` is prose here, so check the concrete sheet it names. */
      for (const sheet of entry.to.match(/[\w-]+\.css/g) ?? []) {
        if (![...published].some((subpath) => subpath.endsWith(sheet))) {
          failures.push(`dead-target     ${entry.from} → ${sheet}, which is not a published stylesheet`)
        }
      }
    }
    if (!entry.mechanical && !entry.action) {
      failures.push(`missing-action  ${entry.from} is not mechanical and tells the reader nothing to do`)
    }
    if (!entry.why) {
      failures.push(`missing-action  ${entry.from} has no recorded reason`)
    }
  }
}

/*
 * The token maps the codemod applies: an undeclared target would blank a working value; a
 * still-declared source would rename a live token.
 */
const declared = new Set(declaredTokens())
const mapped = new Map()
for (const entry of recorded.css ?? []) {
  for (const [from, to] of Object.entries(entry.tokens ?? {})) {
    checked++
    if (mapped.has(from)) failures.push(`live-token      ${from} is mapped twice — the codemod could only honour one`)
    mapped.set(from, to)
    if (declared.has(from)) failures.push(`live-token      ${from} is still declared — renaming it would break a working stylesheet`)
    if (to !== null && !declared.has(to)) failures.push(`dead-token      ${from} → ${to}, which the package does not declare`)
  }
}

/* Every name the last release declared is either still here or has somewhere to go. */
const surface = JSON.parse(readFileSync('architecture/token-surface.json', 'utf8'))
for (const token of surface.tokens) {
  checked++
  if (!declared.has(token) && !mapped.has(token)) {
    failures.push(`unrecorded-token ${token} shipped in ${surface.version} and is gone with no entry in a css \`tokens\` map`)
  }
}

/* Every barrel the broad-import map says was removed needs to be reachable from the docs. */
const map = JSON.parse(readFileSync('docs/generated/migration-broad-imports.json', 'utf8'))
const migration = readFileSync('docs/generated/migration.md', 'utf8')
const broadDoc = readFileSync('docs/generated/migration-broad-imports.md', 'utf8')
for (const removed of map.removedSubpaths ?? []) {
  checked++
  if (!broadDoc.includes(removed) && !migration.includes(removed)) {
    failures.push(`unmapped        ${removed} was removed and appears in no migration document`)
  }
}

if (failures.length) {
  console.log(`FAIL verify migrations — ${failures.length} problem(s)\n`)
  for (const line of [...new Set(failures)].sort()) console.log(`  ${line}`)
  process.exit(1)
}
console.log(
  `PASS verify migrations — ${checked} recorded changes; every target is published, every ` +
    'source is gone, and every manual step says what to do.',
)
