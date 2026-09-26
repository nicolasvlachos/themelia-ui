/*
 * Gates the built package: dist/ and the package.json exports that point into it. A library
 * build succeeds while emitting bundles a consumer cannot import, so each rule below names a
 * failure that would otherwise surface only in a consumer's project. Findings are prefixed
 * by rule: stale, missing-target, undeclared-import, unresolved-alias, cjs-esm-chunk, loads,
 * peer-leak, weight, license, orphan-css, layer-order, css-bare-specifier, css-unresolved.
 * Needs `npm run build:lib` first.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'

import { createRequire } from 'node:module'
import { dirname, resolve as resolvePath } from 'node:path'

import { cssSpecifierFindings } from './lib/css-specifiers.mjs'
import { targetPaths } from './lib/export-targets.mjs'
import { readManifest } from './lib/read-architecture-manifest.mjs'

const require = createRequire(import.meta.url)
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const failures = []

if (!existsSync('dist')) {
  console.error('verify package — no dist/; run `npm run build:lib` first')
  process.exit(1)
}

/* ── stale ──────────────────────────────────────────────────────────────────────
 * First, because every rule below reads dist/. The newest build input is compared with the
 * OLDEST emitted artifact, so a half-finished build is stale too. Scripts come from the
 * `build:lib` command itself: new generators are covered, scripts that emit nothing are not.
 */
const buildCommand = JSON.parse(readFileSync('package.json', 'utf8')).scripts['build:lib'] ?? ''
const buildScripts = [...buildCommand.matchAll(/scripts\/[\w.-]+\.mjs/g)].map((m) => m[0])
/*
 * package.json is left out: gen-exports.mjs writes it during the build. missing-target and
 * loads catch a package.json that has drifted from dist/.
 */
const SOURCE_GLOBS = ['src', 'vite.lib.config.ts', 'vite.shared.ts', 'tsconfig.json', ...buildScripts]

function newest(target, latest = { mtime: 0, file: null }) {
  if (!existsSync(target)) return latest
  const info = statSync(target)
  if (!info.isDirectory()) {
    return info.mtimeMs > latest.mtime ? { mtime: info.mtimeMs, file: target } : latest
  }
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    latest = newest(`${target}/${entry.name}`, latest)
  }
  return latest
}

/* Only what the library build emits: dist/ also holds docs-site assets it never rewrites. */
const EMITTED = /\.(js|cjs|css)$|\.d\.ts$/

function oldest(target, earliest = { mtime: Infinity, file: null }) {
  const info = statSync(target)
  if (!info.isDirectory()) {
    if (!EMITTED.test(target)) return earliest
    return info.mtimeMs < earliest.mtime ? { mtime: info.mtimeMs, file: target } : earliest
  }
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    earliest = oldest(`${target}/${entry.name}`, earliest)
  }
  return earliest
}

const newestSource = SOURCE_GLOBS.reduce((acc, target) => newest(target, acc), { mtime: 0, file: null })
const oldestBuilt = oldest('dist')
if (newestSource.mtime > oldestBuilt.mtime) {
  const days = Math.round((newestSource.mtime - oldestBuilt.mtime) / 86_400_000)
  const age = days >= 1 ? `${days} day(s)` : 'minutes'
  failures.push(
    `stale  ${newestSource.file} is ${age} newer than ${oldestBuilt.file} — ` +
      'every rule below inspects dist/; run `npm run build:lib`',
  )
}

/* ── missing-target ─────────────────────────────────────────────────────────────── */
let targets = 0
for (const [subpath, value] of Object.entries(pkg.exports ?? {})) {
  /* Targets nest by condition: `{ import: { types, default }, require: { … } }`. */
  const paths = targetPaths(value)
  for (const p of paths) {
    if (p.includes('*')) continue
    targets++
    if (!existsSync(p.replace(/^\.\//, ''))) failures.push(`missing-target  ${subpath} → ${p}`)
  }
}

/* ── undeclared-import, unresolved-alias, cjs-esm-chunk ─────────────────────────── */
function walkAll(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`
    if (entry.isDirectory()) walkAll(p, acc)
    else acc.push(p)
  }
  return acc
}

// Everything that ships, not just JS, for the weight rule.
const bundlesAndAssets = walkAll('dist')
const bundles = bundlesAndAssets.filter((file) => /\.(js|cjs)$/.test(file))
/*
 * Every bare import a bundle makes must be a dependency, a peer or a Node builtin; anything
 * else fails at the consumer's import. publint and peer-leak do not see this.
 */
const declared = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  /* Self-references are how one published subpath reaches another. */
  pkg.name,
])
/** What a bare specifier can actually look like. Anything else is a false match. */
const SPECIFIER = /^@?[\w.-]+(?:\/[\w.-]+)*$/
const BUILTIN = /^node:/
/** `@scope/name` keeps two segments; `name/sub` keeps one. */
const packageOf = (specifier) => {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

for (const file of bundles) {
  const source = readFileSync(file, 'utf8')
  for (const match of [
    ...source.matchAll(/(?:from|import)\s*\(?\s*["']([^"'.][^"']*)["']/g),
    ...source.matchAll(/require\(\s*["']([^"'.][^"']*)["']\)/g),
  ]) {
    const specifier = match[1]
    /* `from` and `import(` also occur in strings; skip captures not shaped like a specifier. */
    if (!SPECIFIER.test(specifier)) continue
    if (BUILTIN.test(specifier)) continue
    const name = packageOf(specifier)
    if (!declared.has(name)) failures.push(`undeclared-import  ${file} imports ${specifier}`)
  }
}

/*
 * unresolved-alias: Vite's `external` predicate sees raw specifiers before resolve.alias.
 * cjs-esm-chunk: a .js chunk required from .cjs is parsed as ESM ("type": "module") and throws.
 */
for (const file of bundles) {
  const source = readFileSync(file, 'utf8')
  if (/(from|require\()\s*["']@\//.test(source)) failures.push(`unresolved-alias  ${file}`)
  if (file.endsWith('.cjs')) {
    for (const m of source.matchAll(/require\(["'](\.[^"']+)["']\)/g)) {
      if (m[1].endsWith('.js')) failures.push(`cjs-esm-chunk  ${file} requires ${m[1]}`)
    }
  }
}

/* ── loads ──────────────────────────────────────────────────────────────────────── */

/*
 * CJS must execute in Node and import no CSS (its consumers import stylesheets themselves).
 * ESM entries import their stylesheets, which Node cannot run, so for ESM check only that
 * every stylesheet named was emitted: a missing one renders a component unstyled.
 */
const sample = ['index', 'primitives', 'base/buttons', 'base/cards', 'features/table', 'ui-provider']
let cssLinks = 0
for (const entry of sample) {
  const esm = `dist/${entry}.js`
  const cjs = `dist/${entry}.cjs`
  if (!existsSync(esm)) continue

  const source = readFileSync(esm, 'utf8')
  for (const match of source.matchAll(/^import\s+["']([^"']+\.css)["']/gm)) {
    const target = resolvePath(dirname(esm), match[1])
    cssLinks++
    if (!existsSync(target)) failures.push(`loads(esm)  ${entry} names ${match[1]}, which was not emitted`)
  }
  if (/^\s*import\s+["'][^"']+\.css["']/m.test(readFileSync(cjs, 'utf8'))) {
    failures.push(`loads(cjs)  ${entry} imports a stylesheet — Node cannot require() one`)
  }

  try {
    require(resolvePath(process.cwd(), cjs))
  } catch (error) {
    failures.push(`loads(cjs)  ${entry} — ${error.message.split('\n')[0]}`)
  }
}


/* ── peer-leak ──────────────────────────────────────────────────────────────────── */

/*
 * "Optional" must hold: importing base/buttons may not require recharts. Which subpaths may
 * reach which optional peer comes from the architecture manifest (derived transitively), so
 * do not keep a second list here.
 */
const PEER_CONTAINMENT = {}
for (const family of readManifest().families) {
  for (const peer of family.optionalPeers) {
    const subpath = family.export === '.' ? 'index' : family.export.slice(2)
    ;(PEER_CONTAINMENT[peer] ??= []).push(subpath)
  }
}
function reaches(entry, dep) {
  const seen = new Set()
  const stack = [entry]
  const re = new RegExp(`from\\s*["']${dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(["'/])`)
  while (stack.length) {
    const file = stack.pop()
    if (seen.has(file)) continue
    seen.add(file)
    let source
    try {
      source = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    if (re.test(source)) return true
    for (const m of source.matchAll(/from\s*["'](\.[^"']+)["']/g)) {
      stack.push(resolvePath(dirname(file), m[1]))
    }
  }
  return false
}

const subpaths = Object.keys(pkg.exports ?? {})
  .filter((s) => !s.includes('*') && s !== './package.json')
  .map((s) => (s === '.' ? 'index' : s.slice(2)))
  .filter((s) => existsSync(`dist/${s}.js`))

const optionalPeers = Object.entries(pkg.peerDependenciesMeta ?? {})
  .filter(([, v]) => v?.optional)
  .map(([k]) => k)

let checked = 0
for (const dep of optionalPeers) {
  const allowed = new Set(PEER_CONTAINMENT[dep] ?? [])
  for (const sub of subpaths) {
    checked++
    if (allowed.has(sub)) continue
    if (reaches(`dist/${sub}.js`, dep)) failures.push(`peer-leak  ${sub} reaches optional peer ${dep}`)
  }
}


/* ── weight ─────────────────────────────────────────────────────────────────────── */

/*
 * Whole-dist ceiling (both module formats, declarations, CSS, tokens.json, tailwind.css): a
 * ratchet against accidental bloat. Raise it only for reviewed published surface, never for
 * a bundled dependency or sourcemaps; per-recipe consumer CSS budgets are gated elsewhere.
 */
const MAX_DIST_KB = 5_233

const maps = bundlesAndAssets.filter((file) => file.endsWith('.map'))
if (maps.length) {
  failures.push(`weight  ${maps.length} sourcemap(s) shipped — they embed the full source; see vite.lib.config.ts`)
}

const distBytes = bundlesAndAssets.reduce((total, file) => {
  try {
    return total + statSync(file).size
  } catch {
    return total
  }
}, 0)
const distKb = Math.round(distBytes / 1024)
if (distKb > MAX_DIST_KB) {
  failures.push(`weight  dist is ${distKb}KB, over the ${MAX_DIST_KB}KB cap`)
}

/* ── license ────────────────────────────────────────────────────────────────────── */

if (pkg.license && !existsSync('LICENSE') && !existsSync('LICENSE.md')) {
  failures.push(`license  package.json declares "${pkg.license}" but no LICENSE file exists`)
}

/* ── orphan-css + layer-order ───────────────────────────────────────────────────── */

const SHEET = 'dist/style.css'
if (!existsSync(SHEET)) {
  failures.push(`orphan-css  ${SHEET} was not emitted`)
} else {
  const sheet = readFileSync(SHEET, 'utf8')

  /*
   * Library mode emits per-chunk CSS without restoring its import in the JS, so check that
   * representative component rules (base and features) and the token layer reached the sheet.
   */
  for (const marker of ['.button__', '.cards__', '.table__']) {
    if (!sheet.includes(marker)) failures.push(`orphan-css  ${SHEET} contains no ${marker} rules`)
  }
  if (!sheet.includes('--radius-sm')) failures.push(`orphan-css  ${SHEET} carries no token layer`)

  // Minifiers may drop the order statement; layers would then rank by concatenation order.
  const declared = sheet.match(/@layer\s+([a-z][a-z,\s]*);/)
  const firstBlock = sheet.search(/@layer\s+[a-z]+\s*\{/)
  if (!declared) {
    failures.push(`layer-order  ${SHEET} declares no @layer order statement`)
  } else if (firstBlock !== -1 && sheet.indexOf(declared[0]) > firstBlock) {
    failures.push(`layer-order  ${SHEET} declares its order AFTER the first layer block`)
  }
}

/* ── css-bare-specifier, css-unresolved ──────────────────────────────────────────
 * Every @import and url() a shipped sheet makes is relative and lands on a real file, in its
 * exact case. See scripts/lib/css-specifiers.mjs for the resolvers a bare one breaks.
 */
const cssSpecifiers = cssSpecifierFindings('dist')
failures.push(...cssSpecifiers.findings)

if (failures.length) {
  console.error(`FAIL verify package — ${failures.length} problem(s)\n`)
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
console.log(
  `PASS verify package — ${Object.keys(pkg.exports).length} subpaths, ${targets} targets present, ` +
    `${bundles.length} bundles clean, ${sample.length} CJS entries execute in Node and ${cssLinks} ESM stylesheet links resolve, ` +
    `${optionalPeers.length} optional peers contained across ${checked} checks, ` +
    'every bare import declared, ' +
    `stylesheet complete and layer-ordered, ${cssSpecifiers.sheets} sheets import only relative files, ` +
    `${distKb}KB shipped with no sourcemaps.`,
)
