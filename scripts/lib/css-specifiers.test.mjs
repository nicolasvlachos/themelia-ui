/*
 * The shipped-stylesheet specifier rule: it names each defect once and stays quiet on the
 * forms the kit really ships.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cssSpecifierFindings } from './css-specifiers.mjs'

test('names each bare, missing, escaping and wrong-case specifier, and nothing else', () => {
  const root = mkdtempSync(join(tmpdir(), 'css-specifiers-'))
  try {
    mkdirSync(join(root, 'css')); mkdirSync(join(root, 'fonts')); mkdirSync(join(root, 'base'))
    writeFileSync(join(root, 'core.css'), ':root{}')
    writeFileSync(join(root, 'css/typography.css'), '.t{}')
    writeFileSync(join(root, 'fonts/geist.woff2'), '')
    /* the 2.0.1 shape, one line per defect, and the forms that must stay silent */
    writeFileSync(join(root, 'primitives.css'), [
      '/* @import "tailwindcss"; — documentation, not an import */',
      '@import "core.css";',
      '@import "./css/typography.css" layer(components);',
      '@import url("./missing.css");',
      '@import "../outside.css";',
      "@font-face{src:url(./Fonts/geist.woff2) format('woff2'), url(data:font/woff2;base64,AA==)}",
      '.x{background:url(#grad)}',
    ].join('\n'))
    writeFileSync(join(root, 'base/badge.css'), '@import "../core.css";\n@import "../css/typography.css";\n')
    const { findings, sheets } = cssSpecifierFindings(root)
    assert.equal(sheets, 4)
    assert.deepEqual(findings, [
      'css-bare-specifier  primitives.css @import "core.css"',
      'css-unresolved  primitives.css @import "./missing.css" (missing)',
      'css-unresolved  primitives.css @import "../outside.css" (outside the package)',
      'css-unresolved  primitives.css url() "./Fonts/geist.woff2" (wrong case)',
    ])
  } finally { rmSync(root, { recursive: true, force: true }) }
})
