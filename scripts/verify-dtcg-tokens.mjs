/*
 * Checks dist/tokens.json is valid W3C DTCG and every alias resolves. A walker, not a JSON
 * Schema: inherited `$type`, `{dotted.path}` aliases and OKLCH ranges are not expressible
 * in one. Fails on:
 *
 *   structure   a node that is neither a group nor a token
 *   name        a token or group name containing . { } $, which breaks alias syntax
 *   type        a $type outside the DTCG set, or a token that resolves to no type at all
 *   alias       a {reference} that names nothing, or a cycle of references
 *   value       a $value that does not match its own $type
 *
 * plus a missing or near-empty export.
 */
import { existsSync, readFileSync } from 'node:fs'

const PATH = 'dist/tokens.json'

/* Every type the format module defines, so an unknown type fails rather than passes silently. */
const TYPES = new Set([
  'color', 'dimension', 'duration', 'cubicBezier', 'fontFamily', 'fontWeight',
  'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography',
])

/** The 14 colour spaces the Color module permits. */
const COLOR_SPACES = new Set([
  'srgb', 'srgb-linear', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch',
  'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020', 'xyz-d65', 'xyz-d50',
])

/** OKLCH: lightness 0–1, chroma 0–∞, hue 0–360 exclusive of 360. */
const OKLCH_RANGES = [
  [0, 1],
  [0, Number.POSITIVE_INFINITY],
  [0, 360],
]

function verify(document) {
  const failures = []
  const tokens = new Map()

  const isToken = (node) => node !== null && typeof node === 'object' && '$value' in node

  /* ── walk ──────────────────────────────────────────────────────────────────────── */
  const walk = (node, path, inheritedType) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) {
      failures.push(`structure  ${path || '/'} is neither a group nor a token`)
      return
    }
    const type = node.$type ?? inheritedType
    if (node.$type !== undefined && !TYPES.has(node.$type)) {
      failures.push(`type       ${path || '/'} declares $type "${node.$type}", which DTCG does not define`)
    }

    if (isToken(node)) {
      tokens.set(path, { ...node, resolvedType: type })
      return
    }

    for (const [name, child] of Object.entries(node)) {
      if (name.startsWith('$')) continue
      if (/[.{}$]/.test(name)) {
        failures.push(`name       ${path ? `${path}.` : ''}${name} contains one of . { } $, which alias syntax cannot address`)
      }
      walk(child, path ? `${path}.${name}` : name, type)
    }
  }
  walk(document, '', undefined)

  /* ── aliases resolve, and do not loop ──────────────────────────────────────────── */
  const aliasTarget = (value) =>
    typeof value === 'string' && /^\{[^{}]+\}$/.test(value) ? value.slice(1, -1) : null

  for (const [path, token] of tokens) {
    const seen = new Set([path])
    let cursor = aliasTarget(token.$value)
    while (cursor !== null) {
      if (!tokens.has(cursor)) {
        failures.push(`alias      ${path} references {${cursor}}, which is not a token in this document`)
        break
      }
      if (seen.has(cursor)) {
        failures.push(`alias      ${path} is part of a reference cycle through {${cursor}}`)
        break
      }
      seen.add(cursor)
      cursor = aliasTarget(tokens.get(cursor).$value)
    }
  }

  /* ── every token has a type, and its value matches it ──────────────────────────── */
  for (const [path, token] of tokens) {
    /* An alias inherits its target's type, so it needs none of its own. */
    if (aliasTarget(token.$value)) continue

    if (!token.resolvedType) {
      failures.push(`type       ${path} has no $type, and no ancestor group supplies one`)
      continue
    }
    for (const message of checkValue(token.resolvedType, token.$value)) {
      failures.push(`value      ${path} ${message}`)
    }
  }

  return { failures, tokenCount: tokens.size }
}

function checkValue(type, value) {
  const problems = []
  const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

  if (type === 'color') {
    if (!isObject(value)) return [`is a ${describe(value)}, but a color $value must be an object`]
    if (!COLOR_SPACES.has(value.colorSpace)) {
      problems.push(`has colorSpace ${JSON.stringify(value.colorSpace)}, which is not one of the 14 DTCG colour spaces`)
    }
    if (!Array.isArray(value.components) || value.components.some((c) => typeof c !== 'number')) {
      problems.push('has components that are not an array of numbers')
    } else if (value.colorSpace === 'oklch') {
      if (value.components.length !== 3) problems.push(`has ${value.components.length} oklch components, expected 3`)
      else {
        value.components.forEach((component, index) => {
          const [min, max] = OKLCH_RANGES[index]
          const inRange = index === 2 ? component >= min && component < max : component >= min && component <= max
          if (!inRange) problems.push(`has oklch component ${index} = ${component}, outside [${min}, ${max}]`)
        })
      }
    }
    if (value.alpha !== undefined && (typeof value.alpha !== 'number' || value.alpha < 0 || value.alpha > 1)) {
      problems.push(`has alpha ${JSON.stringify(value.alpha)}, which must be a number in [0, 1]`)
    }
    if (value.hex !== undefined && !/^#[\da-f]{6}([\da-f]{2})?$/i.test(value.hex)) {
      problems.push(`has hex ${JSON.stringify(value.hex)}, which is not a #rrggbb(aa) string`)
    }
    return problems
  }

  if (type === 'dimension' || type === 'duration') {
    const units = type === 'dimension' ? ['px', 'rem'] : ['ms', 's']
    if (!isObject(value)) {
      return [`is a ${describe(value)}, but a ${type} $value must be an object — the string form is the retired draft`]
    }
    if (typeof value.value !== 'number') problems.push(`has a non-numeric value ${JSON.stringify(value.value)}`)
    if (!units.includes(value.unit)) problems.push(`has unit ${JSON.stringify(value.unit)}, expected one of ${units.join(', ')}`)
    return problems
  }

  if (type === 'cubicBezier') {
    if (!Array.isArray(value) || value.length !== 4 || value.some((n) => typeof n !== 'number')) {
      problems.push('must be an array of exactly four numbers')
    }
    return problems
  }

  if (type === 'fontFamily') {
    const ok = typeof value === 'string' || (Array.isArray(value) && value.every((v) => typeof v === 'string'))
    if (!ok) problems.push('must be a string or an array of strings')
    return problems
  }

  if (type === 'number') {
    if (typeof value !== 'number') problems.push(`must be a number, got a ${describe(value)}`)
    return problems
  }

  return problems
}

const describe = (value) =>
  value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value

/* ── run ─────────────────────────────────────────────────────────────────────────── */

if (!existsSync(PATH)) {
  console.log(`FAIL verify dtcg-tokens — ${PATH} does not exist; run \`npm run build:lib\` (scripts/gen-dtcg-tokens.mjs writes it)`)
  process.exit(1)
}
const document = JSON.parse(readFileSync(PATH, 'utf8'))
const { failures, tokenCount } = verify(document)

/* Non-vacuity: an empty document passes every rule above, and is what a broken generator emits. */
if (tokenCount < 100) {
  console.log(`FAIL verify dtcg-tokens — only ${tokenCount} token(s) found; the export is empty or truncated`)
  process.exit(1)
}

if (failures.length) {
  console.log(`FAIL verify dtcg-tokens — ${failures.length} problem(s)\n`)
  for (const line of [...new Set(failures)].sort()) console.log(`  ${line}`)
  process.exit(1)
}
const aliases = JSON.stringify(document).match(/"\{[^{}"]+\}"/g)?.length ?? 0
console.log(
  `PASS verify dtcg-tokens — ${tokenCount} tokens, every $type defined by DTCG, ` +
    `every value matching its type, and all ${aliases} references resolving.`,
)
