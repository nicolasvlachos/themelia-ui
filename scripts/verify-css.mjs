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
  composition: ['pinned-body-size', 'metadata-label-text', 'inline-presentation', 'layer-direction', 'patterns-are-terminal', 'admin-is-terminal', 'primitive-reaches-up', 'important', 'pressable-no-focus', 'raw-field', 'raw-select', 'raw-dl', 'raw-img', 'numeric-copy', 'numeric-sentence', 'radius-pair', 'literal-radius', 'literal-colour', 'literal-space', 'off-ladder-space-token', 'literal-hairline', 'surface-axis-shorthand', 'literal-icon-size', 'radius-role', 'state-fill', 'state-radius', 'text-grey', 'text-class-type', 'empty-rule', 'stale-exception'],
  factors: ['per-family-factor', 'squared-factor', 'type-density', 'type-by-scale', 'unrounded-density'],
  'token-budget': ['dead-token', 'pass-through', 'off-ladder', 'orphaned-override', 'undeclared-runtime-token', 'theme-only-token', 'contract-size'],
  scoping: ['bare-root-derived'],
  wiring: ['unimported-theming', 'undefined-var', 'module-keyframes', 'dead-cursor', 'undefined-inline-var'],
  'dark-overrides': ['bare-theme-class', 'missing-explicit', 'missing-media-twin', 'twin-selector', 'twin-mismatch'],
  'type-pairing': ['no-line-height', 'geometry-font-size'],
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
  /* patterns and admin sit above features, so no feature acquires a domain vocabulary. */
  ['patterns', 'src/components/patterns'],
  ['admin', 'src/components/admin'],
  ['preview', 'src/preview'],
]
const layerOf = (path) => LAYERS.find(([, dir]) => path.startsWith(`${dir}/`))?.[0]
const TOP = ['features', 'patterns', 'admin']
const APP = ['features', 'layout', 'preview']

/* TSX rules: [id, layers (all when null), pattern, says]. */
const TSX_RULES = [
  ['pinned-body-size', [...TOP, 'layout'], /<Text\b[^>]*\bsize="sm"/g, 'body text pinned to sm — omit size so the shared default flows; explicit steps are for semantic roles'],
  ['metadata-label-text', TOP, /\blabel:\s*<Text\b/g, 'a metadata label wrapped in Text — pass the label and let DisplayLabel own its typography'],
  ['inline-presentation', TOP, /\bstyle=\{\{[^}]*\b(?:fontSize|fontFamily|fontWeight|lineHeight|letterSpacing|padding(?:Inline|Block|Top|Right|Bottom|Left)?|margin(?:Inline|Block|Top|Right|Bottom|Left)?|gap|rowGap|columnGap)\s*:/g, 'inline presentation bypasses shared typography/spacing — compose a semantic component and tokenized CSS'],
  /* Dependency direction; the one upward reach allowed is primitives → base/typography. Type-only imports count. */
  ['layer-direction', ['primitives', 'base'], /from "@\/components\/features/g, 'an import from a layer above — the direction only points down'],
  ['patterns-are-terminal', ['primitives', 'base', 'features', 'layout'], /from "@\/components\/patterns/g, 'an import from patterns — a pattern assembles the layers below it, never the reverse'],
  ['admin-is-terminal', ['primitives', 'base', 'features', 'layout', 'patterns'], /from "@\/components\/admin/g, 'an import from the admin profile — nothing general may depend on it'],
  ['primitive-reaches-up', ['primitives'], /from "@\/components\/base\/(?!typography)/g, 'a primitive importing from base — only typography, because a formatted value IS text'],
  ['raw-field', APP, /<(input|textarea)\b(?![^>]*type="(checkbox|radio|file|hidden)")/g, 'a native field — Input / Textarea carry the chrome, the invalid state and the clear affordance'],
  ['raw-select', APP, /<select\b/g, 'a native <select> — Select or NativeSelect'],
  ['raw-dl', APP, /<dl\b/g, 'a hand-rolled description list — MetadataList layout="rows" is one'],
  /* Needs both alt and onError; PreviewImage is the component that answers this rule. */
  ['raw-img', null, /<img\b(?![^>]*alt=)|<img\b(?![^>]*onError)/g, 'an <img> with no alt or no failure path — a third party\'s file fails often', /preview-image\.tsx$/],
  /* `copy.formatHour(h)` returns a numeral, so calls are excluded. */
  ['numeric-copy', null, /numeric[^>]*>\s*\{(?:strings|copy)\.(?!\w+\()/g, '`numeric` on a Text rendering copy — mono is for a bare figure'],
  ['numeric-sentence', null, /numeric[\s\S]{0,80}?\{`[^`]*\s[a-z]/g, '`numeric` on a Text holding a sentence — mono is for a bare figure'],
  /* Icons size in CSS (--size-icon-*); `size="sm"` is a different prop and passes. */
  ['literal-icon-size', null, /\bsize=\{\d+\}/g, 'an icon sized in JavaScript — a numeric size prop is a second mechanism no token override reaches'],
]

const MODULE = /\.module\.css$/
/*
 * CSS rules over declarations: [id, files, property, value, says, skip]. An identity names the
 * property as far as the pattern matched it (`scroll-margin-top` is keyed `margin-top`).
 */
const CSS_RULES = [
  ['important', MODULE, /.+/, /!important/, 'an !important — a specificity fight the cascade layers exist to prevent'],
  /* --radius for containers, --radius-sm inside them; empty-state illustrations draw UI, they are not UI. */
  ['radius-pair', /\.css$/, /border-radius$/, /^var\(--radius-(?!sm\)|pill\))[a-z0-9-]+\)/, 'a radius outside the pair — --radius for containers, --radius-sm inside them (outer = inner + inset), --radius-pill for round ends', /empty-illustrations\.module\.css$/],
  /* calc() is inner = outer − inset; round(min(var(--…))) caps a control's corner at 30% of its height. */
  ['literal-radius', MODULE, /border-radius$/, /^(?!var\(|calc\(|round\(min\(var\(--|0$|inherit|50%)/, 'a literal border-radius'],
  /* Modules and theming/ alike: a colour anywhere in any value. */
  ['literal-colour', /\.module\.css$|^src\/styles\/theming\//, /.+/, /(?<![\w-])(?:#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\()/i, 'a literal colour — every colour in this kit is a token'],
  /* px and rem, so `calc(0.875rem * var(--scale))` is caught; 1px is a hairline. */
  ['literal-space', MODULE, /(?:padding|margin|gap)(?:-[a-z-]+)?$/, /^[^v\n;]*(?:\b(?!1px)\d+px|\b[\d.]+rem)/, 'a measurement off the spacing scale — spacing comes from --space-* so it follows --density-scale and presets'],
  /* A spacing-named token set to a scaled rem between the 2, 4, 6, 8, 12, 16, 24px steps. */
  ['off-ladder-space-token', /\.css$/, /^--[a-z0-9-]*-(?:px|py|gap|inset|indent)(?:-[a-z0-9]+)?$/, /^(?:round\(\s*)?calc\((?!(?:0\.125|0\.25|0\.375|0\.5|0\.75|1|1\.5)rem\b)[\d.]+rem\s*\*\s*var\(--(?:space|density)-scale(?:,\s*var\(--scale\))?\)\)/, 'a spacing token set between two --space-* steps — every reader inherits a value off the ladder'],
  ['literal-hairline', /\.css$/, /^(?:border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-width)?|outline(?:-width)?|box-shadow|column-rule(?:-width)?)$/, /(?<![\d.])[12]px/, 'a literal hairline — use --border-width, --border-width-strong or --focus-ring-width'],
  ['surface-axis-shorthand', MODULE, /padding$/, /^var\(--surface-px(?:-(?:xs|lg))?\)$/, 'an inline-axis surface token used as two-axis padding — pair --surface-py* with --surface-px*'],
]

/*
 * Allowed CSS findings by exact identity (rule|file|selector|property|value). A new finding
 * fails as unexpected; an entry that stops matching fails as stale, so the list only shrinks.
 */
const EXCEPTIONS = []

/* Which radius is the right one: a menu drawn with --radius-sm, or a tooltip with --radius, fails. */
const RADIUS_ROLES = [
  /* Containers hold rows, so they take the outer radius. */
  ['src/components/base/dropdown-menu/dropdown-menu.module.css', '.content', ''],
  ['src/components/base/choice-inputs/select.module.css', '.popup', ''],
  ['src/components/base/combobox/combobox.module.css', '.popup', ''],
  ['src/components/base/popover/popover.module.css', '.content', ''],
  ['src/components/base/hover-card/hover-card.module.css', '.content', ''],
  ['src/components/base/navigation-menu/navigation-menu.module.css', '.popup', ''],
  ['src/components/base/chart/chart.module.css', '.tooltip', ''],
  ['src/components/features/mentions/mentions.module.css', '.panelInline', ''],
  ['src/styles/map.css', '.map--component .leaflet-popup-content-wrapper', ''],
  /* Small things and things inside a container take the complementary radius. */
  ['src/components/base/tooltip/tooltip.module.css', '.content', 'sm'],
  ['src/styles/map.css', '.map--component .leaflet-draw-tooltip', 'sm'],
  ['src/components/base/command/command.module.css', '.inputGroup', 'sm'],
  ['src/components/base/navigation/navigation.module.css', '.tabListEnclosed .tab', 'sm'],
  ['src/components/base/value-inputs/value-inputs.module.css', '.colorPicker', 'sm'],
  ['src/components/base/value-inputs/value-inputs.module.css', '.colorSwatch', 'sm'],
]

/*
 * State fills lift with --accent / --accent-50, and a chosen value takes the brand ladder; --muted
 * is passive and reads as a hole in dark, and a --foreground-N wash is a track or a lifted chip.
 * :read-only is a resting plate, not a state, so it stays out.
 */
const STATE_SELECTOR = /:hover|:active\b|:checked|data-highlighted|data-selected|aria-selected|data-active|aria-current|data-popup-open|\[data-open\]|data-pressed|aria-pressed|data-checked|aria-checked|aria-expanded="true"/
const STATE_SHEETS = ['src/styles/fields.css', 'src/styles/overlays.css', 'src/styles/mentions.css']
/* Any interaction or disclosure state: the shape belongs to the element, so none of these sets it. */
const ANY_STATE = /:hover|:active\b|:focus|:checked|:invalid|data-(?:highlighted|selected|active|pressed|open|popup-open|checked|invalid|state)|aria-(?:selected|current|expanded|pressed|checked|invalid)/

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

function composition({ root, css, ts, sheet }, out) {
  const identities = new Map()
  const exceptions = [...EXCEPTIONS]
  const spacing = join(root, 'scripts/spacing-exceptions.json')
  /* Spacing debt; the file records why each entry stays. */
  if (existsSync(spacing)) exceptions.push(...JSON.parse(readFileSync(spacing, 'utf8')).findings)
  const allowed = new Set(exceptions.map((identity) => identity.replace(/\s+/g, ' ')))

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
    /* A native <button> on a row or card is fine; a pressable surface without :focus-visible is not. */
    const dir = file.path.replace(/\/[^/]+$/, '')
    const parent = dir.replace(/\/[^/]+$/, '')
    const beside = css.filter((s) => s.module && [dir, parent].includes(s.path.replace(/\/[^/]+$/, ''))).map((s) => s.src).join('\n')
    for (const { tag, at } of openingTags(source, 'button')) {
      /* Field chrome draws the ring for data-field-control; tabIndex -1 is unfocusable. */
      if (/data-field-control|tabIndex=\{-1\}/.test(tag)) continue
      const names = [...tag.matchAll(/styles\.(\w+)/g)].map((ref) => ref[1])
      if (names.length && !names.some((name) => new RegExp(`\\.${name}\\b[^{]*:focus-visible`).test(beside))) {
        out('pressable-no-focus', file.path, lineAt(source, at), `styles.${names.join('+')} is pressable with no :focus-visible rule — a keyboard reader cannot see where they are`)
      }
    }
  }

  for (const s of css) {
    if (!layerOf(s.path)) continue
    for (const [id, files, property, value, says, skip] of CSS_RULES) {
      if (!files.test(s.path) || skip?.test(s.path)) continue
      for (const d of s.decls) {
        const name = property.exec(d.name)?.[0]
        if (!name || !value.test(d.value)) continue
        const selector = unglobal(d.block.prelude.split('\n').pop().trim())
        const identity = `${id}|${s.path}|${selector}|${name}|${d.value}`.replace(/\s+/g, ' ')
        identities.set(identity, { id, file: s.path, line: d.line, says })
      }
    }
  }
  for (const [identity, { id, file, line, says }] of identities) {
    if (!allowed.has(identity)) out(id, file, line, `${says} — ${identity}`)
  }
  for (const identity of allowed) {
    if (!identities.has(identity)) out('stale-exception', identity.split('|')[1], undefined, `${identity} no longer matches anything — delete the exception`)
  }

  for (const [path, selector, role] of RADIUS_ROLES) {
    const token = role ? `--radius-${role}` : '--radius'
    const rule = sheet.get(path)?.blocks.find((block) => block.prelude.split('\n').pop().trim() === selector)
    /* Built ON the role's token passes; the closing `)` keeps var(--radius) from passing for --radius-sm. */
    if (!rule?.decls.some((d) => /border-radius$/.test(d.name) && d.value.includes(`var(${token})`))) {
      out('radius-role', path, rule?.line, `${selector} must use ${token}`)
    }
  }

  for (const s of css) {
    if (!(s.module && /^src\/(components|preview)\//.test(s.path)) && !STATE_SHEETS.includes(s.path)) continue
    for (const block of s.blocks.filter(isRule)) {
      const selector = block.prelude.replace(/\s+/g, ' ')
      /* A module class whose only rule is empty vanishes from the bundle while its typed key remains. */
      const empty = (b) => b.decls.length === 0 && b.children.every(empty)
      if (empty(block)) out('empty-rule', s.path, block.line, `${selector.slice(0, 80)} is an empty rule — delete it, or give it the declarations its comment promises`)
      for (const d of block.decls) {
        if (/radius$/.test(d.name) && ANY_STATE.test(selector)) out('state-radius', s.path, d.line, `${selector.slice(0, 80)} sets ${d.name} — a state never changes a shape; put the radius on the base rule`)
      }
      if (s.path.startsWith('src/preview/')) continue
      for (const d of block.decls) {
        /* A passive stripe that steps aside for hover is not a state fill. */
        const fill = /background(?:-color)?$/.test(d.name) && /^var\((--(?:muted|foreground)(?:-\d+)?)\)/.exec(d.value)
        if (fill && STATE_SELECTOR.test(selector) && !/:not\(:hover\)/.test(selector)) {
          out('state-fill', s.path, d.line, `${selector.slice(0, 80)} fills ${fill[1]} — a state lifts with --accent or --accent-50`)
        }
        /* Text is --foreground or --muted-foreground; disabled dims with --disabled-opacity. */
        const grey = d.name === 'color' && /^var\((--(?:muted-)?foreground-\d+)\)/.exec(d.value)
        if (grey) out('text-grey', s.path, d.line, `${selector.slice(0, 80)} paints ${grey[1]} — text is --foreground or --muted-foreground`)
      }
    }
  }
}

/* ── factors ── three factors, no per-family ones (src/styles/FACTORS.md) ──────────── */

const GLOBAL = new Set(['--scale', '--density-scale', '--text-scale'])
/* `var(--density-scale, var(--scale))` is one factor with its default, not two. */
const normalize = (value) => value.replace(/var\(\s*(--(?:density|text)-scale)\s*,\s*var\(\s*--scale\s*\)\s*\)/g, 'var($1)')
const refsIn = (value) => [...value.matchAll(/var\(\s*(--[a-z0-9-]+)/g)]
const scalesIn = (value) => [...value.matchAll(/var\(\s*(--(?:[a-z0-9-]+-)?scale)\s*\)/g)].map((m) => m[1]).filter((name) => GLOBAL.has(name))
/** Whitespace-separated words, leaving the contents of calc()/var() whole. */
function words(value) {
  const out = []
  let depth = 0
  let current = ''
  for (const char of value) {
    if (char === '(') depth++
    else if (char === ')') depth = Math.max(0, depth - 1)
    if (/\s/.test(char) && depth === 0) {
      if (current) out.push(current)
      current = ''
    } else current += char
  }
  if (current) out.push(current)
  return out
}

function factors({ css }, out) {
  const declared = new Map()
  const entries = []
  for (const s of css.filter(under('styles', 'components'))) {
    for (const d of s.decls) {
      const value = normalize(d.value)
      const entry = { path: s.path, d, value }
      if (d.name.startsWith('--')) {
        /* A family factor is identified by its value; `--enter-scale: 0.95` is not one. */
        if (d.name.endsWith('-scale') && !GLOBAL.has(d.name) && /var\(\s*--scale\s*\)/.test(value)) {
          out('per-family-factor', s.path, d.line, `${d.name} reintroduces a per-family factor — scale through --scale / --density-scale / --text-scale only`)
          continue
        }
        declared.set(d.name, [...(declared.get(d.name) ?? []), entry])
      }
      const used = scalesIn(value)
      if (value.includes('calc(') && (d.name.startsWith('--') ? used.length : new Set(used).size) > 1) {
        out('squared-factor', s.path, d.line, `${d.name} multiplies by ${[...new Set(used)].join(' and ')} — the effect is squared`)
      }
      entries.push(entry)
    }
  }

  /* The global factors a value reaches through its references; `seen` survives a cycle. */
  const factorsOf = (value, seen = new Set()) => {
    const found = new Set()
    for (const [, ref] of refsIn(value)) {
      if (GLOBAL.has(ref)) found.add(ref)
      else if (!seen.has(ref)) {
        seen.add(ref)
        for (const entry of declared.get(ref) ?? []) for (const factor of factorsOf(entry.value, seen)) found.add(factor)
      }
    }
    return found
  }

  /*
   * A factor-carrying token multiplied by a factor squares it. Only multiplication counts:
   * `calc(var(--space-lg) + 2px * var(--scale))` scales each term once.
   */
  const squared = (value) => {
    for (const term of words(value).flatMap((word) => word.split(/\s[+]\s|\s[-]\s/))) {
      const refs = refsIn(term).map((m) => ({ name: m[1], start: m.index, end: m.index + m[0].length }))
      const direct = refs.filter((ref) => GLOBAL.has(ref.name))
      for (const ref of direct.length ? refs : []) {
        const inner = GLOBAL.has(ref.name) ? new Set() : factorsOf(`var(${ref.name})`)
        if (!inner.size) continue
        const by = direct.filter((f) => term.slice(Math.min(ref.end, f.end), Math.max(ref.start, f.start)).includes('*'))
        if (by.length) return `${ref.name} — which already carries ${[...inner].join(' and ')} — by ${[...new Set(by.map((f) => f.name))].join(' and ')}`
      }
    }
    return null
  }

  for (const { path, d, value } of entries) {
    const name = d.name
    const custom = name.startsWith('--')
    if (/^--text-(?!scale$)/.test(name) && factorsOf(value).has('--density-scale')) {
      out('type-density', path, d.line, `${name}: ${value} scales by --density-scale — the type ladder scales with --text-scale`)
    }
    /* Component type aliases resolve through the type ramp, never geometry directly. */
    const typeAlias = custom && /(?:-text|-font-size)$/.test(name) && !refsIn(value).some(([, ref]) => ref === '--text-scale' || ref.startsWith('--text-'))
    if ((typeAlias && factorsOf(value).has('--scale')) || (/font-size$/.test(name) && /var\(\s*--scale\s*\)/.test(value))) {
      out('type-by-scale', path, d.line, `${name}: ${value} scales directly by --scale — component typography must resolve through --text-* / --text-scale`)
    }
    const hit = (custom || value.includes('calc(')) && squared(value)
    if (hit) out('squared-factor', path, d.line, `${name} multiplies ${hit}; the effect is squared`)
    /* Whole pixels at every density: each --density-scale term is wrapped in round(…, 1px). */
    for (const term of value.includes('var(--density-scale)') ? words(value) : []) {
      if (term.includes('var(--density-scale)') && !term.startsWith('round(')) {
        out('unrounded-density', path, d.line, `${name} scales by --density-scale without round(…, 1px) — ${term}`)
      }
    }
  }
}

/* ── token-budget ── keeps the token surface from growing back ─────────────────────── */

/* A tone-table row names its tone or variant; the family prefix alone (`--toast-icon`) is a rename. */
const TONE_SET = /^--(button|badge|alert|chart|sidebar|toast)-.*\b(primary|secondary|success|warning|destructive|danger|info|neutral|accent|muted|ghost|outline|solid|soft|link|inverse|tone|series|[1-9])\b/
/* The 2px grid is for spacing; the type ramp is geometric. */
const TYPE_TOKEN = /(?:^|-)(text|font-size|line-height|leading)(?:-|$)/
const GRID_EXEMPT = /font|line-height|letter-spacing|flex|border-radius/
const BARE_ALIAS = /^var\(--[a-z0-9-]+\)$/
const THEMED = /\.dark\b|\.light\b|\[data-theme|prefers-color-scheme/
/* themes/ is what a rebrand touches; raise a budget in a commit that names the token that earned it. */
const THEME_BUDGET = 80
const GLOBAL_BUDGET = 175

/** Lengths under 4rem sit on the 2px grid; above that they are layout. */
const offGrid = (text) =>
  [...text.matchAll(/(?<![\w.])-?(\d*\.?\d+)rem/g)].filter(([, rem]) => Math.abs(rem) > 0 && Math.abs(rem) < 4 && Math.abs((Math.abs(rem) * 16) % 2) > 1e-9)

function tokenBudget({ root, css, ts }, out) {
  /* A name in scripts/ or tests/ (not a generator, which emits tokens) keeps a token alive. */
  const asserted = new Set()
  for (const path of [...filesUnder(root, 'scripts'), ...filesUnder(root, 'tests')]) {
    if (!/\.(mjs|js|ts)$/.test(path) || /\/gen-[^/]+$/.test(path)) continue
    for (const [name] of readFileSync(join(root, path), 'utf8').matchAll(/--[a-z0-9-]+/g)) asserted.add(name)
  }
  /* Any var() or quoted name is a read, comments included; TS reads also exempt from pass-through. */
  const read = new Set()
  const fromCode = new Set()
  for (const file of [...css, ...ts]) {
    const code = !file.path.endsWith('.css')
    for (const [, name, quoted] of file.text.matchAll(/var\((--[a-z0-9-]+)|["'`](--[a-z0-9-]+)["'`]/g)) {
      if (quoted && !code) continue
      read.add(name ?? quoted)
      if (code) fromCode.add(name ?? quoted)
    }
  }
  /* Tokens declared in two or more sheets are extension points, and so is their whole family. */
  const sheetsOf = new Map()
  for (const s of css) for (const d of custom(s.decls)) sheetsOf.set(d.name, new Set([...(sheetsOf.get(d.name) ?? []), s.path]))
  const family = (name) => name.slice(0, name.lastIndexOf('-'))
  const extension = new Set([...sheetsOf].filter(([, where]) => where.size > 1).map(([name]) => family(name)))

  const theming = css.filter((s) => s.module || s.path.startsWith('src/styles/theming/'))
  const declared = new Map()
  for (const s of theming) for (const d of custom(s.decls)) declared.set(d.name, [...(declared.get(d.name) ?? []), { path: s.path, d }])
  for (const [name, sites] of declared) {
    const [{ path, d }] = sites
    if (!read.has(name) && !asserted.has(name)) {
      out('dead-token', path, d.line, `${name} is declared but never read`)
      /* A module declaration overrides for its subtree; with no reader it has no effect. */
      for (const site of sites.filter((site) => site.path.endsWith('.module.css'))) {
        out('orphaned-override', site.path, site.d.line, `${name} is set here but nothing reads it — the override has no effect`)
      }
      continue
    }
    /* Judged on values: a boundary list restating one value is one decision. */
    const restated = new Set(sites.map((site) => site.d.value.replace(/\s+/g, ' '))).size === 1
    if (restated && BARE_ALIAS.test(d.value) && !TONE_SET.test(name) && !name.endsWith('-scale') && !extension.has(family(name)) && !fromCode.has(name)) {
      out('pass-through', path, d.line, `${name}: ${d.value} — a second name for ${d.value}; read it directly`)
    }
  }

  const ladder = new Map()
  for (const s of theming) {
    for (const d of custom(s.decls)) {
      if (TYPE_TOKEN.test(d.name)) continue
      for (const [text, rem] of offGrid(d.value)) ladder.set(`${s.path}:${d.line}:${text}`, [s.path, d.line, `${d.name} uses ${text} (${Math.abs(rem) * 16}px) — not on the 2px grid`])
    }
    if (!s.module) continue
    for (const [index, line] of s.src.split('\n').entries()) {
      if (GRID_EXEMPT.test(line)) continue
      for (const [text, rem] of offGrid(line)) {
        if (!ladder.has(`${s.path}:${index + 1}:${text}`)) ladder.set(`${s.path}:${index + 1}:${text}`, [s.path, index + 1, `${text} (${Math.abs(rem) * 16}px) — not on the 2px grid`])
      }
    }
  }
  for (const [path, line, message] of ladder.values()) out('off-ladder', path, line, message)

  const cssDeclared = new Set(css.flatMap((s) => custom(s.decls).map((d) => d.name)))
  for (const file of ts) {
    for (const match of file.text.matchAll(/(?:getPropertyValue|setProperty|removeProperty)\(\s*["'`](--[a-z0-9-]+)["'`]/g)) {
      if (!cssDeclared.has(match[1])) out('undeclared-runtime-token', file.path, lineAt(file.text, match.index), `reads ${match[1]} at runtime, but no stylesheet declares it`)
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

  const names = (dirs) => new Set(css.filter(under(...dirs)).flatMap((s) => custom(s.decls).map((d) => d.name)))
  const theme = names(['styles/themes']).size
  const contract = names(['styles/tokens', 'styles/themes']).size
  if (theme > THEME_BUDGET) out('contract-size', 'src/styles/themes', undefined, `themes/ declares ${theme} tokens, over the budget of ${THEME_BUDGET}`)
  if (contract > GLOBAL_BUDGET) out('contract-size', 'src/styles/tokens', undefined, `tokens/ + themes/ declare ${contract}, over the budget of ${GLOBAL_BUDGET}`)
}

/* ── scoping ── a derived token at bare :root bakes at root values (src/styles/SCOPES.md) */

const SCOPE_MARKERS = ['[data-ui-scope]', '[data-density]', '[data-theme]']
/* Allowed to read another token from bare :root: a theme alias to a palette constant. */
const BARE_ROOT_ALLOWED = new Set(['--shadow-ink'])

function scoping({ css }, out) {
  for (const s of css.filter(under('styles', 'components', 'preview'))) {
    for (const block of s.blocks) {
      if (!block.prelude.includes(':root') || SCOPE_MARKERS.some((marker) => block.prelude.includes(marker))) continue
      for (const d of custom(block.decls)) {
        if (d.value.includes('var(') && !BARE_ROOT_ALLOWED.has(d.name)) {
          out('bare-root-derived', s.path, d.line, `${d.name} references another token from a bare :root block — it bakes at root values and ignores every nested scope`)
        }
      }
    }
  }
}

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
  const index = css.find((s) => s.path === 'src/styles/index.css')?.text ?? ''
  for (const s of css) {
    const name = /^src\/styles\/theming\/([^/]+\.css)$/.exec(s.path)?.[1]
    if (name && !index.includes(`./theming/${name}`)) out('unimported-theming', s.path, undefined, 'is never imported by src/styles/index.css — every var it defines resolves to nothing')
  }
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
    if (!(s.module && s.path.startsWith('src/components/')) && s.path !== 'src/styles/fields.css') continue
    for (const d of s.decls) {
      /* CSS Modules scopes keyframe names, so a module naming a global one never animates. */
      if (s.module && /animation(?:-name)?$/.test(d.name) && d.value !== 'none' && !d.value.includes('var(')) {
        out('module-keyframes', s.path, d.line, `\`animation: ${d.value}\` names a keyframe directly and will never run — use a --animate-* variable`)
      }
    }
    /* pointer-events: none hides the cursor; native :disabled keeps both, aria/data-disabled only dims. */
    for (const block of s.blocks) {
      const body = block.decls.map((d) => `${d.name}: ${d.value}`).join(';')
      if (/cursor:\s*not-allowed/.test(body) && /pointer-events:\s*none/.test(body)) {
        out('dead-cursor', s.path, block.line, `\`${block.prelude.split('\n').pop()}\` sets pointer-events: none and cursor: not-allowed — the cursor never shows; drop it`)
      }
    }
  }
}

/* ── dark-overrides ── every dark-only block answers the class, the boundaries and the OS ─ */

/* An explicit light choice wins, as .light or [data-theme="light"], and so does a bare boundary inside one (gen-theme.mjs). */
const MEDIA_SELECTORS = [
  ':root:not(.light, [data-theme="light"])',
  '[data-ui-scope]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *)',
  '[data-density]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *)',
]
/* Plain-sheet spelling; a module's :global(...) is unwrapped before comparing. */
const EXPLICIT_SELECTORS = ['.dark', '[data-theme="dark"]', ':is(.dark, [data-theme="dark"]) :is([data-ui-scope], [data-density]):not(.light, [data-theme="light"])']
const DARK_TWIN = /^@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)$/

function darkOverrides({ css }, out) {
  for (const s of css.filter(under('styles/theming', 'components'))) {
    const lines = s.text.split('\n')
    const dark = []
    for (const block of s.blocks.filter(isRule)) {
      const list = selectorList(s, block)
      /* In a module a bare theme class is hashed to a local one and matches nothing. */
      if (s.module && /(?<!:global\()\.(?:dark|light)(?![\w-])/.test(block.prelude)) {
        out('bare-theme-class', s.path, block.line, `a bare .dark/.light in a CSS Module is hashed and matches nothing — write :global(.dark)`)
      }
      /* A standalone dark selector; the shared boundary list has .dark after .light. */
      const start = list.findIndex((item, i) => item.text === '.dark' && list[i - 1]?.text !== '.light')
      if (start >= 0) dark.push({ block, list: list.slice(start), line: list[start].line })
    }
    const twins = s.blocks.filter((block) => DARK_TWIN.test(block.prelude))
    for (const [i, { block, list, line }] of dark.entries()) {
      /* Opt-out: `dark-override: in-tree` within 16 lines above, for a dark class set below the root. */
      if (lines.slice(Math.max(0, line - 17), line - 1).join('\n').includes('dark-override: in-tree')) continue
      for (const wanted of EXPLICIT_SELECTORS) {
        if (!list.some((item) => item.text === wanted)) out('missing-explicit', s.path, line, `explicit dark block is missing \`${wanted}\``)
      }
      const own = custom(block.decls).map((d) => d.name)
      if (!own.length) continue
      /* colorScheme "system" sets no class; the twin comes before the next dark block. */
      const twin = twins.find((t) => t.at > block.at && t.at < (dark[i + 1]?.block.at ?? Infinity))
      if (!twin) {
        out('missing-media-twin', s.path, line, `dark override with no @media (prefers-color-scheme: dark) twin — dead for colorScheme "system". Declares: ${own.join(', ')}`)
        continue
      }
      const inner = descendants(twin).filter(isRule)
      const selectors = inner.flatMap((b) => selectorList(s, b).map((item) => item.text))
      const missing = MEDIA_SELECTORS.find((wanted) => !selectors.includes(wanted))
      if (missing) out('twin-selector', s.path, twin.line, `media twin is missing \`${missing}\``)
      const theirs = inner.flatMap((b) => custom(b.decls).map((d) => d.name))
      const onlyClass = own.filter((name) => !theirs.includes(name))
      const onlyMedia = theirs.filter((name) => !own.includes(name))
      if (onlyClass.length) out('twin-mismatch', s.path, line, `declared for .dark but not under the OS preference: ${onlyClass.join(', ')}`)
      if (onlyMedia.length) out('twin-mismatch', s.path, twin.line, `declared under the OS preference but not for .dark: ${onlyMedia.join(', ')}`)
    }
  }
}

/* ── type-pairing ── a --text-* size carries its leading; density never resizes type ──── */

function typePairing({ css }, out) {
  for (const s of css.filter(under('styles', 'components', 'preview'))) {
    for (const block of s.blocks) {
      const selector = block.prelude.split('\n').pop()
      for (const d of block.decls) {
        const wrong = /font-size$/.test(d.name) && /^var\(\s*(--(?:space|size|action|control|density)[a-z0-9-]*)/.exec(d.value)
        if (wrong) out('geometry-font-size', s.path, d.line, `${selector} font-size uses ${wrong[1]}; use a typography token so density cannot resize text`)
      }
      /* Each step pairs with its --text-<step>--line-height to land on whole pixels. */
      const size = block.decls.find((d) => /font-size$/.test(d.name) && /^var\(--text-[a-z0-9]+\)$/.test(d.value))
      if (size && !block.decls.some((d) => /line-height$/.test(d.name))) {
        out('no-line-height', s.path, size.line, `${selector} font-size: ${size.value} with no line-height — add line-height: var(--text-<step>--line-height)`)
      }
    }
  }
}

/* ── responsive ── each breakpoint's var() chain falls back through every lower one ───── */

/* Every module implementing a responsive chain; add a new family here in the same change. */
const RESPONSIVE = {
  'src/components/base/structure/structure.module.css': ['stack', 'grid', 'cell', 'adaptive', 'split', 'bleed'],
  'src/components/base/aspect-ratio/aspect-ratio.module.css': ['root'],
}
const BPS = ['base', 'sm', 'md', 'lg', 'xl', '2xl']
/* Selector → the variable families each of its breakpoint rules declares. */
const CHAINS = {
  stack: ['stack-direction', 'stack-gap', 'stack-align', 'stack-justify', 'stack-wrap', 'stack-max-width'],
  grid: ['grid-columns', 'grid-gap', 'grid-row-gap', 'grid-column-gap', 'grid-align', 'grid-max-width'],
  cell: ['cell-span'],
  /* Takes Grid's responsive gap and align. */
  adaptive: ['grid-gap', 'grid-align'],
  root: ['aspect-ratio'],
  split: ['split-width', 'split-gap'],
  bleed: ['bleed-amount'],
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
  factors,
  'token-budget': tokenBudget,
  scoping,
  wiring,
  'dark-overrides': darkOverrides,
  'type-pairing': typePairing,
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
