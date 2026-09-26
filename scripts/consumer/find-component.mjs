#!/usr/bin/env node
/*
 * Finds which themelia-ui component to use, with its exact JS and CSS imports, from the
 * catalogue shipped in this package (offline). `--help` lists the filters.
 *   node node_modules/themelia-ui/scripts/consumer/find-component.mjs "bulk selection"
 *   node node_modules/themelia-ui/scripts/consumer/find-component.mjs --tier=base --json
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const INDEX_PATH = resolve(HERE, '..', '..', 'docs/generated/component-index.json')

/** One catalogue entry in the shape the finder searches and `--json` prints. */
const toRecord = (entry) => ({
  module: entry.id,
  tier: entry.tier,
  profile: entry.profile,
  status: entry.status,
  publicImport: entry.import,
  cssImport: entry.css,
  publicSymbols: entry.symbols,
  components: entry.components,
  componentGuidance: entry.componentGuidance,
  doc: entry.documentation,
  apiDoc: entry.apiDoc,
  chooseWhen: entry.chooseWhen ?? null,
  avoidWhen: entry.avoidWhen ?? null,
  alternatives: entry.alternatives ?? [],
  composeWith: entry.composeWith ?? [],
  optionalPeers: entry.optionalPeers,
  dependsOn: entry.dependsOn,
  previews: entry.previews ?? [],
  recipes: entry.recipes ?? [],
})

export function loadIndex(path = INDEX_PATH) {
  if (!existsSync(path)) throw new Error(`the packaged component index is missing at ${path}`)
  return Object.values(JSON.parse(readFileSync(path, 'utf8')).modules).map(toRecord)
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

/*
 * Words in nearly every guidance sentence or doc comment, and `component`, which names every
 * entry in a component catalogue. A length cut-off would also drop `row`, `tab`, `nav`.
 */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'not', 'but', 'its', 'with', 'that', 'this', 'from', 'into', 'when',
  'where', 'which', 'what', 'you', 'your', 'are', 'was', 'has', 'have', 'one', 'two', 'use',
  'used', 'using', 'than', 'then', 'them', 'they', 'there', 'their', 'each', 'any', 'all',
  'such', 'component', 'components',
])

/**
 * Modules matching a query and filters, ranked: an exact public symbol beats a module id,
 * which beats positive guidance and recipes. `avoidWhen` text never counts as a match.
 */
export function findComponents(modules, query, filters = {}) {
  const needle = query.trim().toLowerCase()
  const hasFilter = ['tier', 'profile', 'status', 'module', 'peer', 'route', 'symbol']
    .some((name) => Boolean(filters[name]))
  if (!needle && !hasFilter) return []

  const scored = []
  for (const record of modules) {
    if (filters.tier && record.tier !== filters.tier) continue
    if (filters.profile && record.profile !== filters.profile) continue
    if (filters.status && record.status !== filters.status) continue
    if (filters.module && record.module !== filters.module) continue
    if (filters.peer && !(record.optionalPeers ?? []).includes(filters.peer)) continue
    if (filters.route && !(record.previews ?? []).some((preview) => preview.route === filters.route)) continue

    const symbols = (record.publicSymbols ?? []).map((s) => String(s).toLowerCase())
    if (filters.symbol && !symbols.includes(filters.symbol.toLowerCase())) continue

    if (!needle) {
      scored.push({ record, score: 0 })
      continue
    }

    let score = 0
    const componentMatches = []
    const queryTerms = meaningfulTerms(query)
    const phrase = normalizedWords(query).join(' ')
    const normalizedSymbols = (record.publicSymbols ?? []).map((symbol) => normalizedWords(symbol).join(' '))
    const normalizedModule = normalizedWords(record.module).join(' ')
    const identityItems = [record.module, ...(record.publicSymbols ?? []), ...(record.components ?? [])]
    const identity = identityItems.map(text).join(' ')
    const identityHits = termHits(queryTerms, identity)
    const identityWholeMatch = identityItems.some(
      (item) => termHits(queryTerms, item) === queryTerms.length,
    )
    if (normalizedSymbols.includes(phrase)) score = 100
    else if (normalizedModule === phrase) score = 90
    else if (normalizedSymbols.some((symbol) => symbol.includes(phrase))) score = 75
    else if (normalizedModule.includes(phrase)) score = 70
    else if (queryTerms.length > 1 && identityWholeMatch) score = 65
    else {
      const positive = [
        record.chooseWhen,
        record.doc,
        record.components,
        ...(record.componentGuidance ?? []).flatMap((entry) => [entry.description, entry.chooseWhen, entry.capabilities]),
        ...(record.previews ?? []).flatMap((preview) => [preview.page, preview.route]),
        ...(record.recipes ?? []).flatMap((recipe) => [recipe.id, recipe.title, recipe.page, recipe.route]),
      ].map(text).join(' ').toLowerCase()
      if (positive.includes(needle)) score = 40
      else {
        /*
         * By term, not phrase ("key value facts" must find "label/value facts"). At least
         * half the terms must hit, so one common word does not drag in every module.
         */
        const terms = queryTerms
        const hits = termHits(terms, positive)
        if (terms.length > 0 && hits * 2 >= terms.length) {
          const chooseHits = termHits(terms, record.chooseWhen)
          score = 10 + Math.round((20 * hits) / terms.length) + chooseHits * 4 + identityHits * 2
        }
      }
    }
    for (const entry of record.componentGuidance ?? []) {
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
    if (score > 0) scored.push({ record: filters.explain ? { ...record, match: { score, components: componentMatches.sort((a, b) => b.score - a.score), reason: componentMatches.length ? 'Public component name, description or positive usage guidance' : 'Module identity, positive guidance or attributed recipe' } } : record, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || String(a.record.module).localeCompare(String(b.record.module)))
    .map((entry) => entry.record)
}

export const FINDER_USAGE = `usage: find-component.mjs [query] [options]

Search, or list a filtered part of, the packaged component catalogue.

Options:
  --tier=<tier>         foundations, primitives, base, layout, features or blocks
  --profile=<profile>   general or admin
  --status=<status>     exact stability status from the catalogue
  --module=<id>         exact module id, for example base/buttons
  --symbol=<Name>       exact public export name
  --peer=<package>      modules that require this optional peer
  --route=</path>       modules represented on this live preview route
  --limit=<N>           return at most N matches (default 8)
  --explain             include matched components, reasons and API anchors
  --json                emit complete machine-readable records
  --help                show this help

A text query is optional when at least one catalogue filter is present.`

const VALUE_FLAGS = new Set(['tier', 'profile', 'status', 'module', 'symbol', 'peer', 'route', 'limit'])
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
    ['tier', 'profile', 'status', 'module', 'symbol', 'peer', 'route']
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
        '  The full index is at node_modules/themelia-ui/docs/generated/component-index.json.',
    )
    return 1
  }
  if (parsed.options.json) io.log(JSON.stringify(matches, null, 2))
  else io.log(matches.map(renderMatch).join('\n\n'))
  return 0
}

export function renderMatch(record) {
  const lines = [
    `${record.module}  (${record.tier} · ${record.profile}${record.status ? ` · ${record.status}` : ''})`,
    `  import   ${record.publicImport}`,
  ]
  if (record.cssImport ?? record.css) lines.push(`  css      ${record.cssImport ?? record.css}`)
  if (record.apiDoc) lines.push(`  api      node_modules/themelia-ui/docs/generated/${record.apiDoc}`)
  if (record.chooseWhen) lines.push(`  choose   ${text(record.chooseWhen)}`)
  if (record.avoidWhen) lines.push(`  avoid    ${text(record.avoidWhen)}`)
  if (record.composeWith?.length) lines.push(`  with     ${text(record.composeWith)} — import its JS and CSS too`)
  if (record.alternatives?.length) lines.push(`  instead  ${text(record.alternatives)}`)
  if (record.match) {
    lines.push(`  match    ${record.match.reason}`)
    for (const entry of record.match.components.slice(0, 3)) {
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
