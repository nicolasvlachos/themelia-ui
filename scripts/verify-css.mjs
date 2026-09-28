/*
 * The CSS contracts in one pass. Every stylesheet under src/ is read, comment-stripped and
 * parsed once; TS/TSX is read once for the rules that follow tokens and classes into code.
 * Each group is a function over that model; RULES names every rule id it can report.
 *
 *   node scripts/verify-css.mjs                     every group
 *   node scripts/verify-css.mjs composition bem     those groups
 *
 * `check(groups, { root })` runs the same groups over any tree, so self-tests use fixtures.
 */
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publicComponents } from './lib/public-symbols.mjs'

export const RULES = {
  composition: ['inline-presentation', 'raw-img', 'literal-icon-size', 'text-grey', 'text-class-type', 'theme-selector', 'empty-rule'],
  wiring: ['undefined-var', 'module-keyframes', 'undefined-inline-var', 'undeclared-runtime-token', 'theme-only-token'],
  responsive: ['missing-breakpoint', 'missing-reset', 'missing-chain', 'chain-skip'],
  'container-queries': ['self-query'],
  'css-collisions': ['class-collision'],
  bem: ['missing-hook'],
}

/* ── Model ─────────────────────────────────────────────────────────────────────────── */

function filesUnder(root, dir) {
  const out = []
  const walk = (rel) => {
    if (!existsSync(join(root, rel))) return
    const entries = readdirSync(join(root, rel), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))
    for (const entry of entries) {
      if (entry.isDirectory()) walk(`${rel}/${entry.name}`)
      else out.push(`${rel}/${entry.name}`)
    }
  }
  walk(dir)
  return out
}

const blank = (text) => text.replace(/[^\n]/g, '')

/** Comments become spaces (offsets and lines survive); the rest splits into blocks and declarations. */
function parseCss(text) {
  const comments = []
  const src = text.replace(/\/\*[\s\S]*?\*\//g, (comment, at) => {
    comments.push({ at, text: comment })
    return comment.replace(/[^\n]/g, ' ')
  })
  const starts = [0]
  for (let i = src.indexOf('\n'); i !== -1; i = src.indexOf('\n', i + 1)) starts.push(i + 1)
  const line = (at) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= at) lo = mid
      else hi = mid - 1
    }
    return lo + 1
  }
  const blocks = []
  const decls = []
  const stack = []
  let from = 0
  const span = (to) => {
    const raw = src.slice(from, to)
    const lead = raw.search(/\S/)
    return lead < 0 ? { text: '', at: to } : { text: raw.trim(), at: from + lead }
  }
  const declare = (to) => {
    const { text: segment, at } = span(to)
    const match = stack.length && /^(-?-?[A-Za-z_][\w-]*)\s*:([\s\S]*)$/.exec(segment)
    if (!match) return
    const decl = { name: match[1], value: match[2].trim(), line: line(at), block: stack.at(-1) }
    decl.block.decls.push(decl)
    decls.push(decl)
  }
  for (let i = 0; i < src.length; i++) {
    const char = src[i]
    if (char === '"' || char === "'") i = Math.max(i, src.indexOf(char, i + 1))
    else if (char === ';') {
      declare(i)
      from = i + 1
    } else if (char === '{') {
      const { text: prelude, at } = span(i)
      const block = { prelude, at, line: line(at), close: src.length, parent: stack.at(-1), decls: [], children: [] }
      block.parent?.children.push(block)
      blocks.push(block)
      stack.push(block)
      from = i + 1
    } else if (char === '}') {
      declare(i)
      const block = stack.pop()
      if (block) block.close = i
      from = i + 1
    }
  }
  return { src, comments, blocks, decls, line }
}

function load(root) {
  const css = []
  const ts = []
  for (const path of filesUnder(root, 'src')) {
    if (path.endsWith('.css')) {
      const text = readFileSync(join(root, path), 'utf8')
      css.push({ path, text, module: path.endsWith('.module.css'), ...parseCss(text) })
    } else if (/\.tsx?$/.test(path)) {
      const text = readFileSync(join(root, path), 'utf8')
      /* Comments out, line breaks kept, so offsets still give the right line. */
      const code = text.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/^[ \t]*\/\/.*$/gm, '')
      ts.push({ path, text, code })
    }
  }
  return { root, css, ts, sheet: new Map(css.map((sheet) => [sheet.path, sheet])) }
}

const under = (...dirs) => (file) => dirs.some((dir) => file.path.startsWith(`src/${dir}/`))
const custom = (decls) => decls.filter((decl) => decl.name.startsWith('--'))
const isRule = (block) => !block.prelude.startsWith('@')
const lineAt = (text, at) => text.slice(0, at).split('\n').length
const ancestors = (block) => {
  const out = []
  for (let parent = block.parent; parent; parent = parent.parent) out.push(parent)
  return out
}
const descendants = (block) => block.children.flatMap((child) => [child, ...descendants(child)])
const unglobal = (selector) => selector.replace(/:global\((\.[\w-]+)\)/g, '$1')
/** A selector list split on top-level commas, each item whitespace-normalised, with its line. */
function selectorList(sheet, block) {
  const items = []
  let depth = 0
  let start = 0
  const push = (end) => {
    const raw = block.prelude.slice(start, end)
    const lead = raw.search(/\S/)
    items.push({ text: unglobal(raw.trim().replace(/\s+/g, ' ')), line: sheet.line(block.at + Math.max(0, start + lead)) })
  }
  for (let i = 0; i < block.prelude.length; i++) {
    const char = block.prelude[i]
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      push(i)
      start = i + 1
    }
  }
  push(block.prelude.length)
  return items
}

/* ── composition ───────────────────────────────────────────────────────────────────── */

/* Rules differ per layer ("use Button, not <button>" means nothing in base); token discipline holds everywhere. */
const LAYERS = [
  ['styles', 'src/styles'],
  ['primitives', 'src/components/primitives'],
  ['base', 'src/components/base'],
  ['features', 'src/components/features'],
  ['layout', 'src/components/layout'],
  /* Blocks sit above features, so no feature acquires a domain vocabulary. */
  ['blocks', 'src/components/blocks'],
  ['preview', 'src/preview'],
]
const layerOf = (path) => LAYERS.find(([, dir]) => path.startsWith(`${dir}/`))?.[0]
const TOP = ['features', 'blocks']

/* TSX rules: [id, layers (all when null), pattern, says]. */
const TSX_RULES = [
  ['inline-presentation', TOP, /\bstyle=\{\{[^}]*\b(?:fontSize|fontFamily|fontWeight|lineHeight|letterSpacing|padding(?:Inline|Block|Top|Right|Bottom|Left)?|margin(?:Inline|Block|Top|Right|Bottom|Left)?|gap|rowGap|columnGap)\s*:/g, 'inline presentation bypasses shared typography/spacing — use Text and the spacing tokens'],
  /* Needs both alt and onError; PreviewImage is the component that answers this rule. */
  ['raw-img', null, /<img\b(?![^>]*alt=)|<img\b(?![^>]*onError)/g, 'an <img> with no alt or no failure path — a third party\'s file fails often', /preview-image\.tsx$/],
  /* Icons size in CSS (--icon-size, --icon-size-sm); `size="sm"` is a different prop and passes. */
  ['literal-icon-size', null, /\bsize=\{\d+\}/g, 'an icon sized in JavaScript — a numeric size prop is a second mechanism no token override reaches'],
]

/* Shared sheets checked alongside the component modules for empty rules and text colour. */
const SHARED_SHEETS = ['src/styles/fields.css', 'src/styles/overlays.css', 'src/styles/mentions.css']

/** Opening tags of one element, brace-aware: `onClick={() => …}` holds a `>`. */
function openingTags(source, name) {
  const tags = []
  const open = new RegExp(`<${name}\\b`, 'g')
  for (let match; (match = open.exec(source)); ) {
    let depth = 0
    let index = match.index
    for (; index < source.length; index++) {
      if (source[index] === '{') depth++
      else if (source[index] === '}') depth--
      else if (source[index] === '>' && depth === 0) break
    }
    tags.push({ tag: source.slice(match.index, index + 1), at: match.index })
    open.lastIndex = index + 1
  }
  return tags
}

/*
 * What a module class on a <Text> may not set: Text paints its own colour, weight, size and
 * leading from its props, and text.module loads last in the bundle, so the module's value loses.
 * [property, allowed when the tag says, what to use instead]
 */
const TEXT_OWNS = [
  ['color', /\btype="inherit"/, 'the type prop, or type="inherit" to take the surface\'s colour'],
  ['font-weight', null, 'the weight prop'],
  ['font-size', /^(?=[\s\S]*\bsize="inherit")(?![\s\S]*\blineHeight=)/, 'the size prop, or size="inherit" with no lineHeight'],
  ['line-height', /^(?=[\s\S]*\bsize="inherit")(?![\s\S]*\blineHeight=)/, 'the lineHeight prop, or size="inherit" with no lineHeight'],
]

/** The expression inside a tag's `className={…}`, brace-aware; empty when it has none. */
function classNameOf(tag) {
  const start = tag.search(/\bclassName=\{/)
  if (start < 0) return ''
  let depth = 0
  for (let i = tag.indexOf('{', start); i < tag.length; i++) {
    if (tag[i] === '{') depth++
    else if (tag[i] === '}' && --depth === 0) return tag.slice(start, i + 1)
  }
  return ''
}

/** The selector's subject: its last compound, after the final top-level combinator. */
function subjectOf(selector) {
  let depth = 0
  let start = 0
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i]
    if (char === '(' || char === '[') depth++
    else if (char === ')' || char === ']') depth--
    else if (depth === 0 && /[\s>+~]/.test(char)) start = i + 1
  }
  return selector.slice(start)
}

function composition({ css, ts, sheet }, out) {
  const identities = new Map()

  for (const file of ts) {
    const layer = layerOf(file.path)
    if (!layer || !file.path.endsWith('.tsx')) continue
    /* Template literals (docs samples) and prose props hold code-like text that is not a use. */
    const source = file.code
      .replace(/`(?:[^`\\]|\\.)*`/g, (literal) => `\`${blank(literal)}\``)
      .replace(/\b(description|summary|says)(=|:\s*)"(?:[^"\\]|\\.)*"/g, (match, prop, sep) => `${prop}${sep}""${blank(match.slice(prop.length + sep.length))}`)
    for (const [id, layers, pattern, says, skip] of TSX_RULES) {
      if ((layers && !layers.includes(layer)) || skip?.test(file.path)) continue
      for (const match of source.matchAll(pattern)) {
        /* Keyed by enclosing element, not line, so an exception stays stable. */
        const element = [...source.slice(0, match.index).matchAll(/<([A-Za-z][\w.]*)/g)].pop()?.[1] ?? '?'
        identities.set(`${id}|${file.path}|${element}|${match[0]}|`, { id, file: file.path, line: lineAt(source, match.index), says })
      }
    }
    /* A module class on a Text, followed into its stylesheet: every rule whose subject is that class. */
    const imports = new Map([...file.code.matchAll(/import\s+(\w+)\s+from\s+"([^"]+\.module\.css)"/g)].map(([, name, from]) => [
      name,
      from.startsWith('@/') ? `src/${from.slice(2)}` : posix.join(posix.dirname(file.path), from),
    ]))
    for (const { tag, at } of imports.size ? openingTags(source, 'Text') : []) {
      for (const [, name, local] of classNameOf(tag).matchAll(/\b(\w+)\.(\w+)\b/g)) {
        const owner = imports.has(name) && sheet.get(imports.get(name))
        if (!owner) continue
        const hook = new RegExp(`\\.${local}(?![\\w-])`)
        for (const block of owner.blocks.filter(isRule)) {
          if (!selectorList(owner, block).some((item) => hook.test(subjectOf(item.text)))) continue
          for (const [property, allowed, instead] of TEXT_OWNS) {
            const d = block.decls.find((decl) => decl.name === property)
            if (!d || allowed?.test(tag)) continue
            identities.set(`text-class-type|${file.path}|Text|${name}.${local}|${property}`, {
              id: 'text-class-type',
              file: file.path,
              line: lineAt(source, at),
              says: `<Text className={${name}.${local}}> gets ${property} from ${owner.path}:${d.line} — Text paints its own; use ${instead}`,
            })
          }
        }
      }
    }
  }

  for (const [identity, { id, file, line, says }] of identities) out(id, file, line, `${says} — ${identity}`)

  for (const s of css) {
    if (!(s.module && /^src\/(components|preview)\//.test(s.path)) && !SHARED_SHEETS.includes(s.path)) continue
    for (const block of s.blocks.filter(isRule)) {
      const selector = block.prelude.replace(/\s+/g, ' ')
      /* A module class whose only rule is empty vanishes from the bundle while its typed key remains. */
      const empty = (b) => b.decls.length === 0 && b.children.every(empty)
      if (empty(block)) out('empty-rule', s.path, block.line, `${selector.slice(0, 80)} is an empty rule — delete it, or give it the declarations its comment promises`)
      if (s.path.startsWith('src/preview/')) continue
      for (const d of block.decls) {
        /* Text is --foreground or --muted-foreground; disabled dims with --disabled-opacity. */
        const grey = d.name === 'color' && /^var\((--(?:muted-)?foreground-\d+)\)/.exec(d.value)
        if (grey) out('text-grey', s.path, d.line, `${selector.slice(0, 80)} paints ${grey[1]} — text is --foreground or --muted-foreground`)
      }
    }
  }
  /* Colours switch through light-dark(); a rule keyed on the scheme misses a dark region inside a light page. */
  for (const s of css.filter((sheet) => (sheet.module && sheet.path.startsWith('src/components/')) || /^src\/styles\/(?!theme\/)[^/]+\.css$/.test(sheet.path))) {
    for (const block of s.blocks.filter((b) => THEMED.test(b.prelude))) {
      out('theme-selector', s.path, block.line, `${block.prelude.replace(/\s+/g, ' ').slice(0, 80)} keys on the colour scheme — write light-dark() in the value instead`)
    }
  }
}

/* A token declared only under a theme selector: a default page has no value for it. */
const THEMED = /\.dark\b|\.light\b|\[data-theme|prefers-color-scheme/

/* ── wiring ── the silent failures of a var-driven kit: unstyled, no error ─────────────── */

/* Written at runtime by Base UI, so no stylesheet defines them. Explicit, so typos still fail. */
const RUNTIME_PROVIDED = new Set([
  '--transform-origin', // positioner: the anchor point a popup scales out of
  '--available-width',
  '--available-height',
  '--anchor-width',
  '--anchor-height',
  '--positioner-width',
  '--positioner-height',
  '--accordion-panel-height', // accordion panel: the measured height the collapse transitions to
  '--accordion-panel-width',
])

function wiring({ css, ts }, out) {
  const defined = new Set(css.filter(under('styles', 'components')).flatMap((s) => custom(s.decls).map((d) => d.name)))
  /* Only a bare var(--x) must resolve; a fallback may be absent by design. */
  const undefinedIn = (text, extra = () => false) => {
    const missing = new Map()
    for (const match of text.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/gi)) {
      if (!defined.has(match[1]) && !RUNTIME_PROVIDED.has(match[1]) && !extra(match[1]) && !missing.has(match[1])) missing.set(match[1], match.index)
    }
    return missing
  }
  for (const s of css.filter(under('styles', 'components', 'preview'))) {
    for (const [name, at] of undefinedIn(s.src)) out('undefined-var', s.path, s.line(at), `references ${name}, which nothing defines`)
  }
  /* ChartContainer writes --color-<key> series colours onto its wrapper at runtime. */
  for (const file of ts.filter((f) => f.path.endsWith('.tsx'))) {
    for (const [name, at] of undefinedIn(file.code, (n) => n.startsWith('--color-'))) {
      out('undefined-inline-var', file.path, lineAt(file.code, at), `references ${name} in an inline style, which nothing defines`)
    }
  }
  for (const s of css) {
    if (!(s.module && s.path.startsWith('src/components/'))) continue
    for (const d of s.decls) {
      /* CSS Modules scopes keyframe names, so a module naming a global one never animates. */
      if (/animation(?:-name)?$/.test(d.name) && d.value !== 'none' && !d.value.includes('var(')) {
        out('module-keyframes', s.path, d.line, `\`animation: ${d.value}\` names a keyframe directly and will never run — use a --keyframes-* variable`)
      }
    }
  }

  /* A token read or written from JS must exist in a stylesheet. */
  const declaredAnywhere = new Set(css.flatMap((s) => custom(s.decls).map((d) => d.name)))
  for (const file of ts) {
    for (const match of file.text.matchAll(/(?:getPropertyValue|setProperty|removeProperty)\(\s*["'`](--[a-z0-9-]+)["'`]/g)) {
      if (!declaredAnywhere.has(match[1])) out('undeclared-runtime-token', file.path, lineAt(file.text, match.index), `reads ${match[1]} at runtime, but no stylesheet declares it`)
    }
  }

  /* A :root or plain-selector declaration gives a token a default; variant-only tokens pass. */
  const withDefault = new Set()
  const themedAt = new Map()
  for (const s of css.filter(under('styles/theming', 'components'))) {
    for (const block of s.blocks.filter(isRule)) {
      const scheme = ancestors(block).some((a) => /^@media[^{]*prefers-color-scheme/.test(a.prelude))
      const themed = scheme || (THEMED.test(block.prelude) && !/(^|,)\s*:root\b/.test(block.prelude))
      for (const d of custom(block.decls)) {
        if (!themed) withDefault.add(d.name)
        else if (!themedAt.has(d.name)) themedAt.set(d.name, [s.path, d.line, `${scheme ? 'prefers-color-scheme ' : ''}${block.prelude.split('\n').pop()}`])
      }
    }
  }
  for (const [name, [path, line, selector]] of themedAt) {
    if (!withDefault.has(name)) out('theme-only-token', path, line, `${name} (under ${selector}) is declared only under a theme, so a default page has no value for it`)
  }
}

/* ── responsive ── each breakpoint's var() chain falls back through every lower one ───── */

/* Every module implementing a responsive chain; add a new family here in the same change. */
const RESPONSIVE = {
  'src/components/base/structure/structure.module.css': ['stack', 'grid', 'cell', 'adaptive', 'split', 'bleed'],
  'src/components/base/aspect-ratio/aspect-ratio.module.css': ['root'],
}
const BPS = ['base', 'sm', 'md', 'lg', 'xl', '2xl']
/* Selector → the variable families each of its breakpoint rules declares (private, `--_x`). */
const CHAINS = {
  stack: ['_stack-direction', '_stack-gap', '_stack-align', '_stack-justify', '_stack-wrap', '_stack-max-width'],
  grid: ['_grid-columns', '_grid-gap', '_grid-row-gap', '_grid-column-gap', '_grid-align', '_grid-max-width'],
  cell: ['_cell-span'],
  /* Takes Grid's responsive gap and align. */
  adaptive: ['_grid-gap', '_grid-align'],
  root: ['_aspect-ratio'],
  split: ['_split-width', '_split-gap'],
  bleed: ['_bleed-amount'],
}
/* The breakpoint of the nearest @media (--bp-*); a @container ladder below it takes its values from it. */
const breakpointOf = (block) => {
  for (const a of ancestors(block)) {
    if (a.prelude.startsWith('@container')) return 'container'
    const media = /^@media \(--bp-([\w-]+)\)/.exec(a.prelude)
    if (media) return media[1]
  }
  return 'base'
}

function responsive({ sheet }, out) {
  for (const [path, selectors] of Object.entries(RESPONSIVE)) {
    const s = sheet.get(path)
    for (const selector of selectors) {
      const found = (s?.blocks ?? []).filter((b) => b.prelude.endsWith(`.${selector}`)).map((block) => ({ block, bp: breakpointOf(block) }))
      for (const bp of BPS) {
        if (!found.some((f) => f.bp === bp)) out('missing-breakpoint', path, undefined, `.${selector} has no rule for breakpoint "${bp}"`)
      }
      /* Reset in the base rule, or a nested Stack inherits its parent's inline --stack-direction-base. */
      const base = found.find((f) => f.bp === 'base')?.block
      for (const family of base ? CHAINS[selector] : []) {
        for (const bp of BPS) {
          if (!base.decls.some((d) => d.name === `--${family}-${bp}` && d.value === 'initial')) {
            out('missing-reset', path, base.line, `.${selector}: --${family}-${bp} is never reset, so it inherits from an ancestor that set it`)
          }
        }
      }
      for (const { block, bp } of found) {
        const index = BPS.indexOf(bp)
        /* Per declaration: row-gap also reads the gap chain. A chain is the value opening with its variable. */
        for (const family of index < 0 ? [] : CHAINS[selector]) {
          const own = block.decls.map((d) => d.value).find((value) => value.indexOf('--') >= 0 && value.startsWith(`--${family}-${bp}`, value.indexOf('--')))
          if (!own) {
            out('missing-chain', path, block.line, `.${selector} @ ${bp}: no declaration reads --${family}-${bp}`)
            continue
          }
          for (const lower of BPS.slice(0, index + 1)) {
            if (!own.includes(`--${family}-${lower}`)) out('chain-skip', path, block.line, `.${selector} @ ${bp}: --${family} chain skips "${lower}" — a value set there reverts above ${bp}`)
          }
        }
      }
    }
  }
}

/* ── container-queries ── an element is not a member of its own container ───────────── */

/** Subject classes of a selector list; parentheses blanked so `:has(.x)` is not a subject. */
function subjectClasses(selectorList) {
  const subjects = []
  for (const part of selectorList.split(',')) {
    const subject = part.replace(/\([^()]*\)/g, '()').trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean).at(-1)
    for (const match of subject?.matchAll(/\.([A-Za-z_][\w-]*)/g) ?? []) subjects.push(match[1])
  }
  return subjects
}

function containerQueries({ css }, out) {
  for (const s of css.filter((sheet) => sheet.module && sheet.path.startsWith('src/components/'))) {
    /* Only named containers: an unnamed query cannot be attributed from text. */
    const declaring = new Map()
    for (const d of s.decls) {
      const name = d.name === 'container-name' ? /^([A-Za-z_][\w-]*)$/.exec(d.value)?.[1] : d.name === 'container' ? /^([A-Za-z_][\w-]*)\s*\//.exec(d.value)?.[1] : null
      if (name) declaring.set(name, new Set([...(declaring.get(name) ?? []), ...subjectClasses(d.block.prelude)]))
    }
    const reported = new Set()
    for (const query of s.blocks) {
      const name = /^@container\s+([A-Za-z_][\w-]*)\s*\(/.exec(query.prelude)?.[1]
      for (const block of declaring.has(name) ? descendants(query) : []) {
        for (const cls of subjectClasses(block.prelude)) {
          if (!declaring.get(name).has(cls) || reported.has(`${name}|${cls}`)) continue
          reported.add(`${name}|${cls}`)
          out('self-query', s.path, block.line, `.${cls} declares container "${name}" and is a rule subject inside @container ${name} — an element cannot match its own query; put container-type on an ancestor`)
        }
      }
    }
  }
}

/* ── css-collisions ── one hashed class per file, so two components cannot share one ──── */

/* The `══ Name ══` / `── Name ──` banners separating components in a multi-component module. */
const BANNER = /\/\*[\s*]*(?:══+|──+)?\s*([A-Za-z][\w .&/-]*?)\s*(?:══+|──+)/

function cssCollisions({ css }, out) {
  for (const s of css.filter((sheet) => sheet.module)) {
    const sections = new Map()
    let section = '(top)'
    let next = 0
    let previous = null
    for (const block of s.blocks.filter((b) => !b.parent)) {
      /* Banners at depth 0 only: a comment inside the previous top-level block is not one. */
      for (; next < s.comments.length && s.comments[next].at < block.at; next++) {
        const { at, text } = s.comments[next]
        const banner = BANNER.exec(text)
        if (banner && !(previous && at > previous.at && at < previous.close)) section = banner[1]
      }
      previous = block
      const cls = /^\.([A-Za-z][\w-]*)$/.exec(block.prelude)?.[1]
      if (!cls) continue
      const where = sections.get(cls) ?? new Set()
      if (where.size && !where.has(section)) {
        out('class-collision', s.path, block.line, `.${cls} is declared under ${[...where, section].map((name) => `"${name}"`).join(' and ')} — one hashed class, so the later rule retunes the earlier one`)
      }
      sections.set(cls, where.add(section))
    }
  }
}

/* ── bem ── every public component rendering a className writes `{kebab-name}--component` */

/* Components whose whole output is another component's element; each entry states why. */
const DELEGATES = {
  Url: 'renders a <Link> (link--component); its own className is on the visually-hidden "opens a new tab" span',
  FilterOperatorSelect: 'renders a <DropdownMenu>, a context wrapper; the trigger inside carries its own name',
  FiltersButton: 'renders a <Popover>, likewise a wrapper with no box of its own',
  ProductSummaryRow: 'renders a <ProductRow>, which is an <Item> and carries item--component',
  ProductVariantActionMenu: 'renders <ProductRowActions>, which takes no className',
  ComboboxDropdown: 'renders a <ComboboxPortal> — the content is elsewhere in the tree',
  MapDrawControl: 'renders a context provider; the controls inside are the components with boxes',
  KanbanOverlay: "renders dnd-kit's <DragOverlay>, whose element the library creates and positions",
}
const kebab = (name) => name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/** A declaration's body by brace balance, skipping the parameter list (its `{` may be a pattern). */
function bodyAt(text, at) {
  /* `const X = Primitive.Portal` is an alias with no body of its own. */
  if (/\bconst\s+[\w$]+\s*=\s*[\w$.]+\s*;?\s*$/.test(text.slice(at, text.indexOf('\n', at)))) return null
  let cursor = text.indexOf('(', at)
  if (cursor < 0) return null
  for (let depth = 0; cursor < text.length; cursor++) {
    if (text[cursor] === '(') depth++
    else if (text[cursor] === ')' && !--depth) break
  }
  const open = text.indexOf('{', cursor)
  if (open < 0) return null
  for (let depth = 0, k = open; k < text.length; k++) {
    if (text[k] === '{') depth++
    else if (text[k] === '}' && !--depth) return text.slice(open, k + 1)
  }
  return null
}

function bem({ root, ts }, out) {
  const sources = ts.filter((f) => f.path.startsWith('src/components/') && !/\.test\.|\.d\.ts/.test(f.path))
  const exported = new Map()
  for (const file of sources) {
    /* Declared `export function X`, or `function X` exported later by a local `export { X }`. */
    const listed = new Set([...file.text.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g)].flatMap((m) => m[1].split(',').map((entry) => entry.trim().split(/\s+as\s+/)[0])))
    const first = new Map()
    for (const { 1: exported, 2: name, index } of file.text.matchAll(/(export\s+)?(?:function|const)\s+([A-Za-z_$][\w$]*)/g)) {
      if (!first.has(name) && (exported || listed.has(name))) first.set(name, index)
    }
    for (const [name, at] of first) exported.set(name, [...(exported.get(name) ?? []), { file, at }])
  }
  const names = new Set(sources.filter((f) => f.path.endsWith('/index.ts')).flatMap((f) => publicComponents(join(root, f.path))))
  for (const name of names) {
    if (/^use[A-Z]/.test(name)) continue
    let body = null
    let site = null
    for (const candidate of exported.get(name) ?? []) if ((body = bodyAt(candidate.file.text, candidate.at))) {
      site = candidate
      break
    }
    /* Types, re-exports, region hooks, roots delegated through ValueRoot/hook=, no className: not failures. */
    if (!body || body.includes(`${kebab(name)}--component`) || /["`][a-z][a-z0-9-]*--[a-z][a-z0-9-]*["`]/.test(body)) continue
    if (/ValueRoot|hook=/.test(body) || !/className=/.test(body) || DELEGATES[name]) continue
    out('missing-hook', site.file.path, lineAt(site.file.text, site.at), `${name} renders a className but no \`${kebab(name)}--component\` — add it as the FIRST argument to the root's cx(…), or to DELEGATES with the reason if it renders no box of its own`)
  }
}

/* ── runner ────────────────────────────────────────────────────────────────────────── */

const GROUPS = {
  composition,
  wiring,
  responsive,
  'container-queries': containerQueries,
  'css-collisions': cssCollisions,
  bem,
}

/** Runs `groups` over the tree at `root`; returns every finding and the stylesheet count. */
export function check(groups = Object.keys(GROUPS), { root = process.cwd() } = {}) {
  const unknown = groups.filter((group) => !GROUPS[group])
  if (unknown.length) throw new Error(`unknown group(s): ${unknown.join(', ')} — known: ${Object.keys(GROUPS).join(', ')}`)
  const model = load(root)
  const findings = []
  for (const group of groups) GROUPS[group](model, (rule, file, line, message) => findings.push({ group, rule, file, line, message }))
  return { findings, stylesheets: model.css.length }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const named = process.argv.slice(2)
  const groups = named.length ? named : Object.keys(GROUPS)
  let result
  try {
    result = check(groups)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  const { findings, stylesheets } = result
  for (const group of groups) {
    const own = findings.filter((finding) => finding.group === group)
    if (!own.length) continue
    console.log(group)
    for (const { rule, file, line, message } of own) console.log(`  ${rule.padEnd(24)} ${file}${line ? `:${line}` : ''}  ${message}`)
  }
  const failed = groups.filter((group) => findings.some((finding) => finding.group === group))
  if (failed.length) {
    for (const group of failed) console.log(`FAIL verify ${group} — ${findings.filter((f) => f.group === group).length} finding(s)`)
    process.exit(1)
  }
  const rules = groups.reduce((sum, group) => sum + RULES[group].length, 0)
  console.log(`PASS verify css — ${rules} rules over ${stylesheets} stylesheets`)
}
