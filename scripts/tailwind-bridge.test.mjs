/*
 * The Tailwind bridge, compiled by Tailwind.
 *
 * The generator only checks its input; these tests check Tailwind's output — which keys
 * inline, which utilities read a variable at the element, and what lands on `:root`.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'

import { compile } from '@tailwindcss/node'

const ROOT = process.cwd()
const BRIDGE = `${ROOT}/src/styles/tailwind.css`
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

async function build(css, candidates) {
  const compiler = await compile(css, { base: ROOT, onDependency() {} })
  return compiler.build(candidates)
}

const rule = (out, name) => (out.match(new RegExp(`\\.${name}\\s*\\{([^}]*)\\}`)) ?? [])[1]?.replace(/\s+/g, ' ').trim()

const CANDIDATES = ['rounded-sm', 'font-sans', 'text-sm', 'shadow-lg', 'bg-primary', 'p-padding', 'gap-gap-sm', 'font-heading']
const withBridge = await build(`@import "tailwindcss";\n@import "${BRIDGE}";`, CANDIDATES)
const withoutBridge = await build('@import "tailwindcss";', ['rounded-sm'])

/* Every sheet the kit declares variables in, comments out, the bridge itself excluded. */
const kitSheets = readdirSync(`${ROOT}/src/styles`, { recursive: true })
  .filter((file) => file.endsWith('.css') && !file.endsWith('tailwind.css'))
  .map((file) => strip(readFileSync(`${ROOT}/src/styles/${file}`, 'utf8')))
  .join('\n')

test('without the bridge Tailwind re-points a shared name — the collision it exists for', () => {
  assert.match(rule(withoutBridge, 'rounded-sm'), /var\(--radius-sm\)|0\.25rem/)
  assert.match(withoutBridge, /--radius-sm:\s*0\.25rem/)
})

test('a restated name reads its variable at the element, so a theme can move it', () => {
  assert.equal(rule(withBridge, 'rounded-sm'), 'border-radius: var(--radius-sm);')
  assert.equal(rule(withBridge, 'font-sans'), 'font-family: var(--font-sans);')
})

test('a type step follows the type factor, as Text does, and leaves the kit\'s own step alone', () => {
  assert.match(rule(withBridge, 'text-sm'), /font-size: calc\(0\.875rem \* var\(--text-scale\)\)/)
  assert.doesNotMatch(withBridge, /--text-sm:/)
})

test('a shadow utility draws the kit\'s shadow, which Tailwind inlines to thread its colour through', () => {
  assert.match(rule(withBridge, 'shadow-lg'), /0 12px 24px -12px var\(--tw-shadow-color, oklch\(0 0 0 \/ 18%\)\)/)
})

test('a kit colour or length stays inline, so it resolves against the element', () => {
  assert.equal(rule(withBridge, 'bg-primary'), 'background-color: var(--primary);')
  assert.equal(rule(withBridge, 'p-padding'), 'padding: var(--padding);')
  assert.equal(rule(withBridge, 'gap-gap-sm'), 'gap: var(--gap-sm);')
})

test('a name the kit leaves unset makes no utility, so the kit\'s fallback holds', () => {
  assert.equal(rule(withBridge, 'font-heading'), undefined)
})

test('what Tailwind emits to :root is the kit\'s own value, never a second one', () => {
  const emitted = withBridge.match(/:root, :host \{([^}]*)\}/)?.[1] ?? ''
  const pairs = [...emitted.matchAll(/(--radius-sm|--font-sans):\s*([^;]+);/g)]
  assert.ok(pairs.length >= 2, 'the bridge emitted neither the inner radius nor the sans stack')
  for (const [, name, value] of pairs) {
    const declared = [...kitSheets.matchAll(new RegExp(`${name}:\\s*([^;]+);`, 'g'))].map((m) => m[1].replace(/\s+/g, ' ').trim())
    assert.ok(declared.length, `${name} is not declared where the kit keeps it`)
    for (const own of declared) assert.equal(value.replace(/\s+/g, ' ').trim(), own, `${name} emitted as a second value`)
  }
})

test('every name the kit and Tailwind both declare is restated, or one of them breaks the other', () => {
  /* Tailwind's own theme: a name declared on both sides takes whichever layer sorts last. */
  const tailwind = new Set(
    [...strip(readFileSync(`${ROOT}/node_modules/tailwindcss/theme.css`, 'utf8')).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
  )
  const bridged = new Set([...strip(readFileSync(BRIDGE, 'utf8')).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]))
  const kit = new Set([...kitSheets.matchAll(/(?<=[;{\s])(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]))
  const unbridged = [...kit].filter((name) => tailwind.has(name) && !bridged.has(name)).sort()
  assert.deepEqual(unbridged, [])
})
