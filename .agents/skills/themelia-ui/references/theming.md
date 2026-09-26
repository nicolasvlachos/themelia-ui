# Theming

A theme sets the **global contract** and stops there. Most rebrands begin with the palette,
semantic colours, radii and shadows of the default theme; the contract also covers type,
spacing, motion, focus and layering. `src/styles/TOKENS.md` (`node_modules/themelia-ui/src/styles/TOKENS.md`)
names the token for each role.

Component tokens are not the theming surface: most are a `var()` off the contract, and the
rest is geometry no theme would touch. Override one only where a module reference names it
as an extension point.

## Setting a theme

Where an override has to be declared depends on the kind of token.

A **raw input** (`--radius`, `--radius-sm`, a font stack, a palette step, a scale factor) is
declared once at `:root` and inherits everywhere. The semantic colours resolve through the
palette (`--primary` is `--brand-600` in light and `--brand-350` in dark), so a rebrand that
sets palette steps reaches every scope:

```css
:root {
  --brand-600: oklch(0.55 0.19 250);
  --brand-350: oklch(0.72 0.14 250);
  --radius: 1rem;
  --radius-sm: 0.5rem;
}
```

A **semantic** token (`--primary`, `--background`, `--border`) is declared again at every
scope boundary: `:root`, `[data-ui-scope]`, `[data-density]`, `[data-theme]`, `.light` and
`.dark`. Every provider renders a boundary, so a semantic set on `:root` alone stops at the
first one. Declare it at the same list, which reaches every scope and the popups portalled to
`<body>`:

```css
:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
  --primary: oklch(0.55 0.19 250);
}
```

That rule applies in light and dark alike. For a separate dark value, follow it with a rule
on the dark selectors shown in `SCOPES.md` (`node_modules/themelia-ui/src/styles/SCOPES.md`).

A provider takes the same values as config and writes them on its own element:

```tsx fragment — shape only, not a program
<UIProvider config={{ theme: { colors: { primary: "oklch(0.55 0.19 250)" } } }}>
```

Colours passed this way reach the provider's subtree down to the next boundary: a nested
provider, `Scope` or `data-density` region declares the kit's colours again, and popups
portalled outside the provider never see them. `theme.palette` reaches every boundary inside
the provider, because each one derives its colours from the palette.

For a subtree, use a scope boundary rather than a bare element; see
[Provider and scoping](provider-and-scoping.md#scope--tokens-only). Derived tokens resolve
**where they are declared**, so a variable set on an element that is not a boundary is set
and never read.

## Start with the shared controls

Most layout adjustments need only the surface insets, row insets, density factor, font
family and the two radii. They follow a component's role rather than its name:

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

- Cards, framed ContentBlocks and overlay bodies share the surface X/Y insets.
- Overlay headers and footers use the same horizontal inset and 75% of the vertical inset;
  the header adds a small optical inset above its title.
- Menus and option lists inset their rows by `--space-md`, the difference between the two
  radii, so rows sit concentric.
- Dark mode inherits the chosen fonts.

**Fonts.** The kit ships Geist for text and Geist Mono for code and identifiers (SIL OFL 1.1),
as variable-weight woff2 files beside `core.css`, one per script. A browser downloads a file
only when text in that script renders in that family, so a theme that sets `--font-sans` and
`--font-mono` to its own fonts downloads none of them.

Compose title and description regions with CardHeader, ContentBlock or OverlayHeader, action
regions with CardFooter or OverlayFooter, and label/value facts with MetadataList. These
components own their spacing, so the application does not reproduce it.
`--content-block-p` and `--overlay-region-p` override one surface's inset locally; leave them
unset so the surface follows the theme.

## Scale

Three factors, and no per-module ones:

| Factor | Multiplies |
|---|---|
| `--scale` | everything; the other two default to it |
| `--density-scale` | spacing, control heights and row rhythm, rounded to whole pixels |
| `--text-scale` | the type scale, control labels included |

Setting `--scale` alone moves the whole system. `UIProvider`'s `typography.scale` sets
`--text-scale` for a scope without changing its geometry.
`src/styles/FACTORS.md` (`node_modules/themelia-ui/src/styles/FACTORS.md`) is the reference.

Named `density` presets set only `--density-scale`, so compact and comfortable regions
change spacing, control heights and row rhythm without resizing readable type. Controls are
34, 30 and 24px at the default and 32, 28 and 23px under `compact`. Use `scale` when the
whole scoped UI should move together.

All three are raw inputs: set them on `:root`, with a `density` preset, or on a boundary such
as [`Scope`](provider-and-scoping.md#scope--tokens-only). On a plain nested element nothing
re-derives from them.

A single module cannot be scaled on its own; scale a region with a scope instead, and use the
three factors rather than reconstructing component calculations.

## Dark mode

The kit answers three signals: a `.dark` class, `data-theme="dark"`, and
`prefers-color-scheme: dark` when no explicit scheme is set. A dark-only override should
answer all three, because an app that toggles a class and an app that sets an attribute are
both normal. Use the selectors in `SCOPES.md` (`node_modules/themelia-ui/src/styles/SCOPES.md`), which also reach
the bare boundaries nested under a dark ancestor.

A bare boundary under an explicit dark ancestor (a `Scope`, a `data-density` region, or a
nested provider on the default `system` scheme) resolves the dark values. An explicit light
island inside a dark tree keeps its own boundary light, but a bare boundary inside that
island resolves dark again; give it its own `data-theme`, or use `UIScope`, which writes the
resolved scheme on each boundary it renders.

In CSS Modules, `.dark` is hashed like any other class. Write a dark rule as
`:global(.dark)`, or it matches nothing and the theme silently does not apply.

## Editing a theme at runtime

`ThemeTweaker` (`themelia-ui/features/theme-tweaker`) lets people change appearance, accent
colour, density, corners and font while the app runs, and exports CSS theme values and
provider configuration separately. Mount it as a floating button, a full-page route, or both.

The application owns the theme and provider state, above its router:

- `useAppliedTheme`, mounted there with `target: "document"` and `manageModeClass: false`,
  applies the theme whether or not the editor is open.
- The root `UIProvider` takes the same config and `themeToStyle(theme)`.
- The editor is controlled, with `apply={false}`.

```tsx compile
import { useRef, useState, type ReactNode } from "react"
import { UIProvider, type UIConfig } from "themelia-ui/ui-provider"
import {
  ThemeTweaker, createTheme, themeToStyle, useAppliedTheme, type ThemeDefinition,
} from "themelia-ui/features/theme-tweaker"
import "themelia-ui/features/theme-tweaker.css"

export function ThemedApp({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeDefinition>(() => createTheme())
  const [config, setConfig] = useState<UIConfig>({ colorScheme: "system" })
  const selfRef = useRef<HTMLDivElement>(null)
  useAppliedTheme({ theme, target: "document", selfRef, apply: true, manageModeClass: false })

  return (
    <UIProvider config={config} style={themeToStyle(theme)}>
      {children}
      <ThemeTweaker
        value={theme}
        onValueChange={setTheme}
        config={config}
        onConfigChange={setConfig}
        apply={false}
      />
    </UIProvider>
  )
}
```

Mounted descendants update without a remount. Persist valid configuration apart from
unfinished field input, so a half-typed locale cannot break the app, and use the export
callbacks to save the result. See
[runtime provider configuration](provider-and-scoping.md#updating-defaults-at-runtime).

## Synthesising a theme in code

`themelia-ui/theming` turns one brand colour into a coherent set of overrides, with no
React in the import:

```ts compile
import { deriveThemePalette, readableForeground } from "themelia-ui/theming"

const overrides = deriveThemePalette({ primary: "#3b82f6" })
// { "--primary": "#3b82f6", "--primary-foreground": "oklch(0.18 0.01 260)", … }
```

The keys are semantic custom properties, so write them at the boundary list or pass them to
a `Scope`'s `vars`. The derived values stay CSS
(`color-mix(in oklch, var(--primary) 10%, var(--background))` rather than a computed
literal), so they keep following the tokens they derive from.

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
{ "$value": { "colorSpace": "oklch", "components": [0.45, 0.124, 167.35], "hex": "#006a47" } }
```

Two kinds of value are left out, and the file lists each one under its `$extensions`:

- **Mixed colours.** `--destructive-accent` and the inverse steps are `color-mix()` over
  other tokens; DTCG has no type for a mix, and resolving one would bake one theme's value in.
- **Shadows.** Each is a multi-layer shadow whose colour is a `color-mix()`; resolving it
  would bake one theme's ink in.

[dtcg]: https://www.designtokens.org/TR/drafts/format/

## Tailwind CSS v4

The kit ships no Tailwind and needs none. If your application already uses Tailwind v4,
import the bridge after Tailwind and the kit's stylesheet, and its utilities resolve against
this contract:

```css
@import "tailwindcss";
@import "themelia-ui/core.css";
@import "themelia-ui/tailwind.css";
```

`bg-primary` is `var(--primary)`, `rounded-sm` is the kit's inner radius, `p-md` is
`var(--space-md)`, and `text-sm` is `calc(0.875rem * var(--text-scale, var(--scale)))`. The
container radius has no named utility (`rounded` stays Tailwind's own), so write
`rounded-(--radius)`. Every utility reads the token **at the element**, so a `.dark`
subtree, a `[data-density="compact"]` scope, a nested `UIProvider` and a provider's
`theme.radiusSm` or `typography.fonts` all move Tailwind's output the way they move the
kit's own.

**Import the bridge even if you never write a kit-token utility.** Both projects descend
from shadcn, so custom-property names collide: `--radius-sm`, `--text-xs` through
`--text-2xl`, `--shadow-*`, `--font-sans/serif/mono`, `--leading-*`, `--tracking-*`,
`--ease-*` and `--animate-*`. Tailwind emits its defaults onto `:root` inside `@layer theme`,
and when the kit's layers are declared first, that layer sits **above** the kit's `tokens`
layer. The kit's JavaScript imports `core.css` too, so which comes first depends on your
bundler. Without the bridge, Tailwind can win every shared name, among them:

| what | kit | Tailwind takes it to |
| --- | --- | --- |
| `--radius-sm` | `0.5rem`, the kit's inner radius | `0.25rem` |
| `--text-sm` | `calc(0.875rem * var(--text-scale, var(--scale)))` | `0.875rem`, and **scoped type scaling stops working** |
| `--font-sans` | Geist first | Tailwind's system stack |
| `--animate-pulse` | `pulse 2s var(--ease-in-out) infinite` | `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite` |

The symptom is a slightly wrong radius and a density control that stops working, not an
error. The bridge restates those names with the kit's own definitions, so Tailwind's
override becomes a no-op in either order. It is generated from the same public tokens.

The bridge is two theme declarations and nothing else: no rules and no utilities, and
Tailwind drops every key no utility uses, so it costs nothing you do not use. Keys that read
a kit token or a formula are `@theme inline`, so they resolve at the element; the restated
literals (the inner radius, font stacks, leading, easing) are a plain `@theme`, so their
utilities read the variable and follow a theme that moves it.
