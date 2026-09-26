/*
 * The shipped consumer codemod, run against the generated maps it ships beside, so a lost
 * map or rename fails here rather than in someone's upgrade.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { declaredTokens } from '../lib/token-surface.mjs'
import { loadMaps, rewriteSource } from './codemod.mjs'

const maps = loadMaps()

test('the packaged maps are present and populated', () => {
  /* Non-vacuity: every rename below would pass over an empty map by renaming nothing. */
  assert.ok(maps.tokens.size >= 60, `only ${maps.tokens.size} token mappings`)
  assert.ok(maps.moves.size > 0 && maps.classes.size > 0)
})

test('every rename lands on a token the package declares', () => {
  const declared = new Set(declaredTokens())
  for (const [from, to] of maps.tokens) {
    assert.equal(declared.has(from), false, `${from} is still declared`)
    if (to !== null) assert.ok(declared.has(to), `${from} → ${to}, which is not declared`)
  }
})

test('a stylesheet has its reads and its overrides renamed, and the overrides reported', () => {
  const css = [
    '.card { border-radius: var(--radius-surface); padding: var(--menu-surface-p); }',
    '.theme { --radius-lg: 12px; --height-action: 2.25rem; }',
    '.small { font-size: var(--text-xxs); line-height: var(--text-xxs--line-height); }',
  ].join('\n')
  const { text, notes } = rewriteSource(css, 'app.css', maps)
  assert.match(text, /border-radius: var\(--radius\);/)
  assert.match(text, /padding: var\(--space-md\);/)
  assert.match(text, /--radius: 12px; --height-control: 2\.25rem;/)
  /* The line-height token is its own name, not `--text-xxs` with a suffix left dangling. */
  assert.match(text, /font-size: var\(--text-xs\); line-height: var\(--text-xs--line-height\);/)
  assert.ok(notes.some((note) => note.startsWith('override') && note.includes('--radius-lg')))
  assert.ok(notes.some((note) => note.startsWith('override') && note.includes('--height-action')))
})

test('a name that only starts like a removed one is left alone', () => {
  const css = '.x { width: var(--radius-lgx); height: var(--my--action); margin: var(--action-bar-h); }'
  assert.equal(rewriteSource(css, 'app.css', maps).text, css)
})

test('a removed token is reported, never guessed at', () => {
  const css = '.x { padding-block: var(--field-py); }'
  const { text, notes } = rewriteSource(css, 'app.css', maps)
  assert.equal(text, css)
  assert.ok(notes.some((note) => note.startsWith('removed-token') && note.includes('--field-py')))
})

test('a script renames style keys, var() reads and CSSOM calls — not an argv string', () => {
  const tsx = [
    'const style = { "--radius-control": "6px", width: "var(--field-h)" }',
    'element.style.setProperty("--toast-icon", "20px")',
    'run("--action")',
    'const bar = "h-(--action) [--link-fg:red]"',
  ].join('\n')
  const { text } = rewriteSource(tsx, 'app.tsx', maps)
  assert.match(text, /"--radius-sm": "6px", width: "var\(--control-h\)"/)
  assert.match(text, /setProperty\("--size-icon-lg"/)
  assert.match(text, /run\("--action"\)/)
  assert.match(text, /h-\(--control-h\) \[--link-color:red\]/)
})

test('utilities are renamed with their side and variant, and look-alikes are only reported', () => {
  const tsx = 'const c = "hover:rounded-t-surface rounded-control !text-xxs rounded-lg md:rounded-xl"'
  const { text, notes } = rewriteSource(tsx, 'app.tsx', maps)
  assert.match(text, /hover:rounded-t-\(--radius\) rounded-sm !text-xs rounded-lg md:rounded-xl/)
  assert.ok(notes.some((note) => note.startsWith('review-class') && note.includes('rounded-lg')))
  assert.ok(notes.some((note) => note.startsWith('review-class') && note.includes('rounded-xl')))
})

test('a stylesheet renames utilities only inside @apply', () => {
  const css = '.a { @apply rounded-popup text-xxs; }\n.text-xxs { color: red; }'
  const { text } = rewriteSource(css, 'app.css', maps)
  assert.match(text, /@apply rounded-\(--radius\) text-xs;/)
  assert.match(text, /\.text-xxs \{ color: red; \}/)
})

test('a component file treats its <style> block as a stylesheet', () => {
  const vue = '<template><div class="rounded-inner" /></template>\n<style>\n.a { --radius-md: 4px; }\n</style>'
  const { text } = rewriteSource(vue, 'Card.vue', maps)
  assert.match(text, /class="rounded-sm"/)
  assert.match(text, /\.a \{ --radius-sm: 4px; \}/)
})

test('imports from a removed barrel are split, and moved subpaths rewritten', () => {
  const [[from, to]] = maps.moves
  const tsx = `import { Button } from "themelia-ui/base"\nimport x from "${from}"`
  const { text } = rewriteSource(tsx, 'app.tsx', maps)
  assert.match(text, /import \{ Button \} from "themelia-ui\/base\/buttons"/)
  assert.ok(text.includes(`"${to}"`))
})

test('a moved family takes its stylesheet along, in a script and in an @import', () => {
  const tsx = 'import "themelia-ui/features/suggestions.css"\nimport { SuggestionsCombobox } from "themelia-ui/features/suggestions"'
  assert.equal(
    rewriteSource(tsx, 'app.tsx', maps).text,
    'import "themelia-ui/features/combobox.css"\nimport { SuggestionsCombobox } from "themelia-ui/features/combobox"',
  )
  const css = '@import "themelia-ui/blocks/analytics.css";'
  assert.equal(rewriteSource(css, 'app.css', maps).text, '@import "themelia-ui/patterns/analytics.css";')
})

test('run from the command line, --dry-run reports and writes nothing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'themelia-codemod-'))
  try {
    mkdirSync(join(dir, 'src'))
    const file = join(dir, 'src', 'app.css')
    const source = '.a { border-radius: var(--radius-surface); }\n'
    writeFileSync(file, source)
    const script = fileURLToPath(new URL('./codemod.mjs', import.meta.url))

    const dry = execFileSync('node', [script, '--dry-run', join(dir, 'src')], { encoding: 'utf8' })
    assert.match(dry, /would apply 1 rewrite/)
    assert.equal(readFileSync(file, 'utf8'), source)

    const real = execFileSync('node', [script, join(dir, 'src')], { encoding: 'utf8' })
    assert.match(real, /applied 1 rewrite/)
    assert.equal(readFileSync(file, 'utf8'), '.a { border-radius: var(--radius); }\n')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
