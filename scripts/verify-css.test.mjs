/*
 * Proves verify-css fails on the defects it names. Each case builds a fixture tree in a temp
 * dir and runs the groups through `check()`, so no tracked file is edited. A case asserts the
 * finding itself (rule, file and the words that identify it), not only that a group failed.
 */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'

import { check } from './verify-css.mjs'

const BADGE = 'src/components/base/badge/badge.module.css'
const GLOBAL_MAP = 'src/styles/map.css'
const MEDIA = 'src/components/features/media-library/media-library-parts.tsx'
const PROBE = 'src/components/base/probe/probe.tsx'

/* A Text given a module class, and the class's rule; `props` go on the Text. */
const TEXT_PROBE = 'src/components/base/probe/probe.tsx'
const TEXT_MODULE = 'src/components/base/probe/probe.module.css'
const textProbe = (props, rule) => ({
  [TEXT_PROBE]: `import styles from "./probe.module.css"\n\nexport const Probe = () => <Text ${props} className={styles.caption}>x</Text>\n`,
  [TEXT_MODULE]: `.caption {\n\t${rule}\n}\n`,
})
const PROBE_INDEX = 'export { Probe, ProbePortal } from "./probe"\n'
const probe = (hook) =>
  `import { cx } from "@/lib/cx"\n\nconst ProbePortal = Primitive.Portal\n\nfunction Probe({ className }) {\n\treturn <div className={cx(${hook}className)} />\n}\n\nexport { Probe, ProbePortal }\n`

/* [name, groups, fixture files, expected [rule, file, ...words] (or a list of them), absent [rule, file, ...words]] */
const CASES = [
  /* composition */
  ['an empty rule left behind', ['composition'], { [BADGE]: '.probeEmpty {\n\t/* nothing */\n}\n' }, ['empty-rule', BADGE, '.probeEmpty', 'empty rule']],
  ['text painted in a third grey', ['composition'], { [BADGE]: '.probeCaption { color: var(--muted-foreground-40); }\n' }, ['text-grey', BADGE, '--muted-foreground-40']],
  ['inline presentation cannot bypass the shared role', ['composition'], { [MEDIA]: 'const name = <Text style={{ fontSize: "13px" }} tag="span">{name}</Text>\n' }, ['inline-presentation', MEDIA]],
  ['an icon sized in JavaScript is rejected', ['composition'], { 'src/components/base/spinner/spinner.tsx': 'const icon = <svg size={23} />\n' }, ['literal-icon-size', 'src/components/base/spinner/spinner.tsx', 'size={23}']],
  ['a module class colours a Text', ['composition'], textProbe('type="secondary"', 'color: var(--muted-foreground);'), ['text-class-type', TEXT_PROBE, 'styles.caption', 'color', TEXT_MODULE]],
  ['a Text that inherits its colour may take one from its class', ['composition'], textProbe('type="inherit"', 'color: var(--muted-foreground);'), null, ['text-class-type', TEXT_PROBE]],
  ['a module class sets a Text weight, whatever its props', ['composition'], textProbe('type="inherit" size="inherit"', 'font-weight: var(--weight-medium);'), ['text-class-type', TEXT_PROBE, 'font-weight']],
  ['a Text that inherits its size may take one from its class', ['composition'], textProbe('size="inherit"', 'font-size: var(--text-xs);\n\tline-height: var(--text-xs--line-height);'), null, ['text-class-type', TEXT_PROBE]],
  ['a lineHeight prop takes the leading back from the class', ['composition'], textProbe('size="inherit" lineHeight="tight"', 'line-height: var(--text-xs--line-height);'), ['text-class-type', TEXT_PROBE, 'line-height']],
  ['a class whose rule styles only a descendant of it passes', ['composition'], textProbe('type="secondary"', 'gap: var(--space-xs);\n}\n\n.caption svg {\n\tcolor: var(--primary);'), null, ['text-class-type', TEXT_PROBE]],

  /* the colour scheme is a value, never a selector */
  ['a module rule keyed on the colour scheme is rejected', ['composition'], { [BADGE]: ':global(.dark) .root {\n\tcolor: var(--foreground);\n}\n' }, ['theme-selector', BADGE, 'keys on the colour scheme']],
  ['a value that switches through light-dark() passes', ['composition'], { [BADGE]: '.root {\n\tcolor: light-dark(var(--foreground), var(--muted-foreground));\n}\n' }, null, ['theme-selector', BADGE]],

  /* wiring */
  ['wiring rejects an undefined variable in ordinary global CSS', ['wiring'], { [GLOBAL_MAP]: '.map { font-size: var(--missing-token); }\n' }, ['undefined-var', GLOBAL_MAP, '--missing-token']],

  /* bem: `function X` exported by a later `export { X }` is judged; a `const` alias has no body */
  ['bem judges a component exported by a later export list', ['bem'], { 'src/components/base/probe/index.ts': PROBE_INDEX, [PROBE]: probe('"probe-root", ') }, ['missing-hook', PROBE, 'Probe renders a className but no `probe--component`'], ['missing-hook', PROBE, 'ProbePortal']],
  ['bem passes the same component with its hook', ['bem'], { 'src/components/base/probe/index.ts': PROBE_INDEX, [PROBE]: probe('"probe--component", ') }, null, ['missing-hook', PROBE]],
]

for (const [name, groups, files, expected, absent] of CASES) {
  test(name, (t) => {
    const root = mkdtempSync(join(tmpdir(), 'themelia-ui-verify-css-'))
    t.after(() => rmSync(root, { recursive: true, force: true }))
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), text)
    }
    const { findings } = check(groups, { root })
    const shown = JSON.stringify(findings, null, 2)
    const has = ([rule, file, ...words]) => findings.some((f) => f.rule === rule && f.file === file && words.every((word) => f.message.includes(word)))
    for (const finding of !expected ? [] : Array.isArray(expected[0]) ? expected : [expected]) {
      assert.ok(has(finding), `expected ${finding.join(' | ')}; got ${shown}`)
    }
    if (absent) assert.ok(!has(absent), `expected no ${absent.join(' | ')}; got ${shown}`)
  })
}
