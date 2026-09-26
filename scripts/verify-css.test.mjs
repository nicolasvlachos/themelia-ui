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
const BUTTON = 'src/components/base/buttons/button.module.css'
const MAP = 'src/components/features/map/map.module.css'
const GLOBAL_MAP = 'src/styles/map.css'
const MEDIA = 'src/components/features/media-library/media-library-parts.tsx'
const PROBE = 'src/components/base/probe/probe.tsx'

/* A literal arrow radius allowed through the exceptions file, and the same arrow fixed, which stales it. */
const ARROW = '.tooltipArrow {\n\tborder-radius: 2px;\n}\n'
const ARROW_FIXED = '.tooltipArrow {\n\tborder-radius: calc(var(--radius-sm) / 4);\n}\n'
const ALLOWLIST = 'scripts/spacing-exceptions.json'
const ALLOW_ARROW = JSON.stringify({ findings: [`literal-radius|${MAP}|.tooltipArrow|border-radius|2px`] })
/* The dark block every twin answers, in a theming sheet; `twin` is the media block's selector list. */
const THEMING = 'src/styles/theming/probe.css'
const darkPair = (twin) =>
  `.dark,\n[data-theme="dark"],\n:is(.dark, [data-theme="dark"]) :is([data-ui-scope], [data-density]):not(.light, [data-theme="light"]) {\n\t--probe-fg: red;\n}\n\n@media (prefers-color-scheme: dark) {\n\t${twin} {\n\t\t--probe-fg: red;\n\t}\n}\n`
/* A Text given a module class, and the class's rule; `props` go on the Text. */
const TEXT_PROBE = 'src/components/base/probe/probe.tsx'
const TEXT_MODULE = 'src/components/base/probe/probe.module.css'
const textProbe = (props, rule) => ({
  [TEXT_PROBE]: `import styles from "./probe.module.css"\n\nexport const Probe = () => <Text ${props} className={styles.caption}>x</Text>\n`,
  [TEXT_MODULE]: `.caption {\n\t${rule}\n}\n`,
})
/* A height token that already carries the density factor. */
const BUTTON_H = '[data-ui-scope] {\n\t--button-h: round(calc(2rem * var(--density-scale)), 1px);\n}\n'
const PROBE_INDEX = 'export { Probe, ProbePortal } from "./probe"\n'
const probe = (hook) =>
  `import { cx } from "@/lib/cx"\n\nconst ProbePortal = Primitive.Portal\n\nfunction Probe({ className }) {\n\treturn <div className={cx(${hook}className)} />\n}\n\nexport { Probe, ProbePortal }\n`

/* [name, groups, fixture files, expected [rule, file, ...words] (or a list of them), absent [rule, file, ...words]] */
const CASES = [
  /* composition */
  ['a literal hairline instead of the border-width token', ['composition'], { [BADGE]: '.root {\n\tbox-shadow: 0 0 0 1px var(--border);\n}\n' }, ['literal-hairline', BADGE, '0 0 0 1px']],
  ['a hex colour inside a value, not at its start', ['composition'], { [BADGE]: '.root {\n\tborder: var(--border-width) solid #fff;\n}\n' }, ['literal-colour', BADGE, `literal-colour|${BADGE}`]],
  ['an empty rule left behind', ['composition'], { [BADGE]: '.probeEmpty {\n\t/* nothing */\n}\n' }, ['empty-rule', BADGE, '.probeEmpty', 'empty rule']],
  ['text painted in a third grey', ['composition'], { [BADGE]: '.probeCaption { color: var(--muted-foreground-40); }\n' }, ['text-grey', BADGE, '--muted-foreground-40']],
  ['global integration styles cannot bypass the radius pair', ['composition'], { [GLOBAL_MAP]: '.map--component .leaflet-popup-content-wrapper {\n\tborder-radius: var(--radius-md);\n}\n' }, ['radius-pair', GLOBAL_MAP, '--radius-md']],
  ['inline presentation cannot bypass the shared role', ['composition'], { [MEDIA]: 'const name = <Text style={{ fontSize: "13px" }} tag="span">{name}</Text>\n' }, ['inline-presentation', MEDIA]],
  ['an unrelated literal is rejected', ['composition'], { [BADGE]: '.root {\n\tborder-radius: 3px;\n}\n' }, ['literal-radius', BADGE, 'border-radius|3px']],
  ['an icon sized in JavaScript is rejected', ['composition'], { 'src/components/base/spinner/spinner.tsx': 'const icon = <svg size={23} />\n' }, ['literal-icon-size', 'src/components/base/spinner/spinner.tsx', 'size={23}']],
  ['an allowed literal passes by its exact identity', ['composition'], { [MAP]: ARROW, [ALLOWLIST]: ALLOW_ARROW }, null, ['literal-radius', MAP]],
  ['a stale exception is rejected', ['composition'], { [MAP]: ARROW_FIXED, [ALLOWLIST]: ALLOW_ARROW }, ['stale-exception', MAP, '.tooltipArrow', 'no longer matches anything']],
  ['swapping one literal for another is rejected, though the total is unchanged', ['composition'], { [MAP]: ARROW_FIXED, [BADGE]: '.root {\n\tborder-radius: 3px;\n}\n', [ALLOWLIST]: ALLOW_ARROW }, [['literal-radius', BADGE, '3px'], ['stale-exception', MAP, '.tooltipArrow']]],
  ['an arrow tip derived from the item radius needs no exception', ['composition'], { [MAP]: ARROW_FIXED }, null, ['literal-radius', MAP]],
  ['a module class colours a Text', ['composition'], textProbe('type="secondary"', 'color: var(--muted-foreground);'), ['text-class-type', TEXT_PROBE, 'styles.caption', 'color', TEXT_MODULE]],
  ['a Text that inherits its colour may take one from its class', ['composition'], textProbe('type="inherit"', 'color: var(--muted-foreground);'), null, ['text-class-type', TEXT_PROBE]],
  ['a module class sets a Text weight, whatever its props', ['composition'], textProbe('type="inherit" size="inherit"', 'font-weight: var(--weight-medium);'), ['text-class-type', TEXT_PROBE, 'font-weight']],
  ['a Text that inherits its size may take one from its class', ['composition'], textProbe('size="inherit"', 'font-size: var(--text-xs);\n\tline-height: var(--text-xs--line-height);'), null, ['text-class-type', TEXT_PROBE]],
  ['a lineHeight prop takes the leading back from the class', ['composition'], textProbe('size="inherit" lineHeight="tight"', 'line-height: var(--text-xs--line-height);'), ['text-class-type', TEXT_PROBE, 'line-height']],
  ['a class whose rule styles only a descendant of it passes', ['composition'], textProbe('type="secondary"', 'gap: var(--space-xs);\n}\n\n.caption svg {\n\tcolor: var(--primary);'), null, ['text-class-type', TEXT_PROBE]],

  /* factors */
  ['a factor-carrying token multiplied by a factor squares it', ['factors'], { [BUTTON]: `${BUTTON_H}.root {\n\theight: calc(var(--button-h) * var(--scale));\n}\n` }, ['squared-factor', BUTTON, 'height', '--button-h', 'squared']],
  ['separately scaled additive terms pass', ['factors'], { [BUTTON]: `${BUTTON_H}.root {\n\theight: calc(var(--button-h) + 2px * var(--scale));\n}\n` }, null, ['squared-factor', BUTTON]],

  /* wiring, scoping */
  ['wiring rejects an undefined variable in ordinary global CSS', ['wiring'], { [GLOBAL_MAP]: '.map { font-size: var(--missing-token); }\n' }, ['undefined-var', GLOBAL_MAP, '--missing-token']],
  ['scoping checks derived tokens declared by component modules', ['scoping'], { 'src/components/example.module.css': ':root { --example-derived: var(--scale); }\n' }, ['bare-root-derived', 'src/components/example.module.css', '--example-derived']],

  /* dark-overrides: the OS twin honours .light and a boundary inside an explicit light scope */
  ['a media twin that ignores the .light class is rejected', ['dark-overrides'], { [THEMING]: darkPair(':root:not([data-theme="light"]),\n\t[data-ui-scope]:not([data-theme="light"]),\n\t[data-density]:not([data-theme="light"])') }, ['twin-selector', THEMING, ':root:not(.light, [data-theme="light"])']],
  ['a media twin that honours an explicit light scope passes', ['dark-overrides'], { [THEMING]: darkPair(':root:not(.light, [data-theme="light"]),\n\t[data-ui-scope]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *),\n\t[data-density]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *)') }, null, ['twin-selector', THEMING]],

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
