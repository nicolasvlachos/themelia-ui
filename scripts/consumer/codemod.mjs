#!/usr/bin/env node
/*
 * Rewrites a consumer's source for a themelia-ui upgrade, from the migration maps shipped in
 * docs/generated/. Preview with --dry-run, then apply (in this repo: `npm run codemod`):
 *   node node_modules/themelia-ui/scripts/consumer/codemod.mjs [--dry-run] src/
 * Rewrites moved subpaths, removed-barrel imports, renamed tokens and utility classes.
 * Reports without editing: removed tokens, overrides where old names merged (so one rule
 * may now set --radius twice), utilities whose meaning changed, ambiguous symbols.
 */
import { existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const GENERATED = resolve(HERE, '..', '..', 'docs', 'generated')

const SCRIPT = /\.(?:tsx?|jsx?|mjs|cjs|mts|cts)$/
const STYLE = /\.(?:css|scss|sass|less|pcss|postcss)$/
const MARKUP = /\.(?:html|vue|svelte|astro|mdx)$/

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The two published maps, indexed for the rewrites below. */
export function loadMaps(dir = GENERATED) {
  const read = (file) => {
    const path = resolve(dir, file)
    if (!existsSync(path)) throw new Error(`the packaged migration map is missing at ${path}`)
    return JSON.parse(readFileSync(path, 'utf8'))
  }
  const codemod = read('migration-codemod.json')
  const broad = read('migration-broad-imports.json')
  const pkg = JSON.parse(readFileSync(resolve(dir, '..', '..', 'package.json'), 'utf8'))
  /* A moved family's stylesheet moves with it, where the new one is published. */
  const sheets = new Map()
  for (const [from, to] of Object.entries(codemod.moves ?? {})) {
    const subpath = `.${to.slice(pkg.name.length)}.css`
    if (from.startsWith(`${pkg.name}/`) && pkg.exports?.[subpath]) sheets.set(`${from}.css`, `${to}.css`)
  }
  return {
    /* Where a reader finds the rest, as a path from wherever the codemod was run. */
    doc: relative(process.cwd(), resolve(dir, 'migration.md')),
    moves: new Map([...Object.entries(codemod.moves ?? {}), ...sheets]),
    tokens: new Map(Object.entries(codemod.tokens ?? {})),
    classes: new Map(Object.entries(codemod.classes ?? {})),
    reviewClasses: new Map(Object.entries(codemod.reviewClasses ?? {})),
    broad: new Set([...(broad.removedSubpaths ?? [])]),
    owner: broad.symbols ?? {},
    ambiguous: new Set(Object.keys(broad.ambiguous ?? {})),
  }
}

/*
 * A whole property name: the lookbehind keeps `i--` and `a--b` out; greedy, so a name
 * containing `--` is looked up as itself, not as its prefix.
 */
const TOKEN = /(?<![\w-])--[A-Za-z0-9-]+/g

/*
 * Where a script can name a custom property: `var(--x`, Tailwind `-(--x)` and `[--x:…]`, a
 * style key `"--x":`, or a CSSOM call. Anything else (an argv string like "--flag") is left alone.
 */
const NAME = '--[A-Za-z0-9-]+'
const SCRIPT_TOKEN = new RegExp(
  [
    String.raw`(?<=var\(\s*|-\()${NAME}(?=\s*[,)])`,
    String.raw`(?<=(?:setProperty|getPropertyValue|removeProperty)\(\s*["'\x60])${NAME}(?=["'\x60])`,
    String.raw`(?<=["'\x60])${NAME}(?=["'\x60]\s*:)`,
    String.raw`(?<=\[)${NAME}(?=:)`,
  ].join('|'),
  'g',
)

/** A Tailwind utility, optionally with one side or corner, and any variant prefix. */
const SIDES = '(-(?:t|r|b|l|s|e|x|y|tl|tr|br|bl|ss|se|es|ee))?'
function utilityPattern(name) {
  const [head, ...rest] = name.split('-')
  const tail = rest.join('-')
  return head === 'rounded'
    ? new RegExp(`(?<![\\w-])rounded${SIDES}-${escape(tail)}(?![\\w-])`, 'g')
    : new RegExp(`(?<![\\w-])${escape(name)}(?![\\w-])`, 'g')
}

/** Rewrite one file's text. Returns the new text and what happened, for the report. */
export function rewriteSource(text, file, maps) {
  const changes = []
  const notes = []
  const isScript = SCRIPT.test(file)
  const isStyle = STYLE.test(file)
  const isMarkup = MARKUP.test(file)
  let next = text

  /* A specifier is a quoted string in a script, and an @import target in a stylesheet. */
  if (isScript || isStyle) {
    for (const [from, to] of maps.moves) {
      const pattern = new RegExp(`(["'])${escape(from)}\\1`, 'g')
      if (pattern.test(next)) {
        next = next.replace(pattern, `$1${to}$1`)
        changes.push(`moved-subpath   ${file}  ${from} → ${to}`)
      }
    }
  }

  if (isScript) {
    /* A named import from a removed barrel becomes one import per owning subpath. */
    next = next.replace(
      /import\s*(type\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["'];?/g,
      (whole, typeOnly, body, specifier) => {
        if (!maps.broad.has(specifier)) return whole
        const bySubpath = new Map()
        for (const raw of body.split(',')) {
          const entry = raw.trim()
          if (!entry) continue
          const name = entry.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
          if (maps.ambiguous.has(name)) {
            notes.push(`ambiguous       ${file}  ${name} — exported by more than one family; choose the subpath yourself`)
            return whole
          }
          const subpath = maps.owner[name]
          if (!subpath) {
            notes.push(`unknown         ${file}  ${name} — not in the migration map; it may have been removed`)
            return whole
          }
          if (!bySubpath.has(subpath)) bySubpath.set(subpath, [])
          bySubpath.get(subpath).push(entry)
        }
        if (!bySubpath.size) return whole
        changes.push(`broad-import    ${file}  ${specifier} → ${bySubpath.size} exact subpath(s)`)
        return [...bySubpath]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([subpath, names]) => `import ${typeOnly ?? ''}{ ${names.join(', ')} } from "${subpath}"`)
          .join('\n')
      },
    )
  }

  const renamedTokens = new Map()
  const renameTokens = (source, pattern) =>
    source.replace(pattern, (name, offset, whole) => {
      if (!maps.tokens.has(name)) return name
      const to = maps.tokens.get(name)
      if (to === null) {
        notes.push(`removed-token   ${file}  ${name} — removed with no successor; see ${maps.doc}`)
        return name
      }
      /* A declaration, not a read: `--x:` in a stylesheet, `"--x":` as a style key. */
      const after = whole.slice(offset + name.length)
      if (/^\s*:/.test(after) || /^["'\x60]\s*:/.test(after)) {
        notes.push(
          `override        ${file}  set ${name}, now sets ${to} — more than one component reads it, and ` +
            `a rule that set two old names now sets ${to} twice`,
        )
      }
      renamedTokens.set(`${name} → ${to}`, (renamedTokens.get(`${name} → ${to}`) ?? 0) + 1)
      return to
    })

  if (isStyle) next = renameTokens(next, TOKEN)
  if (isScript) next = renameTokens(next, SCRIPT_TOKEN)
  if (isMarkup) {
    /* A component file's <style> block is a stylesheet; the rest is markup and script. */
    next = next
      .split(/(<style\b[^>]*>[\s\S]*?<\/style>)/)
      .map((part) => (part.startsWith('<style') ? renameTokens(part, TOKEN) : renameTokens(part, SCRIPT_TOKEN)))
      .join('')
  }
  for (const [pair, count] of renamedTokens) changes.push(`token           ${file}  ${pair}${count > 1 ? ` ×${count}` : ''}`)

  /* Utilities live in markup and scripts, and in a stylesheet's @apply. */
  if (isScript || isMarkup || isStyle) {
    const renamed = new Map()
    const rewriteClasses = (source) => {
      let out = source
      for (const [from, to] of maps.classes) {
        /* A side or corner carries across: `rounded-t-surface` → `rounded-t-(--radius)`. */
        const target = (side) => (from.startsWith('rounded-') ? `rounded${side ?? ''}${to.slice('rounded'.length)}` : to)
        out = out.replace(utilityPattern(from), (match, ...groups) => {
          const side = typeof groups[0] === 'string' ? groups[0] : undefined
          const pair = `${match} → ${target(side)}`
          renamed.set(pair, (renamed.get(pair) ?? 0) + 1)
          return target(side)
        })
      }
      for (const [name, note] of maps.reviewClasses) {
        const hits = source.match(utilityPattern(name))
        if (hits) notes.push(`review-class    ${file}  ${name}${hits.length > 1 ? ` ×${hits.length}` : ''} — ${note}`)
      }
      return out
    }
    next = isStyle ? next.replace(/@apply[^;]*;/g, (line) => rewriteClasses(line)) : rewriteClasses(next)
    for (const [pair, count] of renamed) changes.push(`class           ${file}  ${pair}${count > 1 ? ` ×${count}` : ''}`)
  }

  return { text: next, changes, notes }
}

function walk(path, out = []) {
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue
      walk(join(path, entry), out)
    }
  } else if (SCRIPT.test(path) || STYLE.test(path) || MARKUP.test(path)) {
    out.push(path)
  }
  return out
}

export function runCodemod(argv = process.argv.slice(2), { maps = loadMaps(), log = console.log } = {}) {
  const dryRun = argv.includes('--dry-run')
  const targets = argv.filter((arg) => !arg.startsWith('--'))
  if (!targets.length) {
    log('usage: codemod.mjs [--dry-run] <path…>')
    return 1
  }

  const changes = []
  const notes = []
  for (const file of targets.flatMap((target) => walk(target))) {
    const original = readFileSync(file, 'utf8')
    const result = rewriteSource(original, file, maps)
    changes.push(...result.changes)
    notes.push(...result.notes)
    if (result.text !== original && !dryRun) writeFileSync(file, result.text)
  }

  const uniqueNotes = [...new Set(notes)].sort()
  for (const line of changes.sort()) log(`  ${line}`)
  for (const line of uniqueNotes) log(`  ${line}`)
  log(
    `\n${dryRun ? 'would apply' : 'applied'} ${changes.length} rewrite(s)` +
      (uniqueNotes.length ? `, left ${uniqueNotes.length} for you` : '') +
      `.\n\nNot attempted: \`asChild\` → \`render\`, the provider changes, and the CSS split. See\n${maps.doc}.`,
  )
  return 0
}

/*
 * Run or imported? Compared via realpath: `process.argv[1]` and `import.meta.url` disagree
 * across symlinks (macOS `/tmp`, pnpm's store). Same helper as find-component.mjs.
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

if (runFromCommandLine(import.meta.url)) {
  process.exitCode = runCodemod()
}
