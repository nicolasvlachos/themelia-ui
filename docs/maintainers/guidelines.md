# Guidelines

The rules this kit holds itself to, why each exists, and what it costs. Every one of them
was written after something broke — the "why" lines are not decoration, they are the reason
the rule survives contact with a deadline.

Read [Composition](../learn/composition.md) for how consumers assemble the layers and the generated
[family references](../generated/components/INDEX.md) for exact public APIs.

---

## 1. Vocabulary

**`tone` is semantic colour. `variant` is structural presentation. They are never swapped.**

- `tone`: `neutral`, `primary`, `secondary`, `info`, `success`, `warning`, `destructive`
- `variant`: whatever shapes the component — `soft`/`solid`/`outline`, `default`/`inverse`

**One vocabulary per concept.** `RoundingModeSelect` offered `"floor" | "half_up" | "ceil"`
while `DecimalInput` accepted `"round" | "floor" | "ceil" | "half-even"` — so the select
could not drive the field. It came from the source kit, where the type was a bare `string`
and nothing checked; narrowing it to a union here turned it into a type error the first
time anyone wired the two together.

**Never `default`, `muted`, or `error` as a value.** Use `neutral` and `destructive`.
`default` names a position in a list, not a meaning, so it stops being true the moment the
default changes.

> **Why.** Badge shipped with `variant="default" | "secondary" | "destructive" | "outline"`
> — four semantic colours wearing the name of a structural prop. It could not be coloured
> from the same vocabulary as the Alert beside it, and `default` told a reader nothing. It
> was ported from the source kit's `ui/` folder rather than its `base/` folder, which is
> the same mistake Alert made.

**Check `base/`, not `ui/`.** The source kit has both. `ui/` is its shadcn layer; `base/` is
the composed component with the real API. Alert and Badge were both ported from the wrong
one, and in both cases the wrong one had a plausible-looking API that quietly lacked half
the features and used the wrong vocabulary.

---

## 2. Tokens

**Every measurement and colour a component renders comes from a token.** A component
module contains `var(--x)`, never a literal, except where the value is a consequence of
geometry rather than a decision (a pill's radius is half its own height).

**Declare tokens at every scope boundary, never at bare `:root`.**

```css
:root, [data-ui-scope], [data-density], [data-theme], .light, .dark { … }
```

> **Why.** A custom property's `var()` references resolve where the property is
> **declared**, not where it is used. A derived token declared once at `:root` freezes at
> root values, and every scoped density or theme override silently does nothing. This is
> the single most expensive mistake available in this codebase and `verify scoping` exists
> only to catch it.

**Radius is two values, complementary: outer = inner + inset.**

| Token | Used by |
| --- | --- |
| `--radius` | whatever holds other rounded things: card, dialog, sheet, popover, menu, listbox |
| `--radius-sm` | everything inside one or smaller than one: fields, buttons, tabs, badges, menu rows, chips, tooltips, calendar cells. A plain value like `--radius`, not derived from it or from any spacing token; a container of `--radius-sm` items insets them by the difference (`--space-md` at the defaults), so a row sits concentric in its menu. |
| `--radius-pill` | a shape, not a radius: fully round ends |

> **Why.** There used to be a `--corner*` family aliasing the same ladder under different
> names. Card reached for `--corner` and Alert for `--radius-lg` — the identical 12px by
> two routes — while Item and Accordion sat on `--radius-2xl` and every popup on
> `--radius-md`. Four different radii across things that are all just panels, and no way to
> see it from any one file. After that came thirteen names — a ladder, four roles and a
> derived one — and components picked between them case by case, which is how a tooltip and
> the menu beside it disagreed. Two values leave nothing to pick wrongly.

**One popup inset, one popup row.** Dropdown menu, action menu, popover menu, combobox,
select, and the command palette all inset their rows by `--space-md` — the difference
between `--radius` and `--radius-sm`, so a row sits concentric in its popup — and take
`--row-px`, `--menu-row-py` and `--menu-row-min-h` for the row.

> **Why.** Nobody chose four values; each surface set its own 4px and then they NESTED.
> PopoverMenu is a Command inside a Popover, so the Command root's 4px, the list's 4px and
> the group's 4px stacked into a 12px inset sitting beside a dropdown menu's 4 — three
> times the padding for the same job, and nothing in any one file to reveal it.

**Icon sizes come from `--size-icon-*`.** Including the decorative ones
(`--size-icon-xl`, `--size-icon-2xl`) — three components each reaching for a raw `1.5rem`,
`2rem`, `2.5rem` is three different "big icons".

**Three factors: `--scale`, with `--density-scale` and `--text-scale` under it.** Density
moves spacing and control geometry, rounded to whole pixels; the type factor moves every
typography role. No per-family factor, never two factors in one length; `verify factors`
checks both. See `src/styles/FACTORS.md`.

**A layout that can sit inside a container answers to the CONTAINER, not the viewport.**
The auth split has a 24rem floor under its panel, so on a wide window the two columns
appeared however narrow the shell's own box was — the panel took most of it and squeezed
the form to a gutter. `@container`, not `@media`, wherever the component is as likely to
be embedded as to own the screen.

**A responsive variable is reset on the component that reads it.** Custom properties
inherit, so `<Stack direction="horizontal">` — which writes `--stack-direction-base: row`
as an inline style — turned every Stack nested inside it into a row as well. A column of
fields inside a horizontal toolbar silently became a second toolbar. Resetting the whole
family to `initial` in the base rule breaks the inheritance without breaking the prop: an
inline style outranks a class rule, so a Stack that sets its own value keeps it.

**A responsive chain must reach every breakpoint below it.** `var()` fallbacks nest rather
than cascade, so "the nearest defined breakpoint at or below this one" has to be written
out longhand — and longhand is what rots.

> **Why.** Structure's chains were truncated: `lg` fell back to `md` and then straight to
> `base`, skipping `sm`. So `columns={{ base: 1, sm: 2 }}` gave two columns between 40rem
> and 64rem and then reverted to ONE on a wide screen — the opposite of what a mobile-first
> prop means. `flex-wrap` was missing from the two widest queries entirely and the grid's
> `row-gap`, `column-gap` and `align-items` had no responsive rules at all. Nothing failed:
> not the build, not the types, not a screenshot taken at one width. `verify responsive`
> fails now.

**A family never gets its own factor.** Carousel once scaled from `--repeater-scale`, so
tightening a repeater shrank every carousel dot on the page. Family factors were removed;
use a scoped global factor or override one earned measurement instead.

---

## 3. Components

**Controlled and uncontrolled goes through `useControllableState`.** Sixteen components had
independently written the same six lines; two had already drifted — one notified `onChange`
before the state settled, another skipped it entirely while controlled, which silently
makes a controlled component read-only.

**Every structural element carries a `data-slot`.** `className` and `style` land on the
element the component considers its subject — for `Input` that is the `<input>`, not the
box around it — so without a slot on the frame a caller has no way to address the field's
shape at all. TimePicker set a width on its segments, sized the text boxes, and left the
frames filling the row: the hour and the minute ended up a quarter of the page apart.

**A component that owns nothing owns nothing.** Repeaters, uploads, and tables take their
items and their handlers and render them. A component that kept its own copy would have to
reconcile with whatever the form library also thinks the list is, and the two drift on the
first reset or server round-trip.

**A hook that registers something keys its effect on identity you control.**
`useRegisterActions` takes an array callers write inline, so keying the effect on the array
re-registered every render, and registering bumps a store version that re-renders the
caller: an unbounded loop that hangs the tab rather than failing quietly. It keys on the
action IDs and refreshes one stable array in place — re-registering on identity instead
would only have swapped the loop for stale closures.

**A typography component paints its own colour, so `color` on its parent loses.** Any
surface that inverts or tints has to restate the typography contract inside its own scope
— `--text-role-main`, `--text-role-secondary`, `--text-role-inverse` and `--link-color` — not `--foreground`, which is substituted
where it is declared and so cannot be overridden from below. The inverse Alert re-points
those roles. A panel that holds arbitrary children, like the auth split panel, is a
`data-theme="dark"` scope instead, so every token re-derives, not only the text roles.

> **Why.** Twice. The record header's metadata rendered “Owner Jane McDonald” as one
> indistinguishable run because the `dt`'s muted colour never reached the `Text` inside it.
> The auth split panel once inverted to `--foreground`, and a `Heading` dropped into it resolved
> `--foreground` too: white on white, 1.00:1, a title that is simply not there. The
> contrast suite caught the second one; nothing but a pair of eyes caught the first.

**Reset the list.** A `<ol>`/`<ul>` used for semantics still arrives with the UA's 40px
indent and its markers. Breadcrumbs was the one list in the kit that had not, so every
trail — including the one built into `Header` — sat 40px right of the title above it.

**Business logic goes to a hook; the component stays a rendering.** `useObjectUrls`,
`useFieldValue`, `useCarousel`, `useFileDropTarget`, `useDebouncedCallback` all exist
because the logic was repeated, subtle, or both.

**Default strings are a prop, not a helper.**

```tsx fragment — a template with a hole in it
export const defaultXStrings: XStrings = { … }
const copy = { ...defaultXStrings, ...strings }
```

A spread is one line, it is obvious at the call site what wins, it works outside React, and
it cannot introduce a render-order dependency. Resolve it **inside** any `useMemo` that
depends on it — resolving outside makes a new object every render, so the memo never hits.

**A component's default must not read the clock.** `RelativeTime` takes `now`. Reading it
inside the component renders differently on the server and the client, gives a different
snapshot on every test run, and does not even buy a live value in exchange — nothing
re-renders it as time passes.

**No size props**, with three deliberate exceptions: Avatar, Spinner, and Slider. Each has
no content to scale with, or — for the Slider — is dragged, which makes target size a real
decision rather than a style one. Everything else scales through factors.

---

## 4. Accessibility

**The state that styles the component is the state that announces it.** Key styling off
`aria-current`, `aria-invalid`, `aria-expanded`, `data-state` — never off a class that
exists only for CSS. A page that looks right and announces nothing is the normal failure.

**Only a destructive alert gets `role="alert"`.** It interrupts a screen reader
mid-sentence. Everything else is `role="status"` and waits for a pause — cutting someone
off to say a save succeeded is worse than waiting.

**Progress drops its ARIA value attributes when indeterminate.** Announcing 0% when the
number is unknown is worse than announcing nothing.

**A scrollable region needs `tabIndex={0}`.** Otherwise arrow keys go to whatever else has
focus and a reader who cannot use a pointer cannot reach the bottom of the page.

**A control is a control, not an icon with an onClick.** The date picker's clear was a
bare `<svg onClick>` inside the trigger — no name, no focus stop, no keyboard route, so a
keyboard user could not clear the field at all. A real button cannot nest inside the
trigger button either, which is why it belongs in a frame beside it.

**A tooltip is never the only copy.** It cannot be opened on a touch screen and vanishes
when the pointer moves. An icon-only control still needs its own `aria-label` — the tip is
not a name.

**The media aligns to the first line, everywhere.** Item states the rule and the upload
row broke it: centred against three lines, the error glyph sat beside "Failed" rather than
beside the filename it describes.

**Meaning never rests on hue alone.** Badge's dot is filled, hollow, or pulsing; the shape
carries the difference so it survives being printed or read by someone who cannot separate
the colours.

---

## 5. CSS

**Two components in one module must not share a class name.** CSS Modules hashes a class
once per FILE, so `.tab` written under Tabs and `.tab` written again under OverflowTabBar
is one class, and the later rule silently retunes the earlier one. A Tabs tab was picking
up `--tab-bar-px`, a border-radius and a scroll-snap it never asked for; the only reason it
did not show is that the two happened to share a height. `verify css-collisions` reads the
section banners and fails on a class that spans two of them.

**A scroll container clips on BOTH axes.** There is no `overflow-y: visible` beside an
`overflow-x: auto` — it computes to `auto`. The tab list scrolls, so the active tab's
indicator, which hung 2px below to overlap the rule, was simply cut off: the variant called
"underline" had no underline. The rule is an inset shadow now and the indicator sits at
`bottom: 0` on top of it, both inside the box that clips.

**Never write a bare `@keyframes` name inside a `.module.css`.** CSS Modules scopes
keyframe names, so `animation: spin 1s linear` is rewritten to a scoped name that does not
exist. No error, no warning — the spinner simply never turns. Go through an `--animate-*`
variable. `verify wiring` checks this.

**An object URL is revoked when its replacement exists, not in an effect cleanup.**
StrictMode runs the effect, the cleanup, then the effect again, so a cleanup-based revoke
kills the very URLs the state was just handed — the first paint points at dead blobs and
the console fills with one `ERR_FILE_NOT_FOUND` per image.

**`pointer-events: none` and `cursor: not-allowed` are mutually exclusive.** The element is
not hit-tested, so the cursor never renders. Native `:disabled` keeps pointer events and
shows the cursor; anything disabled through `aria-disabled`/`data-disabled` drops them and
dims. `verify wiring` checks this too.

**An exit transition is not the enter transition reversed.** It is shorter, and it is not
eased IN. `ease-in` spends its first half barely moving, so at 112ms the overlay appears to
hang and then vanish — which reads as lag, not as timing. What makes a dismissal feel
immediate is motion that starts immediately; the difference between the two directions is
carried by duration.

**Do not use `backdrop-filter`.** It cannot be composited: every frame it is on screen the
browser re-rasterises everything behind the surface. Timed across a dialog close at
1440×950 — animated blur `10, 29, 32, 39, 93ms`; static blur `5, 8, 37, 48, 65ms`; none at
all `4, 8, 9, 11, 11ms`. A 112ms exit was taking 190ms and drawing four frames of it. That
is what "the overlay lags" turned out to be — not the duration, not the easing, not React.
The tint alone is a scrim; the blur is a garnish that costs the whole animation.
`--overlay-backdrop-filter` is `none`, and a product that wants one can pay for it.

**A patterned rule is a border, not a background.** `background-color` paints a solid
rectangle and has no notion of a dash, so a dashed separator needs zero cross-axis size and
a border.

**Slot takes exactly one element.** Button wrapped its children in a label span and
appended a spinner, so Slot saw an array of two, `isValidElement` said no, and it returned
`null`. Every `asChild` button in the kit rendered nothing — silently, for as long as
nobody used one. The spinner is a `::after` now; `asChild` is retired in favour of `render`
(docs/adr/0005), which puts the content inside the caller's element rather than replacing
it, so the wrapper survives.

**Retiring a compatibility path is a good moment to check what only that path was doing.**
`PopoverTrigger` inferred Base UI's `nativeButton` from the element — on the `asChild`
branch only. So the canonical spelling was the broken one, and
`<PopoverTrigger render={<a href="/x">Open</a>} />` shipped `<a href="/x" type="button">`:
on an anchor `type` is not the button type at all, it is the MIME-type hint for the
destination. The deprecated branch had been carrying the fix.

**A shape depends on the axis it runs along.** ButtonGroup squared its inner corners with
one set of rules for both orientations, so a vertical stack got the horizontal treatment —
top button rounded on its left, square on its right. And a pill radius is a shape for the
LONG axis: stacked, the edge constraining the top corners becomes the button's width, both
clamp to half of it, and a two-button group renders as a circle.

**`table-layout: fixed` for any table with a long cell.** With `auto`, the widest cell wins
the negotiation — and in an API table that is always the type column, which took 530px of
842 and squeezed the description to 91px and 206px-tall rows.

**Padding replaces, it does not stack.** A shell with its own `padding-block` on top of the
control's produced a 40px tags field beside every other field at 36; `min-height` only sets
a floor and could not pull it back.

---

## 6. Testing

Static verifiers (`npm run verify`) and Playwright suites (`npm test`).

**Prove a guard fires before trusting it.** Every verifier in `scripts/` was tested by
injecting the defect it claims to catch. The visual suite's first pixel budget allowed 2%
of the image — over twenty thousand pixels — and passed a broken `--field-radius` without
noticing. The budget is now an absolute 60 pixels, calibrated against that real change.

**An example must be able to show what its text claims.** A loading button beside nothing
cannot demonstrate that it keeps its label's width. A scoped table with no unscoped twin
just looks like a table. `max` was documented on `ActionButtons` for months and did not
exist. If a section asserts a behaviour, the preview under it has to make that behaviour
visible — otherwise the docs are a list of promises.

**Keep the fixtures deterministic.** No `new Date()` in an example, and no JS-driven mount
animations — recharts replays its own and it is not a Web Animation, so nothing can be
awaited on it.

---

## Limitations

Things this kit deliberately does not do, so nobody spends a day discovering them.

- **No router.** `renderLink` / `render` props take the framework's link element. The kit
  never imports one.
- **No required form library.** `FormField` supplies chrome and wiring; validation and state
  are the caller's. `ObjectRepeater` is public, the generic form contract is dependency-free,
  and the react-hook-form adapter lives behind the optional `forms-rhf` subpath.
- **No global shortcut seizure.** `useCommandShortcut` binds ⌘K when the app asks. A library
  that grabs it on import takes it from whatever already used it.
- **No uploads.** The upload family produces `File` objects and renders the status the
  caller reports. Nothing transfers anything.
- **Base UI and cmdk are real dependencies.** Popovers, menus, dialogs, and the command
  palette are theirs; this kit supplies the surface, the tokens, and the composition.
- **`features/` IS ported** — features sit below `patterns/`, which may compose them. What
  remains out of scope is application POLICY: routing, fetching, persistence, permissions,
  and i18n runtime all stay at the consumer boundary, reached through callbacks and accessors.
- **The auth FLOW is not ported, only its layouts.** `AuthShell` and `AuthSplitPanel` are
  arrangements; the source kit's auth form, social-provider row, and method switcher encode
  a particular flow — which providers exist, what a submit means, how a second factor is
  asked for — and a UI kit that ships those has decided your authentication for you.
- **The actions service imports nothing.** No router, no data layer, no toast package, no
  auth. An action's `run` is a callback the application supplies. `requestRunner` and the
  feedback handlers are the seams where a product plugs its own in.
- **Dark theme is token parity with the source kit, not an independent design.** Where the
  source kit's dark values are unusual — `--background: oklch(0.28 0 0)` is lighter than
  stock shadcn — this kit matches it rather than improving on it.
