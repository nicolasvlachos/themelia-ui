# Theming

The theme is about eighty variables, declared once at `:root` in `src/styles/theme/`. Each
colour holds both modes as `light-dark(light, dark)`, and every length, shadow, tint and
duration comes as a pair. Components derive everything else where they use it, so a value
you set anywhere reaches every component below it. [`src/styles/TOKENS.md`](../../src/styles/TOKENS.md)
names the variable for each role.

## Setting a theme

Set the variables you change on `:root`. A colour takes a `light-dark()` pair, or one value
for both modes:

```css
:root {
  --primary: light-dark(oklch(0.55 0.19 250), oklch(0.72 0.14 250));
  --primary-foreground: light-dark(oklch(0.985 0 0), oklch(0.2 0.03 250));
  --radius: 0.75rem;
  --radius-sm: 0.375rem;
  --font-sans: "Your interface font", sans-serif;
}
```

That one block reaches every region, including popups portalled to `<body>` and a dark
region inside a light page: nothing below `:root` declares a colour again.

The same values work on any element, for a region of their own:

```css
.marketing {
  --primary: oklch(0.6 0.2 30);
}
```

A provider takes them as config and writes them on its own element:

```tsx fragment — shape only, not a program
<UIProvider config={{ theme: { colors: { primary: "light-dark(#2563eb, #60a5fa)" } } }}>
```

Colours passed this way reach the provider's subtree. A popup portalled to `<body>` leaves
that subtree; render it into the provider with `UIPortalHost` (see
[Provider and scoping](./provider-and-scoping.md#portals-and-scopes)), or set the value on
`:root` instead.

## Ready-made themes

Four themes ship with the kit, each a style rather than a colour: Soft (large corners,
diffuse shadows, comfortable spacing), Sharp (square corners, hairlines, no shadows), Dense
(compact spacing and small corners, for data) and Editorial (serif headings on warm paper, a
step larger type). Each is a `ThemePreset`: a `label`, a `description`, and the provider
`config` it sets. That config reaches past colour to radii, shadows and border weight, density,
typography, motion and component defaults, such as the card surface. Every theme's colours
hold WCAG AA contrast in both modes, as the kit's own do.

```tsx fragment — shape only, not a program
import { themes } from "themelia-ui/theming"

<UIProvider config={themes.sharp.config}>
```

Switching themes is handing the provider another theme's config. Keep the choice in state,
and wrap the application in `UIPortalHost`, so menus and popovers, which portal to `<body>`,
take the theme too:

```tsx fragment — shape only, not a program
const [name, setName] = useState<ThemeName>("soft")

<UIProvider config={themes[name].config}>
  <UIPortalHost>
    <App onThemeChange={setName} />
  </UIPortalHost>
</UIProvider>
```

A nested provider themes one region the same way. Settings of your own go beside a theme's:
`config={{ ...themes.dense.config, formatting: { locale: "de-DE" } }}`.

A theme of your own is the same shape. Start from one of these and change what you need:

```tsx fragment — shape only, not a program
const brand: ThemePreset = {
  label: "Brand",
  description: "Our product's look.",
  config: {
    ...themes.sharp.config,
    density: "comfortable",
    theme: {
      ...themes.sharp.config.theme,
      colors: {
        ...themes.sharp.config.theme?.colors,
        primary: "light-dark(oklch(0.5 0.19 15), oklch(0.76 0.13 15))",
        "primary-foreground": "light-dark(oklch(0.985 0 0), oklch(0.2 0.05 15))",
      },
    },
  },
}
```

A square theme should set `defaults.card.surface` to `"card"`: the default `framed` surface is
a band that follows the corner, and with no corner to follow it reads as a box in a box. Write
a zero radius as `0px`: the kit subtracts lengths from the radii, and `calc()` cannot subtract
a length from a bare `0`. Write no shadow as `0 0 transparent`, not `none`: a popup lists
`--shadow-lg` after its hairline, and `none` cannot stand in a list, so the popup would lose
its edge.

To edit a theme's colours and variables visually, load them into the theme editor with
`themeFromConfig(themes.soft.config.theme)` from `themelia-ui/features/theme-tweaker`; the
editor exports the result as CSS or provider config.

## Start with the shared controls

Most adjustments need only these, and they follow a component's role rather than its name:

```css
:root {
  --padding: 1.25rem;      /* container insets: cards, dialogs, sheets, popovers */
  --padding-sm: 0.625rem;  /* item insets: rows, cells, chips, fields */
  --gap: 1.25rem;          /* between groups: fields, cards, sections */
  --gap-sm: 0.625rem;      /* inside a group: icon and label, title and description */
  --control-height: 2.25rem;
  --radius: 0.75rem;       /* containers */
  --radius-sm: 0.375rem;   /* what sits inside them; nothing derives one from the other */
}
```

- A nested corner is the container's radius less its inset, computed where it is used, so
  menus and option lists keep their rows concentric at any radius.
- A density preset sets the four lengths and the two control heights on its region (see
  [Scale and density](#scale-and-density)); a value you set on `:root` applies where no preset
  is in effect.

**Fonts.** The kit ships Geist for text and Geist Mono for code and identifiers (SIL OFL 1.1),
as variable-weight woff2 files beside `core.css`, one per script. A browser downloads a file
only when text in that script renders in that family, so a theme that sets `--font-sans` and
`--font-mono` to its own fonts downloads none of them. `--font-heading` is unset by default,
and headings fall back to the interface font.

Compose title and description regions with CardHeader, ContentBlock or OverlayHeader, action
regions with CardFooter or OverlayFooter, and label/value facts with MetadataList. These
components own their spacing, so the application does not reproduce it.

## Scale and density

Controls take two sizes, `default` and `sm`. A denser or roomier region is a scope instead,
so everything inside it moves together:

| Setting | Moves |
| --- | --- |
| `density` | the four lengths and the two control heights; type keeps its size |
| `scale` | the same, the two icon sizes, and type |
| `typography.scale` | type alone, through `--text-scale` |

```tsx fragment — shape only, not a program
<UIProvider config={{ density: "compact" }}>
<UIProvider config={{ scale: 1.125 }}>
<UIProvider config={{ typography: { scale: 0.875 } }}>
```

The provider computes `scale` in JavaScript and writes the lengths themselves, rounded to
whole pixels, so no length is multiplied twice. A density preset also works without a
provider: any element can carry `data-density="compact"` or `"comfortable"`.

A preset sets its lengths on the region. To change a length under one preset, set it for
that preset: `[data-density="compact"] { --padding: 0.625rem; }`.

## Dark mode

Colours switch through `color-scheme`, which the kit sets from three signals: a `.dark` or
`.light` class, `data-theme="dark"` or `"light"`, and, with neither, the operating system's
preference. Each colour's `light-dark()` pair resolves on the element that paints it, so a
dark region inside a light page needs only `data-theme="dark"` (or a nested provider with
`colorScheme: "dark"`) on its container, and a light island inside a dark page the same.

A value of your own switches the same way: write `light-dark()` in the value, never a rule
under `.dark` or `@media (prefers-color-scheme: dark)`, which would miss a dark region inside
a light page.

## Editing a theme at runtime

`ThemeTweaker` (`themelia-ui/features/theme-tweaker`) lets people change appearance, accent
colour, density, corners and font while the app runs, and exports CSS theme values and
provider configuration separately. Mount it as a floating button, a full-page route, or both.
The exported stylesheet is one `:root` block in which each colour it changed is a
`light-dark()` pair.

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
[runtime provider configuration](./provider-and-scoping.md#updating-defaults-at-runtime).

## Synthesising a theme in code

`themelia-ui/theming` turns one brand colour into a coherent set of overrides, with no
React in the import:

```ts compile
import { deriveThemePalette, readableForeground } from "themelia-ui/theming"

const overrides = deriveThemePalette({ primary: "#3b82f6" })
// { "--primary": "#3b82f6", "--primary-foreground": "oklch(0.18 0.01 260)", … }
```

The keys are theme variables, so write them on `:root` or pass them to a `Scope`'s `vars`.
The derived values stay CSS (`color-mix(in oklch, var(--primary) 10%, var(--background))`
rather than a computed literal), so they keep following the variables they derive from.
Derive one set for each mode and pair them, as the ThemeTweaker does, when the two should
differ.

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

`themelia-ui/tokens.json` is the theme in [W3C DTCG][dtcg] format, for Figma and tools like
Style Dictionary. Each colour is a token in `theme.light` and one in `theme.dark`; every other
variable is written once in `theme.light` and aliased from `theme.dark`. Colours are OKLCH
objects with a `hex` fallback:

```json
{ "$value": { "colorSpace": "oklch", "components": [0.45, 0.124, 167.35], "hex": "#006a47" } }
```

Shadows, durations, the easing curve and the font stacks carry their DTCG types. The two tint
strengths are percentages, which DTCG cannot express, and the unset font roles have no value;
the file lists them under its `$extensions`.

[dtcg]: https://www.designtokens.org/TR/drafts/format/

## Tailwind CSS v4

The kit ships no Tailwind and needs none. If your application already uses Tailwind v4,
import the bridge after Tailwind and the kit's stylesheet, and its utilities resolve against
the theme:

```css
@import "tailwindcss";
@import "themelia-ui/core.css";
@import "themelia-ui/tailwind.css";
```

`bg-primary` is `var(--primary)`, `rounded` is the container radius and `rounded-sm` the
item radius, `p-padding` and `gap-gap-sm` are the kit's lengths, and `text-sm` is
`calc(0.875rem * var(--text-scale))`, which follows the type factor as Text does. Every
utility reads the variable **at the element**, so a dark region, a `[data-density="compact"]`
scope, a nested `UIProvider` and a provider's `theme.radiusSm` or `typography.fonts` all move
Tailwind's output the way they move the kit's own.

**Import the bridge even if you never write a kit utility.** Both projects descend from
shadcn, so custom-property names collide: `--radius`, `--radius-sm`, `--shadow`,
`--shadow-lg`, `--text-xs` through `--text-2xl` and the font stacks. Tailwind emits its
defaults onto `:root` inside `@layer theme`, and depending on the order your application
imports its CSS, that layer can sit above the kit's `tokens` layer. Without the bridge,
Tailwind can win every shared name:

| what | kit | Tailwind takes it to |
| --- | --- | --- |
| `--radius-sm` | `0.5rem`, the kit's item radius | `0.25rem` |
| `--shadow-lg` | the kit's floating shadow | Tailwind's `shadow-lg` |
| `--font-sans` | Geist first | Tailwind's system stack |

The symptom is a slightly wrong radius or shadow, not an error. The bridge restates those
names with the kit's own values, so Tailwind's override becomes a no-op in either order. It is
generated from the theme. The kit declares nothing in Tailwind's `--animate-*` namespace, so
`animate-spin` and its neighbours stay Tailwind's own.

The bridge is theme declarations and nothing else: no rules and no utilities, and Tailwind
drops every key no utility uses, so it costs nothing you do not use. Keys that read a kit
variable or a formula are `@theme inline`, so they resolve at the element; the restated
literals (the radii, shadows and font stacks) are a plain `@theme`, so their utilities read
the variable and follow a theme that moves it.
