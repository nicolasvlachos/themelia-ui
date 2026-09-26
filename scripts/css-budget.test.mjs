/*
 * The CSS budget must measure the consumer it names: a recipe family with no stylesheet
 * throws, and recipes only name families in the manifest.
 */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { FIXTURES, collect, loweredSyntax, resolveFixture } from './css-budget.mjs'

test('a fixture naming a family with no stylesheet throws', () => {
  assert.throws(
    () => resolveFixture({ families: ['layout/not-real'] }),
    /missing CSS entrypoint: dist\/layout\/not-real\.css/,
  )
})

test('the throw names the family, not just the failure', (t) => {
  const dist = fixtureBuild(t)
  assert.throws(
    () => resolveFixture({ families: ['base/buttons', 'features/nope', 'features/table'] }, dist),
    /features\/nope/,
  )
})

function fixtureBuild(t) {
  const dist = mkdtempSync(join(tmpdir(), 'css-budget-build-'))
  t.after(() => rmSync(dist, { recursive: true, force: true }))
  mkdirSync(join(dist, 'base'))
  mkdirSync(join(dist, 'features'))
  writeFileSync(join(dist, 'base/buttons.css'), '.button{}')
  writeFileSync(join(dist, 'features/table.css'), '.table{}')
  return dist
}

test('a recipe resolves only the supplied build without requiring repository dist', (t) => {
  const dist = fixtureBuild(t)
  const files = resolveFixture({ families: ['base/buttons', 'features/table'] }, dist)
  assert.deepEqual([...files], [join(dist, 'base/buttons.css'), join(dist, 'features/table.css')])
})

test('every family a recipe names is a real family', () => {
  /* Catches an unpublished family without needing a build. */
  const manifest = JSON.parse(readFileSync('architecture/manifest.json', 'utf8'))
  const known = new Set(manifest.families.map((family) => family.id))
  const unknown = FIXTURES.flatMap((fixture) => fixture.families ?? []).filter((id) => !known.has(id))
  assert.deepEqual(unknown, [], `recipes name families that do not exist: ${unknown.join(', ')}`)
})

test('an @import that goes nowhere is not fatal', () => {
  /* Deliberately asymmetric with a missing entrypoint, which does throw; keep them apart. */
  const dir = mkdtempSync(join(tmpdir(), 'css-budget-'))
  try {
    writeFileSync(join(dir, 'a.css'), '@import "./b.css";\n@import "./gone.css";\n.a{color:red}')
    writeFileSync(join(dir, 'b.css'), '.b{color:blue}')

    const files = collect(join(dir, 'a.css'), new Set(), true)
    assert.equal(files.size, 2, 'follows the import that resolves and ignores the one that does not')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a stylesheet reached twice is counted once', () => {
  const dir = mkdtempSync(join(tmpdir(), 'css-budget-'))
  try {
    writeFileSync(join(dir, 'a.css'), '@import "./shared.css";\n@import "./b.css";')
    writeFileSync(join(dir, 'b.css'), '@import "./shared.css";')
    writeFileSync(join(dir, 'shared.css'), '.s{color:green}')

    assert.equal(collect(join(dir, 'a.css'), new Set(), true).size, 3)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a sheet whose :dir() was lowered to :lang() is reported, a clean one is not', (t) => {
  const dist = fixtureBuild(t)
  writeFileSync(join(dist, 'features/table.css'), '.a:is(:lang(ar),:lang(he)){scale:-1 1}')
  writeFileSync(join(dist, 'base/buttons.css'), '.a:dir(rtl){scale:-1 1}')
  const found = loweredSyntax(dist)
  assert.equal(found.length, 1)
  assert.match(found[0], /features\/table\.css: :dir\(\) rewritten as a language list/)
})
