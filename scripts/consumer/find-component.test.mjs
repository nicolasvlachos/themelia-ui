/* The shipped consumer finder, held to the generated index it ships beside. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { findComponents, loadIndex, renderMatch } from './find-component.mjs'

const modules = loadIndex()

test('the packaged index is present and populated', () => {
  /* Non-vacuity: every test below would pass over an empty index by finding nothing. */
  assert.ok(modules.length > 50, `only ${modules.length} modules in the packaged index`)
})

test('an exact symbol wins over a module whose prose mentions it', () => {
  const [first] = findComponents(modules, 'MetadataList')
  assert.equal(first.module, 'base/display')
  assert.equal(first.publicImport, 'themelia-ui/base/display')
  assert.equal(first.cssImport, 'themelia-ui/base/display.css')
})

test('a plain-language question finds the module by its guidance', () => {
  /* The guidance says "label/value facts": matching is by term, not whole phrase. */
  const [first] = findComponents(modules, 'key value facts')
  assert.equal(first.module, 'base/display')
})

test('formatting intent ranks formatted primitives, not a substring in informational', () => {
  const [first] = findComponents(modules, 'format currency')
  assert.equal(first.module, 'primitives')
})

test('negative guidance never ranks a module as a recommendation', () => {
  const [first] = findComponents(modules, 'editable text input')
  assert.equal(first.module, 'base/text-inputs')
  assert.notEqual(first.module, 'primitives')
})

test('live preview recipe titles are searchable', () => {
  const [first] = findComponents(modules, 'Which megabyte')
  assert.equal(first.module, 'primitives')
})

test('a complete component-name phrase beats a shared preview route', () => {
  const [first] = findComponents(modules, 'rich text editor')
  assert.equal(first.module, 'features/rich-text-editor')
})

test('a nonexistent term matches nothing', () => {
  assert.deepEqual(findComponents(modules, 'zzzz nonexistent thing'), [])
})

test('one common word does not drag in every module', () => {
  /* `a`, `the`, `is` are dropped; a single short term must not match half the catalogue. */
  assert.ok(findComponents(modules, 'the a is').length === 0)
})

test('tier and profile narrow the result', () => {
  const all = findComponents(modules, 'table')
  const featuresOnly = findComponents(modules, 'table', { tier: 'features' })
  assert.ok(all.length >= featuresOnly.length)
  assert.ok(featuresOnly.every((f) => f.tier === 'features'))
  assert.ok(featuresOnly.length > 0, 'no features module matches "table"')
})

test('a tier filter can list a catalogue without a text query', () => {
  const primitives = findComponents(modules, '', { tier: 'primitives' })
  const base = findComponents(modules, '', { tier: 'base' })
  assert.deepEqual(primitives.map((record) => record.module), ['primitives'])
  assert.ok(base.length > 40, `only ${base.length} base modules`)
  assert.ok(base.every((record) => record.tier === 'base'))
})

test('module, optional-peer, and preview-route filters use exact metadata', () => {
  assert.deepEqual(
    findComponents(modules, '', { module: 'base/buttons' }).map((record) => record.module),
    ['base/buttons'],
  )
  const withTable = findComponents(modules, '', { peer: '@tanstack/react-table' })
  assert.ok(withTable.length > 0, 'no modules found for @tanstack/react-table')
  assert.ok(withTable.every((record) => record.optionalPeers.includes('@tanstack/react-table')))
  assert.deepEqual(
    findComponents(modules, '', { route: '/primitive-money' }).map((record) => record.module),
    ['primitives'],
  )
})

test('--symbol matches only modules exporting that name', () => {
  const found = findComponents(modules, '', { symbol: 'MetadataList' })
  assert.equal(found.length, 1)
  assert.equal(found[0].module, 'base/display')
})

test('a rendered match names the exact import a consumer must write', () => {
  const [first] = findComponents(modules, 'MetadataList')
  const rendered = renderMatch(first)
  assert.match(rendered, /themelia-ui\/base\/display\b/)
  assert.match(rendered, /themelia-ui\/base\/display\.css/)
  assert.match(rendered, /docs\/generated\/components\/base--display\.md/)
  /* Never a source path: a consumer cannot import from `src/`. */
  assert.doesNotMatch(rendered, /(^|\s)src\//)
})

test('no index record points a consumer at an unpublished path', () => {
  for (const record of modules) {
    assert.match(record.publicImport, /^themelia-ui(\/|$)/, record.module)
    assert.doesNotMatch(record.publicImport, /^themelia-ui\/(base|features|blocks|layout)$/,
      `${record.module} points at a broad barrel that is not published`)
  }
})

test('the CLI documents filters and accepts filtered catalogue listing', () => {
  const script = fileURLToPath(new URL('./find-component.mjs', import.meta.url))
  const help = execFileSync(process.execPath, [script, '--help'], { encoding: 'utf8' })
  assert.match(help, /--module/)
  assert.match(help, /--peer/)
  assert.match(help, /--route/)

  const listing = execFileSync(process.execPath, [script, '--tier=primitives', '--limit=1'], {
    encoding: 'utf8',
  })
  assert.match(listing, /^primitives\s/m)
})

test('the CLI rejects unknown flags and invalid limits', () => {
  const script = fileURLToPath(new URL('./find-component.mjs', import.meta.url))
  assert.throws(
    () => execFileSync(process.execPath, [script, 'button', '--unknown=yes'], { encoding: 'utf8' }),
    /Command failed/,
  )
  assert.throws(
    () => execFileSync(process.execPath, [script, 'button', '--limit=zero'], { encoding: 'utf8' }),
    /Command failed/,
  )
})

for (const [query, module, symbol] of [
  ['read only metadata', 'base/display', 'MetadataList'],
  ['scrollable tabs with edge fade', 'base/navigation', 'TabList'],
  ['mobile filters for a table', 'features/data-view', 'DataView'],
  ['compact comments with replies', 'features/comments', 'Comments'],
  ['live theme editor from every page', 'features/theme-tweaker', 'ThemeTweaker'],
]) {
  test(`task discovery: ${query}`, () => {
    const [first] = findComponents(modules, query, { explain: true })
    assert.equal(first.module, module)
    assert.equal(first.match.components[0].symbol, symbol)
    assert.equal(first.match.components[0].guidanceSource, 'component')
    assert.match(first.match.components[0].apiDoc, new RegExp(`#${symbol.toLowerCase()}$`))
  })
}

test('module fallback is explicit and every component points at a real public export', () => {
  for (const record of modules) {
    assert.equal(record.componentGuidance.length, record.components.length)
    for (const entry of record.componentGuidance) {
      assert.ok(record.publicSymbols.includes(entry.symbol))
      assert.equal(entry.publicImport, record.publicImport)
      assert.equal(entry.cssImport, record.cssImport)
      assert.ok(['component', 'module'].includes(entry.guidanceSource))
    }
  }
})

test('explanations are optional and do not mutate the shared catalogue', () => {
  const normal = findComponents(modules, 'MetadataList')
  const explained = findComponents(modules, 'MetadataList', { explain: true })
  assert.equal(normal[0].match, undefined)
  assert.equal(explained[0].match.components[0].symbol, 'MetadataList')
  assert.match(renderMatch(explained[0]), /MetadataList —/)
  assert.equal(modules.find((entry) => entry.module === 'base/display').match, undefined)
})

test('access recipes do not inherit timeline or onboarding examples from their shared page', () => {
  const record = modules.find((entry) => entry.module === 'blocks/admin/access')
  assert.ok(record.recipes.length >= 3)
  assert.ok(record.recipes.every((recipe) => !/changelog|milestone|step|onboarding/i.test(recipe.title)))
})
