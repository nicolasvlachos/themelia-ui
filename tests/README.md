# Tests

<!-- GENERATED:suites by scripts/gen-test-docs.mjs — do not edit between these markers. -->
35 Playwright suites over the docs site, and 141 unit test files beside the
code they cover.

| suite | covers | script |
| --- | --- | --- |
| `a11y.spec.ts` | An accessibility audit of every component page. | runs under `npm test` |
| `activities-structure.spec.ts` | Activity rows expand into labelled detail groups, collapse again and follow the feed's variant. | runs under `npm test` |
| `admin-layout-polish.spec.ts` | App-shell layouts: mobile navigation, collapsing and moving the rail, contained scrolling and configured widths. | runs under `npm test` |
| `ai-chat-resource-assignment.spec.ts` | AI chat send, stop and retry, and resource assignment's failure, retry and cancel flows. | runs under `npm test` |
| `audit/geometry.spec.ts` | An on-demand audit of sub-pixel geometry and corner radii across every page: whole-pixel circles, radius bands, near-circles, square icons, concentric nesting and skeleton parity. | `npm run audit` |
| `audit/layout-heuristics.spec.ts` | An on-demand audit of two faults that look like bad spacing and are not measurable one element at a time. | `npm run audit` |
| `audit/token-literals.spec.ts` | An on-demand audit that every audited property on every route resolves to a token in scope. | `npm run audit` |
| `auth-layout-polish.spec.ts` | Auth shells centre, split, stack and scroll correctly in a plain consumer container. | runs under `npm test` |
| `catalogue-polish.spec.ts` | Catalogue blocks keep edits, toggled values and tabs working, and pass axe. | runs under `npm test` |
| `comments-layout.spec.ts` | Comment threads render mentions inline, open replies, toggle reactions and keep their edit, reply and delete actions usable. | runs under `npm test` |
| `commerce-polish.spec.ts` | Commerce blocks keep code entry and order history working, pass axe, and swap the line-item table for a list on a phone. | runs under `npm test` |
| `contrast-measurement.spec.ts` | Contrast measurements handle translucent layers, known range backgrounds, and the AA threshold. | runs under `npm test` |
| `contrast.spec.ts` | Text contrast, every page, both themes. | runs under `npm test` |
| `feature-async-forms.spec.ts` | Async feature flows: action overlays, comboboxes, async previews and the schema form hold pending work, recover from failure and pass axe. | runs under `npm test` |
| `feature-calendar-kanban.spec.ts` | Event calendar selection, filters across views and empty agenda; kanban keyboard drag and narrow layout. | runs under `npm test` |
| `feature-comments-activities.spec.ts` | Comment and activity recovery flows (empty log, failed attachment, failed submit, failed action) at phone widths. | runs under `npm test` |
| `feature-data-states.spec.ts` | Feature data states: pending, failed and empty results recover without losing filters, expanded rows or drafts. | runs under `npm test` |
| `feature-mobile-polish.spec.ts` | Feature flows at desktop and phone widths: DataView filters and the filter sheet, mentions, and activities. | runs under `npm test` |
| `fixtures/tailwind-v4/tailwind.test.ts` | The Tailwind CSS v4 bridge, compiled for real and resolved in a real browser. | runs under `npm test` |
| `foundations-interactions.spec.ts` | Slider state, numeric stepping and tag recovery from the keyboard. | runs under `npm test` |
| `global-search.spec.ts` | Global search keeps its keyboard highlight, loading, empty, recent and palette states, and moves its figures inline on a phone. | runs under `npm test` |
| `interaction.spec.ts` | What a component does when someone uses it. | runs under `npm test` |
| `iphone-input-zoom.spec.ts` | Opted-in fields render at 16px on an iPhone, so Safari does not zoom on focus, whatever the root font size. | runs under `npm test` |
| `layout-faults.spec.ts` | Layout faults no single-element check can see: a box that does not mirror under `dir="rtl"`, and text cut at its start edge by a clipping ancestor. | runs under `npm test` |
| `map.spec.ts` | The default map keeps its tile provider's attribution link. | runs under `npm test` |
| `media-library-states.spec.ts` | Media library async states: a failed fetch retries with its current filters, and empty states recover. | runs under `npm test` |
| `media-library.spec.ts` | Media library views keep selection and failed drafts, uploads recover, and every view passes axe in both themes. | runs under `npm test` |
| `popup-conformance.spec.ts` | Popup behaviour: popups inside a modal dialog, keyboard-only popover menus and comboboxes, checkbox menu rows, and ActionMenu label truncation. | runs under `npm test` |
| `rich-text-editor.spec.ts` | The rich text editor's TipTap editing: undo and redo, formatting, source mode, paste, insertion and mentions. | runs under `npm test` |
| `sweep.spec.ts` | The smoke suite: every route renders, fits a phone, keeps the console clean with and without a pointer, holds still under reduced motion, and opens unscrolled. | runs under `npm test` |
| `theme-consolidation.spec.ts` | Theme overrides: native color-scheme follows theme scopes, and the documented surface, font, padding and typography overrides reach the components that read them. | runs under `npm test` |
| `theme-tweaker-live.spec.ts` | The theme tweaker: overflowing tab rails, the panel's fixed chrome, corner presets, locale input, exported themes and accessible panels. | runs under `npm test` |
| `tokens.spec.ts` | The theming contract: every `var()` resolves, a region keeps an explicit scheme, density and type factor however deep it sits, and the type ladder holds its order under every factor. | runs under `npm test` |
| `ux-polish.spec.ts` | Upload pickers, rejection messages and touch affordances, plus DataView debounce, paging, sorting and empty recovery. | runs under `npm test` |
| `visual.spec.ts` | Local screenshots, one per preview example per theme, compared with baselines recorded on this machine. | `npm run screenshots` |

Playwright projects: `chromium`, `tailwind`, `firefox`, `webkit`, `visual`, `audit`.

Unit tests run separately, under `npm run test:unit`, and are in the `verify` chain. They
cover what a route cannot reach — SSR, hydration, two roots arbitrating over the document,
portals, and hook behaviour across prop changes.

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
- `src/components/base/display/metadata-list.test.tsx`
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
- `src/components/blocks/admin/commerce/catalogue-polish.test.tsx`
- `src/components/blocks/admin/commerce/commerce-polish.test.tsx`
- `src/components/blocks/admin/empty-states.test.tsx`
- `src/components/blocks/onboarding/checklist.test.tsx`
- `src/components/blocks/timelines/steps.test.tsx`
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
- `src/components/features/table/data-table-expansion.test.tsx`
- `src/components/features/theme-tweaker/theme-tweaker.utils.test.ts`
- `src/components/layout/auth/auth-card.test.tsx`
- `src/components/layout/header/header-notifications.test.tsx`
- `src/components/layout/navigation/breadcrumb-progress.test.tsx`
- `src/components/layout/sidebar/app-sidebar.test.tsx`
- `src/components/layout/workspace/workspace-nav.test.tsx`
- `src/components/layout/workspace/workspace-record-header.test.tsx`
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
- `src/lib/theming/theme-contrast.test.ts`
- `src/lib/ui-provider/context.test.ts`
- `src/lib/ui-provider/csp-provider.test.tsx`
- `src/lib/ui-provider/dark-menus.test.tsx`
- `src/lib/ui-provider/iphone-input-zoom.test.tsx`
- `src/lib/ui-provider/portal-host.test.tsx`
- `src/lib/ui-provider/portals.test.tsx`
- `src/lib/ui-provider/root.test.tsx`
- `src/lib/ui-provider/runtime-config.test.tsx`
- `src/lib/ui-provider/scope.test.tsx`
- `src/lib/ui-provider/ssr.test.tsx`
- `src/lib/ui-provider/typography-default.test.tsx`
<!-- /GENERATED:suites -->

The docs site is the fixture: it renders every component and variation, so the tests need no
harness pages of their own. `tests/routes.ts` reads the route table out of
`src/preview/routes.ts`, so a page added to the nav is covered by every route sweep at once.

## Running them

| Command | What runs |
|---|---|
| `npm test` | Chromium and the Tailwind fixture — before a commit |
| `npm run test:engines` | Firefox and WebKit on the specs where engines differ: keyboard and focus, popups, editing |
| `npm run test:all` | All four projects; the release gate runs the same set |
| `npm run screenshots` | Local screenshots, one per preview example per theme, each rendered alone at `#/example/<page>/<id>`. Baselines are git-ignored: record them with `npm run screenshots -- --update-snapshots`, then later runs compare against them |
| `npm run audit` | `tests/audit/`: on-demand sweeps (sub-pixel circles and radii, welded or near-miss spacing, literal values on every page). Run it before accepting a broad visual change; it is not a gate |

Install the engines once with `npx playwright install chromium firefox webkit`. WebKit
exercises the Safari engine; it does not replace testing Safari on real Apple devices.

## What a test here asserts

Behaviour, accessibility and the public contract: keyboard and focus, popups, editing, async
recovery, axe and contrast, RTL mirroring, overflow, and the theming contract (nested scopes,
explicit and system dark, density, text scale). Not pixel arithmetic, and never a hashed
CSS-module class name: select by role, label, text, `data-*` attributes or the documented
`{name}--component` hooks. A flow that does not depend on theme, width or density runs once.

**Prove a test can fail.** A test that asserts an absence is only trusted once it has failed
on the thing it claims to catch: revert the guard, inject the violation, watch it go red.
Where that is cheap to keep, it lives in the suite — `hydration.test.tsx` ends with a case
that hydrates deliberately mismatched markup, so the reporting path is proven every run.

## Keeping pages deterministic

- **No `new Date()` in an example.** Use a fixed instant, or every visit differs.
- **Drive the theme through `colorScheme`, not `data-theme`.** The docs app runs `UIProvider`
  with `colorScheme: "system"`, which removes `data-theme` on mount. `test.use` applies to its
  enclosing scope, so each theme needs its own `describe`.
- **No JS-driven mount animations.** Recharts animations cannot be awaited, so the docs charts
  pass `isAnimationActive={false}`. CSS animations are fine: Playwright freezes them, and
  `settle()` waits out the finite ones.

The suites run against a development-mode build of the docs app, served statically and built
at the start of each run, so an edit made during a run never reaches it. The specs that import
source modules at runtime use the dev server through `DEV_ORIGIN`. Locale and time zone are
pinned (`en-US`, `Europe/Sofia`), and a native date field's text is hidden in captures.

## Route readiness and sweep timeouts

Use `visitRoute(page, path)` from `tests/routes.ts` for route sweeps. It waits for the
requested route's active navigation link and a visible main heading, so a same-document hash
navigation cannot audit the previous page or a not-found page. Wait for `document.fonts.ready`
before measuring font-dependent geometry. Global `networkidle` does not prove the router has
rendered.

A test that walks every route gets `sweepTimeout(routes.length)` from `tests/routes.ts`
(`max(2 minutes, routes × 6s)`); a route sweep visits pages in slices (`shards()`) rather than
one test per page.
