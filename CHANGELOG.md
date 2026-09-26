# Changelog

## 2.0.2 — 2026-09-26

A fix release for two packaging defects, both present since 1.0.3. Nothing in the API changes.

- `themelia-ui/primitives.css` now imports its neighbours relatively (`@import "./core.css"`),
  so it compiles under Tailwind v4. It imported `core.css`, `css/primitives.css` and
  `css/typography.css` bare, which Tailwind v4's resolver reads as package names:
  `@tailwindcss/cli`, `@tailwindcss/postcss` (Next.js with Tailwind) and `@tailwindcss/vite`
  before 4.3 failed with "Can't resolve 'core.css'". Vite, webpack and esbuild on their own
  try a bare import as a file first, so they resolved these imports.
- Core styles now load with every component in bundlers that tree-shake re-export modules.
  Each family entry held the only `import "../core.css"`, and Vite 8, Rspack (Rsbuild) and
  webpack 5 drop such a module in production builds. In those builds, a component imported
  without a stylesheet had no tokens or typefaces, and components imported before
  `style.css`, or before their own family stylesheet as the README's narrow-loading recipe
  does, declared the `components` layer first, so the base reset overrode every component
  rule: a Button rendered with no padding, border or fill, in light and dark. Every chunk
  that carries component styles now imports core itself, and `import "themelia-ui/styles"`,
  which those bundlers dropped entirely, is declared a side effect and imports `core.css`.
- The release gate is stricter. `npm run verify:release` runs every check, then Chromium,
  Firefox and WebKit, on a clean tree, on macOS, because the reviewed screenshot baselines
  are Chromium on macOS. `npm publish` runs it through `prepublishOnly` and now first
  refuses a version npm already has or one without a CHANGELOG heading; a stray `.only`
  fails the gate. New checks reject a shipped `@import` or `url()` that is not relative or
  does not match a file's exact case, and assert the cascade-layer order of four Vite
  consumer builds: family sheets, components alone, components before `style.css`, and the
  `styles` entry.

## 2.0.1 — 2026-09-25

A consistency release: every family now paints each role with one token. Nothing in the
public API changes. If your CSS reads one of the retired colour steps or component
variables, run the codemod from your project, dry first:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
```

- Badges return to the item radius, `--radius-sm`, like buttons and fields beside them. 2.0.0
  gave them half of it, which read as a different family; the Kanban example's count and the
  upload cover chip follow.
- One token per role, across every family. On all 119 component pages, light and dark, at
  rest, hovered, focused, pressed and opened, the same role was painted many ways: 28
  shadows, 62 border colour and width pairs, 48 type combinations, and nine different hover
  fills. Across shape, fill, state, tone, edge, type, elevation, size and dark mode there were
  281 inconsistencies; each is fixed at its owner, and `src/styles/TOKENS.md` now states the
  contract as small groups:
  - **Shape:** `--radius` for wrappers and `--radius-sm` for every item, every control at
    every size included — checkbox, glyph buttons and swatches take the item radius; the
    half radius and Button's 30% cap are gone. A wrapper nested in a Card (Alert, bordered
    Empty, choice and switch cards, upload rows, ContentBlock) steps down to `--radius-sm`.
    Nested corners stay arithmetic on the two; no state sets a radius.
  - **Fills:** grounds are `--background`, `--card`, `--popover` and `--sidebar`; every
    card-like surface sits on `--card`, in dark too (the framed Card no longer lifts itself to
    the popover grey). Neutral fills are `--muted-50` (wells), `--muted-20` (strips) and
    `--foreground-8/-10/-20` (chips, skeletons, tracks). A new `--surface-ground` lets sticky
    cells, rings and fades match the surface they sit on.
  - **States:** hover is `--accent` on controls and `--accent-50` on rows; the current
    navigation item is the neutral `--accent` at medium weight; selection takes the brand
    ladder and outranks hover; one focus ring; disabled is `cursor: not-allowed`; state
    colour changes share `--transition-control` on `--ease-out`.
  - **Tones:** each hue has one ladder — ink, wash (5%), soft (10%), soft hover (20%) and line
    (30%, warning 40%) — used by Badge, Alert, Button tones, mentions, chips, timeline,
    calendar and progress alike, in place of ad-hoc 12, 15, 35 and 45% mixes.
  - **Edges:** `--border` outside, `--border-60` inside, `--control-border` for controls in a
    row with fields, and one invalid edge.
  - **Elevation:** none, `--shadow-xs` resting, `--shadow-sm` hover, `--popover-shadow` for
    every anchored popup, `--shadow-lg` floating, `--shadow-xl` modal.
  - **Type and size:** one weight per role (medium for labels, rows and controls; semibold for
    surface titles and figures), links on `--link-color` and `--link-underline-offset`, control
    heights and paddings in matching pairs, and every derived length rounded to a whole pixel.
  The retired alpha steps, module-local names and glyph sizes are mapped for the codemod; the
  dark `--sidebar-primary` is neutral like light. `verify css` now also flags a `--muted` or
  `--foreground` wash on any state, and a module class that sets a Text's colour, weight, size
  or leading.
- `deriveThemeElevation` derives every tier from the default theme's geometry and
  `--shadow-ink`, scaled so `intensity: 0.8` reproduces the default ladder. It used to emit
  literal black layers in a different shape, so the first Theme Tweaker nudge flattened
  `--shadow-md` and dropped a tinted shadow ink.

## 2.0.0 — 2026-09-25

A major release. It consolidates the visual system and the token surface — two radii, two
text colours, one control height, one spacing ladder — and removes names that were only
another component under a second name. Read
[Upgrading to 2.0](docs/learn/migration.md#upgrading-to-20), then run the packaged codemod
from your project, dry first:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
```

- Merge `--space-scale` into `--density-scale`: one factor moves spacing and control
  geometry, and every density-scaled length is rounded to a whole pixel with `round()`.
  `--density-scale` is now a raw input like `--text-scale` — set on `:root` it reaches every
  scope; before, both factors were re-derived at each boundary, so the documented knob and
  the Theme Tweaker slider did nothing inside a provider. `--density-preset-scale` is gone.
  Controls are 34, 30 and 24px at the default (the small tiers were 30.2 and 22.67px) and
  32, 28 and 23px under `compact`. Navigation-menu triggers take the control height (were
  36px), menubar triggers the small one (were 28px), toast actions the smallest.
- `Textarea` puts `className` and `textarea--component` on the `<textarea>`, like `Input`,
  so a caller can set `resize`; the box is `data-slot="textarea-frame"`.
- Shipped CSS keeps `:dir(rtl)`. Both builds now target the browser floor — Chrome and Edge
  125, Firefox 121, Safari 16.4, set by `round()`, `:has()` and `:dir()` and documented in
  installation. Below it, Vite rewrote every `:dir(rtl)` as a list of right-to-left languages,
  so the carousel, kanban, navigation and both tables ignored `dir="rtl"` in the package,
  though not in source. `verify css-budget` now fails on that rewrite.
- Hashed class names drop `-module`: `button__root___sSlE7`. Hook onto the stable
  `{name}--component` classes, not these. With the token layer joined once and the older
  prefixes gone, `style.css` is 74.4 KB gzip (76.3 KB before); its target moves from 72 to
  74 KiB, with the reason recorded in `architecture/css-budgets.json`.
- One shape per element, and nested shapes concentric. Twenty-two components (accordion
  triggers, tabs and tab panels, table and scroll containers, the carousel track, collapsible
  and upload handles, side-nav items, auth links and others) took a radius only on
  `:focus-visible`, so they were square at rest and on hover and rounded on focus; the radius
  now sits on the base rule. Nested items follow their container's curve — the parent's radius
  less the inset. The batch action bar, the reaction picker and the event calendar's jump
  popover inset by `--space-md` like a menu, so their buttons stay on `--radius-sm`; enclosed
  tabs, attached toggles, media-library segments and gallery controls, input-group buttons, the
  AI chat queue and the metric bar's period button take the parent radius less the inset. The
  30%-of-height cap (7.2, 5.4 and 4.8px corners) is gone: a checkbox and a glyph-sized button
  take half the control radius. `Button` reads `--button-radius`, so a container sets the
  concentric value. The map's place search no longer draws a 16px ring round its 8px field. A
  geometry test forces hover, focus and press on every route and fails a radius that changes
  or a tightly nested item off its container's curve.
- One check runner. `npm run verify` runs every static check in parallel beside the unit
  tests and a single library build, then the checks that read `dist/` — about 50 seconds;
  `npm run verify -- --list` names them and `npm run verify composition bem` runs just those.
  `verify:gates` runs the self-tests (17s, was 35s), `verify:consumer` the packed-package
  checks, and a release builds once instead of twice. `npm test` runs Chromium; `test:engines`
  adds Firefox and WebKit and `test:all` runs every browser. 115 npm scripts are 36. Retired:
  the source-kit parity checks (`verify:button`, `verify:parity`, palette parity), four
  one-time porting scripts, the payload, baseline and base-parity reports, two one-off
  generators, the lint budget (now `oxlint --deny-warnings`) and the unshipped `asChild`
  codemod. `verify composition` catches a hex colour anywhere in a value; it matched only a
  value that began with one.
- Tooling cut by another quarter (15.8k → 11.9k lines, 117 → 84 scripts, 34 npm scripts).
  `verify:release` is a short runner: a clean tree, `verify --all`, then every browser suite,
  failing if the run rewrote a tracked file; the evidence record, criteria report, class-byte
  benchmark and `verify:release-criteria` are gone. Merged: strings-reachable and
  strings-nesting into `strings`, classes into `composition`, tokens-reachable into
  `token-budget`, consumer-documentation into `docs-freshness` and `architecture`; the
  manifest's JSON schema became an `architecture` rule. Removed: token-report and its
  TOKENS.md block, the React matrix (nothing now installs React 19.0.0, the bottom of the peer
  range) and fifteen self-tests of report and documentation tooling.
- Every public part carries its `{name}--component` hook. The hook check skipped components
  exported through `export { X }`, which hid 53 without one — Alert and its parts, Avatar's,
  Command's, DropdownMenu's and ContextMenu's content, items and separators, InputGroup's,
  Item's, Popover's, Label, Skeleton and TooltipContent. Target them from your stylesheets
  like every other hook. The command palette's search field, which showed no focus
  indicator, now firms its edge like a field.
- Faster browser suites: Chromium 12.4 → 4.9 minutes, Firefox and WebKit 24 → 12. The suites
  run against a development-mode build of the docs app served statically — React's warnings
  stay on, but a fresh page loads one bundle instead of ~1,200 dev-server modules, and an
  edit made during a run no longer reaches it. The three specs that import source at runtime
  keep the dev server. That a state never sets a radius moved to `verify css`
  (`state-radius`); the browser test keeps only the nesting geometry and forces :hover on the
  few corner items that need it — 11 seconds, where the sweep took 7 minutes under load.
  Playwright uses 75% of the cores. The long sweeps (focus, axe per theme, reduced motion,
  pointer, RTL mirroring, labels and ids) run as slices of the routes, so no test runs longer
  than about 25 seconds.
- The kit ships its typefaces: Geist for text and Geist Mono for code and identifiers (SIL OFL
  1.1), as variable-weight woff2 files in `dist/fonts/`, one per script, loaded by `core.css`.
  The stacks named Inter and JetBrains Mono without shipping either, so every machine showed
  its own system font and layouts that depended on text width differed between macOS and
  Linux. A theme that sets `--font-sans`/`--font-mono` downloads none of the files. The
  library build keeps fonts as files (it inlines other assets as base64) and the full
  stylesheet stays within budget. Badges, 22px controls, take half the control radius like a
  checkbox (4px, was 8): at the full radius a one-digit count badge was 73% of a circle. The
  upload cover chip, parked in its tile's corner, keeps the control radius, which is concentric
  with that corner; the Kanban example's count sits beside its column title.
- The map draws the kit's focus ring, inset over the tiles. It had none of its own, and the
  browser's default sits outside the map, where the frame around it clipped it away.
- The browser suites are tighter still: all three browsers in about six minutes, where
  Chromium took five and Firefox with WebKit another twelve. Firefox and WebKit run the specs
  where engines differ; token, layout-fault and axe sweeps walk their routes in slices
  instead of reloading a page per route; axe runs in one theme (contrast has its own check in
  both); the foundations spec that repeated the route sweep and axe is gone, and
  its one extra assertion — every example renders — is part of the narrow-viewport sweep.
  `npm test` runs Chromium and the Tailwind fixture, which is its own Playwright project; off
  macOS the pixel specs are skipped rather than failed, and the dev-server specs use port
  5198 so another app on 5173 is never tested in this one's place.
- One CSS checker. `verify css` reads and parses every stylesheet once and runs the eleven
  former checks (composition, factors, token-budget, scoping, wiring, dark-overrides,
  type-pairing, responsive, container-queries, css-collisions, bem) as rule groups — 0.2s
  where the eleven took 1.8s, 951 lines where they took 1,913. Each still runs by name
  (`npm run verify composition`). Checked against the old checkers on 112 injected defects:
  the same rule fires in the same file; ten defects only the new one catches (a `container`
  shorthand, a compound `@container`, a last declaration without `;`, a factor dropped on a
  redeclaration). Its self-test builds temporary fixtures instead of editing source files.
  Tooling is 10.7k lines, from 17.7k before 2.0.
- Comments and consumer docs cut to what a reader needs; the maintainer rulebook moved from
  `docs/learn/` to `docs/maintainers/`.
- Theme Tweaker exports now reach inside a `UIProvider` and follow `data-theme` and the OS
  preference; they wrote `:root`/`.dark` only, so exported semantic and type values stopped at
  the first provider and dark never applied under `colorScheme: "dark"`. `--destructive-accent`
  now flips inside a nested `.dark` (the generated theme left `.dark` off its boundary list).
- DatePicker's trigger is a combobox (`aria-haspopup="dialog"`), like Select's, so a required
  or invalid date field announces it; a button may not carry `aria-required`. DataTable's `sm`
  and `lg` sizes sit on the spacing ladder (8/12/16px; `lg` was denser than the default). Every
  hairline reads `--border-width`/`--border-width-strong`, and `verify composition` rejects a
  literal one. Tabs, table, kanban and carousel measure scroll edges through one shared
  function; the carousel's arrows and index now work in RTL.
- Consistency fixes: phone input keeps Canada when +1 is shared and reads custom
  countries; PillRadioGroup submits its value; chart `nameKey`/`labelKey` read the payload as
  documented; Slot merges classes and handlers; ObjectRepeater keeps row state across reorder;
  the table's scroll arrows work in RTL; toasts centre in RTL; a textarea at `maxLength` shows
  the limit like Input; hard-coded English in date picker, repeater, table, slider, search and
  upload moved into their strings; CarouselDots get the hit area; `AsideNavShell` without a
  title keeps main and aside on one row; dialogs inset like sheets on phones; warning text uses
  the warning ink; hairlines read `--border-width`; duplicate and dead rules removed. Popover's
  unwired `onOpenAutoFocus`/`onInteractOutside`, `CommandStrings.empty` and
  `durations.slow` are removed.
- Remove `RANGE_PRESETS`, deprecated in 1.x with removal promised at 2.0. Build presets with
  `createRangePresets({ strings, weekStartsOn })` from the provider's week, so "This week"
  agrees with the calendar beside it; the preview recipe does.
- Tighten the assistant skill and consumer scripts. The skill gains an upgrade path
  (codemod, then reinstall the skill), `UIRoot`'s `documentTarget` caveat, the dark-menu
  default, and Base UI state attributes in place of `data-state`; its link to the full 2.0
  change list pointed at itself and now opens the packaged migration reference. A family
  used only together with another says so — the menubar's reference and index record name
  `base/dropdown-menu` and its stylesheet — and a declaration's `@deprecated` tag prints in
  its reference. The codemod carries a moved family's stylesheet import with it and names the
  migration document by its installed path. The skill generator clears its reference folder,
  which removes three stale reference files that still taught `--radius-surface`, and
  `verify docs-freshness` rejects any removed token outside a migration guide.
- Let Tailwind's `rounded-sm` and `font-*` follow a theme again. 2.0 made `--radius-sm` a
  literal, and the bridge's `@theme inline` froze it into the utility as `0.5rem`, so a theme,
  `UIConfig.theme.radiusSm` or `typography.fonts` moved every kit component and left the
  utilities behind. Restated literals now sit in a plain `@theme` and their utilities read the
  variable at the element; Tailwind's preflight font follows `--font-sans` with them. Formulas
  and kit references stay inline. `verify consumer-scripts` compiles the bridge with
  Tailwind and checks both, and that what it emits to `:root` is the kit's own value.
- Ship the codemod. `node node_modules/themelia-ui/scripts/consumer/codemod.mjs [--dry-run]
  <paths…>` runs from a consumer's project; `npm run codemod` was a repository script that
  read files the package does not publish. Beyond moved and broad imports it now renames the
  67 custom properties 1.0.4 declared and 2.0 does not, wherever a stylesheet reads or sets
  them or a script reads them through `var()`, a style key or the CSSOM, and the Tailwind
  utilities the bridge no longer emits. It reports, without editing, a token removed with no
  successor, an override that now sets a shared name, and `rounded-lg` and larger. Twelve of
  those removals had no migration record; `verify migrations` now checks every name in
  `architecture/token-surface.json` is declared or mapped, every mapping lands on a declared
  token, and no mapping renames a live one.
- Put every package spacing on the ladder. About two dozen values sat between two steps —
  10, 14, 18 and 20px. Table cells are 12px (rows 4px taller), aside navigation rows take the
  sidebar's 8px inset, toggles and pill radios the control inset, Item rows 12px, and the
  accordion, alert, toast, chart tooltip and calendar gaps the nearest step their peers use.
  A select's group label sat 2px left of its rows and now shares their inset; a nested
  sidebar menu's rule and labels are derived from the parent row, which left a child label a
  pixel off. `--table-cell-py`, `--aside-nav-px`, `--auth-brand-gap`, `--repeater-gap`,
  `--calendar-months-gap` and `--skeleton-block-gap` are removed, and `verify composition`
  rejects a spacing token declared between two steps.
- Let the provider decide the menu colour scheme. `UIConfig.overlay.darkMenus` (default
  `true`) keeps dropdown, context, action and menubar menus dark on a light page; `false`
  lets them follow the scheme they are portalled into, and a nested `UIScope` can set it
  either way. `useOverlayConfig()` reads the resolved overlay slice, which now merges per
  field, so a scope setting `backdropBlur` no longer drops its parent's other overlay
  settings. The Theme Tweaker's provider settings gain a "Dark menus" toggle.
- Calm the shared field surface with flatter idle controls, quieter borders, and a precise
  two-pixel focus treatment. Keep keyboard focus visibly painted on clipped scroll areas,
  tabs, and tab panels. Give overlay headers a small optical top inset and keep their close
  controls aligned with the adjusted title block.
- Make `DataView` the clearly presented full resource-index composition over `DataTable`,
  remove demo-only controls from its primary example, and make the add-filter affordance
  icon-only by default with a tooltip and accessible name. `FiltersButton.labelVisibility`
  restores the labelled presentation where it is useful as a standalone action.
- Recompose comments as full-width discussion rows, tighten rich activity feeds, refine the
  Global Search region rhythm, and bring AI Chat geometry onto shared size, spacing, border,
  and radius roles. Rebuild the Media Library toolbar as explicit search/type and
  refine/view bands so it keeps a legible hierarchy at desktop and compact widths. Tighten
  the shared floating batch-action dock with popup-radius corners, compact insets, restrained
  elevation, aligned dividers, and quieter ghost actions in the recommended examples.
- Keep explicit dark themes intact across nested token boundaries. A `Scope`, a
  `data-density` region, or a provider left on the default `system` colour scheme inside a
  `.dark` or `data-theme="dark"` tree now re-derives dark values instead of reverting to
  light. CSS Modules now spell their theme classes `:global(.light)` and `:global(.dark)`,
  so class-only dark islands such as inverted menus re-derive module tokens, and
  `verify dark-overrides` rejects the hashed form. The theming guide now shows which names
  take effect at `:root` and which need the provider or the boundary list.
- Let a pager's `renderLink` element become the control so router links keep the button's
  geometry, open a date picker on its selected month rather than today, give the input and
  textarea clear controls a 24px target, floor mention chips at the smallest type step so a
  name in small print stays readable, and let a kanban board scroll horizontally when its
  columns are wider than their container instead of being clipped.
- Quieten the Global Search chrome: focus on the search row is the rule beneath it rather
  than a ring around the whole row, group labels and idle headings take the support step in
  the muted colour so result titles lead, "See all" is a text button instead of an underlined
  link, and tab counts are tabular figures rather than bordered badges.
- Base component interaction. Popups opened inside a dialog (select, combobox,
  popover menu, date picker) now portal into the dialog and are operable; the popover menu
  moves by arrow keys and a combobox can put its search field inside the popup
  (`ComboboxPopupInput`). The calendar is one tab stop with PageUp/PageDown, Home/End and
  Shift paging; time segments are spinbuttons that clamp, snap and wrap; the pill radio group
  roves with the arrow keys. A loading `Button` keeps focus (`aria-disabled` rather than
  `disabled`), and `SubmitStateButton` shows its busy and done states in its visible label.
  Toasts pause on hover and focus, dismiss with Escape and return focus.
- Forms. `DecimalInput` reads a pasted "€1,234.50" as a number, steps an off-grid value to
  the nearest step in that direction, disables the stepper at `min`/`max`, and keeps focus in
  the field when a stepper is clicked. `ErrorSummary` is named by its heading, takes
  `autoFocus` to receive focus after a failed submit, and styles linked items.
  `FormField` groups (`htmlFor={false}`) and `FieldGroup` describe themselves with their hint.
  `PasswordInput`'s reveal control no longer reports two states at once and forwards input
  strings. `LocalizedStringField` takes the field's label and hint and names its input with
  the locale; `LocalizedObjectField` gives each field a visible label. `ColorInput` names
  each swatch by its field, shows an unpaintable value as an empty swatch and marks it
  invalid once editing stops. File and image uploads put `aria-invalid` and the field's hint
  on the input, name the picker by its field, accept the same file again after removal, and
  move focus to the next row when a file is removed; the upload list offers retry and remove
  on a failed row and announces transfers that finish. Textarea `rows`, `minRows` and
  `maxRows` now size from the real padding.
- Display and navigation. A `Table` is a tab stop only while it scrolls, and is then a
  region named by its caption, its `aria-label`, or the new `containerLabel`; wide tables
  fade the edge that has more columns. End-aligned sortable headers line up with their
  values, the sticky header uses the card surface, the selected row uses the DataTable's
  colour above hover, and header, footer and empty rows no longer hover. A `CardFooter`
  passed as a child renders as the card's footer. Item rows use the control radius and hover
  whatever element they render as. `MetadataList` no longer resets a surrounding density
  scope. Carousel and overflow tab bar fades are masks, correct in dark, on cards and in
  right-to-left; the carousel honours reduced motion. `OverflowTabBar` is one tab stop with
  arrow-key movement and matches `Tabs`' type and icon size; tabs reveal a selected tab clear
  of the fade; the enclosed tab variant is raised in dark. Pagination stays on one row at
  phone width. `SidebarMenuButton` takes a `tooltip` for the collapsed icon rail, and ⌘B
  toggles only the sidebar around the focus. Sheets pad for the device safe area.
- `Text numeric` keeps the text's own typeface (tabular figures only); the monospace stack
  gains the platform monospace faces before the generic fallback. The undocumented
  `--field-py` token is removed; fields read `--space-xs`.
- Consolidate near-duplicate components without changing their public names. `SwitchCard`
  is now `ToggleField` with `surface="card"` (ToggleField gains `surface`, `icon`, `hint`
  and `uncheckedValue`); `CardRadioGroup` and `ListRadioGroup` are one option group laid out
  two ways, and the list now marks its options invalid; `FileUpload` renders `Dropzone`
  (which gains `label`, `hint` and a caller's input id) instead of a copy of it, and so
  shows the drop prompt; `ActionDialog`, `ActionSheet` and `ConfirmDialog` share one frame,
  and the actions outlet renders them instead of rebuilding their footer; `ResourceCombobox`
  runs on `useSuggestions` (now homed in `features/combobox`); primitives `Link` renders
  `TextLink`. `CellValue` hands money
  strings to `Money` instead of `Number()` and honours `dateLocale`. The event calendar's
  previous/next pair is a `ButtonGroup`, so the focused button's ring is no longer clipped.
- Merge catalogue pages that showed the same components twice. Input absorbs Search input and
  Password input; Switch absorbs Toggle field; Radio groups absorbs the card, list and pill
  pages; Dropdown menu absorbs Context menu; Metadata absorbs Inline stat; Dialog absorbs
  Alert dialog (whose demo now answers with `AlertDialogAction` and whose API no longer
  lists a close button it cannot show); Action menu absorbs Action buttons; Side nav absorbs
  Settings shell; Upload absorbs Image upload and Upload queue; the twenty primitive pages
  become eight. Every retired address redirects to the page that absorbed it, and
  `ComponentPage` takes `alsoImports`, so a merged page still yields a gallery card and a
  search result for each family it documents.
- Replace the sidebar's current-page bar, an inset shadow that curled round the row's corners,
  with a lifted row: hover is half the accent, the current page the whole accent with a
  small shadow and medium weight.
- One action shape for everything that acts on a record. `ContextAction<T>` is an
  `ActionDefinition` whose handler and `visible`/`disabled` predicates take the record, with
  a `placement` that pins it inline or sends it to the overflow menu;
  `resolveContextActions` binds a set to one record and `splitActions` divides it. Table row
  actions, kanban card actions, activity actions and `PageActions` all resolve through it, so
  a predicate or a placement means the same thing in each.
- `OverflowTabBar` is `Tabs` underneath, and a bar of links is `NavigationTabs`: links are a
  `<nav>` with `aria-current="page"` rather than tabs that navigate. A bar with nothing
  selected, such as saved views showing a custom view, still has a tab stop. Its filled-chip
  look is now `TabList variant="pill"` (and `NavigationTabs variant="pill"`), open to any
  tab list. An inline `Command` no longer scrolls the page down to itself when it highlights
  its first row; it scrolls its own list only.
- The select and async filter editors are one editor on `PopoverMenuPanel`, the body of
  `PopoverMenu` exported for surfaces that bring their own popup. `PopoverMenu` gains
  `error`, `onRetry`, `minSearchLength` and `label`; a throwing `onValueChange` now reaches
  `onError` from every commit path. Without a search field the list is the tab stop, a named
  listbox that announces the highlighted row, so a filter pill's options work from the
  keyboard and a screen reader.
- Base `Stepper` draws a numbered sequence as a `bar` or a `trail`; `StepsBar` and
  `BreadcrumbProgress` render it. The current step carries `aria-current="step"`, a finished
  step says so, and narrow trails hide labels visually rather than removing them. The
  `--steps-line` and `--steps-item-min` tokens are now `--stepper-line` and
  `--stepper-item-min`.
- `AuthCard` is a `Card`, and `WorkspaceRecordHeader` is a `PageHeading`. `Card` gains
  `titleLevel`, which renders the title as a heading, and `media`, a full-bleed strip above
  the header. A compact inline `MetadataList` keeps each value at its label's size instead of
  a step smaller.
- `NavigationTabs` no longer imports the layout layer (its path helpers live in
  `@/lib/navigation`), and `verify architecture` now rejects an import of a whole layer's
  barrel. Preset date pickers forward `ref` to their trigger.
- Popup rows sit concentric in their surface. `--radius-inner` is now the popup radius less
  the popup inset, so a highlighted row in a dropdown, select, combobox, command list or
  popover menu follows the menu's corner at every radius preset instead of a fixed fraction
  of `--radius` that only lined up at one of them.
- The menubar is the quiet strip its own documentation described: one rule underneath and no
  outlined frame or inset around the triggers. The indeterminate progress band now crosses
  the whole track, off-edge to off-edge, in both directions; it used to stop 80% across and
  snap back. An inline `BatchActionBar` shares the floating dock's geometry — popup radius,
  compact inset, the same action rhythm — and differs only in being flat and in flow.
- Global search reads as one structure: every fact on a result's second line is the same
  size (the subtitle ran a step larger than the facts beside it), a status badge sits on that
  line without making its row taller, amounts end on the same edge as "See all", group
  headings share the rows' inset, and the tab strip is a slim band under the field rather
  than a second header of the same height.
- The combobox family runs on one engine. `ResourceCombobox` and `SuggestionsCombobox` are
  presets of one self-fetching picker and `AsyncCombobox` / `AsyncMultiCombobox` share its
  wiring; `SuggestionsCombobox` and `useSuggestions` now live in `features/combobox`. Drift
  between the copies is resolved: a field with no preload says "Type to
  search…" rather than "No results found.", a query waiting on the debounce shows "Searching…",
  an error belongs to the query that failed, a disabled picker no longer fetches, each chip's
  remove control names its value, and picker rows match the base combobox rows. Additive
  options: `ResourceCombobox` gains controlled search, `defaultOpen`, `clearSearchOnClose` and
  `requestDelay`; `SuggestionsCombobox` gains form props, `portalContainer` and
  `highlightMatch`; `ComboboxInputTrigger` and `ComboboxChip` take `strings`.
- Comments read as a social thread: each comment is a bubble beside its avatar with the
  author, a relative `<time>` and "edited" in its header; replies hang off a thread line with
  "Show N replies" and "Show N earlier replies" expanders; long bodies fold behind "See more";
  attachments past the first few fold behind "Show N more"; reactions, Reply and the overflow
  menu sit in one quiet row. Reply opens a composer inside the thread and editing happens in
  place, each with its own draft, and focus returns when either closes. New optional
  `CommentThreadOptions` — `commentActions`, `maxVisibleReplies`, `clampLines`,
  `maxVisibleAttachments`, `reactionChoices` — on `Comments`, `CommentTimeline` and
  `CommentItem`; new `CommentsStrings` keys are optional in the type.
- Catalogue: Overlay is the one page for overlays, and Dialog, AlertDialog and Sheet are
  presented as its presets; Data view and Data table are one page; Async combobox is part of
  the Combobox page. `/dialog`, `/sheet`, `/data-table` and `/async-combobox` redirect.
- **Breaking (2.0):** names that were only another kit component under a second name are
  removed, along with the entry point that only re-exported another. Dialog, sheet and alert
  dialog keep the parts that set something (`DialogContent`, `SheetContent`, and the alert
  dialog's content, media and answers); `Dialog`/`Sheet`/`AlertDialog`, their `Trigger`,
  `Body`, `Title`, `Description`, `Header` and `Footer`, `DialogClose`, `SheetClose` and
  `DialogDismissArea` become the `Overlay` parts they always were — the header and footer
  parts only added a class no stylesheet read. The action overlays' shared frame draws
  Overlay's header, body and footer itself. A menubar's menus are `DropdownMenu` and its parts
  around `MenubarTrigger`: `MenubarMenu` is `DropdownMenu`, and `MenubarContent`,
  `MenubarItem` and the other eleven `Menubar*` parts are the `DropdownMenu*` part of the
  same suffix (`MenubarPortal` is `DropdownMenuPortal`).
  `SettingsShell` is `AsideNavShell`, `ToggleGroupItem` is `Toggle`, and the `DialogProps`,
  `SettingsShellProps` and `ToggleGroupItemProps` types are `OverlayRootProps`,
  `AsideNavShellProps` and `ToggleProps`. `themelia-ui/features/suggestions` and its
  stylesheet are no longer published; import the same names from
  `themelia-ui/features/combobox` (the codemod rewrites the specifier and its stylesheet).
- One edge for every control that sits beside another. Fields, selects, comboboxes, date
  pickers, popover triggers, filter pills, neutral and secondary outline buttons, the
  header's search trigger and the rich-text editor frame all draw `--control-border`, now
  30% foreground (was 40% on fields, 35% on outline buttons and the bare `--border` on filter
  pills) — lighter than the old field edge and darker than the old pill edge. The idle edge
  measures 2.4:1 on the light canvas, a deliberate calm below WCAG 1.4.11's 3:1; hover
  (4.5:1), focus (4.3:1) and invalid edges still clear it, and the token test holds the idle
  edge to its own 2.3:1 floor.
- A command row that is not checked no longer reserves its hidden check mark, so a trailing
  caption in a `CommandItem` sits at the row's end instead of midway along it.
- Catalogue navigation: twelve task-shaped groups, each showing how many pages it holds,
  with labelled sections inside the long ones (Forms › Text, Choice, Numbers…; Data display ›
  Collections, Content…; Features and Blocks by task). Navigation, Feedback & status and
  Overlays & menus are groups of their own; Batch action bar and Copyable moved to Actions,
  Scroll area to Foundations. The page breadcrumb and search results name the section too.
  The "Menubar, hover card & co." page is seven pages, one per family and each on its own
  import path: Menubar, Navigation menu, Hover card, Resizable panels, One-time code input,
  Aspect ratio and Keyboard key.
- **Breaking (2.0):** a navigation menu has one panel. Every `NavigationMenuContent` built
  its own portal and popup, so moving between entries swapped surfaces instead of resizing
  one, and each idle entry painted a dot (a 0x0 popup's ring shadow). `NavigationMenu` now
  owns the shared panel and each content block is drawn into it; `side`, `sideOffset` and
  `container` move from `NavigationMenuContent` to `NavigationMenu`, which also takes `align`
  (default `"start"`, so the panel lines up with its entry instead of centring). Panel links
  sit one per row. `NavigationMenuIndicator` draws a chevron that turns while its panel is
  open (it drew nothing without children).
- **Breaking (2.0):** two text colours. Text is `--foreground` or `--muted-foreground`;
  `Text type="secondary"` resolves to `--muted-foreground`, and the `discrete` type, the
  `--text-role-discrete` token and `--foreground-80` are gone. Heading subtitles, navigation
  links, avatar initials and empty-state icons that painted a third or fourth grey read the
  same muted colour as every other supporting line.
- **Breaking (2.0):** two radii, both plain values set once at `:root`: `--radius` (1rem)
  for containers and `--radius-sm` (0.5rem) for everything inside or small — inputs,
  buttons, rows, chips, badges, tooltips. Nothing derives one from the other; they are
  complementary, so a container of `--radius-sm` items insets them by the difference
  (`--space-md`) and a row sits concentric in its menu. `--radius-surface`,
  `--radius-popup`, `--radius-control`, `--radius-inner` and the `-md` to `-4xl` ladder are
  removed (296 uses renamed; the Tailwind bridge and composition gate follow). New
  `UIConfig.theme.radiusSm` beside `radius`; the ThemeTweaker edits both.
- **Breaking (2.0):** one name per value. `--menu-surface-p`, `--menu-row-px`, `--field-h`,
  `--field-px`, `--text-xxs` and the heading, label and link colour roles restated another
  token under a second name and are removed (popups inset by `--space-md`; headings and
  labels paint `--text-role-main`, subtitles `--text-role-secondary`, links
  `--link-color`). Buttons and fields share one height: `--height-action` merges into
  `--height-control`, and the `--action`, `--action-sm` and `--action-2xs` ladder into
  `--control-h`, `--control-h-sm` and `--control-h-2xs`.
- One name per role, continued. The sidebar width had four names (`--shell-sidebar-width`,
  the app shell's and the workspace's copies, and Sidebar's own) and the shells restated
  16rem, so the theme knob moved no shell: it is `--sidebar-width` now, for Sidebar and
  every shell. The header height knob was 4.5rem while the shell hard-coded 3.5rem; the
  knob is 3.5rem, drives every top bar through `--shell-header-h`, and the media library's
  scroll offset reads it. The medallion is `--size-medallion` (it was restated four times),
  the switch track is `--choice-size`, the dropdown menu uses `--popover-shadow`, the two
  sidebar action sizes are one, menu and list rows share `--row-px`, and the button,
  toast, sidebar and accordion read the kit's steps instead of renaming them. A dead
  `--badge-destructive-bg` and its two dark overrides are gone.
- Contrast and shape fixes. The dark `--accent` steps down to a new neutral-750, so muted
  text and toned badges on a selected row or active tab stay above 4.5:1. Avatar initials
  take the main ink. `--destructive-accent` joins the other tone accents for destructive
  text on a destructive tint (Badge and the analytics deltas read it). Small controls cap
  their corner at 30% of their height, so an 18px checkbox is no longer a circle and a 20px
  icon button no longer a near-circle; full-size controls are unaffected at every corner
  preset. Submenus clear their parent again, the AI-chat queue mirrors under RTL, the
  activity heatmap's weekday labels are no longer clipped, and a batch action bar docked
  inside a panel fits it on a phone.
- Hardening. The token gate no longer lets a bare alias hide behind a test that names
  it or behind a family prefix. The composition gate now fails a hover, selection or open
  state filled from the `--muted` family, text painted in an alpha step of the two text
  colours, and an empty rule. The geometry suite fails a small square that nearly closes
  into a circle and caps corners at the roundest preset instead of a stale 14px, and a new
  sweep fails any text clipped at its start edge, at desktop and phone widths. A calendar's
  disabled day, the breadcrumb separator and a disabled workspace step use the two text
  colours; a secondary mention chip lifts on hover instead of fading. Item's image media and
  a file row's thumbnail share the medallion size; the header's inset is `--space-xl`. Hover
  cards and the header's tool popup cap at the positioner's available width, and toasts at
  their containing block, so all three fit inside a scoped portal host. The AI chat's step
  connector mirrors under RTL. Thirty-five CSS rules that no component applied are gone,
  along with five scope blocks the token merges had emptied. Thirty-eight literal component
  tokens that were restated at every scope boundary are declared once at `:root`, so an
  override set on a wrapper is no longer reset by the next nested scope — and DevTools no
  longer lists a struck-through copy per boundary.
- One hover language. Neutral hover and selection fills had six values (`--muted`, three
  `--muted-*` steps, `--accent`, `--muted-40` most of all), and every `--muted` one went
  darker than a dark card — a hole, not a lift. Controls, popup cursors and
  selected/current/open states take `--accent`; hover over page rows and large surfaces takes
  `--accent-50` (added to the alpha ladder). The header search, drawn as a field, hovers like
  one. Calendar chips deepen their own tone on hover instead of turning grey.
- Fields focus the way they fail: the edge firms to the focus colour and a soft 22% halo
  (`--field-focus-ring`) sits round it, instead of a solid ring welded to the border. Applied
  to every field, shell, input group, OTP slot and colour picker.
- Buttons no longer scale on press; the label jumped and joined groups and overlay footers
  opened gaps between neighbours.
- Overlays move better: the dialog enters over 200ms from 97% with a slight rise and leaves
  in 150ms; sheets slide their full width out of their edge; the scrim fades with the
  surface. New `UIProvider config.overlay.backdropBlur` (px or CSS length, default none)
  blurs the page behind a modal overlay. An overlay with no body draws one rule between its
  header and footer, not two.
- Cards are framed by default: a bezel of `--muted-50` round a content plate whose corner is
  `--radius-sm` inside the frame's `--radius`, with media, footer and primary action
  following the inner corner.
- `DateBlock` is a calendar leaf — the month as a band across the top, the day under it,
  then weekday, year and time — on the small radius, and it has its own catalogue page.
  Inline it is a phrase at the size of its line. Metadata list and Inline stat are separate
  pages.
- `TableSkeleton` reads as a table: the table's edge (`framed`, default on), a wide first
  column, a right-aligned last one, ragged row measures and short head labels. `PageSkeleton`
  is PageHeader's row over card-shaped panels, and `TwoColumnPageSkeleton` a record beside
  its owner and facts; title bars are glyph height rather than a line-box pill.
- `ScrollArea`'s styled scrollbar now runs in Chromium (the standard `scrollbar-*` pair had
  switched it off): the thumb is inset from the edge, stops short of rounded corners and is
  findable against a white card. Firefox keeps the thin standard bar.
- One match highlight. `<mark>` is styled once in the base layer — an amber wash under full
  ink, square-ended, with no shift in the text — replacing three different treatments in
  global search, the combobox and rich text. Global search marks every occurrence.
- Timeline dots are opaque, so the connector no longer shows through tinted markers.
- `PreviewTriggerCell`'s hover ground is an even inset paid back by its margins (rows are
  no taller than plain ones), and its caret sits on the value's line.
- `MetadataList` compact density tightens gaps only; values no longer drop to 12px under
  14px labels, and a custom `render` sits in the value's box so it takes the value's size.
- The pending badge dot is a thin ring rather than a bold "o"; neutral `IconBadge` uses the
  avatar fallback's disc so two medallions in one list match; mention chips take the line's
  size and the badge corner.
- A repeater nested inside another no longer takes its parent's handle indent or carded
  row inset on its footer.
- AI chat, comments, media library, event calendar, product variants and analytics polish:
  one fill per surface, chip heights and borders unified, supporting text on the two
  colours, aligned glyphs, and narrow-width layouts fixed.

## 1.0.4 — 2026-09-22

- Restore the small shared spacing step between primary and secondary lines in Item,
  media list rows, filter options, async preview cells, and place results. Product,
  commerce, credential, and other compact identities now stay visually paired without
  their two text rows touching.
- Refine feature and block surface hierarchy so ledgers, activity details, comparison
  summaries, upload rows, transcript tools, attachments, and other nested regions use the
  tighter inner radius while genuine cards and shells retain the structural radius. This
  removes repeated card silhouettes without changing the established typography roles.
- Rebalance the shared corner system around a 12px default surface and a 14px rounded
  preset, with visibly tighter control and nested-element roles. Inputs, buttons, menus,
  cards, preview frames, and composite controls now preserve that hierarchy instead of
  drifting toward accidental pills. Existing saved 16px preview preferences migrate to
  the new rounded preset.
- Separate compact floating surfaces from structural panels with a shared popup-radius
  role. Menus, submenus, listboxes, popovers, tooltips, chart tooltips, mention pickers,
  and map popups now stay tighter than cards and dialogs; nested menus also keep a clear
  four-pixel gap instead of merging into one rounded silhouette. Correct remaining role
  bypasses in command fields, enclosed tabs, color inputs, and unlayered map chrome.
- Give browser selection, editing carets, range tracks, progress tracks, and avatar
  fallbacks deliberate theme-aware colors. These small foundation surfaces now retain
  their shape and contrast on both light and dark backgrounds instead of blending into
  nearby cards or falling back to browser-default blue.
- Replace the raised Preview/Code pills in documentation examples with a quieter underline
  treatment and expose their pressed state to assistive technology.
- Replace the duplicate and non-monotonic shadow values with eight distinct key-plus-ambient
  elevation tiers, from compact controls through exceptional overlays.
- `CardPrimaryAction`: whole-card links now respond on hover-capable devices with a treatment
  appropriate to their surface—border and lift for bordered cards, stronger elevation for
  framed cards, and a quiet background for flat cards—without covering nested controls.
- Keep the full component-search label visible in the mobile preview header by giving search
  sole ownership of the flexible space and hiding the desktop keyboard hint at that width.
- `AppSidebar`: a parent entry without an `href` now opens and closes on click, with
  `aria-expanded` on the row. The first frame is still derived from the current URL, so a
  nested route arrives with its group open, and a navigation returns every group to that
  derived state. `SidebarItemContext` gains an optional `toggle` for custom rows.
- `PageHeading` / `PageHeader`: when the headline row holds actions, the description
  sits a medium step below it instead of four pixels under the buttons.
- The optional peer range for `react-leaflet-markercluster` is `^5.0.0-rc.0`, the only
  published 5.x; `^5.0.0` excluded it and made `npm install` fail for any consumer of
  `features/map`.

## 1.0.3 — 2026-09-17

Unifies component spacing and typography, polishes commerce and catalogue workflows,
and adds live app theming with accessible, configurable tab overflow controls.

- Add opt-in `TabList.edgeFade` for soft overflow edges that follow scroll position and
  text direction. Enable it on the Theme Tweaker category tabs.

- Add automatic overflow arrows to the shared TabList, using ScrollArea for touch and
  trackpad scrolling. Reveal selected tabs without scrolling the page, support RTL and
  reduced motion, and remove scroll controls when the row fits.

- Integrate Theme Tweaker as a live app tool, available from a floating launcher on every route
  with compact appearance controls, advanced values, and a full-page workspace. Share
  theme and provider settings across the app,
  persist valid edits in browser storage, and provide reset and export controls.
  Use shared ScrollArea, tabs, form typography, and icon sizing, with fixed panel controls.
  Restore the overlay sizing API so sheets honor named and custom cross-axis sizes.

- Align all block and feature families on shared composition and typography. Route group
  labels through DisplayLabel, facts through MetadataList, and primary text through provider
  defaults. Remove local font and opacity overrides; fix narrow product rows, inline facts,
  admin action headers, and API reference tables. Add source guardrails and browser checks
  for canonical typography, consumer overrides, and desktop/mobile layouts in every density.

- Remove commerce-specific overrides of metadata labels, item descriptions, and ledger
  total sizes. Commerce blocks now use the canonical component typography directly;
  browser regression checks compare their rendered styles with MetadataList and Item.

- Refine commerce summaries with unified financial ledgers, aligned order and refund
  metadata, and a compact shipment timeline that follows the latest reached event.
  Keep prices beside their content on narrow screens and use compact rounded booking
  date tiles with appointment times beside the service. Skip obsolete or terminal
  next steps in order summaries.

- Consolidate Card, ContentBlock, and overlay spacing around the shared surface X/Y
  controls while retaining explicit local inset overrides. Reuse Stack for surface
  headers and footers and MetadataList for activity changes. Let metadata labels wrap
  and dark scopes inherit custom fonts. Remove the unused activity rail variable and
  move GlobalSearch radius and placement onto shared tokens.

- Restructure catalogue blocks with compact SEO checks, grouped inventory fields and
  stock summaries, clearer supplier profiles, and consistent booking typography. Keep
  stock toggles readable on phones, make records read-only without a change handler,
  and add responsive previews with working search-appearance editing.

- Polish commerce blocks with responsive invoice lists and shipment journeys, readable
  stock quantities, clearer monetary labels, stronger loyalty balances, and ruled booking
  rows. Normalize loyalty movement signs, recover failed cart thumbnails, and prevent
  code submission/removal while pending. Make the commerce previews responsive and
  interactive. Keep AdaptiveGrid columns inside narrow containers and make StepsBar
  keyboard-scrollable.

- Clarify activity structure with divided date groups, quieter timeline rails, a visible
  details control, and separate changes/context/related-record sections. Align before/after
  values in a semantic description list and keep actions after the information they act on.

- Reshape comments into compact conversation bubbles with inline reply/reaction controls,
  a shared moderation menu, and connected replies that stay readable in narrow panels.
  Expose reply expansion and reaction state to assistive technology, and retain deeper
  replies. Preserve paragraph and list structure when rendering live mentions.

- Recompose GlobalSearch with shared Item, Badge, ScrollArea, and loading components;
  unify media, wrap context and tags, simplify match highlights, and keep amounts readable
  on narrow screens. Correct grouped keyboard order, async selection, IME handling,
  result scrolling, group counts, thumbnail images, and dialog selection dismissal.

- Harmonize Card, ContentBlock, and Overlay header typography and small title/description
  gaps. Give overlay headers and footers a little more vertical padding.

- Remove empty icon columns from iconless ActionMenu rows and apply ellipsis to long
  labels in fixed-width menus, including checkbox and link actions.

- Center toolbar separators at icon height and simplify the formatting preview, removing
  empty card padding, narrowing its font-size field, and repairing its API navigation link.
- Keep the Header preview's sticky backdrop inside its rounded frame so the top borders
  follow the same corner radius as the bottom borders.
- Align PageHeading and PageHeader title icons to the first title baseline, including
  narrow layouts where badges or actions wrap.
- Keep Item label/value pairs compact with tight line heights and no added inter-line gap,
  including nested filter values.

## 1.0.2 — 2026-09-16

Improves mobile data workflows, activity and mention presentation, media management,
async interactions, layouts, and foundational controls.

### Upgrade notes

Review the [1.0.2 migration guide](docs/learn/migration.md#upgrading-to-102) for the
TipTap peer requirements, Slider wrapper types, decimal Money strings, mobile filter
presentation, and opt-in iPhone field sizing.

### Mobile filters, activity, and mentions

- Move mobile DataView and FilterLayout controls into a 90%-width sheet, with saved-view
  selection, per-filter clearing, staged editors, focus restoration, and usable nested
  menus/calendars. Set `mobilePresentation="inline"` to retain an inline mobile layout.
- Simplify activity headlines and separate timestamps/source labels from row actions.
  Resource facts expand with the event details. Narrow comment cards give messages the full
  content width and keep their actions visible below the message.
- Align mention suggestions with compact menu geometry and shared Item/Command rows.
  Support Arrow/Enter selection without moving the editor caret, dismiss with Escape,
  and prevent unchanged caret callbacks from reopening a dismissed query.

### Base controls and primitives

- Harden base fields: disable clear/reveal/step/prefix actions with their fields, preserve
  intermediate numeric entry, and support ArrowUp/ArrowDown stepping. Keep standard buttons
  stationary when pressed. FormField labels now reach composite controls through `aria-labelledby`.
- Keep uncontrolled slider readouts and submitted values current. Slider callbacks now infer
  scalar/range payloads; explicitly typed wrappers may need a generic parameter (see migration guide).
- Preserve rejected pasted tags, split typed entries by their delimiter, honor IME composition,
  and keep keyboard removal available at the tag limit. Omit disabled tags from form data.
- Correct primitive empty/non-finite states, DMS rounding, fractional-byte units, custom date-range
  patterns and same-day collapse. Preserve canonical decimal monetary strings and reject malformed amounts.

### Overlays, async controls, and forms

- Cap centered dialogs at 90% of the viewport so narrow screens retain visible side margins.
- Size overlay close icons to the shared interface icon scale while preserving a larger click target.
- Protect pending action overlays against duplicate confirmations, cancellation, and stale
  completions; label confirmations and sheets for assistive technology and keep non-modal
  sheets above sticky page chrome. Honor non-modal Escape dismissal, including nested-control
  consumption, and remove empty dialog body bands.
- Honor externally controlled combobox opening and dismissal, preserve multi-select drafts
  across result changes, compare selections by key, and link errors to their fields.
- Reuse Async Preview hover requests, cancel on close or record change, recover under Strict
  Mode, respect cache expiry, and give popovers accessible names and consistent state layouts.
- Schema Form now owns pending async submissions, prevents duplicate saves, preserves values
  after errors, and focuses schema validation failures. Invalid JSON blocks submission and
  reset clears its draft/error; disabled fields no longer block schema validation. Customize
  failed-save feedback with the optional `strings.submitError` key.

### Media Library and field typography

- Add Media Library grid, list, metadata table, and reusable selection-bar parts. Improve
  card selection markers, document placeholders, keyboard detail focus, and narrow layouts.
- Retain detail drafts after failed saves and keep assets visible during deletes. Preserve
  selected records across remote searches; support consumer-owned patches with `applyItemPatch`.
- Expose stable staged file IDs through upload helpers, guard duplicate starts, retain failed
  files for retry, and ignore cancelled or completed upload callbacks. Upload requires a handler.
- Keep shared field typography consistent at every width. Opt into a 16px native-field minimum
  on iPhones using `UIProvider config={{ forms: { preventIPhoneZoom: true } }}`; default off.

### Data and editor state handling

- Unify saved-view tabs and selects, including operator defaults, custom selections and
  ordered ranges. Make pending filters unavailable to keyboard and pointer input,
  announce progress, and allow clearing search-only filters.
- Show DataView filter failures alongside fallback rows. Add `error` and `onRetry` to
  ActivityFeed and loading/error/retry support to ActivityLog; preserve loaded history,
  expanded details and composer drafts through refreshes.
- Keep activity presentation density separate from theme/density scopes, preserving
  explicit light themes on dark-system devices and the surrounding density scale.

- Use TipTap by default and stabilize the RichTextEditor family, with real formatting/history, source
  mode, controlled updates and atomic mention chips. Keep the existing props, ref and
  custom-engine API; retain the legacy execCommand factory for explicit integrations.
- Editor, comments and activities consumers must install `@tiptap/core`, `@tiptap/pm`
  and `@tiptap/starter-kit`. Root and unrelated imports remain peer-independent.
  HTML is now normalized to the TipTap schema; use custom extensions for other content.
- Keep activity-feed header/footer slots mounted through empty and loading states,
  so an empty activity log can accept its first comment without losing drafts.

### Layouts, interactions, documentation, and verification

- Make the release benchmark reproducible from a standalone checkout using a validated,
  versioned comparison capture, and reject incomplete measurements.
- Run interaction, accessibility, token and layout checks across Chromium, Firefox and
  WebKit while preserving the reviewed Chromium/macOS visual baselines.
- Restore focus after Safari pointer users dismiss overlays, mobile navigation,
  resource assignment and site search; preserve rendered trigger callbacks and refs.

- Complete keyboard Kanban reordering, preserve usable narrow-screen lanes, and compare
  event-calendar bounds by local day.
- Keep comment submissions locked until completion, isolate drafts and pending actions
  when records change, announce errors, and demonstrate retained-draft retry. Prevent
  duplicate attachment uploads under React Strict Mode.
- Stabilize activity ordering for missing dates, deduplicate expanded IDs, and demonstrate
  successful recovery from a failed activity action.
- Make chat controls reflect their callbacks and demonstrate send/stop/reuse. Guard
  duplicate resource confirmations and stale completions; give action dialogs accessible
  names and descriptions, with a working assignment retry example.
- Follow standalone type re-exports, aliases and cycles in API compatibility snapshots;
  detect member removals, newly required members and narrowing behind those exports.

- Polish admin-shell containment, scrolling, mobile drawers and left/right navigation;
  add provider configuration and full-width stacked composition options.
- Correct auth centering and split-container responsiveness; demonstrate card, bare,
  split and composed auth screens with validation and recovery states.
- Compose sidebar router callbacks with mobile dismissal and make workspace navigation
  keyboard-operable with real button/link semantics.
- Add media-library fetch retry, accessible progress and result announcements, preserved
  filter/selection state, and responsive type filters.
- Keep loading-button names stable for assistive technology and preserve grouped-button
  geometry around progress announcements.
- Omit preview artwork, test-helper declarations and macOS metadata from library packages.

- Improve avatar/image upload click targets, touch edit affordances, removal focus, and
  form error descriptions. Keep mixed-drop rejection feedback and stack mobile examples.
- Cancel pending search drafts when filters are cleared or saved views change.
- Add disabled pagination controls, retain result counts for zero/one-page data views,
  and demonstrate real filtering, sorting, pagination, and empty-state recovery.

- Validate handwritten API-table names against their owning TypeScript symbols, including
  nested types, hook arguments/results, and exported APIs. Correct stale callback, upload,
  layout, and token documentation; report unresolved runtime defaults explicitly.
- Correct Theme Tweaker's provider guidance and demonstrate live configuration updates,
  retaining the last valid locale while an edit is incomplete.
- Hide decorative command separators from the accessibility tree and improve destructive
  badge text contrast on muted surfaces. Remove the resolved accessibility allowances.
- Correct translucent-color measurement and add regressions for popup token overrides,
  empty-state alignment, numeric steppers, calendar ranges, and provider updates.

## 1.0.1

Released 2026-09-14. The package is renamed from `@themelia/ui` to `themelia-ui`, with the
consumer documentation and the shipped assistant skill updated to match.

## 1.0.0 — initial repository baseline

The original 1.0 surface. Everything below describes that baseline; changes after it follow
[the compatibility policy](docs/learn/api-compatibility.md).

Release-candidate notes last updated 2026-09-10.

### Production-readiness hardening

The global contract now separates whole-interface scale, geometry-only density, and
type-only scale without per-family factors or double multiplication. Compact/default/
comfortable density preserves readable type across nested provider, theme, and portal
boundaries; explicit typography scale inherits through those same scopes. Token reporting
is generated and freshness-gated at 55 theme variables, 166 global variables, and 429
component/runtime variables.

The public surface adds an accessible Base UI-backed Toolbar family, explicit render
composition for FormField and FieldShell, normalized linear/circular progress ranges, and
CSPProvider integration. The feature editor and data-table toolbars use the shared roving-
focus model. Exact family CSS remains self-contained and consumer overrides are documented
and tested against packed Vite and Tailwind applications.

Documentation navigation is now ten job-shaped groups and search is a command dialog with
grouped ranking, keyboard navigation, focus return, and mobile bounds. Preview surfaces,
generated docs, API/architecture records, assistant-skill mirrors, and every light/dark
visual baseline were refreshed together. No broadly reusable primitive is missing for 1.0;
Meter and a gesture-aware Drawer remain future candidates, to be added when real use calls
for them rather than as speculative API.

Consumer documentation now ships in the npm tarball with the package skill, practical
composition/framework/troubleshooting/verification guides, and one progressively disclosed
API reference per family. Those references are generated from the compatibility snapshot,
including inherited props, optional peers, exact JS/CSS imports, selection guidance, and the
same recipes rendered by the previews. A release gate rejects missing packed docs, broken
relative links, checkout-only imports or commands, stale token/version claims, recipe gaps,
and incomplete family references.

### Server components, one polymorphic contract, Tailwind v4 and design tokens

**`"use client"` is a directive, not a string.** The library build emitted it after the
CSS import on every client entry, where it is an inert expression statement and React
ignores it. A grep for `"use client"` in the bundles was clean; the boundary did not
exist. `verify:rsc` asserts POSITION now — 79 client-interactive families carry it as
their FIRST statement in both ESM and CJS, and server-pure families carry none — and
the classification is derived from source rather than maintained by hand.

**`render` is the only polymorphic contract.** All 13 `asChild` declarations are gone
and every call site is migrated; `verify:api-vocabulary` fails on the prop, and ADR 0005
is closed. `scripts/codemods/as-child-to-render.mjs` rewrites the mechanical cases and
refuses the rest, because a codemod cannot decide whether a child is the element to
become or the content.

Retiring it exposed a defect in the surviving spelling: `PopoverTrigger` inferred Base
UI's `nativeButton` from the element on the `asChild` path ONLY, so the canonical form
shipped `<a href="/x" type="button">` — where `type` on an anchor is the MIME-type hint
for the destination, not a button type. The deprecated branch had been carrying the fix.

**`themelia-ui/tailwind.css`** bridges the token contract into Tailwind v4, so
`bg-primary`, `rounded-surface` and `p-md` mean what they mean everywhere else in the
kit. Import it even if you never write one of those: both projects descend from shadcn,
41 custom-property names collide, and without the bridge Tailwind's defaults silently win
23 of them — the whole radius ladder, six type steps, three font stacks. `--text-sm`
becomes a flat `0.875rem`, which drops the kit's `--text-scale` fallback and stops scoped
type scaling.

**`themelia-ui/theming`** publishes the theme-synthesis recipes without the React
feature they used to live behind, so a build script can turn a brand seed into CSS
variables. Its foreground picker now MEASURES WCAG contrast instead of thresholding OKLCH
lightness — a behaviour change recorded in the migration map, because `#3b82f6` went from
white at 3.52:1 (failing AA) to dark at 5.11:1.

**`themelia-ui/tokens.json`** is the contract in W3C DTCG format for Figma and
design tooling: 164 tokens, OKLCH colour objects with a `hex` fallback, light and dark as
aliases. What it cannot carry is stated in its own `$extensions` rather than hidden —
`calc()` is resolved so a derived dimension loses its link to the token it derives from,
and the shadow ladder is absent because DTCG has no `color-mix`.

### Release truth, consumer guidance, and the rich-text seam

The last phase before 1.0. What changed is mostly what the package can PROVE about
itself.

**Readiness is an artifact, not a document.** `docs/generated/release-readiness.md`
was committed and said "`1.0.0` is ready to publish" while the evidence behind it
named a commit five commits back, on a tree whose live verdict was HOLD. It could
not say otherwise: its generator stripped the commit and the timestamp so the
committed file would stop churning. The verdict now renders to `.release/`, which
is ignored, and names the commit it is about. Nothing committed asserts current
release state.

**Status comes from one fact source.** README said `0.9.0` and `baseline/report.json`
recorded 37 lint warnings for a 1.0.0 package with none, and the anti-drift gate
passed over both. `collectRepositoryFacts` feeds README's status block, which is now
under `verify:docs-freshness` — putting `0.9.0` back fails `npm run verify`.

**The consumer skill ships.** `files` was `["dist"]`, so the tarball carried 1,878
build artefacts and no guidance. It now carries the assistant skill, its references, the
component index, an offline installer and a finder that answers from `node_modules`
with no checkout and no registry lookup.

**No known string debt.** Two ratcheted baselines holding 102 findings are gone. Three
were real — a screen-reader-only "Unread", the em dash before a quoted block's
attribution, and the curly quotes around a search term; the last two are typography
rather than words, which a list of strings hides. Seventeen unreachable override keys
are resolved: two named something real and unlabelled and are wired, fifteen named
nothing their component renders and are removed. The remaining 82 findings are
exceptions that each name a reason from a closed set and the declaration that owns
them.

**Two reference consumers.** `examples/consumer-general` and `examples/consumer-admin`
install from the packed tarball and are typechecked, built and server-rendered on
every run. They take opposite branches on optional peers, which is what proves the
forms seam is real rather than described.

**The catalogue has headroom again.** `dist/style.css` was 219 bytes under its
ceiling; a final pass over the concatenation — and only over the concatenation — leaves it
at 71,814 gzip bytes, 1,914 under the 72 KiB target. The three representative exact-CSS
recipes remain inside their 32, 48 and 58 KB budgets.

**Profiles are a dependency ceiling, stated as one.** `themelia-ui/profiles/general.json`
and `.../admin.json` publish every subpath below each ceiling and the peers that come
with it. The documentation no longer describes `general` as a subject-matter category.

**Rich text has a stable engine contract.** `RichTextEngine` is the seam between the
editor's chrome and whatever edits the document; one shared suite runs against the
built-in `execCommand` engine and a TipTap adapter behind its own exact subpath. The
contract is stable; the default engine remains experimental.

**Fixed along the way:** `RichText` rendered nothing at all — it sanitised `html` and
handed it to `Text`, which returned null whenever it had no children, so rich comment
content lost its paragraphs and its quoted blocks. Four of eleven type roles scaled by
the SPACING factor, so `--space-scale: 1.25` inverted the type ladder. The SSR sweep
became 96 named cases, halving the unit suite. `Copyable`'s clipboard behaviour is one
`useCopyToClipboard` hook instead of five disagreeing copies, and typography gained
`truncate`, removing the kit's most-repeated CSS from 21 families.

### The surface

**199 published subpaths** across **98 families**, each importable on its own:

| layer | families | may import |
|---|---|---|
| `foundation` | 4 | — |
| `typography` | 1 | foundation |
| `primitives` | 1 | foundation, typography |
| `base` | 53 | foundation, typography, primitives |
| `patterns` | 3 | everything below |
| `layout` | 9 | foundation, typography, primitives, base |
| `features` | 25 | foundation, typography, primitives, base |
| `admin` | 2 | everything below |

There is no `./base` or `./features` aggregate, and there will not be one: an aggregate
subpath is how a consumer who wanted a Button ends up with the optional peers of a chart.

The exported declarations are recorded name by name with normalised signatures in
`architecture/api-snapshot.json`. `verify:api-snapshot` fails on a removal, a removed
interface member, an optional member made required, or a changed member type.

### Profiles

96 families are `general` — domain-neutral presentation. 2 are `admin`, which is B2B
lifecycle vocabulary, and **nothing general may import from admin**. `verify:architecture`
enforces the direction.

### CSS delivery

Three ways in, and the narrow one is the default the documentation leads with:

```ts
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"     // the family, and the tokens it needs
```

- **94 stylesheet subpaths** — one per family that draws anything, plus `core.css` and
  `primitives.css`.
- `core.css` alone is the token layer, for your own CSS. A family sheet already `@import`s
  it; you do not need both.
- `style.css` is the whole catalogue at **71,814 bytes gzip (70 KiB)**. It is the right
  choice for an application that uses most of the kit and the wrong one for a public page
  using a handful of components; exact-family recipes are budgeted independently.

The cascade layer order — `tokens, theming, base, components, utilities` — is declared by
`core.css`. Every family stylesheet imports that contract first, so consumers need a
separate `core.css` import only when their own CSS needs tokens before a family loads.

### Experimental

**`features/rich-text-editor`.** Its editing engine is `document.execCommand`, which is
deprecated with no standard replacement. It works in every current browser, and it is not a
foundation to freeze a stable API on: expect its internals to change within 1.x.
`RichTextEditorHandle` is the seam intended to survive that. It produces **unsanitized
HTML** — see [SECURITY.md](SECURITY.md).

Every other family is `stable`.

### Deprecated, removal targets 2.0

11 declarations carry `@deprecated` with a named replacement. Two shapes:

- **`asChild`** on the components that predate Base UI's contract. Use `render`, which they
  already accept.
- **`RANGE_PRESETS`** — an English constant computed on date-fns's own week, which is Sunday
  while this package's default is Monday. Use `createRangePresets({ strings, weekStartsOn })`.

`docs/generated/migration.md` and `docs/generated/migration-broad-imports.md` are generated
and name every symbol with its replacement.

### Peers

React `>=19.0.0 <20`, proven at both ends by `verify:react-matrix` rather than inferred
from whichever version was installed. Twelve optional peers are contained per family by
the packed-package verification.

### What a release proves

`npm run verify:release` runs the 48-step static chain, packed-package consumer contracts,
reference consumers, API snapshot, CSS budgets, and 620 browser tests, and writes
`.release/readiness.json` as
each one passes. A record that is missing, unfinished, from another commit or from a dirty
tree cannot support a publish — which makes publishing after an incomplete gate unreachable
rather than merely discouraged.

### Known debt carried into 1.0

- **One dependency-owned accessibility ceiling.** The `/command` preview retains one
  `aria-required-children` finding in cmdk-generated markup. Kit-owned findings are closed,
  and the ratchet fails if the count grows.
- **The documentation bundle is intentionally broad.** Its all-routes production build
  emits a large-chunk warning. Consumer applications avoid that bundle through exact
  JavaScript and CSS family entrypoints.
- **Two RSC boundaries that family granularity cannot reach.** `Separator` needs no client
  runtime, but it ships from `base/display` beside `Collapsible` and `DateBlock`, which
  both hold real hooks — so the family is client and `Separator` goes with it. And
  `Money`, `Number` and the date primitives read the provider's locale through
  `useFormatting()`, which is a hook, so `primitives` is client by construction. Neither
  is a bug; both are the cost of drawing the boundary per family, and moving `Separator`
  to a server-pure family is the fix when it is worth a breaking import change.

The accessibility ceiling is recorded rather than hidden and gated so it cannot grow.
