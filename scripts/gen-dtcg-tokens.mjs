/*
 * Generates dist/tokens.json: the theme in W3C DTCG format (current editor's draft,
 * designtokens.org/TR/drafts), for design tooling.
 *
 * Reads the theme's `:root` declarations (styles/theme/*.css), each with the comment beside
 * it as its `$description`. A colour's `light-dark()` pair becomes a token in `theme.light`
 * and one in `theme.dark`; every other variable is written once in `theme.light` and aliased
 * from `theme.dark`. Colours use the draft's object form with `colorSpace: "oklch"` plus the
 * optional `hex` fallback (clipped outside sRGB). A value no DTCG type expresses is skipped
 * and listed, on stdout and in `$extensions`. `verify dtcg-tokens` checks the result.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

import { converter, formatHex, inGamut, parse } from 'culori'

const THEME_DIR = 'src/styles/theme'
const OUT = 'dist/tokens.json'

const toOklch = converter('oklch')
const inSrgb = inGamut('rgb')
const round = (n) => Number(Number(n).toFixed(6))

/* ── read the theme ──────────────────────────────────────────────────────────────── */

/**
 * name → { css, doc }. The first declaration wins: a `:root` block inside `@media` (reduced
 * motion) restates a value for a condition, not the theme's value.
 */
const declared = new Map()
for (const file of readdirSync(THEME_DIR).filter((name) => name.endsWith('.css')).sort()) {
  const source = readFileSync(`${THEME_DIR}/${file}`, 'utf8')
  for (const block of source.matchAll(/(^|\n)\s*:root\s*\{([^}]*)\}/g)) {
    for (const [, name, css, doc] of block[2].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);[ \t]*(?:\/\*\s*(.*?)\s*\*\/)?/g)) {
      if (!declared.has(name)) declared.set(name, { css: css.trim().replace(/\s+/g, ' '), doc })
    }
  }
}

/* ── value conversion ────────────────────────────────────────────────────────────── */

const skipped = []
let outOfGamut = 0

/** The top-level comma-separated parts of a value, keeping `oklch(… / …)` whole. */
function topLevel(css, separator = ',') {
  const parts = []
  let depth = 0
  let start = 0
  for (let index = 0; index < css.length; index++) {
    const character = css[index]
    if (character === '(') depth++
    else if (character === ')') depth--
    else if (depth === 0 && (separator === ' ' ? /\s/.test(character) : character === separator)) {
      parts.push(css.slice(start, index).trim())
      start = index + 1
    }
  }
  parts.push(css.slice(start).trim())
  return parts.filter(Boolean)
}

/** `light-dark(a, b)` → [a, b]; any other value is the same in both modes. */
function halves(css) {
  if (!css.startsWith('light-dark(') || !css.endsWith(')')) return null
  const parts = topLevel(css.slice('light-dark('.length, -1))
  return parts.length === 2 ? parts : null
}

function colorValue(css) {
  const parsed = parse(css)
  if (!parsed) return null
  const { l, c, h, alpha } = toOklch(parsed)
  /* `h` is undefined for an achromatic colour; the spec's components must all be numbers. */
  const value = { colorSpace: 'oklch', components: [round(l), round(c), round(h ?? 0)] }
  if (alpha !== undefined && alpha !== 1) value.alpha = round(alpha)
  const hex = formatHex(parsed)
  if (hex) value.hex = hex
  if (!inSrgb(parsed)) outOfGamut++
  return value
}

/** A DTCG dimension: px or rem only; a bare `0` is zero pixels. */
function dimensionValue(css) {
  if (css === '0') return { value: 0, unit: 'px' }
  const match = /^(-?[\d.]+)(px|rem)$/.exec(css)
  return match ? { value: Number(match[1]), unit: match[2] } : null
}

function durationValue(css) {
  const match = /^([\d.]+)(ms|s)$/.exec(css)
  return match ? { value: Number(match[1]), unit: match[2] } : null
}

function cubicBezierValue(css) {
  const match = /^cubic-bezier\(([^)]*)\)$/.exec(css)
  const numbers = match?.[1].split(',').map(Number)
  return numbers?.length === 4 && numbers.every(Number.isFinite) ? numbers : null
}

/** One layer: `offsetX offsetY blur spread color`, optionally `inset`. */
function shadowLayer(css) {
  const parts = topLevel(css, ' ')
  const inset = parts[0] === 'inset' ? parts.shift() !== undefined : false
  const color = colorValue(parts.at(-1) ?? '')
  const lengths = parts.slice(0, -1).map(dimensionValue)
  if (!color || lengths.length < 2 || lengths.length > 4 || lengths.some((length) => !length)) return null
  const [offsetX, offsetY, blur = { value: 0, unit: 'px' }, spread = { value: 0, unit: 'px' }] = lengths
  return { color, offsetX, offsetY, blur, spread, ...(inset ? { inset } : {}) }
}

function shadowValue(css) {
  const layers = topLevel(css).map(shadowLayer)
  return layers.every(Boolean) ? (layers.length === 1 ? layers[0] : layers) : null
}

function fontFamilyValue(css) {
  if (!/[a-z]/i.test(css) || /\(/.test(css)) return null
  return topLevel(css).map((family) => family.replace(/^['"]|['"]$/g, ''))
}

/** The DTCG type and value for one CSS value; `null` when none fits. */
function typed(name, css) {
  if (css === 'initial') return null
  if (name.startsWith('--shadow')) {
    const value = shadowValue(css)
    return value && { $type: 'shadow', $value: value }
  }
  if (name.startsWith('--font-')) {
    const value = fontFamilyValue(css)
    return value && { $type: 'fontFamily', $value: value }
  }
  const color = /^(oklch|oklab|rgb|hsl|#)/.test(css) ? colorValue(css) : null
  if (color) return { $type: 'color', $value: color }
  const dimension = dimensionValue(css)
  if (dimension) return { $type: 'dimension', $value: dimension }
  const duration = durationValue(css)
  if (duration) return { $type: 'duration', $value: duration }
  const bezier = cubicBezierValue(css)
  if (bezier) return { $type: 'cubicBezier', $value: bezier }
  if (/^-?[\d.]+$/.test(css)) return { $type: 'number', $value: Number(css) }
  return null
}

/* ── build the tree ──────────────────────────────────────────────────────────────── */

const light = {}
const dark = {}
for (const [name, { css, doc }] of declared) {
  const key = name.slice(2)
  const describe = (token) => (doc ? { $description: doc, ...token } : token)
  const pair = halves(css)
  if (pair) {
    const [lightToken, darkToken] = pair.map((half) => typed(name, half))
    if (!lightToken || !darkToken) {
      skipped.push(`${name}: no DTCG type fits ${css}`)
      continue
    }
    light[key] = describe(lightToken)
    dark[key] = describe(darkToken)
    continue
  }
  const token = typed(name, css)
  if (!token) {
    skipped.push(`${name}: ${css === 'initial' ? 'unset by default' : `no DTCG type fits ${css}`}`)
    continue
  }
  light[key] = describe(token)
  dark[key] = { $value: `{theme.light.${key}}` }
}

const tokens = {
  $description: 'themelia-ui design tokens in the W3C Design Tokens (DTCG) format.',
  theme: { light, dark },
  $extensions: {
    'org.themelia-ui': {
      skipped,
      outOfGamutColors: outOfGamut,
      note:
        'Each colour is one CSS variable holding both modes as light-dark(); here it is a token per mode. ' +
        'Every other variable is the same in both modes, so theme.dark aliases theme.light.',
    },
  },
}

if (!existsSync('dist')) mkdirSync('dist', { recursive: true })
writeFileSync(OUT, `${JSON.stringify(tokens, null, 2)}\n`)

const count = (group) => Object.keys(group).length
console.log(`dtcg tokens: ${count(light)} light + ${count(dark)} dark → ${OUT}`)
console.log(`  ${outOfGamut} colour(s) outside sRGB, whose \`hex\` fallback is clipped`)
if (skipped.length) {
  console.log(`  ${skipped.length} skipped:`)
  for (const line of skipped) console.log(`    ${line}`)
}
