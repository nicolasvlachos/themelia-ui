/**
 * Emits styles/themes/default.css and styles/tokens/states.css from scripts/theme-manifest.mjs
 * (`npm run tokens:theme`). The dark blocks carry only tokens with a `dark` value.
 *
 * Throws when a token declares neither `dark` nor `inherits: true`, or is marked `inherits`
 * while reading a token the same manifest flips in dark.
 */
import { writeFileSync } from 'node:fs'
import { theme, states } from './theme-manifest.mjs'

/*
 * Derived tokens: declared at every scope boundary (styles/SCOPES.md), `.dark` included, so a
 * light-only token that reads a flipping one (`--destructive-accent`) re-resolves in a dark
 * subtree. The dark block below follows at equal specificity, so its values still win.
 */
const LIGHT_SCOPE = ':root,\n[data-ui-scope],\n[data-density],\n[data-theme],\n.light,\n.dark'

/*
 * The dark flip AND every scope boundary nested under it: otherwise a nested
 * `[data-ui-scope]`/`[data-density]` re-declares the light value inside a dark tree.
 * See styles/SCOPES.md for the nesting a descendant selector cannot express.
 */
const DARK_SCOPE = [
  '.dark',
  '[data-theme="dark"]',
  ':is(.dark, [data-theme="dark"]) :is([data-ui-scope], [data-density]):not(.light, [data-theme="light"])',
].join(',\n')

/*
 * The same dark values under the OS preference, for `colorScheme: "system"` (the provider
 * default, which sets no `data-theme`). An explicitly light scope still wins, whether it says
 * so with `data-theme` or with the `.light` class (next-themes' class strategy), and so does a
 * bare boundary nested inside one. Matches `systemDark` in theme-tweaker.utils.ts.
 */
const SYSTEM_DARK_SCOPE = [
  ':root:not(.light, [data-theme="light"])',
  '[data-ui-scope]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *)',
  '[data-density]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *)',
].join(',\n')

function render(tokens, { file, header, lightSelector, ownsColorScheme = false }) {
  const light = []
  const rootOnly = []
  const dark = []
  const problems = []

  const darkOverridden = new Set(
    Object.entries(tokens).filter(([, s]) => 'dark' in s).map(([t]) => t),
  )

  for (const [token, spec] of Object.entries(tokens)) {
    if (!('dark' in spec) && spec.inherits !== true) {
      problems.push(`${token} declares neither \`dark\` nor \`inherits: true\``)
      continue
    }

    /*
     * An `inherits` token reading a token this manifest flips (`--popover: var(--background)`)
     * must state its dark value. Cross-manifest reads rely on LIGHT_SCOPE re-resolving them at
     * every dark boundary. Primitives (`--neutral-800`) do not flip and are fine.
     */
    if (spec.inherits === true) {
      for (const ref of String(spec.light).matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
        if (ref[1] && darkOverridden.has(ref[1])) {
          problems.push(
            `${token} is marked \`inherits\` but references ${ref[1]}, which dark overrides — ` +
              `it must declare \`dark\` too or it will keep the light value`,
          )
        }
      }
    }
    const doc = spec.doc ? ` /* ${spec.doc} */` : ''
    /*
     * Raw inputs (`rootOnly`, e.g. `--radius`) are declared at `:root` only, so a consumer's
     * override inherits down instead of being restated at each scope boundary.
     */
    if (spec.rootOnly === true) {
      rootOnly.push(`\t${token}: ${spec.light};${doc}`)
      if ('dark' in spec) dark.push(`\t${token}: ${spec.dark};`)
      continue
    }
    light.push(`\t${token}: ${spec.light};${doc}`)
    if ('dark' in spec) dark.push(`\t${token}: ${spec.dark};`)
  }

  if (problems.length) {
    throw new Error(
      `${file}: ${problems.length} token(s) with undeclared dark behaviour —\n  ` +
        problems.join('\n  '),
    )
  }

  const rootBlock = rootOnly.length
    ? `/*\n * Raw inputs — \`:root\` ONLY, so a consumer's override inherits everywhere\n` +
      ` * instead of being restated (and overwritten) at each scope boundary.\n */\n` +
      `:root {\n${rootOnly.join('\n')}\n}\n\n`
    : ''

  const scheme = (value, indent = '') => ownsColorScheme ? `${indent}\tcolor-scheme: ${value};\n` : ''
  const css =
    `${header}\n` +
    rootBlock +
    `${lightSelector} {\n${scheme('light')}${light.join('\n')}\n}\n\n` +
    `/*\n * Dark theme — overrides only.\n *\n` +
    ` * Every token not listed here inherits its light value through the cascade, which is\n` +
    ` * declared explicitly as \`inherits: true\` in scripts/theme-manifest.mjs rather than\n` +
    ` * left to chance. GENERATED: edit the manifest, then run \`npm run tokens:theme\`.\n */\n` +
    `${DARK_SCOPE} {\n${scheme('dark')}${dark.join('\n')}\n}\n\n` +
    `/*\n * The same values under the OS preference, for \`colorScheme: "system"\`.\n *\n` +
    ` * Emitted rather than hand-written so it cannot drift from the block above.\n */\n` +
    `@media (prefers-color-scheme: dark) {\n` +
    `${SYSTEM_DARK_SCOPE.split('\n').map((line) => `\t${line}`).join('\n')} {\n` +
    `${scheme('dark', '\t')}${dark.map((line) => `\t${line}`).join('\n')}\n\t}\n}\n`

  writeFileSync(file, css)
  return { light: light.length, dark: dark.length }
}

const t = render(theme, {
  file: 'src/styles/themes/default.css',
  lightSelector: LIGHT_SCOPE,
  ownsColorScheme: true,
  header: `/*
 * Theme — the swappable palette.
 *
 * GENERATED from scripts/theme-manifest.mjs by scripts/gen-theme.mjs.
 * Do not hand-edit; edit the manifest and re-run \`npm run tokens:theme\`.
 *
 * This file owns only the shadcn-compatible contract: palette, radius, shadows, sidebar
 * palette, and charts. Package state, layout, density, and component knobs live in
 * styles/tokens/* and styles/theming/*.
 *
 * Every colour resolves through a primitive in styles/tokens/palette.css — there are no
 * colour literals here — so a rebrand moves the ramp, not forty separate values.
 */`,
})

const s = render(states, {
  file: 'src/styles/tokens/states.css',
  lightSelector: LIGHT_SCOPE,
  header: `/*
 * Package-owned state tokens.
 *
 * GENERATED from scripts/theme-manifest.mjs by scripts/gen-theme.mjs.
 * Do not hand-edit; edit the manifest and re-run \`npm run tokens:theme\`.
 *
 * These extend the shadcn palette with the semantics the package needs. Product tokens
 * may reference shadcn tokens; the shadcn theme never references these back.
 */`,
})

console.log(`theme:  ${t.light} light, ${t.dark} dark overrides`)
console.log(`states: ${s.light} light, ${s.dark} dark overrides`)
console.log(`${t.light + s.light - t.dark - s.dark} declarations no longer restated`)
