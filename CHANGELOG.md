# Changelog

## 3.1.0 — 2026-09-28

This release renames and removes public API. Read
[Upgrading to 3.1](docs/learn/migration.md#upgrading-to-31) before you upgrade, then run the
packaged codemod from your project, dry first:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
```

### Breaking

- Blocks are published under `themelia-ui/blocks/`, the name the documentation, the
  component index and the finder already use. `themelia-ui/patterns/analytics`,
  `onboarding` and `timelines` are now `themelia-ui/blocks/analytics`, `onboarding` and
  `timelines`; `themelia-ui/admin/patterns/access` and `commerce` are
  `themelia-ui/blocks/admin/access` and `commerce`. Each stylesheet moved with its module.
  The codemod rewrites both.
- The theme is one level: about eighty variables declared once at `:root`, each colour a
  `light-dark(light, dark)` pair, and every length, shadow, tint and duration in twos.
  Components compute everything else where they use it, so a value set anywhere reaches every
  component below it, and a dark region inside a light page needs no second set of values.
  - The palette, the alpha steps (`--primary-10`), the spacing ladder (`--space-*`), the
    control, icon and avatar ladders, the derived role variables, the dark twins, the
    `--scale` and `--density-scale` factors, and `--font-serif`, which nothing read, are gone. The codemod renames each variable that
    has a successor (`--control-h` to `--control-height`, `--size-icon` to `--icon-size`,
    `--link-color` to `--link`) and reports the rest.
  - A theme of your own is one `:root` block; the selector list for re-declaring colours at
    every boundary is not needed.
  - The `theming` cascade layer is gone: the order is `tokens, base, components, utilities`.
  - `--animate-*` are gone. A `--keyframes-*` variable holds a keyframes name and you state
    the timing: `animation: var(--keyframes-spin) 1s linear infinite`. The kit's keyframes
    are named `themelia-*`, so a bare `spin` or `pulse` is no longer the kit's.
  - `tokens.json` has no palette group; each colour is a token per mode, and shadows,
    durations, the easing curve and the font stacks carry their DTCG types.
  - Safari 17.5 or newer is required, for `light-dark()`.
- Fill style is `appearance` on every component that has one, so `tone` is colour,
  `appearance` is fill and `variant` is structure:
  - `buttonStyle` becomes `appearance` on `Button`, `TextButton`, `LoaderButton`,
    `TooltipButton`, every component that forwards Button props, and action definitions.
    `ButtonStyle` and `ActionButtonStyle` become `ButtonAppearance` and `ActionAppearance`,
    provider defaults read `defaults.button.appearance`, and Button renders
    `data-appearance` instead of `data-style`.
  - `Badge`'s `variant` becomes `appearance` (`BadgeAppearance`); a metadata badge value's
    `badgeVariant` becomes `badgeAppearance`. `badgeVariants` is no longer exported: a badge
    takes its colour from its tone, so render a `Badge` (with `render` for a link) instead.
  - `Toggle`'s and `SidebarMenuButton`'s `variant` become `appearance`; Toggle renders
    `data-appearance` instead of `data-variant`.
  - The overlays' and action modalities' `confirmStyle` becomes `confirmAppearance`
    (`OverlayButtonAppearance`).
- Every size, padding and gap prop has two steps, `default` and `sm`:
  - `gap`, `rowGap`, `columnGap` and `amount` on `Stack`, `Grid`, `AdaptiveGrid`, `Split` and
    `Bleed` take `none`, `sm` (8px) or `default` (16px), and an unset `Stack` or `Split` gap
    is now 16px instead of 8px.
  - `maxWidth` and `sideWidth` take `default` (the content width), `sm`, `full`, `none` or a
    CSS length; `AdaptiveGrid`'s `minColumnWidth` takes `default`, `sm` or a length. A free
    string is no longer accepted, so a misspelt step cannot pass as a length.
  - `ComponentScale` is `default | sm`: `Spinner`'s `size`, `Empty`'s and
    `ResourceDetailsSection`'s `padding` and `DataTable`'s `size`. `md` is `default`; `lg` is
    gone.
  - `Avatar`, `SidebarMenuButton` and `AuthShell` lose `size="lg"`; `SidebarMenuButton`,
    `SidebarMenuSubButton` and `AuthShell` name their middle step `default`.
  - An overlay's, `SheetContent`'s and `ActionSheet`'s `size` takes `default`, `sm`, `full`
    or a CSS length, and `length` and `inset` take a CSS length.
  - `Slider` and `SliderField` have no `size`: under a finger the track and thumb grow into
    a larger target by themselves. `InputGroupButton` has one size, and `iconOnly` makes it
    square.
  - `ActivityFeed`'s `itemSpacing` is `default | sm`.
- `density` belongs to the provider. `MetadataList`'s becomes `size` (`default | sm`, and
  `data-size`), `MediaLibrary`'s and its parts' become `size`, `ActivityFeed`'s and its
  rows' become `variant` (`data-variant`), and `AiTask`'s becomes `defaultExpanded`.
- An action modality's `size` and the `ActionOverlaySize` type are gone: nothing read them.
- `Text` drops `size="xxs"` and `weight="regular"`; write `xs` and `normal`.
- The ThemeTweaker writes one block in which each colour is a `light-dark()` pair, so an
  exported theme follows `color-scheme` wherever it is applied:
  - `ThemeSelectors` is `{ shared }`, and `createScopedThemeSelectors` returns it; the `light`
    and `dark` selectors are gone.
  - `themeToStyle(theme)` takes no mode: the style carries both halves.
  - The default fields are the theme's variables, grouped into new `ThemeTweakerSection`s.
- The theming recipes write the theme's variables: `deriveThemePalette` sets `--link` and no
  sidebar primary, `deriveThemeTypeScale` writes the type steps (Text pairs each step with its
  line height), and `deriveThemeElevation` writes `--shadow` and `--shadow-lg`.
- The provider's `theme.colors` takes the theme's 38 colours (`SemanticToken`). `link-color`
  is `link`, and `overlay-backdrop` is new. The `inverse-*` colours, `primary-accent`,
  `destructive-accent`, `warning-accent` and `sidebar-primary*` are gone: an inverse region
  is a nested provider with its own `colorScheme`, and a tone's text colour comes from its
  tone. `theme.palette` and the `PaletteToken` type are gone with the palette.
- `MotionConfig.durations` takes `fast` and `normal`; `instant` is gone.
- The Tailwind bridge follows the theme. `p-padding`, `p-padding-sm`, `gap-gap` and
  `gap-gap-sm` replace the spacing keys (`p-md` and the rest), `rounded` is the container
  radius, and `animate-*`, `leading-*`, `tracking-*` and the shadow steps other than
  `shadow` and `shadow-lg` are Tailwind's own again.

### Added

- `DataTable` rows expand. `expandedRow` turns on a toggle at each row's start and the panel it
  opens under the row: `render` draws the panel, and `onLoad` optionally fetches what it shows
  when the row opens, with a skeleton meanwhile, the request aborted when the row closes, Retry
  on failure and the result kept for the next open. `canExpand` leaves a row without a toggle,
  `multiple: false` keeps one row open at a time, and `expanded`, `defaultExpanded` and
  `onExpandedChange` control the open rows. The panel lines up with the first column, stays in
  view on a table scrolled sideways, and keeps a panel that throws or suspends inside its row.
- `textClassName()` lends Text's classes to an element Text cannot wrap: a native control,
  a button's label, a table cell. `Text` takes `mono` and `caps`.
- `AiShimmer` takes `size`, a step on the type scale as on `Text`.
- `richTextClassName()` lends RichText's prose surface to an element RichText cannot render,
  such as an editor's content-editable root.
- Each block's page shows it composed from the lower tiers (analytics, timelines, onboarding,
  access and commerce), for the case configuration does not reach.

### Changed

- `package.json` publishes each tier through two subpath patterns, `./base/*` and
  `./base/*.css`, instead of one entry per module. Every import path resolves as before; a
  tool that lists the `exports` keys sees the patterns.
- Destructive is lighter in dark mode, so red text holds 4.5:1 on the hover fill, on its own
  tint in a popover, and as a soft badge in a selected row.
- A framed Card's band is the item inset, and the surface inside it takes the concentric
  corner, so a square-cornered theme keeps the band.
- `MetricTrendChip` and `MetricComparison` render `data-tone` as `success`, `destructive` or
  `neutral`, the kit's tone names, instead of `positive` and `negative`.
- Checkboxes, radios and switches keep one size, 1.125rem, at every density.
- A disabled control shows the not-allowed cursor and dims; it no longer ignores the pointer.
- Table headers are quieter: labels in the muted colour, with the sorted column's in the body
  colour, a lighter band on `DataTable`, and 42px instead of 48px, following density. The whole
  head cell sorts, and an unsorted column's arrow shows on hover or keyboard focus; touch
  screens keep a faint one. `TableSkeleton` reserves the new height.

### Fixed

- `MonoValue` renders in the monospaced face its documentation promises.
- `MapTooltip` draws its own surface; Leaflet's stylesheet left bare text on the map, and
  its arrow points at the marker on every side.
- The fade at a scroll edge of `Carousel` and a scrolling `Table` lifts while the region
  has focus, so it no longer hides the focus outline.
- `ResizableHandle` shows its active state while dragged again.
- A vertical `Slider` has its 10rem track; the track collapsed.
- Text in an `InputGroup` textarea is inset from the frame.
- A `Card` title with an info button lines up with one without.
- A default `Sheet` is 384px wide again; it rendered at 472px.
- Upload file sizes render at the small secondary size.
- A permission a role lacks, and a refund stage not yet reached, recede again.
- The AI composer draws one frame; it drew the field's frame inside its own.
- The breadcrumb bar no longer clips the sidebar trigger's focus outline, and the collapsed
  sidebar rail no longer shows a sliver of each row's label.
- A nested provider with `density="default"` resets a density set further out; it kept the
  outer one.
- A nested provider that sets `density` under a scaled one sizes that density at the
  inherited scale; the outer lengths outranked the preset.
- Map controls sit on a ground and an edge of their own; over the tiles they were
  see-through. An active drawing tool keeps its fill.
- A scrolling `DataTable`'s focus outline runs round the whole frame; its sticky header and
  pinned columns painted over it.
- A failed attachment keeps its file name in view: the error shares the row, may widen the
  chip to the tray, and shows in full on hover. Each attachment's link is named by its file;
  every one was named "Download".
- The kit's animations run on a page that also loads Tailwind or tw-animate-css. Their
  `spin`, `pulse`, `enter` and `exit` replaced the kit's keyframes, or the kit's replaced
  theirs, whichever loaded last.

## 3.0.0 — 2026-09-27

A major release. The package is ES modules whose JavaScript imports no CSS, so each module's
stylesheet is imported beside it; every `renderLink` takes one shape; and the published
catalogue uses the documentation's words. Read
[Upgrading to 3.0](docs/learn/migration.md#upgrading-to-30), then run the packaged codemod
from your project, dry first:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
```

The [migration reference](https://unpkg.com/themelia-ui/docs/generated/migration.md) lists
every change with its replacement.

### Breaking

- The package is ES modules only, and its JavaScript imports no CSS. Import each module's
  stylesheet beside its JavaScript, or `style.css` once: a component whose stylesheet is not
  imported renders unstyled. `themelia-ui/styles` is gone; import `themelia-ui/core.css`. The
  CommonJS build and its `.cjs` and `.d.cts` files are gone too, each export has one
  JavaScript target, and the package is about 2 MB smaller. In exchange, Node loads the
  package as it is: server rendering and test runners need no configuration for it, and
  CommonJS code on Node 20.19 or later can `require()` it. Jest still needs the package
  exempted in `transformIgnorePatterns`.
- `Scope` takes `render` instead of `as`, like every component that can become a different
  element: `<Scope vars={vars} as="section">` becomes
  `<Scope vars={vars} render={<section />}>`. It also passes the element's own props through
  (`id`, `aria-*`, `ref`), as `UIScope` does, and its props are exported as `ScopeProps`.
- The published catalogue uses the documentation's words, modules and tiers:
  - `docs/generated/component-index.json` is schema 3. `modules` replaces `families`; each
    entry's `tier` (`foundations`, `primitives`, `base`, `layout`, `features` or `blocks`)
    replaces `layer`, and `dependsOn` replaces `dependsOnFamilies`. Component guidance that
    falls back to its module's text has `guidanceSource: "module"`.
  - `docs/generated/recipes.json`: `module`, `modules` and `supportingModules` replace
    `family`, `families` and `supportingFamilies`.
  - `themelia-ui/profiles/general.json` and `admin.json`: `modules` replaces `families`.
  - `find-component.mjs` takes `--module=` and `--tier=` instead of `--family=` and
    `--layer=`, and its `--json` records carry `module`, `tier` and `dependsOn`.
- Props typed from a variant map are declared, so they no longer accept `null`: `Badge`'s
  `tone` and `variant` (and a metadata value's `badgeTone` and `badgeVariant`), `Alert`'s
  `tone` and `variant`, `Item`'s `surface`, `ItemMedia`'s `variant`, `InputGroupAddon`'s
  `align` and `InputGroupButton`'s `size`. Leave the prop out for the default.
- Every component that renders a link takes one `renderLink` shape, `LinkRenderer`, so one
  router adapter serves the kit. `ActionMenu`, `ActionButtons`, a card's action strip,
  `ResourceCell` and `SideNav` took shapes of their own; `ActionLinkRenderer`,
  `ActionLinkRenderProps` and `ResourceCellLinkProps` are gone. A renderer returns one
  element. `Pagination` takes `pageHref={(page) => …}`, which makes every control a link by
  itself, and its `renderLink` receives the same props as every other renderer.

### Added

- `LinkRenderer` and `LinkRenderProps`, the type of `renderLink`, are exported from every
  module whose components take one: `base/action-menu`, `base/cards`, `base/navigation`,
  `features/table`, and `layout/auth`, `header`, `navigation`, `page`, `settings`, `sidebar`
  and `workspace`.

### Changed

- The packaged skill is about 110 KB instead of 2.4 MB. It no longer copies the per-module
  API references and the component index, which ship under `docs/generated`; it names them
  there, and `find-component.mjs` reads the index from there. Re-run the skill installer to
  replace an installed copy.

### Fixed

- `Time`, `DateTime` and comment timestamps follow the provider's `dates.timeFormat`; they
  showed `HH:mm` whatever it was set to.
- A `MetadataList` info button is named after its fact ("Amount info"), not after its
  tooltip text.
- A disabled `SideNav` entry renders without a destination; the keyboard could still reach
  and follow it.
- `themelia-ui/primitives.css` compiles under Tailwind v4. It imported its neighbours by bare
  file name, which `@tailwindcss/cli`, `@tailwindcss/postcss` and `@tailwindcss/vite` before
  4.3 resolve as package names ("Can't resolve 'core.css'"). Its imports are now relative.
- A nested `UIScope` keeps what an enclosing provider or scope set through `config`:
  `theme.colors`, `theme.vars`, type sizes and fonts. Semantic colours are declared again at
  every scope boundary, so the nested scope painted the kit's defaults while `useUIConfig()`
  reported the merged values. Each scope now writes the merged overrides on its element.

## 2.0.1 — 2026-09-25

Every family now paints each role with one token. No public API changes. If your CSS reads a
retired colour step or component variable, run the codemod from your project, dry first:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
```

[`src/styles/TOKENS.md`](src/styles/TOKENS.md) states the contract by role:

- **Shape.** `--radius` for wrappers and `--radius-sm` for every item and every control at
  every size, checkboxes, glyph buttons, swatches and badges included; the half radius that
  2.0.0 gave small controls and badges is gone. A wrapper nested in a Card (Alert, bordered
  Empty, choice and switch cards, upload rows, ContentBlock) steps down to `--radius-sm`.
  Nested corners are arithmetic on the two, and no state changes a radius.
- **Fills.** Grounds are `--background`, `--card`, `--popover` and `--sidebar`. Every
  card-like surface sits on `--card` in dark too; the framed Card no longer lifts to the
  popover grey. Neutral fills are `--muted-50` (wells), `--muted-20` (strips) and
  `--foreground-8/-10/-20` (chips, skeletons, tracks). New `--surface-ground` lets sticky
  cells, rings and fades match the surface they sit on.
- **States.** Hover is `--accent` on controls and `--accent-50` on rows. The current
  navigation item is the neutral `--accent` at medium weight; selection takes the brand
  ladder and outranks hover. One focus ring. Disabled is `cursor: not-allowed`. State colour
  changes share `--transition-control` on `--ease-out`.
- **Tones.** Each hue has one ladder: ink, wash (5%), soft (10%), soft hover (20%) and line
  (30%, warning 40%). Badge, Alert, Button tones, mentions, chips, timeline, calendar and
  progress all use it.
- **Edges.** `--border` outside, `--border-60` inside, `--control-border` for controls in a
  row with fields, and one invalid edge.
- **Elevation.** None, `--shadow-xs` at rest, `--shadow-sm` on hover, `--popover-shadow` for
  every anchored popup, `--shadow-lg` floating and `--shadow-xl` modal.
- **Type and size.** One weight per role: medium for labels, rows and controls, semibold for
  surface titles and figures. Links use `--link-color` and `--link-underline-offset`, control
  heights and paddings come in matching pairs, and every derived length is a whole pixel.
- Glyph buttons below the smallest control come in two sizes: the icon size inside a field,
  the large icon size elsewhere.
- The dark `--sidebar-primary` is neutral, as in light.
- Fixed: `deriveThemeElevation` derives every tier from the default theme's geometry and
  `--shadow-ink`, so `intensity: 0.8` reproduces the default ladder. It emitted literal black
  layers, so the first Theme Tweaker change flattened `--shadow-md` and dropped a tinted ink.

## 2.0.0 — 2026-09-25

A major release. It consolidates the visual system and the token surface (two radii, two
text colours, one control height, one spacing ladder) and removes names that were only
another component under a second name. Read
[Upgrading to 2.0](docs/learn/migration.md#upgrading-to-20), then run the packaged codemod
from your project, dry first:

```sh
node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/
```

The [migration reference](docs/generated/migration.md) lists every removed name, token and
utility with its replacement.

### Breaking

- **One name per component.** Props and behaviour are unchanged under the remaining name.
  - `Dialog`, `Sheet` and `AlertDialog`, their `Trigger`, `Close`, `Body`, `Title`,
    `Description`, `Header` and `Footer` parts, and `DialogDismissArea` are the `Overlay`
    parts from `themelia-ui/base/overlay`. The presets keep what sets something:
    `DialogContent`, `SheetContent`, and `AlertDialogContent` with `AlertDialogAction`,
    `AlertDialogCancel` and `AlertDialogMedia`. CSS aimed at `.dialog--header` and the like
    targets `.overlay--header` / `.overlay--footer` inside the preset's `--component` class.
  - A menubar's menus are dropdown menus: `MenubarMenu` is `DropdownMenu`, and every other
    `Menubar*` part except `MenubarTrigger` is the `DropdownMenu*` part with the same suffix.
    Import `themelia-ui/base/dropdown-menu.css` beside the menubar's stylesheet.
  - `SettingsShell` is `AsideNavShell` and `ToggleGroupItem` is `Toggle`. The `DialogProps`,
    `SettingsShellProps` and `ToggleGroupItemProps` types are `OverlayRootProps`,
    `AsideNavShellProps` and `ToggleProps`.
  - `themelia-ui/features/suggestions` and its stylesheet are no longer published. Import the
    same names from `themelia-ui/features/combobox`; the codemod rewrites both.
- **A navigation menu has one panel.** `NavigationMenu` owns a shared panel that each
  `NavigationMenuContent` draws into, so moving between entries resizes one surface and idle
  entries no longer paint a dot. `side`, `sideOffset` and `container` move from
  `NavigationMenuContent` to `NavigationMenu`, which also takes `align` (default `"start"`).
  Panel links sit one per row. `NavigationMenuIndicator` draws a chevron that turns while its
  panel is open; remove an empty one you relied on to draw nothing.
- **Two text colours.** Text is `--foreground` or `--muted-foreground`. `Text type="discrete"`
  is `type="secondary"`, which resolves to `--muted-foreground`; `--text-role-discrete` and
  `--foreground-80` are removed. Heading subtitles, navigation links and empty-state icons
  take the muted colour.
- **Two radii.** `--radius` (1rem) for containers and `--radius-sm` (0.5rem) for what sits
  inside them, both plain values set at `:root`; nothing derives one from the other, so a
  theme that sets `--radius` sets `--radius-sm` too. A container insets its items by the
  difference, `--space-md`, so a highlighted row sits concentric in its menu.
  `--radius-surface`, `--radius-popup`, `--radius-control`, `--radius-inner` and the `-md` to
  `-4xl` ladder are removed; `rounded-md`, `rounded-lg` and larger are Tailwind's own radii
  again. `UIConfig.theme.radiusSm` sits beside `radius`, and the Theme Tweaker edits both.
- **One density factor.** `--space-scale` merges into `--density-scale`, which now moves
  spacing and control geometry alike; `--density-preset-scale` is removed. `--density-scale`
  is a raw input like `--text-scale`: set on `:root`, it reaches inside every provider.
  Every density-scaled length is rounded to a whole pixel. Controls are 34, 30 and 24px at the
  default (the small tiers were 30.2 and 22.67px) and 32, 28 and 23px under `compact`.
  Navigation-menu triggers take the control height (were 36px), menubar triggers the small
  height (were 28px) and toast actions the smallest.
- **One name per value.** Tokens that restated another under a component name are removed:
  `--menu-surface-p`, `--menu-row-px`, `--field-h`, `--field-px`, `--field-py`, `--text-xxs`,
  and the heading, label and link colours (headings and labels paint `--text-role-main`,
  subtitles `--text-role-secondary`, links `--link-color`). `--height-action` merges into
  `--height-control`, and `--action`, `--action-sm` and `--action-2xs` into `--control-h`,
  `--control-h-sm` and `--control-h-2xs`. The sidebar width is `--sidebar-width` for Sidebar
  and every shell, and the top-bar height is `--shell-header-height` (3.5rem). The codemod
  renames each; the migration reference lists the component variables that went with them.
- **`RANGE_PRESETS` is removed**, as its 1.x deprecation announced. Build presets with
  `createRangePresets({ strings, weekStartsOn })` from the provider's week, so "This week"
  agrees with the calendar beside it.
- **Unwired API is removed.** `PopoverContent`'s `onOpenAutoFocus` and `onInteractOutside`
  (use Base UI's `initialFocus`/`finalFocus` and `onOpenChange`), `CommandStrings.empty`
  (`CommandEmpty` renders its children) and `UIConfig.motion.durations.slow`.
- **`Textarea`** puts `className` and `textarea--component` on the `<textarea>`, like `Input`,
  so a caller can set `resize`. Select the box with `[data-slot="textarea-frame"]`.
- **A browser floor.** Chrome and Edge 125, Firefox 121 and Safari 16.4 or newer, set by
  `round()`, `:has()` and `:dir()`.
- **Types.** `ResolvedUIConfig.overlay` is required (code that builds a resolved config
  spreads `DEFAULT_UI_CONFIG`). `OverflowTabBar` no longer accepts the `defaultValue` it
  ignored. An exhaustive switch over `TabListProps["variant"]` needs a `"pill"` case. A
  complete `UIConfigSettingsStrings` translation adds `labels.darkMenus` and
  `darkMenusDescription`.

### Added

- The codemod ships in the package:
  `node node_modules/themelia-ui/scripts/consumer/codemod.mjs [--dry-run] <paths…>`. Beyond
  moved and broad imports, it renames every custom property 1.0.4 declared and 2.0 does not,
  wherever a stylesheet reads or sets it or a script reads it through `var()`, a style key or
  the CSSOM, and the Tailwind utilities the bridge no longer emits. It reports without editing
  a removed token with no successor, an override that now sets a shared name, and
  `rounded-md` and larger.
- The kit ships its typefaces: Geist for text and Geist Mono for code and identifiers (SIL OFL
  1.1), as variable-weight woff2 files in `dist/fonts/`, one per script, loaded by `core.css`.
  Text now renders alike on every platform, so anything sized to its text may be slightly
  wider or narrower than under 1.x. A theme that sets `--font-sans` and `--font-mono`
  downloads none of the files.
- `UIConfig.overlay.darkMenus` (default `true`) keeps dropdown, context, action and menubar
  menus dark on a light page; `false` lets them follow the scheme around them, and a nested
  `UIScope` can set either. The overlay settings merge per field, so a scope that sets
  `backdropBlur` keeps its parent's other overlay settings. The Theme Tweaker has a "Dark
  menus" toggle.
- `UIConfig.overlay.backdropBlur` (px or a CSS length; default none) blurs the page behind a
  modal overlay.
- `ContextAction<T>`, an `ActionDefinition` whose handler and `visible`/`disabled`
  predicates take the record, with a `placement` that pins it inline or sends it to the
  overflow menu. `resolveContextActions` binds a set to one record and `splitActions` divides
  it. Table row, kanban card and activity actions and `PageActions` all resolve through it.
- `NavigationTabs` for a bar of links: a `<nav>` with `aria-current="page"`. `OverflowTabBar`
  runs on `Tabs`, and a bar with nothing selected still has a tab stop. The filled-chip look
  is `variant="pill"` on any `TabList` or `NavigationTabs`.
- `PopoverMenuPanel`, the body of `PopoverMenu`, for a surface that brings its own popup.
  `PopoverMenu` gains `error`, `onRetry`, `minSearchLength` and `label`, and a throwing
  `onValueChange` reaches `onError` from every commit path. Without a search field its list
  is the tab stop, a named listbox that announces the highlighted row, so filter pills work
  from the keyboard and a screen reader.
- Base `Stepper`, a numbered sequence drawn as a `bar` or a `trail`, which `StepsBar` and
  `BreadcrumbProgress` render. The current step carries `aria-current="step"`, a finished step
  says so, and a narrow trail hides its labels visually rather than removing them.
  `BreadcrumbProgressStrings.step` takes an optional third status argument.
- `Card` gains `titleLevel`, which renders the title as a heading, and `media`, a full-bleed
  strip above the header. `AuthCard` is a `Card` and `WorkspaceRecordHeader` a `PageHeading`.
- `ComboboxPopupInput` puts a combobox's search field inside its popup. `ResourceCombobox`
  gains controlled search, `defaultOpen`, `clearSearchOnClose` and `requestDelay`;
  `SuggestionsCombobox` gains form props, `portalContainer` and `highlightMatch`;
  `ComboboxInputTrigger` and `ComboboxChip` take `strings`.
- `CommentThreadOptions` on `Comments`, `CommentTimeline` and `CommentItem`:
  `commentActions`, `maxVisibleReplies`, `clampLines`, `maxVisibleAttachments` and
  `reactionChoices`. A thread shows its last three replies, folds a body after six lines and
  shows three attachments before "Show N more"; pass `0` to any of the three to show
  everything. The new `CommentsStrings` keys are optional.
- `ToggleField` gains `surface`, `icon`, `hint` and `uncheckedValue`, and `SwitchCard` is
  `ToggleField surface="card"`. `Dropzone` gains `label`, `hint` and a caller's input id.
- `SidebarMenuButton` takes a `tooltip` for the collapsed icon rail.
  `FiltersButton.labelVisibility` restores the labelled add-filter control. `TableSkeleton`
  takes `framed` (default on; pass `false` inside a card that draws its own edge).
- `--destructive-accent` for destructive text on a destructive tint, `--accent-50` for row
  hover, and `--field-focus-ring`.
- Every public part carries its `{name}--component` hook, among them Alert's parts, Avatar's,
  Command's, the content, items and separators of DropdownMenu and ContextMenu, InputGroup's,
  Item's, Popover's, Label, Skeleton and TooltipContent.
- The packaged assistant skill covers upgrading (run the codemod, then reinstall the skill),
  `UIRoot`'s `documentTarget`, the dark-menu default and Base UI's state attributes, and a
  declaration's `@deprecated` tag prints in its reference.

### Changed

- **Spacing sits on the ladder** (2, 4, 6, 8, 12, 16 and 24px). Values between two steps
  moved to one: table cells are 12px (rows 4px taller), aside navigation rows take the
  sidebar's 8px inset, toggles and pill radios the control inset, Item rows 12px, and the
  accordion, alert, toast, chart tooltip and calendar gaps the nearest step. DataTable's `sm`,
  default and `lg` cells are 8, 12 and 16px and follow density.
- **Shapes.** Each element has one radius at rest, on hover and on focus; twenty-two
  components, among them accordion triggers, tabs, tab panels, table and scroll containers,
  the carousel track and side-nav items, were square until focused. Nested items follow their
  container's curve (the parent's radius less the inset): enclosed tabs, attached toggles,
  media-library segments, gallery controls, input-group buttons, the AI chat queue and the
  metric bar's period button. The batch action bar, reaction picker and event calendar's jump
  popover inset by `--space-md` like a menu. `Button` reads `--button-radius`, so a
  container can set the concentric value. Cards are framed by default: a `--muted-50` bezel
  round a content plate whose corner is `--radius-sm` inside the frame's `--radius`.
- **Edges and focus.** Fields, selects, comboboxes, date pickers, popover triggers, filter
  pills, neutral and secondary outline buttons, the header's search trigger and the rich-text
  editor frame share `--control-border`, 30% foreground (fields were 40%, outline buttons 35%
  and filter pills `--border`). The idle edge measures 2.4:1 on the light canvas, a
  deliberate calm below WCAG 1.4.11's 3:1; hover (4.5:1), focus (4.3:1) and invalid edges
  clear it. A focused field firms its edge to the focus colour inside a soft 22% halo, on
  every field, shell, input group, OTP slot and colour picker. Hairlines read `--border-width`
  and `--border-width-strong`.
- **Hover and selection.** Controls, popup cursors and selected, current and open states take
  `--accent`; page rows and large surfaces hover with `--accent-50`, where fills from the
  `--muted` family read as holes in dark. The header search hovers like a field, and
  calendar chips deepen their own tone. The sidebar marks the current page with a lifted row,
  the whole accent with a small shadow and medium weight, in place of an inset bar.
- **Dark mode.** The dark `--accent` steps down to a new neutral-750, so muted text and toned
  badges on a selected row or active tab stay above 4.5:1. A `Scope`, a `data-density`
  region or a provider on the default `system` scheme inside a `.dark` or
  `data-theme="dark"` tree stays dark instead of reverting to light, and class-only dark
  islands such as inverted menus re-derive component tokens.
- **Motion.** Buttons no longer scale on press. The dialog enters over 200ms from 97% with a
  slight rise and leaves in 150ms, sheets slide their full width out of their edge, and the
  scrim fades with the surface. The indeterminate progress band crosses the whole track in
  both directions.
- **Match highlight.** `<mark>` is styled once in the base layer: an amber wash under full
  ink, square-ended, with no shift in the text. Global search marks every occurrence.
- Consolidated components keep their public names: `CardRadioGroup` and `ListRadioGroup` are
  one option group laid out two ways, `FileUpload` renders `Dropzone` and shows its drop
  prompt, `ActionDialog`, `ActionSheet` and `ConfirmDialog` share one frame,
  `ResourceCombobox` and `SuggestionsCombobox` are presets of one self-fetching picker whose
  wiring `AsyncCombobox` and `AsyncMultiCombobox` share, and primitives' `Link` renders
  `TextLink`. `SuggestionsCombobox` and `useSuggestions` live in `features/combobox`.
- `Slot` merges props: classes join, both handlers run (the child's first) and the child's
  style wins.
- `PageActions` collapses below the kit's `lg` breakpoint, 1024px, rather than at 1040px;
  pass `breakpoint={1040}` to keep the old width.
- A dialog is capped at the viewport less the overlay edge inset, like a sheet, rather than
  90vw, and `ActionDialog`'s `"full"` width is that cap.
- `useCopyToClipboard` confirms for 2000ms, as `Copyable` did (was 1600ms).
- DatePicker's trigger is a combobox (`aria-haspopup="dialog"`) named by its label, with the
  date as its value, so a required or invalid date field announces it. Tests find it with
  `getByRole("combobox", { name })`.
- `StackedAvatarsStrings.overflow` supplies the "+N" chip text.
- `Text numeric` keeps the text's typeface and uses tabular figures; the monospace stack adds
  the platform monospace faces before the generic fallback.
- Hashed class names drop `-module` (`button__root___sSlE7`). Target the stable
  `{name}--component` classes instead.
- InputGroup no longer pads addons that carry `border-b` or `border-t` classes.
- `DataView`'s add-filter control is icon-only, with a tooltip and an accessible name.
- Surfaces: the menubar is one quiet strip under a rule; an inline `BatchActionBar` shares the
  floating dock's geometry; comments read as a thread of bubbles with "Show N replies",
  "See more" and in-place reply and edit, each with its own draft; Global Search has quieter
  chrome (a rule under the search row, muted group labels, "See all" as a text button,
  tabular tab counts) and even result lines; the Media Library toolbar is split into
  search/type and refine/view bands; `DateBlock` is a calendar leaf; `TableSkeleton`,
  `PageSkeleton` and `TwoColumnPageSkeleton` take the shape of what they stand in for;
  overlay headers take a small optical top inset; `Item` rows use the control radius; neutral
  `IconBadge` uses the avatar's disc; the pending badge dot is a thin ring; AI chat, activity,
  event calendar, product variants and analytics share sizes, fills and borders.

### Fixed

- **Keyboard and assistive technology.** Popups opened inside a dialog (select, combobox,
  popover menu, date picker) portal into it and are operable. The popover menu moves by arrow
  keys. The calendar is one tab stop with PageUp/PageDown, Home/End and Shift paging. Time
  segments are spinbuttons that clamp, snap and wrap. The pill radio group roves with the
  arrow keys, and `OverflowTabBar` is one tab stop. A loading `Button` keeps focus
  (`aria-disabled`), and `SubmitStateButton` shows its busy and done states in its visible
  label. Toasts pause on hover and focus, dismiss with Escape and return focus. A `Table` is a
  tab stop only while it scrolls, named by its caption, `aria-label` or
  `strings.scrollRegion`. ⌘B toggles only the sidebar around the focus. Keyboard focus stays
  visible on clipped scroll areas, tabs and tab panels, the command palette's search field
  shows focus, and the map draws the kit's focus ring inside its frame.
- **Forms.** `DecimalInput` reads a pasted "€1,234.50", steps an off-grid value to the nearest
  step, disables the stepper at `min`/`max` and keeps focus in the field. `ErrorSummary` is
  named by its heading, takes `autoFocus` and styles its links. `FormField` groups
  (`htmlFor={false}`) and `FieldGroup` are described by their hint. `PasswordInput`'s reveal
  control reports one state and forwards input strings. `LocalizedStringField` takes the
  field's label and hint and names its input with the locale; `LocalizedObjectField` labels
  each field. `ColorInput` names each swatch and marks an unpaintable value invalid once
  editing stops. File and image uploads put `aria-invalid` and the hint on the input, name the
  picker, accept the same file after removal and move focus to the next row; the upload list
  offers retry and remove on a failed row and announces finished transfers. Textarea `rows`,
  `minRows` and `maxRows` size from the real padding, and a textarea at `maxLength` shows the
  limit. The phone input keeps Canada when +1 is shared and reads custom countries.
  `PillRadioGroup` submits its value. Clear controls in inputs and textareas have a 24px
  target.
- **Combobox.** A field with no preload says "Type to search…", a query waiting on the debounce
  shows "Searching…", an error belongs to the query that failed, a disabled picker does not
  fetch, each chip's remove control names its value, and picker rows match the base rows.
- **Right-to-left.** Shipped CSS keeps `:dir(rtl)`, so the carousel, kanban, navigation and
  both tables honour `dir="rtl"`. The carousel's arrows and index, the table's scroll arrows,
  toast centring, the AI chat queue and its step connector work in RTL.
- **Layout.** Wide tables fade the edge with more columns; end-aligned sortable headers line
  up with their values; the sticky header uses the card surface; the selected row outranks
  hover, and header, footer and empty rows do not hover. A `CardFooter` passed as a child
  renders as the footer. `MetadataList` keeps a surrounding density scope, tightens only gaps
  when compact, and sits a custom `render` in the value's box. Carousel and tab-bar fades are
  masks, correct in dark, on cards and in RTL; the carousel honours reduced motion; tabs reveal
  the selected tab clear of the fade. Pagination stays on one row at phone width, sheets pad
  for the safe area, and a kanban board scrolls horizontally. `AsideNavShell` without a title
  keeps main and aside on one row. Submenus clear their parent. Hover cards and the header's
  tool popup cap at the available width, and toasts at their containing block, so they fit a
  scoped portal host. `ScrollArea`'s styled scrollbar runs in Chromium. A command row that is
  not checked no longer reserves space for its check mark.
- **Theming.** Theme Tweaker exports reach inside a `UIProvider` and apply under
  `colorScheme: "dark"`: shared values are written at every scope boundary, and each scheme
  at its explicit selectors and the `prefers-color-scheme` blocks. `ThemeSelectors` gains
  `systemLight` and `systemDark`; re-export a saved theme to pick this up.
  `--destructive-accent` flips inside a nested `.dark`. Tailwind's `rounded-sm`
  and `font-*` follow a theme, and the preflight font follows `--font-sans`. Literal component
  tokens are declared once at `:root`, so an override set on a wrapper is no longer reset by a
  nested scope.
- **Other.** A pager's `renderLink` element becomes the control, so router links keep the
  button's geometry. A date picker opens on its selected month, and preset date pickers
  forward `ref` to their trigger. Mention chips take the line's size and the badge corner,
  with a floor at the smallest type step. Chart `nameKey` and `labelKey` read the payload.
  `ObjectRepeater` keeps row state across reorder, and a nested repeater no longer takes its
  parent's handle indent. `CellValue` hands money strings to `Money` and honours
  `dateLocale`. English left in the date picker, repeater, table, slider, search and upload
  moved into their strings. Warning text uses the warning ink, avatar initials the main ink.
  The event calendar's previous and next buttons are a `ButtonGroup`, so the focus ring is
  not clipped. `NavigationTabs` no longer pulls in the layout layer.

## 1.0.4 — 2026-09-22

### Changed

- Corners: a 12px default surface radius and a 14px rounded preset, with tighter control and
  nested roles, so inputs, buttons, menus, cards and composite controls keep their hierarchy
  instead of drifting towards pills. Ledgers, activity details, comparison summaries, upload
  rows, transcript tools, attachments and other nested regions use the tighter inner radius;
  genuine cards and shells keep the structural one.
- Compact floating surfaces take a shared popup radius: menus, submenus, listboxes, popovers,
  tooltips, chart tooltips, mention pickers and map popups stay tighter than cards and
  dialogs, and nested menus keep a 4px gap. Command fields, enclosed tabs, colour inputs and
  map chrome follow the roles.
- Eight distinct key-plus-ambient elevation tiers replace duplicate and non-monotonic
  shadows.
- Browser selection, editing carets, range and progress tracks and avatar fallbacks take
  theme-aware colours in light and dark.
- `CardPrimaryAction`: a whole-card link responds on hover-capable devices with a treatment
  that suits its surface (border and lift for bordered cards, stronger elevation for framed
  cards, a quiet background for flat cards) without covering nested controls.
- `AppSidebar`: a parent entry without an `href` opens and closes on click, with
  `aria-expanded` on the row. The first frame still follows the current URL, and navigation
  returns every group to that state. `SidebarItemContext` gains an optional `toggle`.

### Fixed

- Item, media list rows, filter options, async preview cells and place results keep a small
  step between primary and secondary lines.
- `PageHeading` and `PageHeader` place the description a medium step below a headline row
  that holds actions.
- The optional peer range for `react-leaflet-markercluster` is `^5.0.0-rc.0`, the only
  published 5.x; `^5.0.0` made `npm install` fail for consumers of `features/map`.

See [Upgrading to 1.0.4](docs/learn/migration.md#upgrading-to-104).

## 1.0.3 — 2026-09-17

Unified component spacing and typography, live app theming, and accessible tab overflow.

### Added

- `TabList` shows overflow arrows automatically, scrolling through ScrollArea for touch and
  trackpads, revealing the selected tab without scrolling the page, and supporting RTL and
  reduced motion; the controls disappear when the row fits. `TabList.edgeFade` adds soft
  overflow edges that follow scroll position and text direction.
- `ThemeTweaker` works as a live app tool: a floating launcher with compact appearance
  controls, advanced values, a full-page workspace, and reset and export controls.

### Changed

- Block and feature families share composition and typography: group labels go through
  `DisplayLabel`, facts through `MetadataList` and primary text through provider defaults,
  with no local font or opacity overrides. Commerce blocks use the canonical component
  typography directly.
- Card, ContentBlock and overlay spacing follows the shared surface X/Y controls, with local
  inset overrides kept. Header typography and title/description gaps match across the three,
  and overlay headers and footers have a little more vertical padding. Metadata labels wrap,
  and dark scopes inherit custom fonts.
- Commerce: unified financial ledgers, aligned order and refund metadata, a compact shipment
  timeline that follows the latest reached event, responsive invoice lists, readable stock
  quantities, clearer monetary labels, stronger loyalty balances and ruled booking rows.
  Order summaries skip obsolete or terminal next steps.
- Catalogue blocks: compact SEO checks, grouped inventory fields and stock summaries, clearer
  supplier profiles and consistent booking typography. Records are read-only without a change
  handler.
- Activity: divided date groups, quieter timeline rails, a visible details control, separate
  changes, context and related-record sections, before/after values in a description list,
  and actions after the information they act on.
- Comments: compact conversation bubbles with inline reply and reaction controls, a shared
  moderation menu, and connected replies that stay readable in narrow panels. Reply expansion
  and reaction state are exposed to assistive technology, and deeper replies are kept.
- GlobalSearch is recomposed from Item, Badge, ScrollArea and the loading components, with
  unified media, wrapping context and tags, simpler match highlights and readable amounts on
  narrow screens.

### Fixed

- Sheets honour named and custom cross-axis sizes.
- GlobalSearch: grouped keyboard order, async selection, IME input, result scrolling, group
  counts, thumbnails and dismissal after a selection in the dialog.
- Prices stay beside their content on narrow screens, booking date tiles are compact, stock
  toggles stay readable on phones, and `AdaptiveGrid` keeps its columns inside narrow
  containers. `StepsBar` scrolls from the keyboard.
- Loyalty movement signs are normalised, failed cart thumbnails recover, and a code cannot be
  submitted or removed while pending.
- Live mentions keep paragraph and list structure.
- Iconless `ActionMenu` rows have no empty icon column, and long labels in fixed-width menus
  truncate, checkbox and link actions included.
- Toolbar separators are centred at icon height. PageHeading and PageHeader title icons align
  to the first title baseline. Item label/value pairs stay compact.

See [Upgrading to 1.0.3](docs/learn/migration.md#upgrading-to-103).

## 1.0.2 — 2026-09-16

Mobile data workflows, activity and mention presentation, media management, async
interactions and foundational controls.

### Upgrade notes

Review [Upgrading to 1.0.2](docs/learn/migration.md#upgrading-to-102) for the TipTap peers,
Slider wrapper types, decimal Money strings, mobile filter presentation and opt-in iPhone
field sizing.

### Added

- Media Library grid, list and metadata-table views and a reusable selection bar;
  `applyItemPatch` for consumer-owned record shapes; fetch retry; announced progress and
  results; responsive type filters.
- `ActivityFeed` takes `error` and `onRetry`, and `ActivityLog` supports loading, error and
  retry, keeping loaded history, expanded details and composer drafts through refreshes.
- Schema Form's optional `strings.submitError` customises failed-save feedback.
- `UIProvider config={{ forms: { preventIPhoneZoom: true } }}` applies a 16px minimum to
  native fields on iPhones; off by default.
- Admin shell provider configuration and full-width stacked composition options.

### Changed

- `RichTextEditor` uses TipTap by default, with real formatting and history, source mode,
  controlled updates and atomic mention chips. Props, ref and the custom-engine API are
  unchanged, and the `execCommand` factory remains for explicit integrations. The editor,
  comments and activities need `@tiptap/core`, `@tiptap/pm` and `@tiptap/starter-kit`;
  root and unrelated imports do not. HTML is normalised to the TipTap schema.
- Below 768px, DataView and FilterLayout move their controls into a 90%-width sheet with
  saved-view selection, per-filter clearing and staged editors. `mobilePresentation="inline"`
  keeps an inline layout.
- Activity headlines are simpler, with timestamps and source labels apart from row actions,
  and resource facts expand with the event details. Narrow comment cards give the message the
  full width and keep their actions below it.
- Mention suggestions use compact menu geometry and the shared Item and Command rows.
- Slider callbacks infer scalar or range payloads; explicitly typed wrappers may need a
  generic parameter.
- A single dot in a Money string is a decimal separator, and malformed amounts render the
  empty state.
- Centred dialogs cap at 90% of the viewport; overlay close icons follow the interface icon
  scale with a larger click target.
- Field typography is the same at every width.

### Fixed

- Base fields disable clear, reveal, step and prefix actions with the field, keep
  intermediate numeric entry and step with ArrowUp/ArrowDown. `FormField` labels reach
  composite controls through `aria-labelledby`. Standard buttons stay put when pressed.
- Uncontrolled slider readouts and submitted values stay current.
- Tag inputs keep rejected pasted tags, split typed entries by their delimiter, honour IME
  composition, keep keyboard removal at the limit and omit disabled tags from form data.
- Primitives: empty and non-finite states, DMS rounding, fractional-byte units, custom
  date-range patterns and same-day collapse. Canonical decimal money strings are preserved.
- Mentions: Arrow and Enter select without moving the editor caret, Escape dismisses, and an
  unchanged caret callback no longer reopens a dismissed query.
- Action overlays resist duplicate confirmations, cancellation and stale completions;
  confirmations and sheets are labelled for assistive technology; non-modal sheets sit above
  sticky page chrome and honour Escape, including when a nested control consumes it; empty
  dialog body bands are gone.
- Comboboxes honour externally controlled opening and dismissal, keep multi-select drafts
  across result changes, compare selections by key and link errors to their fields.
- Async Preview reuses hover requests, cancels on close or record change, recovers under
  Strict Mode, respects cache expiry, and names its popovers.
- Schema Form owns pending async submissions, prevents duplicate saves, keeps values after
  errors and focuses validation failures; invalid JSON blocks submission, reset clears its
  draft, and disabled fields no longer block validation.
- Media Library keeps detail drafts after failed saves, keeps assets visible during deletes,
  keeps selected records across remote searches, and improves selection markers, document
  placeholders, keyboard detail focus and narrow layouts. Upload helpers expose stable staged
  file ids, guard duplicate starts, keep failed files for retry and ignore cancelled or
  completed callbacks; uploads require a handler.
- Saved-view tabs and selects agree on operator defaults, custom selections and ordered
  ranges. Pending filters are unavailable to keyboard and pointer, progress is announced, and
  search-only filters can be cleared. Clearing filters or changing a saved view cancels
  pending search drafts. DataView shows filter failures beside fallback rows.
- Activity presentation density stays separate from theme and density scopes, so an explicit
  light theme holds on a dark-system device. Activity-feed header and footer slots stay
  mounted through empty and loading states, so an empty log can take its first comment.
- Focus returns after Safari pointer users dismiss overlays, mobile navigation, resource
  assignment and site search; rendered trigger callbacks and refs are preserved.
- Keyboard Kanban reordering is complete, narrow-screen lanes stay usable, and event-calendar
  bounds compare by local day.
- Comment submissions stay locked until complete, drafts and pending actions are isolated per
  record, errors are announced, and attachments do not upload twice under Strict Mode.
- Activity ordering is stable for missing dates, and expanded ids are de-duplicated.
- Chat controls reflect their callbacks; resource confirmations resist duplicates and stale
  completions; action dialogs have accessible names and descriptions.
- Admin shell containment, scrolling, mobile drawers and left/right navigation; auth centring
  and split-container responsiveness; sidebar router callbacks compose with mobile dismissal;
  workspace navigation uses real buttons and links.
- Loading buttons keep a stable accessible name, and grouped buttons keep their geometry
  around progress announcements.
- Avatar and image uploads have larger click targets, touch edit affordances, removal focus
  and error descriptions, and keep mixed-drop rejection feedback.
- Pagination controls disable at the ends, and data views keep result counts for zero and one
  page.
- Theme Tweaker keeps the last valid locale while an edit is incomplete.
- Decorative command separators are hidden from the accessibility tree, and destructive badge
  text has more contrast on muted surfaces.
- The package no longer includes preview artwork, test-helper declarations or macOS metadata.

## 1.0.1

Released 2026-09-14. The package is renamed from `@themelia/ui` to `themelia-ui`; the
documentation and the packaged assistant skill use the new name.

## 1.0.0 — initial repository baseline

The first stable release. Later changes follow
[the compatibility policy](docs/learn/api-compatibility.md).

- **98 families on exact subpaths** across eight layers: foundation, typography, primitives,
  base, layout, features, patterns and admin. Each family is importable on its own, and there
  are no layer barrels such as `themelia-ui/base`, so an optional peer is reachable only from
  the families that use it.
- **Two profiles.** `general` families are domain-neutral; the two `admin` families carry B2B
  lifecycle vocabulary and may build on general families, never the reverse.
  `themelia-ui/profiles/general.json` and `admin.json` list every subpath below each ceiling
  and the peers that come with it.
- **CSS per family.** `themelia-ui/<family>.css` carries a family's rules and imports
  `core.css`, which declares the tokens, themes and the cascade layer order
  `tokens, theming, base, components, utilities`. `style.css` is the whole catalogue in one
  file.
- **One scale contract.** `--scale` moves the whole interface, density moves geometry and the
  type scale moves text, with no per-family factors; density keeps type readable across nested
  provider, theme and portal boundaries.
- **`render` is the only polymorphic prop.** `PopoverTrigger` infers Base UI's
  `nativeButton` from the rendered element, so `render={<a href="/x" />}` produces a link
  without `type="button"`.
- **Server Components.** `"use client"` is the first statement of every interactive entry, in
  ESM and CJS; server-pure families carry none.
- **Theming outside React.** `themelia-ui/theming` turns a brand seed into CSS variables, and
  its foreground picker measures WCAG contrast (`#3b82f6` now takes dark text at 5.11:1, not
  white at 3.52:1). `themelia-ui/tokens.json` is the token contract in W3C DTCG format, with
  OKLCH colours and a `hex` fallback. `themelia-ui/tailwind.css` bridges the tokens into
  Tailwind v4; import it in any Tailwind app, because the two share custom-property names and
  Tailwind's defaults would otherwise win.
- **Components.** An accessible Toolbar family, `render` composition for `FormField` and
  `FieldShell`, normalised linear and circular progress ranges, `CSPProvider`, roving focus in
  the editor and data-table toolbars, and a `truncate` prop on typography.
- **Rich text.** `RichTextEngine` is a stable seam between the editor's chrome and the engine
  that edits the document. The default `execCommand` engine is experimental, and the editor
  produces unsanitised HTML; `RichText` renders stored HTML through an allow-list. See
  [SECURITY.md](SECURITY.md).
- **Documentation in the package**: the guides, one generated API reference per family, the
  assistant skill with an offline installer, and a component finder that answers from
  `node_modules`.
- **Peers.** React `>=19.0.0 <20`. Twelve optional peers, each reached only by the families
  that need it.
- **Deprecated:** `RANGE_PRESETS`, an English constant on date-fns's Sunday week; use
  `createRangePresets({ strings, weekStartsOn })`. Removed in 2.0.
- **Known limitations.** `Separator` ships from `base/display` beside hooks, so it is a client
  component, and `primitives` is client because `Money`, `Number` and the date primitives read
  the provider's locale through a hook. The Command family's cmdk markup has one axe
  `aria-required-children` finding.
