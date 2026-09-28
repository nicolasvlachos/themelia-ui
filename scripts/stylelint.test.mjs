/*
 * Proves the stylelint config fails on the defects it names: each case lints a fragment as if
 * it were a file at the given path, and asserts the rule that reports it (or that none does).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import stylelint from 'stylelint'

import config from '../stylelint.config.mjs'

const MODULE = 'src/components/base/badge/badge.module.css'

async function rulesFor(code, file) {
  const { results } = await stylelint.lint({ code, codeFilename: file, config, configBasedir: process.cwd() })
  return results.flatMap((result) => result.warnings.map((warning) => warning.rule))
}

const CASES = [
  ['a hex colour in a module', MODULE, '.root { border-color: #fff; }', 'color-no-hex'],
  ['a colour function in a module', MODULE, '.root { color: oklch(0.5 0 0); }', 'function-disallowed-list'],
  ['!important in a module', MODULE, '.root { color: var(--foreground) !important; }', 'declaration-no-important'],
  ['a literal padding', MODULE, '.root { padding: 12px var(--padding); }', 'declaration-property-value-disallowed-list'],
  ['a literal hairline', MODULE, '.root { border: 1px solid var(--border); }', 'declaration-property-value-disallowed-list'],
  ['a radius outside the pair', MODULE, '.root { border-radius: var(--radius-md); }', 'declaration-property-value-allowed-list'],
  ['a literal radius', MODULE, '.root { border-radius: 6px; }', 'declaration-property-value-allowed-list'],
  ['a type property in a module', MODULE, '.root { font-size: var(--text-sm); }', 'property-disallowed-list'],
]

for (const [name, file, code, rule] of CASES) {
  test(`${name} is rejected by ${rule}`, async () => {
    assert.ok((await rulesFor(code, file)).includes(rule), `${rule} did not report: ${code}`)
  })
}

const PASSES = [
  ['theme variables and arithmetic on them', MODULE, '.root { padding: var(--padding-sm) calc(var(--padding) * 2); border: var(--border-width) solid var(--border); border-radius: calc(var(--radius) - var(--padding-sm)); color: color-mix(in oklab, var(--primary) var(--tint), transparent); }'],
  ['a colour literal in the theme', 'src/styles/theme/colour.css', ':root { --primary: light-dark(oklch(0.45 0.12 167), oklch(0.7 0.13 167)); }'],
  ['type in Text', 'src/components/base/typography/text/text.module.css', '.sizeSm { font-size: calc(var(--text-sm) * var(--text-scale)); }'],
]

for (const [name, file, code] of PASSES) {
  test(`${name} passes`, async () => {
    assert.deepEqual(await rulesFor(code, file), [])
  })
}
