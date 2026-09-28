# The theme contract

The theme is `src/styles/theme/*.css`: about eighty variables, declared once at `:root`. Every
colour is `light-dark(light, dark)`, and the element's `color-scheme` (set by `.light`,
`.dark`, `data-theme` or the operating system) picks the half. Nothing below `:root`
declares a theme variable again, so a value set anywhere reaches every reader below it, and
a dark region inside a light page needs no second set of values.

Components read the theme and compute the rest in the rule that uses it. The package's checks
fail on a `var()` nothing defines, a literal colour, radius, spacing or hairline in a
component module, and a rule keyed on `.dark` or `prefers-color-scheme`.

## What the theme owns

| File | Variables |
| --- | --- |
| `colour.css` | `--background`, `--foreground`, `--card`, `--popover`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, the tones and their foregrounds, `--link`, `--chart-1`…`5`, the `--sidebar-*` set, `--overlay-backdrop`, and the tint strengths `--tint` and `--tint-strong` |
| `shape.css` | `--radius`, `--radius-sm`, `--radius-pill`, `--border-width` |
| `spacing.css` | `--padding`, `--padding-sm`, `--gap`, `--gap-sm` |
| `size.css` | `--control-height`, `--control-height-sm`, `--icon-size`, `--icon-size-sm` |
| `typography.css` | the font stacks, the type steps `--text-xs`…`--text-2xl`, and the type factor `--text-scale` |
| `elevation.css` | `--shadow`, `--shadow-lg` |
| `motion.css` | `--duration-fast`, `--duration`, `--ease`, `--disabled-opacity` |
| `layout.css` | the z tiers, `--sidebar-width`, `--header-height`, `--content-width`, `--overlay-backdrop-filter` |
| `density.css` | the `compact`, `default` and `comfortable` presets, keyed on `data-density` |

The colour names are shadcn's, so a shadcn theme drops in.

## Two of each

Every length, shadow, tint and duration comes as a pair. A value between or beyond them is
arithmetic on the pair in the rule that needs it, never a third variable.

| Pair | The first | The second |
| --- | --- | --- |
| `--radius`, `--radius-sm` | containers: cards, dialogs, popovers, menus, panels | anything inside one, or smaller: controls, rows, chips, badges, tooltips |
| `--padding`, `--padding-sm` | container insets | item insets: rows, cells, chips, fields |
| `--gap`, `--gap-sm` | between groups: fields, cards, sections | inside a group: icon and label, title and description |
| `--control-height`, `-sm` | every button, field, select and trigger | the dense step |
| `--icon-size`, `-sm` | icons beside text and in controls | icons in dense rows and chips |
| `--shadow`, `--shadow-lg` | raised: a framed card, a raised chip, a thumb, a hover lift | floating: popovers, menus, dialogs, toasts |
| `--tint`, `--tint-strong` | a soft fill: a selected row, a soft badge, a wash | a tinted line or edge |
| `--duration-fast`, `--duration` | state changes: hover, press, colour | entrances: popups, dialogs, panels |

**Corners.** `--radius-pill` is a shape, not a corner: switches, tracks, status dots. True
circles are `50%`. Every other corner is arithmetic: a nested corner is its container's
radius less the inset (`calc(var(--radius) - var(--padding-sm))`), an edge-to-edge child of a
bordered container is `calc(var(--radius) - var(--border-width))`, and a data mark or an
arrow tip is `calc(var(--radius-sm) / 4)`. A control is never smaller than its corner, and a
state (hover, focus, open, invalid) never sets a radius.

**Hairlines.** Every edge is `--border-width`; a mark (a quote bar, a drop line) and the
focus outline are twice it.

## Colour roles

**Grounds.** `--background` is the page, the app shell and content dialogs; `--card` every
in-flow framed region; `--popover` anchored popups and palettes; `--sidebar` the shell
sidebar. A surface that paints a ground sets `--surface-ground` to it, and a sticky cell or a
fade reads `var(--surface-ground, var(--background))` to match what it sits on.

**Fills.** `--muted` is a well or a placeholder. A strip (a card footer, a zebra stripe) is
`--muted` at `--tint-strong`; a track or a skeleton is `--foreground` at `--tint`, which lifts
off any ground.

**State.** `--accent` is the one hover and current fill: control hover, the menu cursor, an
open trigger, the current navigation item, row hover. Selected is `--primary` at `--tint`
(a large surface adds a `--primary` edge), and a checked mark is solid `--primary`. Selection
outranks hover. Current navigation is neutral; the brand colour is for a value the user chose.

**Tones.** A component with a `tone` renders `data-tone`, and the tone rule
(`src/styles/tone.css`) gives it three variables instead of a colour name: `--tone` (the
hue: a solid fill, a tint, a line), `--tone-foreground` (text on the solid fill) and
`--tone-ink` (the hue as text or a glyph, on the page or on its own tint). The ink is the hue
itself in dark mode; in light mode it mixes toward the text colour as far as the hue needs to
hold 4.5:1.

**Edges.** `--border` is every divider and frame; `--input` the frame of a control, and a
control's hover edge mixes it toward `--foreground`. An invalid control's edge and outline
are `--destructive`.

**Focus.** One rule (`src/styles/focus.css`) outlines every focused element in `--ring` at
twice the hairline, offset by the same. A component that clips its content draws the outline
inside (`outline-offset: calc(var(--border-width) * -2)`); one that shows focus another way (a
menu's highlight) removes the outline only beside that equivalent.

**Contrast.** `src/lib/theming/theme-contrast.test.ts` measures the theme's text and focus
pairs in both modes and fails below WCAG AA.

## Type

Type goes through `Text` and `Heading`. A module sets no `font-size`, `font-weight`,
`line-height`, `letter-spacing` or `font-family`; an element `Text` cannot wrap (a native
control, a button's label, a table cell) takes `textClassName({ size, weight, … })`. Each step
is `calc(var(--text-X) * var(--text-scale))` with its own line box, and colour reaches a
`Text` through its `type` prop, never a class.

## Density and scale

A `data-density` preset sets the four lengths and the two control heights on its element, so
a region is denser or roomier and type keeps its size. The provider's `scale` computes the
same lengths, the icon sizes and the type factor in JavaScript and writes them, rounded to
whole pixels; CSS multiplies one factor, `--text-scale`, inside Text.

## What components own

A component's own variables are private and named `--_x`, declared on its root class or
inlined where used. A private name earns its place with one of:

- **arithmetic** read by two or more rules that must stay equal;
- **a variant** that re-points it (`.columns4 { --_min: 9rem; }`);
- **JavaScript** that writes it (`style={{ "--_progress-fill": … }}`);
- **another module** that sets it: `--_button-height`, `--_button-radius`, `--_card-px` and
  `--_card-py`, `--_icon-badge-size`, `--_content-block-gap`, `--_overlay-max-width`.

A bare `var(--gap)` behind another name is none of these; read the theme directly.

Animations name global keyframes through `--keyframes-*` (CSS Modules would rename a bare
name) and state their own timing: `animation: var(--keyframes-spin) 1s linear infinite`. The
keyframes are named `themelia-*`, so Tailwind's and tw-animate-css's `spin` or `enter` never
replace them.
