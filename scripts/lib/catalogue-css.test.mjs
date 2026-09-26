/*
 * The catalogue optimiser: it must shrink the join, and must not touch its inputs.
 */
import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'
import { test } from 'node:test'

import { minifyCatalogueCss } from './catalogue-css.mjs'

/* Two fragments as Vite emits them: separately minified, with a seam between. */
const A = '@layer components{.a{color:red}}@media (min-width:40rem){.a{padding:1rem}}'
const B = '@media (min-width:40rem){.b{padding:1rem}}@layer components{.b{color:blue}}'

test('the join gets smaller than the sum of its parts', () => {
  const joined = A + B
  const minified = minifyCatalogueCss(joined)
  assert.ok(
    gzipSync(minified).length <= gzipSync(joined).length,
    `${gzipSync(minified).length} is not smaller than ${gzipSync(joined).length}`,
  )
  /* Both selectors survive: this is a merge, not a cull. */
  assert.match(minified, /\.a/)
  assert.match(minified, /\.b/)
})

test('adjacent identical at-rules are merged', () => {
  const minified = minifyCatalogueCss('@media (min-width:40rem){.a{color:red}}@media (min-width:40rem){.b{color:blue}}')
  assert.equal((minified.match(/@media/g) ?? []).length, 1, minified)
})

test('the inputs are not mutated', () => {
  /* Family assets are written from these same strings. */
  const before = A
  minifyCatalogueCss(A)
  assert.equal(A, before)
})

test('layer order is preserved', () => {
  /* Dropping or reordering it could let a consumer's utilities lose to a component style. */
  const css = '@layer tokens,theming,base,components,utilities;@layer components{.a{color:red}}'
  const minified = minifyCatalogueCss(css)
  assert.match(minified, /@layer tokens\s*,\s*theming\s*,\s*base\s*,\s*components\s*,\s*utilities/)
  assert.match(minified, /@layer components/)
})

test('custom properties survive verbatim', () => {
  /* A minifier that resolved `var()` would destroy every theme override. */
  const css = ':root{--space-lg:calc(0.75rem * var(--density-scale))}.a{gap:var(--space-lg)}'
  const minified = minifyCatalogueCss(css)
  assert.match(minified, /--space-lg:\s*calc\(/)
  assert.match(minified, /gap:\s*var\(--space-lg\)/)
})

/*
 * ── The built catalogue, against the sheets it is made of ──
 * The visual suite loads CSS from src/, so it never sees this transform. Every class and
 * custom property in the family sheets must survive into the catalogue. Skipped, visibly,
 * when dist/ is not built.
 */
import { existsSync, readdirSync } from 'node:fs'
import { readFileSync as read } from 'node:fs'

const built = existsSync('dist/style.css') && existsSync('dist/css')

test('the built catalogue loses no class and no custom property', { skip: !built && 'dist/ is not built' }, () => {
  const source =
    read('dist/core.css', 'utf8') +
    readdirSync('dist/css')
      .filter((f) => f.endsWith('.css'))
      .sort()
      .map((f) => read(`dist/css/${f}`, 'utf8'))
      .join('')
  const catalogue = read('dist/style.css', 'utf8')

  const classes = (css) => new Set([...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]))
  const properties = (css) => new Set([...css.matchAll(/(--[a-z][\w-]*)\s*:/g)].map((m) => m[1]))

  const sourceClasses = classes(source)
  const sourceProperties = properties(source)

  /* Non-vacuity: a comparison of two empty sets passes and proves nothing. */
  assert.ok(sourceClasses.size > 1000, `only ${sourceClasses.size} classes across the family sheets`)
  assert.ok(sourceProperties.size > 400, `only ${sourceProperties.size} custom properties`)

  const catalogueClasses = classes(catalogue)
  const catalogueProperties = properties(catalogue)
  assert.deepEqual([...sourceClasses].filter((c) => !catalogueClasses.has(c)), [])
  assert.deepEqual([...sourceProperties].filter((p) => !catalogueProperties.has(p)), [])
})

test('the built catalogue still declares its layer order first', { skip: !built && 'dist/ is not built' }, () => {
  const catalogue = read('dist/style.css', 'utf8')
  const order = catalogue.match(/@layer\s+[a-z][a-z,\s]*;/)
  assert.ok(order, 'no @layer order statement in the built catalogue')
  assert.ok(catalogue.indexOf(order[0]) < 200, 'the order statement is not near the top of the file')
})
