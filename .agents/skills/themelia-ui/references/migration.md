# Compatibility and migration

The package is `2.0.2`. The stable-major policy below applies within a major version.

## Upgrading to 2.0.2

A fix release with no API change. `themelia-ui/primitives.css` now builds under Tailwind v4's
resolver (`@tailwindcss/cli`, `@tailwindcss/postcss`, `@tailwindcss/vite` before 4.3), and a
Vite 8, Rspack or webpack 5 production build keeps the core tokens and the cascade-layer
order when components are imported before, or without, a stylesheet, and keeps
`import "themelia-ui/styles"`. If you switched to `themelia-ui/style.css` to work around the
first, you can switch back.

## Upgrading to 2.0.1

A consistency release with no API change. The in-between alpha steps, per-family colour
names and glyph sizes are retired, and the codemod maps each read to the step that now owns
its role. Every control takes `--radius-sm` at every size (checkboxes and glyph buttons
included), badges return to it from 2.0.0's half radius, a wrapper nested in a Card steps
down to it, every card-like surface is `--card` in dark, and the current navigation item is
neutral. The groups are in the token contract (`node_modules/themelia-ui/src/styles/TOKENS.md`).

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
  `--radius` should set `--radius-sm` too — nothing derives it.
- **Two text colours.** `--foreground` and `--muted-foreground`; `Text type="discrete"` is
  `type="secondary"`.
- **One control height.** `--height-control` with `--control-h`, `-sm` and `-2xs` (34, 30 and
  24px); `--height-action` and the `--action*` ladder are gone. Navigation-menu triggers are
  34px (were 36), menubar triggers 30px (were 28) and toast actions 24px.
- **One density factor.** `--space-scale` is removed: `--density-scale` scales spacing and
  control geometry alike, and every density-scaled length is rounded to a whole pixel. A rule
  that set both factors now sets `--density-scale` twice after the codemod, and the later
  one wins.
- **One spacing ladder.** Every package spacing is a `--space-*` step (2, 4, 6, 8, 12, 16,
  24px), a control or row inset, or arithmetic over what it clears. Table cells, Item rows,
  toggles, alerts and toasts move by 2–4px.
- **Menus stay dark by default**, now decided by the provider: `overlay.darkMenus: false`
  lets them follow the page.
- **The typefaces ship.** `--font-sans` and `--font-mono` start with Geist and Geist Mono,
  loaded by `core.css` from `dist/fonts/`, one file per script. The 1.x stacks named Inter and
  JetBrains Mono and shipped neither, so text rendered in each machine's own font; anything
  sized to its text is a little wider or narrower now. To keep your own typefaces, set both
  tokens: the kit's files are then never downloaded. Your bundler must emit the files
  `core.css` references, as Vite, webpack and Next.js do for `url()` in imported CSS.
- **A browser floor.** Chrome and Edge 125, Firefox 121 and Safari 16.4 or newer, set by
  `round()`, `:has()` and `:dir()`; 1.x documented none. See
  [installation](installation.md).

Run the codemod from your project, dry first. It rewrites the moved imports, the renamed
tokens wherever your CSS or scripts read or set them, and the renamed Tailwind utilities. It
reports what it will not guess at: a removed token with no successor, an override that now
sets a shared name, and `rounded-lg` and larger, which are Tailwind's own radii now:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
node node_modules/themelia-ui/scripts/consumer/codemod.mjs src/
```

Every removed name, token and utility with its replacement is listed in the
migration reference (`node_modules/themelia-ui/docs/generated/migration.md`).

## Upgrading to 1.0.4

No import migration is required. 1.0.4 refined the default shape, surface, typography and
interaction system: structural surfaces used a 12px default radius, compact floating surfaces
the popup radius role, Preview/Code controls an underline presentation, and nested feature
surfaces the shared surface hierarchy.

If custom CSS overrides literal radii, menu chrome, field focus treatments, or nested
feature surfaces, compare those overrides with the shared semantic roles before keeping
them.

See the 1.0.4 changelog (`node_modules/themelia-ui/CHANGELOG.md`) for the complete changes.

## Upgrading to 1.0.3

Existing imports keep working. `TabList` gains optional `edgeFade` and scroll-control labels
through `TabList.strings`. Overflow arrows appear automatically; edge fades are opt-in.
TabList keeps its tablist attributes and className on the scrolling element, inside a new
`tabs--rail` wrapper that also holds the scroll buttons.

Review custom CSS that depends on tablist parent selectors or overrides component spacing
and typography. Cards, content blocks, overlays, and domain blocks use the shared surface
and typography patterns more consistently. Overlay sheets honor their configured named or
custom cross-axis size.

See the 1.0.3 changelog (`node_modules/themelia-ui/CHANGELOG.md`) for the complete changes.

## Upgrading to 1.0.2

- **Rich text, comments, and activities:** TipTap is the default editor engine. Install
  `@tiptap/core`, `@tiptap/pm`, and `@tiptap/starter-kit` when importing those families.
  HTML is normalized to the editor schema; use the documented custom extensions or engine
  seam for other content. Unrelated families and root imports remain independent of these peers.
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
- **Media Library:** `view="table"` now shows metadata columns. Use `view="list"` to retain
  compact rows. Supply `onUpload` to enable the upload tab; use the upload helpers' stable
  file IDs for progress updates and `applyItemPatch` for custom record shapes.
- **Mention completion:** custom `MentionInlineSuggestions` compositions should connect
  `onDismiss` to `() => mentions.setPickerOpen(false)` when using `useMentions`, so Escape
  dismisses the session without reopening from unchanged caret callbacks.
- **iPhone fields:** the 16px native-field minimum is off by default and only applies to
  iPhones when `UIProvider` enables `forms.preventIPhoneZoom`. Desktop, iPad, and Android
  retain the normal typography. Nested providers can opt out.

The changelog (`node_modules/themelia-ui/CHANGELOG.md`) records the full changes. Check the
generated family reference for each adopted feature before adapting custom compositions.

## Before 1.0

A breaking change before the stable release arrived with a codemod or mechanical migration
instructions: a consumer could apply it by search and replace or by running a script, not
by re-reading their code and deciding.

Every change is classified as one of:

- **additive** — a new export, a new optional prop
- **documentation-only** — no runtime or type change
- **behaviour-preserving internal** — a refactor whose observable behaviour is identical
- **deprecation** — the old name still works, and says what replaces it
- **breaking** — anything else

## Within a stable major

An alias introduced during a stable major is deprecated in that major, documented with its
replacement, and removed only in the next one. It stays for one full stable major unless
security or correctness makes keeping it unsafe.

## Import paths

Layer barrels — `themelia-ui/base` and its siblings — are not public and will not become
public: one specifier pulling an entire layer would also pull every optional peer inside it.

If you are migrating from a broad import, the mapping from old specifier to exact subpath is
in `docs/generated/migration-broad-imports.md` (`node_modules/themelia-ui/docs/generated/migration-broad-imports.md`).

## What is not a compatibility surface

- **Component tokens.** Component-level custom properties are plumbing and may be renamed
  or removed in any release. The global contract listed in
  `src/styles/TOKENS.md` (`node_modules/themelia-ui/src/styles/TOKENS.md`) is the contract.
- **CSS class names.** CSS Modules hashes them. The stable DOM hooks are the
  `{kebab-name}--component` classes and the `data-slot` attributes.

## Verifying an upgrade

After changing versions, type-check and build the consuming application against the installed
package rather than a source alias. Run its unit, interaction, accessibility, and production
bundle checks, then exercise the adopted families across the app's themes and density modes.
You do not need this repository's scripts or source tree.

The focused matrix is in [Verifying a consuming application](verification.md).
