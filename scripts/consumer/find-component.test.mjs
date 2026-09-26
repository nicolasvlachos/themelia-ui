/* The shipped consumer finder, held to the generated index it ships beside. */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { findComponents, loadIndex, renderMatch } from './find-component.mjs'

const families = loadIndex()

test('the packaged index is present and populated', () => {
  /* Non-vacuity: every test below would pass over an empty index by finding nothing. */
  assert.ok(families.length > 50, `only ${families.length} families in the packaged index`)
})

test('an exact symbol wins over a family whose prose mentions it', () => {
  const [first] = findComponents(families, 'MetadataList')
  assert.equal(first.family, 'base/display')
  assert.equal(first.publicImport, 'themelia-ui/base/display')
  assert.equal(first.cssImport, 'themelia-ui/base/display.css')
})

test('a plain-language question finds the family by its guidance', () => {
  /* The guidance says "label/value facts": matching is by term, not whole phrase. */
  const [first] = findComponents(families, 'key value facts')
  assert.equal(first.family, 'base/display')
})

test('formatting intent ranks formatted primitives, not a substring in informational', () => {
  const [first] = findComponents(families, 'format currency')
  assert.equal(first.family, 'primitives')
})

test('negative guidance never ranks a family as a recommendation', () => {
  const [first] = findComponents(families, 'editable text input')
  assert.equal(first.family, 'base/text-inputs')
  assert.notEqual(first.family, 'primitives')
})

test('live preview recipe titles are searchable', () => {
  const [first] = findComponents(families, 'Which megabyte')
  assert.equal(first.family, 'primitives')
})

test('a complete component-name phrase beats a shared preview route', () => {
  const [first] = findComponents(families, 'rich text editor')
  assert.equal(first.family, 'features/rich-text-editor')
})

test('a nonexistent term matches nothing', () => {
  assert.deepEqual(findComponents(families, 'zzzz nonexistent thing'), [])
})

test('one common word does not drag in every family', () => {
  /* `a`, `the`, `is` are dropped; a single short term must not match half the catalogue. */
  assert.ok(findComponents(families, 'the a is').length === 0)
})

test('layer and profile narrow the result', () => {
  const all = findComponents(families, 'table')
  const featuresOnly = findComponents(families, 'table', { layer: 'features' })
  assert.ok(all.length >= featuresOnly.length)
  assert.ok(featuresOnly.every((f) => f.layer === 'features'))
  assert.ok(featuresOnly.length > 0, 'no features family matches "table"')
})

test('a layer filter can list a catalogue without a text query', () => {
  const primitives = findComponents(families, '', { layer: 'primitives' })
  const base = findComponents(families, '', { layer: 'base' })
  assert.deepEqual(primitives.map((family) => family.family), ['primitives'])
  assert.ok(base.length > 40, `only ${base.length} base families`)
  assert.ok(base.every((family) => family.layer === 'base'))
})

test('family, optional-peer, and preview-route filters use exact metadata', () => {
  assert.deepEqual(
    findComponents(families, '', { family: 'base/buttons' }).map((family) => family.family),
    ['base/buttons'],
  )
  const withTable = findComponents(families, '', { peer: '@tanstack/react-table' })
  assert.ok(withTable.length > 0, 'no families found for @tanstack/react-table')
  assert.ok(withTable.every((family) => family.optionalPeers.includes('@tanstack/react-table')))
  assert.deepEqual(
    findComponents(families, '', { route: '/primitive-money' }).map((family) => family.family),
    ['primitives'],
  )
})

test('--symbol matches only families exporting that name', () => {
  const found = findComponents(families, '', { symbol: 'MetadataList' })
  assert.equal(found.length, 1)
  assert.equal(found[0].family, 'base/display')
})

test('a rendered match names the exact import a consumer must write', () => {
  const [first] = findComponents(families, 'MetadataList')
  const rendered = renderMatch(first)
  assert.match(rendered, /themelia-ui\/base\/display\b/)
  assert.match(rendered, /themelia-ui\/base\/display\.css/)
  assert.match(rendered, /docs\/generated\/components\/base--display\.md/)
  /* Never a source path: a consumer cannot import from `src/`. */
  assert.doesNotMatch(rendered, /(^|\s)src\//)
})

test('no index record points a consumer at an unpublished path', () => {
  for (const family of families) {
    assert.match(family.publicImport, /^themelia-ui(\/|$)/, family.family)
    assert.doesNotMatch(family.publicImport, /^themelia-ui\/(base|features|patterns|layout|admin)$/,
      `${family.family} points at a broad barrel that is not published`)
  }
})

test('the CLI documents filters and accepts filtered catalogue listing', () => {
  const script = fileURLToPath(new URL('./find-component.mjs', import.meta.url))
  const help = execFileSync(process.execPath, [script, '--help'], { encoding: 'utf8' })
  assert.match(help, /--family/)
  assert.match(help, /--peer/)
  assert.match(help, /--route/)

  const listing = execFileSync(process.execPath, [script, '--layer=primitives', '--limit=1'], {
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

for (const [query, family, symbol] of [
  ['read only metadata', 'base/display', 'MetadataList'],
  ['scrollable tabs with edge fade', 'base/navigation', 'TabList'],
  ['mobile filters for a table', 'features/data-view', 'DataView'],
  ['compact comments with replies', 'features/comments', 'Comments'],
  ['live theme editor from every page', 'features/theme-tweaker', 'ThemeTweaker'],
]) {
  test(`task discovery: ${query}`, () => {
    const [first] = findComponents(families, query, { explain: true })
    assert.equal(first.family, family)
    assert.equal(first.match.components[0].symbol, symbol)
    assert.equal(first.match.components[0].guidanceSource, 'component')
    assert.match(first.match.components[0].apiDoc, new RegExp(`#${symbol.toLowerCase()}$`))
  })
}

test('family fallback is explicit and every component points at a real public export', () => {
  for (const family of families) {
    assert.equal(family.componentGuidance.length, family.components.length)
    for (const entry of family.componentGuidance) {
      assert.ok(family.publicSymbols.includes(entry.symbol))
      assert.equal(entry.publicImport, family.publicImport)
      assert.equal(entry.cssImport, family.cssImport)
      assert.ok(['component', 'family'].includes(entry.guidanceSource))
    }
  }
})

test('explanations are optional and do not mutate the shared catalogue', () => {
  const normal = findComponents(families, 'MetadataList')
  const explained = findComponents(families, 'MetadataList', { explain: true })
  assert.equal(normal[0].match, undefined)
  assert.equal(explained[0].match.components[0].symbol, 'MetadataList')
  assert.match(renderMatch(explained[0]), /MetadataList —/)
  assert.equal(families.find((entry) => entry.family === 'base/display').match, undefined)
})

test('access recipes do not inherit timeline or onboarding examples from their shared page', () => {
  const family = families.find((entry) => entry.family === 'admin/patterns/access')
  assert.ok(family.recipes.length >= 3)
  assert.ok(family.recipes.every((recipe) => !/changelog|milestone|step|onboarding/i.test(recipe.title)))
})
