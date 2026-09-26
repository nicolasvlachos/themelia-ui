# Tests

<!-- GENERATED:suites by scripts/gen-test-docs.mjs — do not edit between these markers. -->
39 Playwright suites over the docs site, and 137 unit test files beside the
code they cover.

| suite | covers | script |
| --- | --- | --- |
| `a11y.spec.ts` | An accessibility audit of every component page. | `npm run test:a11y` |
| `activities-structure.spec.ts` | Activity rows expand into labelled detail groups and never overflow, at every density, width and theme. | runs under `npm test` |
| `admin-layout-polish.spec.ts` | App-shell layouts: mobile navigation, collapsing and moving the rail, contained scrolling and configured widths. | runs under `npm test` |
| `ai-chat-resource-assignment.spec.ts` | AI chat send, stop and retry, and resource assignment's failure, retry and cancel flows. | runs under `npm test` |
| `auth-layout-polish.spec.ts` | Auth shells centre, split, stack and scroll correctly in a plain consumer container, and the preview's sign-in flow recovers from errors. | runs under `npm test` |
| `button-loading.spec.ts` | A LoaderButton's loading announcement leaves its ButtonGroup's corners, seams and geometry identical to a plain group. | runs under `npm test` |
| `catalogue-polish.spec.ts` | Catalogue blocks keep edits, toggled values and tabs working, without overflow, at every width, density and theme. | runs under `npm test` |
| `command-accessibility.spec.ts` | Decorative command separators preserve listbox semantics and keyboard navigation. | runs under `npm test` |
| `comments-layout.spec.ts` | Comment threads keep their nested bubble geometry at every width, density and theme, and their actions stay usable. | runs under `npm test` |
| `commerce-polish.spec.ts` | Commerce blocks keep code entry, order history and row geometry working, without overflow, at every width, density and theme. | runs under `npm test` |
| `commerce-typography.spec.ts` | Commerce and catalogue blocks render labels, values and descriptions in the canonical metadata and item typography. | runs under `npm test` |
| `composition-audit.spec.ts` | Block and feature pages: display labels match the canonical label in scope, examples render, no text under 12px, no page overflow. | runs under `npm test` |
| `contrast-measurement.spec.ts` | Contrast measurements handle translucent layers, known range backgrounds, and the AA threshold. | runs under `npm test` |
| `contrast.spec.ts` | Text contrast, every page, both themes. | `npm run test:contrast` |
| `feature-async-forms.spec.ts` | Async feature flows (action overlays, comboboxes, async previews, schema form) at desktop and phone widths, in every theme and density. | runs under `npm test` |
| `feature-calendar-kanban.spec.ts` | Event calendar selection, filters across views and empty agenda; kanban keyboard drag and narrow layout. | runs under `npm test` |
| `feature-comments-activities.spec.ts` | Comment and activity recovery flows (empty log, failed attachment, failed submit, failed action) at phone widths. | runs under `npm test` |
| `feature-data-states.spec.ts` | Feature data states: pending, failed and empty results recover without losing filters, expanded rows or drafts. | runs under `npm test` |
| `feature-identity-rhythm.spec.ts` | Two-line identities in feature rows keep a visible gap between their primary and secondary lines. | runs under `npm test` |
| `feature-mobile-polish.spec.ts` | Feature polish at desktop and phone widths: DataView and filter sheets, mentions, activities, reflow, text-pair leading and popup density. | runs under `npm test` |
| `fixtures/tailwind-v4/tailwind.test.ts` | The Tailwind CSS v4 bridge, compiled for real and resolved in a real browser. | runs under `npm test` |
| `foundations-interactions.spec.ts` | Slider state, numeric stepping, tag recovery and stable button presses across desktop/mobile. | runs under `npm test` |
| `geometry.spec.ts` | Sub-pixel geometry, across every page. | `npm run test:geometry` |
| `global-search.spec.ts` | Global search keeps its layout, keyboard highlight, loading, empty and palette states at desktop and phone widths. | runs under `npm test` |
| `interaction.spec.ts` | What a component does when someone uses it. | `npm run test:interaction` |
| `iphone-input-zoom.spec.ts` | Opted-in fields render at 16px on iPhone only, so Safari does not zoom on focus; everything else keeps 14px. | runs under `npm test` |
| `layout-faults.spec.ts` | Two faults that look like bad spacing and are not measurable one element at a time. | runs under `npm test` |
| `map.spec.ts` | Map defaults preserve provider attribution and theme it through the public token contract. | runs under `npm test` |
| `media-library-states.spec.ts` | Media library async states: a failed fetch retries with its current filters, and empty states recover. | runs under `npm test` |
| `media-library.spec.ts` | Media library views keep selection and failed drafts, uploads recover, and every view stays responsive and accessible. | runs under `npm test` |
| `popup-conformance.spec.ts` | Shared popup geometry and ActionMenu label overflow contracts. | runs under `npm test` |
| `rich-text-editor.spec.ts` | Rich text editor toolbar alignment and roving focus, plus TipTap undo, formatting, source mode, paste and mentions. | runs under `npm test` |
| `sweep.spec.ts` | The three failures no other suite here can see. | runs under `npm test` |
| `theme-consolidation.spec.ts` | Native color-scheme follows theme scopes, and cards, content blocks and overlays share one surface inset, gap, font and radius. | runs under `npm test` |
| `theme-tweaker-live.spec.ts` | The theme tweaker: overflowing tab rails, fixed panel chrome, live and persisted edits, corner presets, saved-theme migration and locale input. | runs under `npm test` |
| `tokens.spec.ts` | Token conformance. | `npm run test:tokens` |
| `ux-polish.spec.ts` | Upload pickers, rejection messages and touch affordances, plus DataView debounce, paging, sorting and empty recovery. | runs under `npm test` |
| `visual-contracts.spec.ts` | Visual contracts measured directly: empty copy, numeric steppers, selection carets, preview tabs, nested radii and selected calendar ranges. | runs under `npm test` |
| `visual.spec.ts` | Visual regression, one baseline per component page per theme. | `npm run test:visual` |

Playwright projects: `chromium`, `tailwind`, `firefox`, `webkit`.

Unit tests run separately, under `npm run test:unit`, and are in the `verify` chain. They
cover what a route cannot reach — SSR, hydration, two roots arbitrating over the document,
portals, and hook behaviour across prop changes.

- `src/components/admin/patterns/commerce/catalogue-polish.test.tsx`
- `src/components/admin/patterns/commerce/commerce-polish.test.tsx`
- `src/components/admin/patterns/empty-states.test.tsx`
- `src/components/base/action-menu/context-actions.test.ts`
- `src/components/base/buttons/button-group-loading.test.tsx`
- `src/components/base/buttons/button.test.tsx`
- `src/components/base/buttons/loader-button-actions.test.tsx`
- `src/components/base/buttons/render-children.test.tsx`
- `src/components/base/cards/card-footer-child.test.tsx`
- `src/components/base/chart/chart.test.tsx`
- `src/components/base/choice-inputs/card-checkbox-group.test.tsx`
- `src/components/base/choice-inputs/pill-radio-group.test.tsx`
- `src/components/base/choice-inputs/toggle-field.test.tsx`
- `src/components/base/copyable/copyable.test.tsx`
- `src/components/base/copyable/use-copy-to-clipboard.test.ts`
- `src/components/base/date-pickers/date-picker.test.tsx`
- `src/components/base/date-pickers/locale.test.tsx`
- `src/components/base/date-pickers/time-picker.test.tsx`
- `src/components/base/feedback/progress.test.tsx`
- `src/components/base/forms-numeric/decimal-input.test.tsx`
- `src/components/base/forms-numeric/decimal.format.test.ts`
- `src/components/base/forms-numeric/unit-inputs.test.tsx`
- `src/components/base/forms/form-field.test.tsx`
- `src/components/base/forms/workflow.test.tsx`
- `src/components/base/input-group/input-group-field.test.tsx`
- `src/components/base/item/item.test.tsx`
- `src/components/base/navigation/language-switcher.test.tsx`
- `src/components/base/navigation/overflow-tab-bar.test.tsx`
- `src/components/base/navigation/pagination.test.tsx`
- `src/components/base/navigation/tabs.test.tsx`
- `src/components/base/otp-input/otp-input.test.tsx`
- `src/components/base/overlay/overlay-trigger.test.tsx`
- `src/components/base/popover-menu/popover-menu.test.tsx`
- `src/components/base/popover/popover.test.tsx`
- `src/components/base/qr-code/qr-code.test.tsx`
- `src/components/base/repeaters/localized-fields.test.tsx`
- `src/components/base/repeaters/object-repeater.test.tsx`
- `src/components/base/sidebar/render-children.test.tsx`
- `src/components/base/sidebar/sidebar-context.test.tsx`
- `src/components/base/sidebar/sidebar-navigation.test.tsx`
- `src/components/base/slot/slot.test.tsx`
- `src/components/base/table/table.test.tsx`
- `src/components/base/text-inputs/field-shell.test.tsx`
- `src/components/base/text-inputs/input-states.test.tsx`
- `src/components/base/text-inputs/textarea.test.tsx`
- `src/components/base/timeline/stepper.test.tsx`
- `src/components/base/toaster/toaster.test.tsx`
- `src/components/base/toolbar/toolbar.test.tsx`
- `src/components/base/typography/rich-text/rich-text.test.tsx`
- `src/components/base/upload/file-upload.test.tsx`
- `src/components/base/upload/media-upload.test.tsx`
- `src/components/base/upload/preview-image.test.tsx`
- `src/components/base/upload/upload-queue.test.tsx`
- `src/components/base/upload/use-file-drop-target.test.ts`
- `src/components/base/value-inputs/color-input.test.tsx`
- `src/components/base/value-inputs/tags-input-keyboard.test.tsx`
- `src/components/base/value-inputs/value-inputs.test.tsx`
- `src/components/features/activities/activity-log.test.tsx`
- `src/components/features/activities/activity-structure.test.tsx`
- `src/components/features/activities/use-activity-feed.test.tsx`
- `src/components/features/ai-chat/ai-chat-copy.test.tsx`
- `src/components/features/ai-chat/ai-chat-interactions.test.tsx`
- `src/components/features/async-preview/use-async-preview.test.tsx`
- `src/components/features/combobox/async-combobox.test.tsx`
- `src/components/features/combobox/pickers.test.tsx`
- `src/components/features/combobox/use-suggestions.test.ts`
- `src/components/features/comments/comment-item.test.tsx`
- `src/components/features/comments/comment-thread.test.tsx`
- `src/components/features/comments/comments.test.tsx`
- `src/components/features/comments/use-attachment-upload.test.tsx`
- `src/components/features/comments/use-comments.test.tsx`
- `src/components/features/data-view/data-view-pagination.test.tsx`
- `src/components/features/data-view/data-view.test.tsx`
- `src/components/features/event-calendar/event-calendar.test.tsx`
- `src/components/features/filters/filter-cache.test.ts`
- `src/components/features/filters/filter-editors.test.tsx`
- `src/components/features/filters/filter-layout.test.tsx`
- `src/components/features/filters/filter-tabs.test.tsx`
- `src/components/features/filters/search-filters.test.tsx`
- `src/components/features/filters/use-async-options.test.tsx`
- `src/components/features/global-search/global-search.test.tsx`
- `src/components/features/kanban/kanban.test.tsx`
- `src/components/features/kanban/use-kanban.test.ts`
- `src/components/features/map/map-draw-globals.test.ts`
- `src/components/features/map/resolve-tile-layer.test.ts`
- `src/components/features/media-library/media-library-interactions.test.tsx`
- `src/components/features/media-library/media-library.test.tsx`
- `src/components/features/media-library/use-media-library.test.tsx`
- `src/components/features/mentions/mention-content.test.tsx`
- `src/components/features/mentions/use-mentions.test.tsx`
- `src/components/features/overlays/use-overlay-actions.test.tsx`
- `src/components/features/overlays/use-overlay-visibility.test.ts`
- `src/components/features/resource-assignment/use-shared-resource-card.test.tsx`
- `src/components/features/rich-text-editor/exec-command-engine.test.ts`
- `src/components/features/rich-text-editor/rich-text-editor-toolbar.test.tsx`
- `src/components/features/rich-text-editor/rich-text-editor.test.tsx`
- `src/components/features/rich-text-editor/rich-text-security.test.tsx`
- `src/components/features/rich-text-editor/tiptap/tiptap-engine.test.ts`
- `src/components/features/schema-form/json-control.test.tsx`
- `src/components/features/schema-form/schema-form.test.tsx`
- `src/components/features/table/cell-value.test.tsx`
- `src/components/features/theme-tweaker/theme-tweaker.utils.test.ts`
- `src/components/layout/auth/auth-card.test.tsx`
- `src/components/layout/header/header-notifications.test.tsx`
- `src/components/layout/navigation/breadcrumb-progress.test.tsx`
- `src/components/layout/sidebar/app-sidebar.test.tsx`
- `src/components/layout/workspace/workspace-nav.test.tsx`
- `src/components/layout/workspace/workspace-record-header.test.tsx`
- `src/components/patterns/onboarding/checklist.test.tsx`
- `src/components/patterns/timelines/steps.test.tsx`
- `src/components/primitives/edge-cases.test.tsx`
- `src/components/primitives/primitives.test.tsx`
- `src/hooks/use-controllable-state.test.ts`
- `src/hooks/use-latest.test.ts`
- `src/hooks/use-mobile.test.ts`
- `src/hooks/use-native-dialog.test.tsx`
- `src/hooks/use-object-urls.test.ts`
- `src/hooks/use-synced-state.test.ts`
- `src/lib/hydration.test.tsx`
- `src/lib/jsdom-portability.test.tsx`
- `src/lib/responsive.test.ts`
- `src/lib/scroll-edges.test.ts`
- `src/lib/ssr-safety.test.tsx`
- `src/lib/ssr-surface.test.tsx`
- `src/lib/strings.test.ts`
- `src/lib/theming/contrast.test.ts`
- `src/lib/theming/recipes.test.ts`
- `src/lib/ui-provider/context.test.ts`
- `src/lib/ui-provider/csp-provider.test.tsx`
- `src/lib/ui-provider/dark-menus.test.tsx`
- `src/lib/ui-provider/iphone-input-zoom.test.tsx`
- `src/lib/ui-provider/portal-host.test.tsx`
- `src/lib/ui-provider/portals.test.tsx`
- `src/lib/ui-provider/root.test.tsx`
- `src/lib/ui-provider/runtime-config.test.tsx`
- `src/lib/ui-provider/ssr.test.tsx`
- `src/lib/ui-provider/typography-default.test.tsx`
<!-- /GENERATED:suites -->

The docs site is the fixture on purpose: it already renders every component and every
variation, so the tests never need harness pages of their own that could drift from what the
library actually ships. `tests/routes.ts` reads the route table out of
`src/preview/routes.ts` as text, so a page added to the nav is covered by every suite the
moment it exists — which is why `verify docs-coverage` fails a public component that has no
page: it is a component none of these has ever measured.

`npm test` runs Chromium — every spec, screenshots included. `npm run test:engines` runs
Firefox and WebKit on the specs where engines differ (keyboard and focus, popups, editing,
form controls, iOS zoom, sub-pixel geometry), and `npm run test:all` runs all three. Install
the engines once with `npx playwright install chromium firefox webkit`.

`npm run test:update -- --project=chromium` accepts reviewed visual changes on macOS.
WebKit checks exercise the Safari engine; they do not replace testing Safari on real
Apple devices or establish a minimum supported browser version.

## Prove a test can fail

**Any test that asserts an absence must be shown to fail on the thing it claims to catch.**
Not as a nicety — three tests in this repository have passed while measuring nothing, and
none of them was findable by reading:

| what it claimed | why it was empty |
|---|---|
| `verify consumer-fixtures` deduplicates CSS | the marker it counted was never in the bundle, so it counted zero twice and compared them |
| the provider hydrates without a mismatch | React 19 reports mismatches through `onRecoverableError`, not `console.error`, so the spy read an empty array |
| 24 components render on the server | the setup file threw before any component was reached, so every case "failed" for one unrelated reason |

Every one had an `expect`. A check for tests with no assertion finds none of them — the
assertions were real and the measurement was not.

So the convention is to break it on purpose: revert the guard, delete the derive, inject a
divergence, and watch the test go red before trusting it green. Where that is cheap to keep,
it lives in the suite — `hydration.test.tsx` ends with a case that hydrates deliberately
mismatched markup, so the reporting path is proven live every run rather than the day it was
written.

**Every `verify:*` gate has been shown to fail**, and so have six Playwright suites, each by
injecting the exact violation it defines:

| suite | injection that fails it |
|---|---|
| `contrast` | a light-theme `--foreground` set to `--neutral-200` |
| `geometry` | `.dot { position: relative; top: 0.5px }` |
| `tokens` | `border-top-left-radius: 7px` on a component's root class |
| `layout-faults` | a 3px `margin-inline-start` on one of two siblings |
| `visual` | any pixel change; it fails constantly and is re-recorded deliberately |
| `fixtures/tailwind-v4/tailwind` | drop `inline` from the bridge's `@theme` (fails the scope and dark-mode cases), or restore the self-referential `--radius-sm: var(--radius-sm)` (fails the radius and density cases) |

`a11y`, `interaction` and `sweep` have **not** been proven this way; the table claims only
what an injection has shown.

The same injections exposed three inherited gates as defective; all three are fixed.

**And the counterweight, which cost more time than the fixes.** When an injection does not
fire, read the rule before believing the check is broken. Nearly every mis-fire was the
probe: `tokens` audits four properties and padding is not one of them; the badge's root
class is `.root`, not `.badge`; `Item`'s is `.description`, not `.itemDescription`;
`token-budget` exempts `--badge-*` because `TONE_SET` covers a whole tone family on purpose.
A falsifiability habit without that discipline produces confident wrong reports.

The suite table at the top of this file is generated, and this prose is not. That split is
deliberate: a hand-counted "five suites" in the opening line would be wrong the first time
someone added a sixth — silently, in the document a new contributor reads first.

## `tokens.spec.ts`

**Token conformance**, per component page. Reads the resolved value off each real element
and requires it to match a custom property resolved *through the same property* on a probe
element. That indirection is the point: reading a custom property back gives you what was
written (`calc(0.75rem * 2.6)`, `150ms`), never what the browser computed from it, so a
direct comparison against a used value of `26px` or `0.15s` could never match however
correct the stylesheet was.

**Cross-component consistency**, on `/review`, which renders everything at once:

- every dimmed control dims by the same amount
- every keyboard-focused control shows the same ring (driven by real `Tab` presses, since
  `:focus-visible` does not match a programmatic `.focus()`)
- every single-line field and button lands on one height, measured on the outer
  `[data-field-shell]` rather than the control inside it

## `visual.spec.ts`

One baseline per component page per theme. Both themes, because most of what breaks in a
token system breaks in exactly one of them.

The pixel budget is **absolute, not a ratio**, and was calibrated against a real
regression: breaking `--field-radius` so every field on a page changes shape moves about
128 pixels, because a corner arc is a tiny area even when it changes everywhere. An
earlier ratio-based budget allowed 2% of the image — over twenty thousand pixels — and
passed that change without noticing. A ratio is also the wrong unit when pages differ in
height by a factor of five.

Baselines are engine/platform-stamped (`-chromium-darwin`), so they are compared on macOS
only, and never regenerated to obtain a pass.

## `contrast.spec.ts`

Every text node on every page, both themes, against WCAG AA (4.5:1, or 3:1 for large
text). It found failures at 2.19:1 and 3.22:1 that looked perfectly acceptable in a
screenshot — which is the argument for measuring rather than looking.

Colours are composited with their ancestor backgrounds. `getImageData` exposes straight
RGBA channels; dividing those channels by alpha again brightens translucent colors and
can hide a real contrast failure. `contrast-measurement.spec.ts` checks known translucent
colors, layered backgrounds and the AA threshold independently of the catalogue sweep.

Three known shortfalls are allowlisted, all in dark, all between 4.36 and 4.38. Each is a
palette value kept from the source kit; raising one is a palette change, reviewed on its
own. Anything new fails.

## `geometry.spec.ts`

Sub-pixel geometry, every page. It catches the class of defect that reads as "it just
looks a bit off" and survives every review: a circle sized 6.99px lands at a half-pixel
offset and the rasteriser softens it into something visibly oval, but nothing in the code
looks wrong and no screenshot diff explains why. That was the badge's status dot.

Three rules:

- a **circle** must be a whole number of pixels and centre on a whole pixel in its parent
- a **radius** between 65% and 95% of half-height is the uncanny middle — near enough to a
  pill that the eye reads the corners as a mistake. The badge sat there at 73%
- a **scroll container** smaller than a line of text cannot be scrolled usefully

The commonest cause of a fractional box is a component setting `font-size` without its
paired `line-height`: the scale's ratios land on whole pixels at their own size, so a
component picking 12px while inheriting the 14px ratio gets 17.14px, and everything
centred inside it lands on a half pixel. `--leading-12/13/14` exist for components that
bound their own height.

Shape tokens that scale go through CSS `round(…, 1px)`, so a circle stays a circle at
`--scale: 0.85` instead of becoming 13.6px.

### What this test must NOT measure

Four separate false-positive classes had to be designed out, and each one produced a page
of confident nonsense first:

- **premultiplied alpha** — reading `getImageData` without dividing the alpha back out
  makes every translucent surface a near-black backdrop (this one is in `contrast.spec.ts`)
- **viewport-absolute positions** — they carry the page's own fractional scroll offset
- **transformed elements** — a spinning ring's rotated bounding box is 16 x root-2 wide and
  drifts every frame; measure the computed width, not the rect
- **SVG internals and fixed-position nodes** — a Lucide glyph is full of `<circle>` nodes
  laid out by the path, and Base UI parks hidden native inputs at fixed coordinates

### Keeping it deterministic

Two things had to change in the docs pages for this suite to mean anything, and both are
worth knowing before adding a page:

- **No `new Date()` in an example.** A page that renders "now" differs on every visit, so
  an intended change cannot be told apart from the clock moving. Use a fixed instant.
- **Drive the theme through `colorScheme`, not `data-theme`.** The docs app runs
  `UIProvider` with `colorScheme: "system"`, and that configuration *removes*
  `data-theme` on mount — so setting the attribute in an init script was wiped before the
  first paint, and for a while every "dark" baseline was a byte-identical copy of its
  light counterpart: seventy-four screenshots comparing the theme against itself. Note
  that `test.use` applies to its enclosing scope, so each theme needs its own `describe`
  or the last call wins for the whole file.
- **No JS-driven mount animations.** Recharts replays its own animation on every mount and
  it is not a Web Animation, so nothing can be awaited on it — the docs charts pass
  `isAnimationActive={false}`. CSS animations are fine: Playwright freezes them for the
  shutter, and `settle()` waits out the finite ones (the infinite ones — a spinner, an
  indeterminate progress bar — are filtered out, or awaiting them would never resolve).

## `layout-faults.spec.ts`

Two faults that look like bad spacing and are not measurable one element at a time.

- **WELDED** — a label and its description with zero pixels between them. A stack under
  `--leading-tight` with no `gap` closes to nothing, so the descender of one meets the cap
  of the next. It has caught a `DateBlock` whose three lines had collapsed and an
  `ErrorSummary` whose problems ran together — both on components that had just been given
  their first preview page, having shipped unmeasured until then.
- **NEAR-MISS** — two sibling left edges 1–6px apart. Far enough to look wrong, close
  enough that nobody reads it as deliberate.

Neither is visible in a screenshot diff until someone has already changed the thing, and
neither is reachable by a static check: they are relationships between two rendered boxes.

## Where these run

Every suite runs locally. Run `npm run verify` and `npm test` before a commit;
`npm run verify:release` is the release gate: every check, then Chromium, Firefox and WebKit,
on a clean tree, on macOS. `npm publish` runs it through `prepublishOnly`, which first
refuses a version npm already has or one without a CHANGELOG heading. The two specs with
Darwin baselines (`visual`, `theme-tweaker-live`) are compared only on macOS; elsewhere the
Chromium project skips `visual.spec.ts`, which is why the release gate refuses to run there.
A stray `.only` fails the gate: Vitest runs with `--allowOnly=false`, Playwright with
`--forbid-only`.

**A missing snapshot is a failure, not a skipped check.** A run that writes its own baseline
has verified nothing; `--update-snapshots` is for a change a person has looked at.

**What they run against.** A development-mode build of the docs app, served statically:
React's warnings stay on, and a fresh page loads one bundle instead of ~1,200 dev-server
modules. It is built at the start of each run (about a second), so an edit made during a run
never reaches it. The three specs that import source modules at runtime, as a consumer's
bundler would, run against the dev server through `DEV_ORIGIN`. Locale and time zone are
pinned (`en-US`, `Europe/Sofia`), and a native date field's text is hidden in captures: the
operating system draws it in its own locale.

**How long.** A route sweep visits every page in one of a few slices (`shards()` in
`routes.ts`) rather than one test per page, so pages are not reloaded per check. All three
browsers take about six minutes on a busy 11-core machine; Chromium alone, about four. A test
compares a token's value numerically: the built stylesheet writes numbers short (`.941177`,
`oklch(1 0 0)`).

## Route readiness and sweep timeouts

Use `visitRoute(page, path)` from `tests/routes.ts` for route sweeps. It waits for the
requested route's active navigation link and a visible main heading, so a same-document
hash navigation cannot silently audit the previous page or a not-found page. Navigation
can be hidden on mobile; the visible heading still proves the page body is present.
Wait for `document.fonts.ready` before measuring font-dependent geometry, and retain
feature-specific waits for asynchronous content. Global `networkidle` does not prove
that the router has rendered and can remain pending because of background traffic.

A test that walks every route gets `sweepTimeout(routes.length)` from `tests/routes.ts`,
which is `max(2 minutes, routes × 6s)`. Playwright's default of 30 seconds is right for a
test that loads one page and wrong for one that loads a hundred and thirty-nine.

Derived rather than written by hand, because two suites carried a literal `15 * 60 * 1000`
and three carried nothing — so whether a sweep had a budget at all depended on which file you
were reading, and "no page arrives already scrolled" failed inside the full suite while
passing on its own.
