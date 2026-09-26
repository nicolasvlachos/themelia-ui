/*
 * Generates src/styles/tailwind.css, the Tailwind v4 theme bridge (`npm run tokens:tailwind`).
 * verify docs-freshness fails when the committed file differs from this output.
 *
 *   different name  `--color-primary: var(--primary)`, `--spacing-md: var(--space-md)`
 *   same name       `--radius-sm`, `--text-sm`, … are kit tokens AND Tailwind keys, so
 *                   `var(--radius-sm)` would reference itself; these restate the kit's value.
 *
 * `@theme inline` is load-bearing: a plain @theme resolves each key once at :root, so
 * utilities stop following `.dark` and scoped factors (styles/SCOPES.md). Same-name literals
 * go in a plain @theme so the utility still reads the variable at the element.
 *
 * Fails when a bridged token is undeclared, or a same-name token has more than one distinct
 * declared value: a :root-only restatement is only safe while identical in every scope.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { writeIfChanged } from './lib/write-if-changed.mjs'

import { theme, states } from './theme-manifest.mjs'

const OUT = 'src/styles/tailwind.css'

/* ── read every custom property the token tree declares ──────────────────────────── */

const cssFiles = (dir, acc = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) cssFiles(path, acc)
    else if (path.endsWith('.css') && !path.endsWith('.module.css')) acc.push(path)
  }
  return acc
}

/* A `--token:` quoted in a CSS comment is not a declaration. */
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '')

/** name → { values: Set<string>, files: Set<string> } over the whole token tree. */
const declared = new Map()
/* The generated bridge repeats same-name values by design; never treat the old output as an input. */
for (const file of cssFiles('src/styles').filter((file) => file !== OUT)) {
  /* Lookbehind, not a capturing prefix: consuming the `;` would hide the next declaration. */
  for (const match of stripComments(readFileSync(file, 'utf8')).matchAll(
    /(?<=[;{\s])(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+);/g,
  )) {
    const record = declared.get(match[1]) ?? { values: new Set(), files: new Set() }
    record.values.add(match[2].trim().replace(/\s+/g, ' '))
    record.files.add(file.replace('src/styles/', ''))
    declared.set(match[1], record)
  }
}

const failures = []

/**
 * The kit's declared value for a same-name token. Refuses more than one distinct value:
 * the `:root`-only emission would override the other scopes.
 */
const declaredValue = (name) => {
  const record = declared.get(name)
  if (!record) {
    failures.push(`${name} is bridged under its own name but nothing in src/styles declares it`)
    return null
  }
  if (record.values.size > 1) {
    failures.push(
      `${name} has ${record.values.size} distinct declared values (${[...record.files].join(', ')}) — ` +
        `a :root-only bridge entry would override the others:\n      ${[...record.values].join('\n      ')}`,
    )
    return null
  }
  return [...record.values][0]
}

/** A token bridged under a DIFFERENT key. Only has to exist; the value is read at use. */
const reference = (name) => {
  if (!declared.has(name)) {
    failures.push(`${name} is bridged as a reference but nothing in src/styles declares it`)
    return null
  }
  return `var(${name})`
}

/* ── which tokens go into which Tailwind namespace ───────────────────────────────── */

/*
 * Colours come from the theme manifest (the rebrand contract), not the CSS scan.
 * `--shadow-ink` is never a surface and `--border-width*` are lengths, so both are skipped.
 */
const NOT_A_COLOUR = /^--(radius|shadow|border-width)/
const COLOUR_KEY = { '--link-color': '--color-link' }

const colours = [...Object.keys(theme), ...Object.keys(states)]
  .filter((name) => !NOT_A_COLOUR.test(name))
  .map((name) => [COLOUR_KEY[name] ?? `--color-${name.slice(2)}`, name])

/*
 * `--leading-12` is omitted: it is a length, and Tailwind users read `leading-12` as
 * `calc(var(--spacing) * 12)`.
 */
const SAME_NAME = {
  radius: ['sm', 'pill'],
  shadow: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
  text: ['xs', 'pxs', 'sm', 'base', 'lg', 'xl', '2xl'],
  font: ['sans', 'serif', 'mono', 'heading'],
  leading: ['none', 'tight', 'snug', 'normal', 'relaxed'],
  tracking: ['tight', 'widest'],
  ease: ['out', 'in-out'],
  /*
   * Not `--animate-enter`/`--animate-exit`: they go `none` under prefers-reduced-motion, and a
   * :root-only entry would re-enable motion. Tailwind has no defaults by those names.
   */
  animate: ['spin', 'ping', 'pulse'],
}

/* Tailwind's `<key>--line-height` pairing matches the kit's ladder, so partners carry over. */
const textEntries = SAME_NAME.text.flatMap((step) => [`--text-${step}`, `--text-${step}--line-height`])

const sameName = [
  ...SAME_NAME.radius.map((k) => `--radius-${k}`),
  ...SAME_NAME.shadow.map((k) => `--shadow-${k}`),
  ...textEntries,
  ...SAME_NAME.font.map((k) => `--font-${k}`),
  ...SAME_NAME.leading.map((k) => `--leading-${k}`),
  ...SAME_NAME.tracking.map((k) => `--tracking-${k}`),
  ...SAME_NAME.ease.map((k) => `--ease-${k}`),
  ...SAME_NAME.animate.map((k) => `--animate-${k}`),
]

/* `--spacing-*` → `--space-*`: different names, so references that follow a scoped `--density-scale`. */
const spacing = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((step) => [
  `--spacing-${step}`,
  `--space-${step}`,
])

/* ── emit ────────────────────────────────────────────────────────────────────────── */

const section = (title, note, rows) =>
  [`\t/* ── ${title} ${'─'.repeat(Math.max(1, 74 - title.length))}`, `\t * ${note}`, '\t */', ...rows, ''].join('\n')

const pad = (rows) => {
  const width = Math.max(...rows.map(([key]) => key.length))
  return rows.map(([key, value]) => `\t${key}:${' '.repeat(width - key.length + 1)}${value};`)
}

const colourRows = colours.map(([key, token]) => [key, reference(token)]).filter(([, v]) => v)
const spacingRows = spacing.map(([key, token]) => [key, reference(token)]).filter(([, v]) => v)
const sameNameRows = sameName.map((name) => [name, declaredValue(name)]).filter(([, v]) => v)
/*
 * Formulas (containing `var(`) are inlined and read their inputs at the element. Literals
 * would be frozen into the utility, so they go in a plain `@theme` and stay re-pointable by a
 * theme or provider.
 */
const inlineRows = sameNameRows.filter(([, value]) => value.includes('var('))
const liveRows = sameNameRows.filter(([, value]) => !value.includes('var('))

if (failures.length) {
  console.log(`FAIL gen:tailwind-bridge — ${failures.length} problem(s)\n`)
  for (const line of failures) console.log(`  ${line}`)
  process.exit(1)
}

const body = [
  section(
    'colour',
    'The key is Tailwind\'s, the value reads the kit\'s. Nothing of the kit\'s is overridden,\n\t * so a consumer re-pointing a token at any scope — including .dark — is followed.',
    pad(colourRows),
  ),
  section(
    'spacing',
    "Tailwind's namespace is `--spacing-*`, the kit's ladder is `--space-*`. A different name,\n\t * so `p-md` follows a scoped `--density-scale` the way the kit's own padding does.",
    pad(spacingRows),
  ),
  section(
    'names the kit and Tailwind both use — formulas',
    'These restate the kit\'s own declared values. `--text-sm: var(--text-sm)` would\n\t * reference itself and resolve to nothing; restating makes the override a no-op and\n\t * takes Tailwind\'s default — which silently re-points every kit token the two share — out of the way.\n\t * Inlined, each formula reads its inputs at the element.',
    pad(inlineRows),
  ),
].join('\n')

const liveBody = section(
  'names the kit and Tailwind both use — literals',
  'Not inline: an inlined literal is frozen into the utility, so a theme or provider that\n\t * re-points one of these would move the kit and not `rounded-sm` or `font-sans`. Here the\n\t * utility reads the variable at the element, and the value Tailwind emits to `:root` is\n\t * the kit\'s own, so it overrides nothing.',
  pad(liveRows),
)

const file = `/*
 * themelia-ui → Tailwind CSS v4.
 *
 * GENERATED by scripts/gen-tailwind-bridge.mjs — run \`npm run tokens:tailwind\`.
 * Edit the tokens, not this file. \`verify docs-freshness\` fails if the two disagree.
 *
 * Import it AFTER Tailwind and after the kit's stylesheet:
 *
 *   @import "tailwindcss";
 *   @import "themelia-ui/core.css";
 *   @import "themelia-ui/tailwind.css";
 *
 * It is a theme declaration only — no utilities, no rules, nothing to ship at runtime that
 * Tailwind does not already emit. Tailwind drops every key no utility uses.
 *
 * Two things it does. It makes the kit's contract addressable from Tailwind, so
 * \`bg-primary\`, \`text-muted-foreground\`, \`rounded-sm\` and \`p-md\` mean what they mean
 * everywhere else in the kit. And it stops Tailwind's own defaults from overwriting the token
 * names the two projects share — both descend from shadcn, so 41 names collide and 23 of them
 * are silently re-pointed without this file. The kit's small radius, six type steps and three
 * font stacks quietly become Tailwind's, and \`--text-sm\` loses its type-factor fallback so
 * scoped type scaling stops working. The ${sameNameRows.length} restated names below are the fix.
 *
 * \`inline\` is load-bearing, not a style choice. Without it every key resolves once at
 * \`:root\`, and \`bg-primary\` inside a \`.dark\` subtree paints the light colour. The second
 * block is the exception that proves it: literals, which resolve the same everywhere and
 * must stay readable at the element so a theme can move them.
 */
@theme inline {
${body}}

@theme {
${liveBody}}
`

writeIfChanged(OUT, file)
console.log(
  `tailwind bridge: ${colourRows.length} colours, ${spacingRows.length} spacing steps, ` +
    `${sameNameRows.length} shared names restated → ${OUT}`,
)
