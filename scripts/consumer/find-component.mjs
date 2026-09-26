#!/usr/bin/env node
/*
 * Finds which themelia-ui component to use, with its exact JS and CSS imports, from the
 * catalogue shipped in this package (offline). `--help` lists the filters.
 *   node node_modules/themelia-ui/scripts/consumer/find-component.mjs "bulk selection"
 *   node node_modules/themelia-ui/scripts/consumer/find-component.mjs --layer=base --json
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const INDEX_PATH = resolve(HERE, '..', '..', '.agents/skills/themelia-ui/references/components/INDEX.json')

export function loadIndex(path = INDEX_PATH) {
  if (!existsSync(path)) throw new Error(`the packaged component index is missing at ${path}`)
  return JSON.parse(readFileSync(path, 'utf8')).families
}

const text = (value) => (Array.isArray(value) ? value.join(' ') : String(value ?? ''))
const normalizedWords = (value) => String(value ?? '')
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .toLowerCase()
  .replace(/[^a-z0-9@]+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean)

const stem = (word) => {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  for (const suffix of ['ing', 'ed', 'es', 's']) {
    if (word.length <= suffix.length + 3 || !word.endsWith(suffix)) continue
    let base = word.slice(0, -suffix.length)
    if (base.length > 3 && base.at(-1) === base.at(-2)) base = base.slice(0, -1)
    return base
  }
  return word
}

const meaningfulTerms = (value) => normalizedWords(value)
  .filter((word) => word.length > 2 && !STOPWORDS.has(word))
  .map(stem)

const termHits = (queryTerms, corpus) => {
  const words = normalizedWords(corpus)
  const stems = new Set(words.map(stem))
  return queryTerms.filter((term) =>
    stems.has(term) || words.some((word) => term.length >= 4 && word.startsWith(term)),
  ).length
}

/* Words in nearly every guidance sentence; a length cut-off would also drop `row`, `tab`, `nav`. */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'not', 'but', 'its', 'with', 'that', 'this', 'from', 'into', 'when',
  'where', 'which', 'what', 'you', 'your', 'are', 'was', 'has', 'have', 'one', 'two', 'use',
  'used', 'using', 'than', 'then', 'them', 'they', 'there', 'their', 'each', 'any', 'all',
])

/**
 * Families matching a query and filters, ranked: an exact public symbol beats a family id,
 * which beats positive guidance and recipes. `avoidWhen` text never counts as a match.
 */
export function findComponents(families, query, filters = {}) {
  const needle = query.trim().toLowerCase()
  const hasFilter = ['layer', 'profile', 'status', 'family', 'peer', 'route', 'symbol']
    .some((name) => Boolean(filters[name]))
  if (!needle && !hasFilter) return []

  const scored = []
  for (const family of families) {
    if (filters.layer && family.layer !== filters.layer) continue
    if (filters.profile && family.profile !== filters.profile) continue
    if (filters.status && family.status !== filters.status) continue
    if (filters.family && family.family !== filters.family) continue
    if (filters.peer && !(family.optionalPeers ?? []).includes(filters.peer)) continue
    if (filters.route && !(family.previews ?? []).some((preview) => preview.route === filters.route)) continue

    const symbols = (family.publicSymbols ?? []).map((s) => String(s).toLowerCase())
    if (filters.symbol && !symbols.includes(filters.symbol.toLowerCase())) continue

    if (!needle) {
      scored.push({ family, score: 0 })
      continue
    }

    let score = 0
    const componentMatches = []
    const queryTerms = meaningfulTerms(query)
    const phrase = normalizedWords(query).join(' ')
    const normalizedSymbols = (family.publicSymbols ?? []).map((symbol) => normalizedWords(symbol).join(' '))
    const normalizedFamily = normalizedWords(family.family).join(' ')
    const identityItems = [family.family, ...(family.publicSymbols ?? []), ...(family.components ?? [])]
    const identity = identityItems.map(text).join(' ')
    const identityHits = termHits(queryTerms, identity)
    const identityWholeMatch = identityItems.some(
      (item) => termHits(queryTerms, item) === queryTerms.length,
    )
    if (normalizedSymbols.includes(phrase)) score = 100
    else if (normalizedFamily === phrase) score = 90
    else if (normalizedSymbols.some((symbol) => symbol.includes(phrase))) score = 75
    else if (normalizedFamily.includes(phrase)) score = 70
    else if (queryTerms.length > 1 && identityWholeMatch) score = 65
    else {
      const positive = [
        family.chooseWhen,
        family.doc,
        family.components,
        ...(family.componentGuidance ?? []).flatMap((entry) => [entry.description, entry.chooseWhen, entry.capabilities]),
        ...(family.previews ?? []).flatMap((preview) => [preview.page, preview.route]),
        ...(family.recipes ?? []).flatMap((recipe) => [recipe.id, recipe.title, recipe.page, recipe.route]),
      ].map(text).join(' ').toLowerCase()
      if (positive.includes(needle)) score = 40
      else {
        /*
         * By term, not phrase ("key value facts" must find "label/value facts"). At least
         * half the terms must hit, so one common word does not drag in every family.
         */
        const terms = queryTerms
        const hits = termHits(terms, positive)
        if (terms.length > 0 && hits * 2 >= terms.length) {
          const chooseHits = termHits(terms, family.chooseWhen)
          score = 10 + Math.round((20 * hits) / terms.length) + chooseHits * 4 + identityHits * 2
        }
      }
    }
    for (const entry of family.componentGuidance ?? []) {
      const curated = entry.guidanceSource === 'component'
      const corpus = [entry.symbol, entry.description, curated ? entry.chooseWhen : '', ...(entry.capabilities ?? [])].join(' ')
      const hits = termHits(queryTerms, corpus)
      const exact = normalizedWords(entry.symbol).join(' ') === phrase
      if (exact || (queryTerms.length && hits * 2 >= queryTerms.length)) {
        const componentScore = exact ? 100 : Math.min(curated ? 64 : 34, (curated ? 39 : 10) + Math.round(25 * hits / queryTerms.length))
        componentMatches.push({ ...entry, score: componentScore, matchedTerms: queryTerms.filter((term) => termHits([term], corpus)) })
        score = Math.max(score, componentScore)
      }
    }
    if (score > 0) scored.push({ family: filters.explain ? { ...family, match: { score, components: componentMatches.sort((a, b) => b.score - a.score), reason: componentMatches.length ? 'Public component name, description or positive usage guidance' : 'Family identity, positive guidance or attributed recipe' } } : family, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || String(a.family.family).localeCompare(String(b.family.family)))
    .map((entry) => entry.family)
}

export const FINDER_USAGE = `usage: find-component.mjs [query] [options]

Search, or list a filtered part of, the packaged component catalogue.

Options:
  --layer=<layer>       typography, primitives, base, layout, features, patterns, admin, foundation
  --profile=<profile>   general or admin
  --status=<status>     exact stability status from the catalogue
  --family=<id>         exact family id, for example base/buttons
  --symbol=<Name>       exact public export name
  --peer=<package>      families that require this optional peer
  --route=</path>       families represented on this live preview route
  --limit=<N>           return at most N matches (default 8)
  --explain             include matched components, reasons and API anchors
  --json                emit complete machine-readable records
  --help                show this help

A text query is optional when at least one catalogue filter is present.`

const VALUE_FLAGS = new Set(['layer', 'profile', 'status', 'family', 'symbol', 'peer', 'route', 'limit'])
const BOOLEAN_FLAGS = new Set(['json', 'help', 'explain'])

export function parseFinderArgs(args) {
  const options = {}
  const query = []
  for (const arg of args) {
    if (!arg.startsWith('--')) {
      query.push(arg)
      continue
    }
    const [rawName, ...rest] = arg.slice(2).split('=')
    if (BOOLEAN_FLAGS.has(rawName)) {
      if (rest.length) throw new Error(`--${rawName} does not take a value`)
      options[rawName] = true
      continue
    }
    if (!VALUE_FLAGS.has(rawName)) throw new Error(`unknown option --${rawName}`)
    const value = rest.join('=')
    if (!value) throw new Error(`--${rawName} requires a value written as --${rawName}=...`)
    options[rawName] = value
  }
  const limit = options.limit === undefined ? 8 : Number(options.limit)
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('--limit must be an integer from 1 to 100')
  }
  return { query: query.join(' ').trim(), options: { ...options, limit } }
}

export function runFinderCli(args = process.argv.slice(2), io = console) {
  let parsed
  try {
    parsed = parseFinderArgs(args)
  } catch (error) {
    io.error(`FAIL find-component — ${error.message}\n\n${FINDER_USAGE}`)
    return 1
  }
  if (parsed.options.help) {
    io.log(FINDER_USAGE)
    return 0
  }
  const filters = Object.fromEntries(
    ['layer', 'profile', 'status', 'family', 'symbol', 'peer', 'route']
      .filter((name) => parsed.options[name])
      .map((name) => [name, parsed.options[name]]),
  )
  if (!parsed.query && Object.keys(filters).length === 0) {
    io.error(FINDER_USAGE)
    return 1
  }
  const matches = findComponents(loadIndex(), parsed.query, { ...filters, explain: parsed.options.explain }).slice(0, parsed.options.limit)
  if (matches.length === 0) {
    io.error(
      `no component matches ${JSON.stringify(parsed.query)}.\n` +
        '  Try a shorter term, a public symbol, or fewer filters.\n' +
        '  The full index is at .agents/skills/themelia-ui/references/components/INDEX.json.',
    )
    return 1
  }
  if (parsed.options.json) io.log(JSON.stringify(matches, null, 2))
  else io.log(matches.map(renderMatch).join('\n\n'))
  return 0
}

export function renderMatch(family) {
  const lines = [
    `${family.family}  (${family.layer} · ${family.profile}${family.status ? ` · ${family.status}` : ''})`,
    `  import   ${family.publicImport}`,
  ]
  if (family.cssImport ?? family.css) lines.push(`  css      ${family.cssImport ?? family.css}`)
  if (family.apiDoc) lines.push(`  api      node_modules/themelia-ui/docs/generated/${family.apiDoc}`)
  if (family.chooseWhen) lines.push(`  choose   ${text(family.chooseWhen)}`)
  if (family.avoidWhen) lines.push(`  avoid    ${text(family.avoidWhen)}`)
  if (family.composeWith?.length) lines.push(`  with     ${text(family.composeWith)} — import its JS and CSS too`)
  if (family.alternatives?.length) lines.push(`  instead  ${text(family.alternatives)}`)
  if (family.match) {
    lines.push(`  match    ${family.match.reason}`)
    for (const entry of family.match.components.slice(0, 3)) {
      lines.push(`  ${entry.symbol} — ${entry.chooseWhen}`, `    api    ${entry.apiDoc}`, `    compose ${entry.composition}`)
    }
  }
  return lines.join('\n')
}

/*
 * Run or imported? Compared via realpath: `process.argv[1]` and `import.meta.url` disagree
 * across symlinks (macOS `/tmp`, pnpm's store), and the script would silently do nothing.
 */
function runFromCommandLine(moduleUrl) {
  if (!process.argv[1]) return false
  const real = (path) => {
    try {
      return realpathSync(path)
    } catch {
      return resolve(path)
    }
  }
  return real(process.argv[1]) === real(fileURLToPath(moduleUrl))
}

const invokedDirectly = runFromCommandLine(import.meta.url)
if (invokedDirectly) {
  process.exitCode = runFinderCli()
}
