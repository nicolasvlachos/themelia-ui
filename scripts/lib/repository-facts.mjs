/*
 * The single source for status facts about the repository (version, entrypoints, families,
 * verify chain), so documents stop deriving and drifting separately. Costly measurements
 * (lint, browser results) are `null` unless supplied; renderers must say "not measured"
 * rather than reuse an old number.
 */
import { execFileSync } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

const countBy = (items, key) => {
  const out = {}
  for (const item of items) {
    const value = item[key]
    if (value === undefined) continue
    out[value] = (out[value] ?? 0) + 1
  }
  /* Sorted, so a generated file's diff shows a changed COUNT rather than a reordering. */
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
}

/** HEAD, or `null` outside a repository. A missing commit is a valid answer, not an error. */
function defaultReadCommit(root) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

/**
 * Everything a status claim may be derived from. `readCommit` and `gzip` are injectable for
 * fixtures; `lintWarnings` comes from whoever measured it this run (this never runs a linter).
 */
export function collectRepositoryFacts(root = '.', options = {}) {
  const { readCommit = defaultReadCommit, gzip = gzipSync, lintWarnings = null } = options

  const pkg = readJson(join(root, 'package.json'))
  const exports = pkg.exports ?? {}

  /* JS entrypoints are conditional exports; CSS ones resolve to a stylesheet. Counted apart. */
  const entries = Object.entries(exports)
  const jsEntrypoints = entries.filter(([, value]) => typeof value === 'object' && value !== null && ('import' in value || 'types' in value)).length
  const cssEntrypoints = entries.filter(([key, value]) => key.endsWith('.css') || (typeof value === 'string' && value.endsWith('.css'))).length

  const manifestPath = join(root, 'architecture/manifest.json')
  const allFamilies = existsSync(manifestPath) ? readJson(manifestPath).families : []

  /* The root entry is in the manifest but is not a family a consumer chooses; see `manifestEntries`. */
  const families = allFamilies.filter((family) => family.export !== '.')

  /* `null`, not 0, when there is no build: zero bytes would be a measurement. */
  const cssPath = join(root, 'dist/style.css')
  let catalogueCss = null
  if (existsSync(cssPath)) {
    const buffer = readFileSync(cssPath)
    catalogueCss = { bytes: statSync(cssPath).size, gzipBytes: gzip(buffer).length }
  }

  return {
    packageVersion: pkg.version,
    jsEntrypoints,
    cssEntrypoints,
    families: families.length,
    /* Including the root entry: the number `architecture/manifest.json` reports. */
    manifestEntries: allFamilies.length,
    profiles: countBy(families, 'profile'),
    layers: countBy(families, 'layer'),
    statuses: countBy(families, 'status'),
    lintWarnings,
    catalogueCss,
    commit: readCommit(root),
  }
}

/** `n` of `thing`, pluralised, or "not measured" when the number is absent. */
const measured = (value, singular, plural = `${singular}s`) =>
  value === null || value === undefined ? 'not measured' : `${value} ${value === 1 ? singular : plural}`

/**
 * The README status block, rendered from facts alone. States no release verdict and nothing
 * from `dist/`: the block is committed and compared against a fresh generation, so a
 * build-only figure would make the gate depend on a build.
 */
export function renderStatusMarkdown(facts) {
  const layers = Object.entries(facts.layers).map(([layer, n]) => `${layer} ${n}`).join(', ')
  const profiles = Object.entries(facts.profiles).map(([profile, n]) => `${profile} ${n}`).join(', ')
  const experimental = facts.statuses.experimental ?? 0

  return [
    `Version \`${facts.packageVersion}\` contains ${facts.families} component families across ${Object.keys(facts.layers).length} layers — ${layers}.`,
    '',
    `The package publishes ${facts.jsEntrypoints} exact JavaScript entrypoints and ${facts.cssEntrypoints} exact CSS entrypoints. There are no broad aggregate barrels: a consumer imports the family it uses.`,
    '',
    `Families per profile: ${profiles}. A profile is a dependency ceiling, not a product taxonomy. ` +
      (experimental === 0
        ? 'Every family is stable.'
        : `${experimental} ${experimental === 1 ? 'family is' : 'families are'} marked experimental.`),
    '',
    `Oxlint: ${measured(facts.lintWarnings, 'warning')}.`,
    '',
    'These figures are generated from the repository and checked by `npm run verify`.',
  ].join('\n')
}
