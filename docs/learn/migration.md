# Compatibility and migration

What changes between versions, what to do when you upgrade, and which changes a stable major
allows.

## Upgrading to 3.1

3.1 renames and removes public API as well as adding to it. Upgrade deliberately, not
through a caret range: pin `themelia-ui` to `~3.0.0` until you have run the codemod and fixed
what TypeScript reports.

**Blocks are published under `blocks/`.** The tier the documentation, the component index
and the finder call Blocks now has subpaths that say so:

| was | is |
| --- | --- |
| `themelia-ui/patterns/analytics` | `themelia-ui/blocks/analytics` |
| `themelia-ui/patterns/onboarding` | `themelia-ui/blocks/onboarding` |
| `themelia-ui/patterns/timelines` | `themelia-ui/blocks/timelines` |
| `themelia-ui/admin/patterns/access` | `themelia-ui/blocks/admin/access` |
| `themelia-ui/admin/patterns/commerce` | `themelia-ui/blocks/admin/commerce` |

Each stylesheet moved with its module, from `…/patterns/analytics.css` to
`…/blocks/analytics.css`.

**Fill style is `appearance`.** `tone` is colour, `appearance` is fill and `variant` is
structure, on every component. TypeScript reports each rename:

| was | is |
| --- | --- |
| `buttonStyle` on a Button, a Button-like component or an action definition | `appearance` |
| `ButtonStyle`, `ActionButtonStyle` | `ButtonAppearance`, `ActionAppearance` |
| `defaults: { button: { buttonStyle } }` | `defaults: { button: { appearance } }` |
| `variant` on `Badge`, `Toggle` and `SidebarMenuButton` | `appearance` |
| `BadgeVariant` | `BadgeAppearance` |
| `badgeVariants({ tone, variant })` on your own element | `<Badge tone appearance render={<a … />}>` |
| `badgeVariant` on a metadata badge value | `badgeAppearance` |
| `confirmStyle` on an overlay or an action modality | `confirmAppearance` |

Button renders `data-appearance` instead of `data-style`, and Toggle `data-appearance`
instead of `data-variant`: update CSS that selects either.

**Two steps for every size.** A size, padding or gap prop offers `default` and `sm`. `md` is
`default`, which is also what leaving the prop out gives you; a step larger than the default
is gone. The gaps map like this:

| was | is |
| --- | --- |
| `gap="2xs"`, `"xs"`, `"sm"`, `"md"` | `gap="sm"` (8px) |
| `gap="lg"`, `"xl"`, `"2xl"` | `gap="default"` (16px), or no `gap` |
| no `gap` on a `Stack` or `Split` (8px) | 16px; write `gap="sm"` to keep 8px |

Widths take `default`, `sm`, `full`, `none` or a CSS length such as `"48rem"`, and a free
string no longer type-checks. `Slider` and `SliderField` lose `size`, `InputGroupButton`
takes `iconOnly` instead of its icon sizes, and an action modality's `size`, which nothing
read, is gone.

**`density` belongs to the provider.** `MetadataList density="compact"` becomes
`size="sm"`, `MediaLibrary density="compact"` becomes `size="sm"`, `ActivityFeed density`
becomes `variant`, and `AiTask density="expanded"` becomes `defaultExpanded`. CSS that
selects `[data-row-density]`, `[data-media-density]` or `[data-activity-density]` selects
`[data-size]` or `[data-variant]`.

`Text` drops `size="xxs"` and `weight="regular"`: write `xs` and `normal`.

**The theme is one level.** It is about eighty variables, declared once at `:root`, each
colour a `light-dark(light, dark)` pair. For a theme of your own:

- Declare it on `:root` alone. The selector list 3.0 asked for (`:root, [data-ui-scope],
  [data-density], [data-theme], .light, .dark`) is not needed: nothing below `:root` declares a
  theme variable again.
- Write a dark value into the colour's pair, `--primary: light-dark(#2563eb, #60a5fa)`, rather
  than a `.dark { … }` block, which colours a dark page but misses a dark region inside a light
  one.
- The palette, the alpha steps, the spacing ladder, the control, icon and avatar ladders, the
  derived role variables and the scale factors are gone. The codemod renames a variable that
  has a successor and reports the rest:

| was | is |
| --- | --- |
| `--space-2xs` to `--space-md` | `--gap-sm` between things, `--padding-sm` for an inset |
| `--space-lg` to `--space-2xl` | `--gap` between things, `--padding` for an inset |
| `--surface-px`, `--surface-py`; `--row-px`, `--row-py` | `--padding`; `--padding-sm` |
| `--control-h`, `--control-h-sm` | `--control-height`, `--control-height-sm` |
| `--size-icon`, `--size-icon-sm` | `--icon-size`, `--icon-size-sm` |
| `--primary-10` and every other alpha step | `color-mix(in oklab, var(--primary) var(--tint), transparent)`; a line takes `--tint-strong` |
| `--accent-50`, `--border-60`, `--muted-50` | `--accent`, `--border`, `--muted` |
| `--control-border`, `--focus-ring-color`, `--link-color` | `--input`, `--ring`, `--link` |
| `--shadow-xs`, `--shadow-sm`; `--shadow-md` to `--shadow-2xl`, `--popover-shadow` | `--shadow`; `--shadow-lg` |
| `--duration-normal`, `--duration-instant`, `--ease-out` | `--duration`, `--duration-fast`, `--ease` |
| `--leading-*`, `--weight-*`, `--tracking-*` | Text's `lineHeight`, `weight` and `caps` |
| `--scale`, `--density-scale` | the provider's `scale` and `density` |
| `--inverse-*` | a nested provider with `colorScheme: "dark"` |
| `--animate-spin` and the other `--animate-*` | `--keyframes-spin` and the others, which hold the name alone: `animation: var(--keyframes-spin) 1s linear infinite` |

`--text-scale` stays, and Text multiplies each step by it. A component variable you set from
outside, such as `--content-block-p`, `--overlay-region-p`, `--field-label-width` or
`--chart-aspect`, is the component's own now: set the theme variable it reads, or style the
component through `className`. With Tailwind, `p-padding` and `gap-gap-sm` replace `p-md` and
the other spacing keys, and `rounded` is the container radius.

**A browser floor for `light-dark()`.** Safari 17.5 or newer; Chrome and Edge 125 and Firefox
121 are unchanged.

Run the codemod from your project, dry first. It rewrites the moved subpaths and their
stylesheets, renames each theme variable that has a successor, and reports the rest:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
node node_modules/themelia-ui/scripts/consumer/codemod.mjs src/
```

Every change with its replacement is listed in the
[migration reference](../generated/migration.md).

## Upgrading to 3.0

3.0 changes how the package loads, and gives a few props one shape.

**Stylesheets are imported, never implied.** The package is ES modules only, and its
JavaScript imports no CSS. Import each module's stylesheet beside its JavaScript, or
`themelia-ui/style.css` once; a component whose stylesheet is not imported renders unstyled.
`themelia-ui/styles` is gone: import `themelia-ui/core.css` instead. In exchange, Node loads
the package as it is. Server rendering and test runners need no configuration for it, so
`ssr.noExternal` and `test.server.deps.inline` entries added for the kit can go, and
CommonJS code on Node 20.19 or later can `require()` it. Jest still needs the package
exempted in `transformIgnorePatterns`.

TypeScript flags the rest:

- `Scope` takes `render` instead of `as`: `<Scope vars={vars} render={<section />}>`.
- `Badge`, `Alert`, `Item`, `ItemMedia`, `InputGroupAddon` and `InputGroupButton` no longer
  accept `null` for a variant prop; leave the prop out for the default.
- Every `renderLink` is a `LinkRenderer`: it receives `LinkRenderProps` and returns one
  element. `ActionLinkRenderer`, `ActionLinkRenderProps` and `ResourceCellLinkProps` are
  gone. `Pagination` builds its addresses with `pageHref={(page) => …}`, and its
  `renderLink` receives the href already built.

A tool that reads the published catalogue (`docs/generated/component-index.json`,
`recipes.json`, the profile records) reads `modules`, `tier` and `dependsOn` where it read
`families`, `layer` and `dependsOnFamilies`, and passes `--module=` and `--tier=` to
`find-component.mjs`.

Run the codemod from your project, dry first. It rewrites `themelia-ui/styles`:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
node node_modules/themelia-ui/scripts/consumer/codemod.mjs src/
```

Every change with its replacement is listed in the
[migration reference](../generated/migration.md).

## Upgrading to 2.0.1

A consistency release with no API change. The in-between alpha steps, per-component colour
names and glyph sizes are retired, and the codemod maps each read to the step that now owns
its role. Every control takes `--radius-sm` at every size (checkboxes and glyph buttons
included), badges return to it from 2.0.0's half radius, a wrapper nested in a Card steps
down to it, every card-like surface is `--card` in dark, and the current navigation item is
neutral. The groups are in [the token contract](../../src/styles/TOKENS.md).

Run the codemod from your project, dry first, if your CSS reads a retired step:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
```

## Upgrading to 2.0

2.0 removes names that were another component under a second name, and one entry point that
only re-exported another, so each thing has one name:

- `Dialog`, `Sheet` and `AlertDialog`, with their `Trigger`, `Close`, `Body`, `Title`,
  `Description`, `Header` and `Footer` parts and `DialogDismissArea`, are the `Overlay*`
  parts from `themelia-ui/base/overlay`. Each preset keeps only what sets something:
  `DialogContent`, `SheetContent`, and `AlertDialogContent` with its `Action`, `Cancel` and
  `Media` parts.
- A menubar's menus are dropdown menus: `DropdownMenu*` around `MenubarTrigger`, with
  `themelia-ui/base/dropdown-menu.css` imported beside the menubar's stylesheet.
- `SettingsShell` is `AsideNavShell`; `ToggleGroupItem` is `Toggle`.
- `themelia-ui/features/suggestions` is `themelia-ui/features/combobox`.

These are removed at the major boundary without a deprecation period, because each was the
same component as its replacement: props and behaviour are unchanged, only the import
changes.

2.0 also consolidates the token surface. Custom properties that restated another under a
component name are gone, and the rest settle on fewer decisions:

- **Two radii.** `--radius` (1rem) for containers and `--radius-sm` (0.5rem) for what sits
  inside them, both plain values. `--radius-surface`, `-popup`, `-lg` and larger read
  `--radius`; `--radius-control`, `-inner` and `-md` read `--radius-sm`. A theme that sets
  `--radius` should set `--radius-sm` too, because nothing derives it.
- **Two text colours.** `--foreground` and `--muted-foreground`; `Text type="discrete"` is
  `type="secondary"`.
- **One control height.** `--height-control` with `--control-h`, `-sm` and `-2xs` (34, 30 and
  24px); `--height-action` and the `--action*` ladder are gone. Navigation-menu triggers are
  34px (were 36), menubar triggers 30px (were 28) and toast actions 24px.
- **One density factor.** `--space-scale` is removed: `--density-scale` scales spacing and
  control geometry alike, and every density-scaled length is rounded to a whole pixel. A rule
  that set both factors sets `--density-scale` twice after the codemod, and the later one
  wins.
- **One spacing ladder.** Every package spacing is a `--space-*` step (2, 4, 6, 8, 12, 16,
  24px), a control or row inset, or arithmetic over what it clears. Table cells, Item rows,
  toggles, alerts and toasts move by 2–4px.
- **Menus stay dark by default**, now decided by the provider: `overlay.darkMenus: false`
  lets them follow the page.
- **The typefaces ship.** `--font-sans` and `--font-mono` start with Geist and Geist Mono,
  loaded by `core.css` from `dist/fonts/`, one file per script. Text renders the same on
  every machine now, so anything sized to its text may be a little wider or narrower. To keep
  your own typefaces, set both tokens: the kit's files are then never downloaded. Your
  bundler must emit the files `core.css` references, as Vite, webpack and Next.js do for
  `url()` in imported CSS.
- **A browser floor.** Chrome and Edge 125, Firefox 121 and Safari 16.4 or newer, set by
  `round()`, `:has()` and `:dir()`. See [installation](installation.md#browser-support).

Run the codemod from your project, dry first. It rewrites the moved imports, the renamed
tokens wherever your CSS or scripts read or set them, and the renamed Tailwind utilities. It
reports what it will not guess at: a removed token with no successor, an override that now
sets a shared name, and `rounded-md` and larger, which are Tailwind's own radii now:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
node node_modules/themelia-ui/scripts/consumer/codemod.mjs src/
```

The codemod does not edit component code. TypeScript flags the renamed components above and
`type="discrete"`; a few more changes may need a line of your own:

- `NavigationMenu` takes `side`, `sideOffset` and `container`, which moved from each
  `NavigationMenuContent`.
- `Textarea` puts `className` on the `<textarea>`; select the box with
  `[data-slot="textarea-frame"]`.
- `PageActions` collapses below 1024px; pass `breakpoint={1040}` to keep the old width.
- `Comments` shows the last three replies, folds a body after six lines and shows three
  attachments; pass `maxVisibleReplies={0}`, `clampLines={0}` or `maxVisibleAttachments={0}`
  to show everything.
- DatePicker's trigger is a combobox named by its label: tests find it with
  `getByRole("combobox", { name })`.
- `TableSkeleton` draws the table's edge; pass `framed={false}` inside a card that draws one.
- `useCopyToClipboard` confirms for 2000ms; pass a duration to keep 1600ms.
- A theme exported from the Theme Tweaker before 2.0 stops at the first provider; export it
  again.

Every removed name, token and utility with its replacement is listed in the
[migration reference](../generated/migration.md).

## Upgrading to 1.0.4

No import changes. 1.0.4 moved structural surfaces to a 12px default radius, compact
floating surfaces to a shared popup radius, and nested feature surfaces to the shared
surface hierarchy.

If custom CSS overrides literal radii, menu chrome, field focus treatments or nested feature
surfaces, compare those overrides with the shared semantic roles before keeping them.

See the [1.0.4 changelog](../../CHANGELOG.md#104--2026-09-22) for the complete changes.

## Upgrading to 1.0.3

Existing imports keep working. `TabList` gains optional `edgeFade` and scroll-control labels
through `TabList.strings`. Overflow arrows appear automatically; edge fades are opt-in.
TabList keeps its tablist attributes and className on the scrolling element, inside a new
`tabs--rail` wrapper that also holds the scroll buttons.

Review custom CSS that depends on tablist parent selectors or overrides component spacing
and typography. Cards, content blocks, overlays and domain blocks use the shared surface
and typography patterns more consistently. Overlay sheets honour their configured named or
custom cross-axis size.

See the [1.0.3 changelog](../../CHANGELOG.md#103--2026-09-17) for the complete changes.

## Upgrading to 1.0.2

- **Rich text, comments, and activities:** TipTap is the default editor engine. Install
  `@tiptap/core`, `@tiptap/pm`, and `@tiptap/starter-kit` when importing those modules.
  HTML is normalized to the editor schema; use the documented custom extensions or engine
  seam for other content. Unrelated modules and root imports remain independent of these peers.
- **Complete translation maps:** add `applying`, `savedViews`, and `customView` to complete
  `FilterStrings` maps; add `refreshing`, `error`, `refreshError`, and `retry` to complete
  `ActivitiesStrings` maps. Partial overrides keep working. Spreading the corresponding
  default strings before overrides retains fallback copy.
- **Slider wrappers:** JSX infers scalar and range callbacks from the value. Explicit
  wrappers should use `SliderProps<number>` / `SliderFieldProps<number>` for single values
  and `SliderProps<number[]>` / `SliderFieldProps<number[]>` for ranges. Range events use
  `SliderChangeEvent<number[]>`; the unparameterized event remains scalar.
- **Money strings:** a single dot is a decimal separator: `"1.234"` means 1.234, not 1234.
  Pass numeric data when possible. Strings containing both grouping and decimal separators
  continue to support valid US/EU notation; malformed amounts render the empty state.
- **Mobile filters:** below 768px, FilterLayout keeps search inline and places editors in
  an inset sheet; saved views become a select. Set `mobilePresentation="inline"` to own the
  mobile arrangement, or `filtering.mobilePresentation` when using DataView.
- **Media Library:** `view="table"` shows metadata columns. Use `view="list"` to retain
  compact rows. Supply `onUpload` to enable the upload tab; use the upload helpers' stable
  file IDs for progress updates and `applyItemPatch` for custom record shapes.
- **Mention completion:** custom `MentionInlineSuggestions` compositions should connect
  `onDismiss` to `() => mentions.setPickerOpen(false)` when using `useMentions`, so Escape
  dismisses the session without reopening from unchanged caret callbacks.
- **iPhone fields:** the 16px native-field minimum is off by default and only applies to
  iPhones when `UIProvider` enables `forms.preventIPhoneZoom`. Desktop, iPad, and Android
  retain the normal typography. Nested providers can opt out.

The [changelog](../../CHANGELOG.md#102--2026-09-16) records the full changes. Check the
generated module reference for each adopted feature before adapting custom compositions.

## How changes are classified

Every change is one of:

- **additive**: a new export, a new optional prop
- **documentation-only**: no runtime or type change
- **behaviour-preserving internal**: a refactor whose observable behaviour is identical
- **deprecation**: the old name still works, and says what replaces it
- **breaking**: anything else

## Within a stable major

An alias introduced during a stable major is deprecated in that major, documented with its
replacement, and removed only in the next one. It stays for one full stable major unless
security or correctness makes keeping it unsafe.

## Import paths

Tier barrels such as `themelia-ui/base` are not public and will not become public: one
specifier pulling an entire tier would also pull every optional peer inside it.

If you are migrating from a broad import, the mapping from old specifier to exact subpath is
in [`docs/generated/migration-broad-imports.md`](../generated/migration-broad-imports.md).

## What is not a compatibility surface

- **Component tokens.** Component-level custom properties are implementation detail and may
  be renamed or removed in any release. The global contract listed in
  [`src/styles/TOKENS.md`](../../src/styles/TOKENS.md) is the contract.
- **CSS class names.** CSS Modules hashes them. The stable DOM hooks are the
  `{kebab-name}--component` classes and the `data-slot` attributes.

## Verifying an upgrade

After changing versions, type-check and build the consuming application against the installed
package rather than a source alias. Run its unit, interaction, accessibility, and production
bundle checks, then exercise the adopted modules across the app's themes and density modes.

The focused matrix is in [Verifying a consuming application](./verification.md).
