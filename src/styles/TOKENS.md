# The token contract

The theme is `themes/default.css` plus `tokens/*.css`: the global contract. The rest is
cross-cutting wiring and component-owned measurements a theme author does not need to touch.

**The theme surface is the global contract, not every token.** Only the contract is a theme
surface: a theme author sets it and every component follows, because a component token is
either derived from it or a measurement a rebrand has no opinion about.

**A component's variables live with the component**: in its own module when one component
reads them, in `styles/theming/` only when many do.

The package's token checks fail on a dead token, a PASS-THROUGH (a second name for another
token that does no arithmetic and is never re-pointed), an override nothing reads, a runtime
token no stylesheet declares, a colour literal outside `tokens/`, and a length off the 2px
grid.

## What earns a component token

One of three things, and a name that does none of them is noise:

* **arithmetic** — `--heatmap-pitch: calc(var(--heatmap-cell) + var(--space-2xs))`
* **a variant or scope re-points it** — `--badge-hue`, declared once per tone
* **JS writes it** — `style={{ "--micro-bar": "62%" }}`, the interface a chart arrives through

A name like `--sidebar-p: var(--space-md)` does none: however often it is read, it is one
name in front of one step, and every reader can say `--space-md`.

Two exemptions. A **family with a member re-declared in another file** is an extension
point: inlining `--text-role-main` breaks the inverse Alert that re-points it for its own
subtree. A token **named in TSX or a test** has a reader a `var()` scan cannot see.

## What a theme owns

`themes/default.css` is shadcn-shaped, so a shadcn theme drops in. In the repository it is
generated from `scripts/theme-manifest.mjs` by `npm run tokens:theme`; edit the manifest,
not the file.

**Colour** resolves through the ramp in `tokens/palette.css`. The theme file holds no
literals, so a rebrand moves the ramp rather than forty separate values.

```css
--background --foreground --card --popover --primary --secondary
--muted --accent --destructive --border --input --ring
--chart-1…5 --sidebar-*
```

**Edge** — the three properties that describe every border in the kit, kept together
because they are one decision:

```css
--border: var(--neutral-200);   /* colour */
--border-width: 1px;            /* weight */
--radius: 1rem;                 /* corner  */
```

**Shape** is two values. `--radius` rounds whatever holds other rounded things;
`--radius-sm` rounds everything inside one or smaller than one. Both are plain values
declared once at `:root`, and nothing derives one from the other, so a theme that changes
one usually sets both. A container holding `--radius-sm` items insets them by the
difference (`--space-md` at the defaults), so outer = inner + inset. There is no third
radius token:

| token | used by |
|---|---|
| `--radius` | wrappers: cards, dialogs, sheets, popovers, menus, listboxes, panels, columns, dropzones, framed media and maps, choice cards |
| `--radius-sm` | items: buttons at every size, fields, checkboxes, glyph buttons, tabs, badges, chips and tags, rows, menu items, tooltips, calendar cells, thumbnails, icon tiles, bubbles, gallery tiles, and every wrapper nested inside a Card |
| `--radius-pill` | shapes rather than corners: switches, tracks, skeleton bars, status dots, series swatches, a count overlaid on an icon |
| `50%` | true circles only: avatars, radios, spinners, a circular IconBadge |

Every other corner is arithmetic on the two radii:

* an edge-to-edge child of a bordered wrapper: `calc(var(--radius) - var(--border-width))`
* an item inset inside an item frame: `calc(var(--radius-sm) - <inset>)`
* an item parked in a wrapper's corner at `--space-md`: plain `--radius-sm`, concentric by construction
* data marks and arrow tips, which are not controls: `calc(var(--radius-sm) / 4)`

A control is never smaller than its corner: an 18px checkbox and a 16px clear glyph take
`--radius-sm` like a button, so a theme's item radius reaches every control.

A state never sets a radius: hover, focus, open, active and invalid keep the resting corner.
`--button-radius` is a hook that only ever takes one of the expressions above.

## What the ramps own

`tokens/` holds the ladders the theme resolves against: the colour ramp, the type scale
(`--text-xs` … `--text-2xl` and its paired line heights), the spacing scale, the content
widths, and the raw tunables — `--height-control`, `--control-x`, `--row-x/y`,
`--surface-x/y`, `--icon`, `--avatar`, `--scale`.

**Spacing sits on a 2px grid.** Every length under `4rem` is a multiple of `0.125rem`, so
neighbouring insets cannot land a pixel apart.

**Type is exempt from the grid**, because a type ramp is geometric — `0.75`, `0.8125`,
`0.875`, `1`, `1.125` — and lands off a 2px grid by construction. `0.8125rem` is the
`--text-pxs` step, not a stray 13px.

## What components own

**A component reads the theme directly**: `background-color: var(--foreground)` in the
module, not `--tooltip-bg: var(--foreground)` somewhere else and `var(--tooltip-bg)` here.
A name with one reader is indirection. Where a component adjusts a theme value, it does the
arithmetic in its own rule — `calc(var(--space-lg) * 2)` — rather than minting a name.

A token earns a NAME only when one of these is true:

| | |
|---|---|
| **arithmetic read by two or more rules** | a `calc()` whose readers must stay equal; a bare `var(--step)` is a pass-through however often it is read |
| **an extension point** | another file re-declares it, so inlining kills the override |
| **read from TS/TSX** | a runtime hook; the indirection is the API |
| **an `--animate-*`** | CSS Modules scope keyframe names; inlined, the animation dies |
| **a bare length a module may not hold** | a module may not hold raw px or rem spacing |

Everything else belongs in the rule that uses it, and still may not hold a colour literal:
colour always resolves through the palette.

**An extension point is anything another file re-declares**, including a one-line rule:
`.columns4 { --choice-card-min: 9rem; }` is how a variant re-points a token, and inlining
the default silently kills all three column variants.

There is no per-component scale factor. See [FACTORS.md](./FACTORS.md) for the three global
factors, and [SCOPES.md](./SCOPES.md) for why derived values are declared at every scope
boundary rather than once at `:root`.

## One token per role

Every visual role has one token or one recipe. Reach for the role, not for a value that
happens to look right, and never spell an ad hoc `color-mix()` step in a module: a pair the
kit uses is declared once in `theming/colors.css`.

**Grounds.** What a surface is painted with.

| token | role |
|---|---|
| `--background` | the page, the app shell, and content dialogs, sheets and drawers |
| `--card` | every in-flow framed region: Card, DataTable and DataView frames, the EventCalendar grid, panels |
| `--popover` | anchored popups, command palettes (CommandDialog, GlobalSearchDialog), a raised segmented chip |
| `--sidebar` | the shell sidebar |
| `--field-bg` | the resting fill of every field and box control (transparent by default) |

The **modal ground** is deliberate: a content dialog is the page brought forward and sits on
`--background`; a palette is a popup that happens to be modal and sits on `--popover`. A
dark lift for cards belongs in the theme's `--card`, never in one module.

`--surface-ground` is "the surface I sit on". A surface that paints a ground (Card, popups,
the sidebar, table and data-view frames) sets it; a sticky cell, a cut-out ring, an opaque
halo or a fade reads `var(--surface-ground, var(--background))`, so it matches whatever it
lands on. It is unset by default and reset at every colour island (SCOPES.md).

**Neutral fills.**

| token | role |
|---|---|
| `--muted` | a solid placeholder: media and thumbnail fallback, map canvas, QR fallback |
| `--muted-50` | a recessed well: muted ContentBlock and Item, summary and diff panels, code, table head and foot cells, segmented and enclosed-tab tracks, unread rows, the secondary Alert |
| `--muted-20` | a strip: Card, Overlay and GlobalSearch footers, zebra stripes, column-group bands, optional sections |
| `--muted-40` `-60` `-80` | the empty-state illustration ramp, nothing else |
| `--foreground-8` | a small neutral fill that must lift on any ground: avatar fallback, neutral IconBadge, tile or medallion, neutral chip, tag or mention, read-only plate |
| `--foreground-10` | skeletons |
| `--foreground-20` | every track or unfilled segment: Progress, Slider, Upload, metric and chip progress |

There is no muted step between these: a well is `-50`, a strip `-20`.

**State fills.** `--muted-*` and `--foreground-*` are never state fills.

| token | role |
|---|---|
| `--accent` | control hover (Toggle and clear or remove glyphs included), the popup cursor, a pressed toggle, an open popup trigger, the current navigation item |
| `--accent-50` | row and large-surface hover, add-slot hover, an open accordion item |
| `--sidebar-accent` `--sidebar-accent-50` | the same two roles inside the sidebar |
| `--primary-5` with a `--primary` edge | a selected large surface: choice card, switch card, locale tile, drop target |
| `--primary-10` | a selected row |
| `--primary` | a checked mark and solid selection |
| `--primary-accent` | state ink: check and busy icons, today, the radio ring |

Selection outranks hover: a selected item does not change on hover. Current navigation is
neutral (`--accent`, foreground ink, medium weight); the brand ladder is for a value the user
chose.

**Tone ladder.** For T in primary, info, success, warning and destructive:

| role | step | readers |
|---|---|---|
| solid fill | `--T` with `--T-foreground` | solid Button, Badge and IconBadge |
| ink | `--primary-accent`, `--info`, `--success`, `--warning-accent`, `--destructive-accent` | text, glyphs, dots, sparklines and bars on the page or on a tint |
| wash | `T-5`, warning `-10` | large panels: Alert, AI confirmation, a failed row, an applied coupon |
| soft | `T-10` | chips and tiles: Badge soft, mentions, IconBadge, trend and diff chips, calendar chips, timeline discs, ghost and outline hover |
| soft hover, halo | `T-20` | a linked soft chip's hover, the current-step and status halos |
| line | `T-30`, warning `-40` | callouts, soft chips, outline Buttons and Badges, metric panels, applied filters |

Warning's steps sit one higher because amber is light: a 10% amber wash lands where the
other hues land at 5%. `--primary-15`, `--primary-25` and `--primary-40` are not tone steps:
they belong to the range band, the analytics ruler and the media-tile selection ring.
There is no other soft or wash step in any hue. Badge and mention
chips do the arithmetic on one re-pointed hue (`--badge-hue`, `--ref-hue`) with the same
percentages.

**Edges.**

| token | role |
|---|---|
| `--border-width` | every hairline, rail and connector |
| `--border-width-strong` | marks only: a quote bar, the active-nav bar, a dot ring, a drop line |
| `--focus-ring-width` | focus only |
| `--border` | an outer edge: frames on the page, overlays, page-chrome bars, the Separator, rails, thumbnails |
| `--border-60` | an inner edge: header, footer and toolbar bands, section rules, nested frames, row rules, menu separators |
| `--control-border` `--control-border-hover` | the frame of a control in a row with fields: outline toggles and ToggleGroup, pill groups, filter pills, interactive chips, dashed add slots. Mixed separately for dark. A divider inside a control (a ButtonGroup separator, a filter pill's segments) is an inner rule, `--border-60` |
| `--foreground-20` | the hover edge of a clickable surface |
| `--invalid-ring-border` with `--invalid-ring` | every invalid edge. Focus adds the ring, invalid keeps its border, and hover never repaints it |

There is no edge colour between the two. No literal `1.5px` or `3px` edge.

**Elevation.**

| token | role |
|---|---|
| none | bordered or flat surfaces, field shells, sticky bars |
| `--shadow-xs` | resting lift: a framed Card's bezel, a raised chip, a thumb, a floating sidebar |
| `--shadow-sm` | hover lift for every clickable card and tile; controls over artwork |
| `--popover-shadow` | every anchored popup (select, combobox, mention panel, chart tooltip, map popup), never with a real border |
| `--shadow-lg` | free-floating transients: toast, drag ghost, floating batch bar, submenu |
| `--shadow-xl` | modals and palettes |

`--shadow-2xs`, `--shadow` and `--shadow-2xl` are kept for shadcn compatibility; no kit
surface reads them. A frosted sticky bar is opaque `--background`, then `--background-70`
with `blur(12px)` under `@supports`.

**Focus.** Controls take `--focus-ring`, or `--focus-ring-inset` under a clip. Fields and
field shells take `--field-focus-ring` with a `--focus-ring-color` border, keyed on the
control's `:focus-visible`; the rich-text editor and the AI composer are the multi-control
exception and light on `:focus-within`. Never read `--ring` directly. Every Sidebar
surface re-points `--focus-ring-color` to the theme's `--sidebar-ring` through the same
recipe (mixed toward `--sidebar-foreground` in light, unmixed in dark) and composes
`--focus-ring`, `--focus-ring-inset` and `--field-focus-ring` again from it. It also sets
`--surface-ground: var(--sidebar)`.

**Type.** Sizes come with their paired leading. `--leading-none` for fixed-height controls
and glyphs, `--leading-tight` for titles at base size and up, `--leading-relaxed` for prose;
`--leading-snug` never on `xs` or `sm`. Weight: normal for body; medium for labels, headers,
controls, badges, row and accordion titles; semibold for surface titles, Heading, card
titles and headline figures; bold for strong text and grand totals. `--tracking-widest` is
for uppercase and shortcuts, `--tracking-tight` for Heading `xl` and `2xl` only. Colour
reaches a `Text` through its `type` prop, never a module rule. Links read `--link-color` and
`--link-underline-offset`.

**Size.** Control heights and paddings go in matching pairs from the control ladder; a 24px
glyph button is `--control-h-2xs`. A chevron inside a control is `--size-icon`, a caret after
text `--size-icon-sm`. A head-of-row thumbnail is `--size-medallion`; a nav or menu row icon
is `--size-icon`; a status dot is `--space-md`. Gaps: control icon to label `--space-sm`, chip
icon to label `--space-xs`, sibling actions `--space-md`. Every derived multiple is rounded
to a whole pixel and lands on the 2px grid.

**Dark and inverse.** Small inverse chips flip with the theme (Tooltip, solid neutral
controls). Large inverse slabs stay dark in both modes: the inverse Alert and the toast read
`--inverse-*`, and the auth showcase panel is a `data-theme="dark"` scope. A QR code always
renders dark modules on light through `--inverse-background` and `--inverse-foreground`.

**Menus in dark.** `overlay.darkMenus` (default `true`) renders dropdown and context menus in
the dark scheme on a light page. It applies to command menus only: listboxes, selects,
comboboxes and pickers belong to the field that opened them and follow the page, like every
other popup.

## Shared surface and content rhythm

Retheme surface padding with `--surface-x` and `--surface-y`. Cards, choice cards, framed
ContentBlocks, popovers, hover cards, the form actions bar and overlay bodies share these
insets. Overlay headers and footers, and CardFooter, use 0.75 of the vertical inset
(`round(calc(var(--surface-py) * 0.75), 1px)`) and the body's horizontal inset; the overlay
header adds one `--space-2xs` above its title. Bands (a toolbar or header row inside a frame)
are `--row-py` by `--surface-px`; edge-to-edge rows, table cells included, take `--surface-px`
inline; list rows are `--row-py` by `--row-px`. Compact collection shells use half the inset.

Title/description pairs in CardHeader, ContentBlock and OverlayHeader use the same
`Stack gap="xs"`. CardFooter and OverlayFooter use a wrapping horizontal Stack with
`gap="md"`. Ordinary label/value rows belong to MetadataList, including activity changes
with custom before/after values. Specialized timelines and ledgers keep their own geometry.

`--content-block-p` and `--overlay-region-p` are optional local overrides. They are unset
(`initial`) by default, so each axis follows the shared surface controls; setting either
sets both axes for that surface. Do not add another family-specific padding variable for
the same job.

Set fonts at the theme root or an explicit scope. Dark regions inherit the font family;
switching colour mode does not restore the package's default font.
