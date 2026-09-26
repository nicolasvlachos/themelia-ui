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

async function build(css, candidates) {
  const compiler = await compile(css, { base: ROOT, onDependency() {} })
  return compiler.build(candidates)
}

const rule = (out, name) => (out.match(new RegExp(`\\.${name}\\s*\\{([^}]*)\\}`)) ?? [])[1]?.replace(/\s+/g, ' ').trim()

const CANDIDATES = ['rounded-sm', 'font-sans', 'leading-tight', 'text-sm', 'bg-primary', 'p-md', 'font-heading']
const withBridge = await build(`@import "tailwindcss";\n@import "${BRIDGE}";`, CANDIDATES)
const withoutBridge = await build('@import "tailwindcss";', ['rounded-sm'])

test('without the bridge Tailwind re-points a shared name — the collision it exists for', () => {
  assert.match(rule(withoutBridge, 'rounded-sm'), /var\(--radius-sm\)|0\.25rem/)
  assert.match(withoutBridge, /--radius-sm:\s*0\.25rem/)
})

test('a restated literal reads its variable at the element, so a theme can move it', () => {
  assert.equal(rule(withBridge, 'rounded-sm'), 'border-radius: var(--radius-sm);')
  assert.equal(rule(withBridge, 'font-sans'), 'font-family: var(--font-sans);')
  assert.match(rule(withBridge, 'leading-tight'), /line-height: var\(--leading-tight\)/)
})

test('a formula and a kit reference stay inline, so they resolve against the element', () => {
  assert.match(rule(withBridge, 'text-sm'), /font-size: calc\(0\.875rem \* var\(--text-scale, var\(--scale\)\)\)/)
  assert.equal(rule(withBridge, 'bg-primary'), 'background-color: var(--primary);')
  assert.equal(rule(withBridge, 'p-md'), 'padding: var(--space-md);')
  assert.equal(rule(withBridge, 'font-heading'), 'font-family: var(--font-sans);')
})

test('what Tailwind emits to :root is the kit\'s own value, never a second one', () => {
  const emitted = withBridge.match(/:root, :host \{([^}]*)\}/)?.[1] ?? ''
  /* Every sheet the kit declares tokens in, comments out, the bridge itself excluded. */
  const kit = readdirSync(`${ROOT}/src/styles`, { recursive: true })
    .filter((file) => file.endsWith('.css') && !file.endsWith('tailwind.css'))
    .map((file) => readFileSync(`${ROOT}/src/styles/${file}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''))
    .join('\n')
  const pairs = [...emitted.matchAll(/(--radius-sm|--font-sans):\s*([^;]+);/g)]
  assert.ok(pairs.length >= 2, 'the bridge emitted neither the inner radius nor the sans stack')
  for (const [, name, value] of pairs) {
    const declared = [...kit.matchAll(new RegExp(`${name}:\\s*([^;]+);`, 'g'))].map((m) => m[1].replace(/\s+/g, ' ').trim())
    assert.ok(declared.length, `${name} is not declared where the kit keeps it`)
    for (const own of declared) assert.equal(value.replace(/\s+/g, ' ').trim(), own, `${name} emitted as a second value`)
  }
})
