# Theming

A theme author sets the **global contract** and stops. Most rebrands begin with the palette,
semantic-colour, radius and shadow seeds in the default theme; the contract also includes
the public type, spacing, motion, focus and layering controls.
[`src/styles/TOKENS.md`](../../src/styles/TOKENS.md) names the token for each role.

The component-token layer is plumbing, not the theming surface: most of it is a `var()` off
the contract, and the rest is geometry no theme would touch.
Override component tokens only where a family reference names one as an extension point.

## Editing a running app

`ThemeTweaker` (`themelia-ui/features/theme-tweaker`) lets people change appearance, accent
colour, density, corners and font while the app runs, and exports CSS theme values and
provider configuration separately. Mount it as a floating button, a full-page route, or both.

The application owns the theme and provider state, above its router:

- Keep `useAppliedTheme` mounted there with `target="document"` and `manageModeClass={false}`.
- Give the root `UIProvider` the shared config and `themeToStyle(theme)`.
- Render the controlled editor with `apply={false}`.

This keeps document portals and the provider scope in sync, and theme application does not
depend on whether the panel is open. Persist valid config separately from unfinished field
input, so typing a partial locale cannot break the app.

## Setting a theme

Declare the contract's names wherever you want them to apply. Which selector reaches a
component depends on the kind of name.

A **raw input** — `--radius`, a font stack, a palette primitive — is declared once at
`:root` and inherits everywhere. `--primary` resolves through `--brand-600` in light and
`--brand-350` in dark, so a rebrand sets the primitives and every semantic follows:

```css
:root {
  --brand-600: oklch(0.55 0.19 250);
  --brand-350: oklch(0.72 0.14 250);
  --radius: 1rem;
  --radius-sm: 0.5rem;
}
```

A **semantic** — `--primary`, `--background`, `--border` — re-derives at every scope
boundary, and the provider's own element is one. Set on `:root` alone, it is re-declared at
that element and no component sees it. Pass it through the provider, which writes it on the
boundary itself:

```tsx fragment — shape only, not a program
<UIProvider config={{ theme: { colors: { primary: "oklch(0.55 0.19 250)" } } }}>
```

or declare it at the boundaries, in the list the package itself uses:

```css
:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
  --primary: oklch(0.55 0.19 250);
}
```

For a subtree, use a scope boundary rather than a bare element — see
[Provider and scoping](./provider-and-scoping.md#scope--tokens-only). Derived tokens resolve
**where they are declared**, so a variable set on an element that is not a boundary is set
and never read.

## Start with the shared controls

Most layout adjustments need only the surface insets, row insets, spacing factor, font
family, and the two radii. These controls follow the component's role rather than its
feature name:

```css
:root {
  --surface-x: 1.25rem;
  --surface-y: 1rem;
  --row-x: 0.75rem;
  --row-y: 0.5rem;
  --font-sans: "Your interface font", sans-serif;
  --radius: 0.75rem;    /* containers */
  --radius-sm: 0.375rem; /* what sits inside them — set both, nothing derives it */
}
```

**Fonts.** The kit ships Geist for text and Geist Mono for code and identifiers (SIL OFL 1.1),
as variable-weight woff2 files beside `core.css`, one per script. A browser downloads a file
only when text in that script renders in that family, so a theme that sets `--font-sans` and
`--font-mono` to its own fonts downloads none of them.

- Cards, framed ContentBlocks and overlay bodies share the surface X/Y insets.
- Overlay headers and footers use the same horizontal inset and 75% of the vertical inset;
  the header adds a small optical inset above its title.
- Menus and option lists inset their rows by `--space-md`, the difference between the two
  radii, so rows sit concentric.
- Dark mode inherits the chosen fonts.

Compose title/description regions with CardHeader, ContentBlock or OverlayHeader; action
regions with CardFooter or OverlayFooter; and label/value facts with MetadataList. These
components own their spacing, so the application does not reproduce it.

`--content-block-p` and `--overlay-region-p` remain supported for local exceptions. Leave
them unset when the surface should follow the theme.

## Scale

Three factors, and no per-family ones:

| Factor | Multiplies |
|---|---|
| `--scale` | everything; the other two default to it |
| `--density-scale` | spacing, control heights and row rhythm, rounded to whole pixels |
| `--text-scale` | the type scale, control labels included |

Setting `--scale` alone moves the whole system. `UIProvider`'s `typography.scale` sets
`--text-scale` for a scope without changing its geometry.
[`src/styles/FACTORS.md`](../../src/styles/FACTORS.md) is the authority.

Named `density` presets set only `--density-scale`, so compact and comfortable regions
change spacing, control heights and row rhythm without resizing readable type. Controls are
34, 30 and 24px at the default and 32, 28 and 23px under `compact`. Use explicit `scale`
when the entire scoped UI should move together.

All three are raw inputs: set them on `:root`, with a `density` preset, or on a boundary such
as [`Scope`](./provider-and-scoping.md#scope--tokens-only). On a plain nested element nothing
re-derives from them.

A single family cannot be scaled on its own; scale a region with a scope instead. A
family-shaped token name is not a tuning seam. Use the three public factors rather than
reconstructing component calculations.

## Dark mode

Three signals, all answered:

```css
.dark { … }
[data-theme="dark"] { … }
@media (prefers-color-scheme: dark) { … }
```

A dark-only override should answer all three: an app that toggles a class and an app that
sets an attribute are both normal, and honouring only one leaves the other half-themed.

A bare token boundary nested under an explicit dark ancestor — a `Scope`, a `data-density`
region, a nested provider on the default `system` scheme — re-derives the dark values. An
explicit light island inside a dark tree keeps its own boundary light, but a bare boundary
inside that island re-derives dark again; give it its own `data-theme`, or use `UIScope`,
which writes the resolved scheme on each boundary it renders.
[`src/styles/SCOPES.md`](../../src/styles/SCOPES.md) shows the selectors.

In CSS Modules, `.dark` is hashed like any other class. Write a dark rule as
`:global(.dark)`, or it matches nothing and the theme silently does not apply.

## Runtime theming

`features/theme-tweaker` edits CSS theme values and provider defaults at runtime. Connect
`onConfigChange` to application state and pass valid configuration to the provider; mounted
descendants update without a remount. Use its export callbacks to persist the result in
your application. See [runtime provider configuration](./provider-and-scoping.md#updating-defaults-at-runtime).

## Synthesising a theme in code

`themelia-ui/theming` turns one brand colour into a coherent set of overrides, with no
React in the import:

```ts compile
import { deriveThemePalette, readableForeground } from "themelia-ui/theming"

const overrides = deriveThemePalette({ primary: "#3b82f6" })
// { "--primary": "#3b82f6", "--primary-foreground": "oklch(0.18 0.01 260)", … }
```

The derived values stay CSS — `color-mix(in oklch, var(--primary) 10%, var(--background))`
rather than a computed literal — so they keep following the tokens they derive from.

`readableForeground(background)` **measures** WCAG contrast against both candidates and
returns the better one, with the ratio and whether it clears AA:

```ts fragment — one expression and its result, not a program
readableForeground("#6366f1")
// { color: "oklch(0.985 0 0)", ratio: 4.28, meetsAA: false, measured: true }
```

`meetsAA: false` is not an error to handle: neither ink nor paper clears 4.5:1 on that
seed. Pick a darker or lighter brand, or set `--primary-foreground` yourself.

Both functions are also re-exported from `features/theme-tweaker`.

## Design tokens (DTCG)

`themelia-ui/tokens.json` is the contract in [W3C DTCG][dtcg] format, for Figma and
tools like Style Dictionary. Colours are OKLCH objects with a `hex` fallback:

```json
{ "$value": { "colorSpace": "oklch", "components": [0.45, 0.124, 167.35], "hex": "#00785f" } }
```

Two kinds of value are deliberately absent, each named in its own `$extensions`:

- **Mixed colours.** `--destructive-accent` and the inverse steps are `color-mix()` over
  other tokens; DTCG has no type for a mix, and resolving one would bake one theme's value in.
- **Shadows.** Each is a multi-layer shadow whose colour is a `color-mix`; resolving it
  would bake one theme's ink in.

Every `$type`, value and `{reference}` in the file is validated, and no dark token aliases
a skipped light token.

[dtcg]: https://www.designtokens.org/TR/drafts/format/

## Tailwind CSS v4

The kit ships no Tailwind and needs none. If your application already uses Tailwind v4,
import the bridge and its utilities resolve against this contract:

```css
@import "tailwindcss";
@import "themelia-ui/core.css";
@import "themelia-ui/tailwind.css";
```

`bg-primary` is `var(--primary)`, `rounded-sm` is the kit's inner radius, `p-md` is
`var(--space-md)`, `text-sm` is `calc(0.875rem * var(--text-scale, var(--scale)))`. The
container radius has no named utility — `rounded` stays Tailwind's own — so write
`rounded-(--radius)`. Every utility reads the token **at the element**, so a `.dark`
subtree, a `[data-density="compact"]` scope, a nested `UIProvider` and a provider's
`theme.radiusSm` or `typography.fonts` all move Tailwind's output the way they move the
kit's own.

**Import it even if you never write a kit-token utility.** Both projects descend from
shadcn, so custom-property names collide — `--radius-sm` and `--radius-pill`, `--text-xs`
through `--text-2xl`, `--shadow-*`, `--font-sans/serif/mono`, `--leading-*`, `--ease-*`.
Tailwind emits its defaults onto `:root` inside `@layer theme`; when the kit is imported
first, that layer sits **above** the kit's `tokens` layer. Without the bridge, Tailwind
wins every shared name, among them:

| what | kit | Tailwind takes it to |
| --- | --- | --- |
| `--radius-sm` | `0.5rem` — the kit's inner radius | `0.25rem` |
| `--text-sm` | `calc(0.875rem * var(--text-scale, var(--scale)))` | `0.875rem` — **scoped type scaling stops working** |
| `--font-sans` | Geist first | Tailwind's system stack |
| `--animate-pulse` | `cubic-bezier(0.4, 0, 0.2, 1)` | `cubic-bezier(0.4, 0, 0.6, 1)` |

The symptom is a slightly wrong radius and a density control that stops working, not an
error. The bridge restates those names with the kit's own definitions, so Tailwind's
override becomes a no-op. It is generated from the same public tokens.

The bridge is two theme declarations and nothing else: no rules and no utilities, and
Tailwind drops every key no utility uses, so it costs nothing you do not use. Keys that read
a kit token or a formula are `@theme inline`, so they resolve at the element; the restated
literals (the inner radius, font stacks, leading, easing) are a plain `@theme`, so their
utilities read the variable and follow a theme that moves it.
