# Architecture

Not a port. The layer model, composition logic, and component vocabulary come from
`admin-ui-starter-kit`; the provider, tokenization, and structure are redesigned.

---

## 1. Layers

```
styles/          tokens + theming (no JS)
lib/             provider, variance helper, utilities
components/
  primitives/    a single formatted value — money, a date, an email
  base/          typography, controls, overlays, rows, passive structure
  features/      an interaction lifecycle: a context, a public hook, a state machine
  layout/        page and application shells around unknown children
  patterns/      domain presentation assembled from everything below
  admin/patterns/ the admin profile, built only on general families
```

There is no `ui/` layer. In the source kit that folder held vendored shadcn; nothing is
vendored here, so every primitive is authored and lives in `base/`.

**Dependency rule, enforced by `npm run verify architecture`:**

| layer | may import |
|---|---|
| `primitives/` | `lib/`, `base/typography`, formatting libs |
| `base/` | `lib/`, other `base/`, `primitives/`, Base UI, native elements |
| `features/` | `base/`, `primitives/`, `lib/` |
| `layout/` | `base/`, `primitives/`, `lib/` — a feature by another name for these rules |
| `patterns/` | everything below it; nothing below may import a pattern |
| `admin/patterns/` | everything below it, general families only |

`patterns/` sitting ABOVE features inverts the source kit's arrangement, and the inversion
is deliberate: when a feature may reach down into domain code, every feature acquires the
domain's vocabulary, and `features/ai-chat` would have had to wait on a domain family that
did not exist yet. A feature stays self-contained and a pattern assembles features; the
arrow never points the other way. The rule constrains the layers BELOW patterns — it does
not forbid a pattern composing another pattern.

No framework imports anywhere — no router, data client, or i18n. Consumers wire those at
the call site through callbacks.

---

## 2. The provider is the token system

### The problem being fixed

The source kit solves configuration three times:

| mechanism | location | nests? | runtime? |
|---|---|---|---|
| `UIProvider` — JS defaults | `lib/ui-provider` | no, **throws** on nesting | no, **mount-once** |
| `data-density` attribute | applied by hand on wrappers | yes | yes |
| `ThemeScope` / `use-applied-theme` — writes CSS vars | **`features/theme-tweaker`** | yes | yes |

Because the provider cannot nest or change at runtime, the kit grew a *feature* to do the
provider's job. `density` exists twice with no link between the halves: the provider knows
`density.defaultScale: 'md'`, CSS knows `--density-scale: 1`, and nothing reconciles them.

### The design

**Configuration is CSS custom properties on a DOM scope, plus JS config through context.**
One mechanism, and three properties fall out of it:

- **Nesting is free.** A nested scope is a nested DOM scope; the cascade merges the tokens
  and React context merges the JS config. No special casing.
- **Runtime changes are free.** Setting a custom property is cheap and needs no remount, so
  a density toggle or theme switcher is ordinary state.
- **One source per concept.** `density: "compact"` sets `--density-scale` *and* the JS
  default scale, because they are the same decision.

That is four components rather than one, because the jobs turned out to have different
contracts and inferring which one you meant from whether a provider happened to be above
you was the bug:

| | renders | reaches | for |
|---|---|---|---|
| `UIRoot` | nothing | the document, when asked | the application's defaults, once per React root |
| `UIScope` | an element (or nothing) | its own subtree | a region that differs from the app |
| `Scope` | an element | its own subtree | a token override with no JS config |
| `UIPortalHost` | a `display: contents` element | portals inside it | keeping popups in their scope |

```tsx
<UIRoot config={{ colorScheme: "dark", density: "compact" }} documentTarget="documentElement">
  <App />
  <UIScope config={{ density: "comfortable" }}>
    <Toolbar />
  </UIScope>
</UIRoot>
```

`UIProvider` still composes `UIRoot` and `UIScope` and behaves as it always has.

**`UIRoot` renders no element.** A box at the top of every application is a layout node
nobody asked for, and it broke flex and grid parents that expected their real child.

**`documentTarget` is `false` by default and must be named.** Mirroring theme and density
onto `<html>` or `<body>` is the only way a root can own the page canvas — `<body>` is an
ancestor of anything the root renders, so inline custom properties never reach it — and it
is also the only thing here that touches state outside the React tree.

Two roots on one page therefore arbitrate. Each *asks* for a target; the oldest still
mounted owns it, and when that one unmounts the document passes to the next in line rather
than reverting. What the page looked like before the FIRST root arrived is what a final
unmount restores. `body` and `documentElement` are tracked separately.

**Configuration merges one level below a slice.** A scope naming `theme.colors.primary`
keeps the rest of the palette; the record fields — `theme.colors`, `theme.palette`,
`theme.vars`, `typography.fonts`, `typography.sizes`, `motion.durations` — merge rather than
replace. Below them a record is a flat map of token to value, so there is nothing left to
merge.

**Portals leave the subtree, so they leave the scope.** Both scoping mechanisms work by
inheritance down the DOM tree, and a portal renders somewhere else in the document.
`UIPortalHost` puts the portal target back inside the scope; it is opt-in per region, and
with no host every popup renders exactly where it always did.

### What goes where

The split is mechanical, not a judgement call:

> **If it can be a token, it is CSS. If it is a decision a component makes in JavaScript,
> it is context.**

| slice | mechanism | contents |
|---|---|---|
| `theme` | CSS vars | palette, radius, shadows |
| `density` | CSS vars + context | `--density-scale` and the default `ComponentScale` |
| `typography` | CSS vars + context | `--text-*` overrides, and `defaultTextSize` |
| `motion` | CSS vars | durations, easings, reduced-motion override |
| `defaults` | context only | per-component prop defaults |
| `formatting` | context only | locale, currency, date format, week start |

### Component defaults without editing the core

The source kit's config grew a slice per component that happened to need one — `item`,
`button`, `badge`, `card`, `toast`, `spinner`, and `comments` (a *feature*) all sit in the
core type. Adding a component means editing core types.

Here, a component family declares its own defaults and registers them through interface
merging, so the core never changes:

```ts
// base/buttons/button.defaults.ts
declare module "@/lib/ui-provider" {
  interface ComponentDefaults {
    button: { tone: SemanticTone; buttonStyle: ButtonStyle; size: ComponentScale }
  }
}
```

`useDefaults("button")` is then typed, and the core config type is closed to edits.

---

### Derived tokens are declared at every scope boundary

Making the provider scopable exposed a defect that had been latent in the whole token
layer. A custom property's `var()` references resolve **where the property is declared**,
so a derived token written once at `:root`:

```css
:root { --control-h: calc(var(--height-control) * var(--density-scale)); }
```

resolves `--density-scale` at `:root` and inherits the RESULT. Overriding the scale on a
descendant changes nothing — `--control-h` is already `calc(2.25rem * 1)`. Measured before
the fix: a nested provider correctly set `--density-scale: 0.875`, and `--button-h-md` still
read `calc(2.25rem * 1)`. Scoped density and scoped theming were impossible.

Every derived layer now declares at the scope boundaries instead:

```css
:root, [data-ui-scope], [data-density], [data-theme], .light, .dark { … }
```

Each boundary re-derives from its own inputs and descendants inherit that scope's values.
Not `*` — only elements that can change an input need to recompute. The generators emit
this selector, so regeneration cannot undo it. Full rationale in `styles/SCOPES.md`.

## 3. Tokenization

Three tiers, already built and verified:

```
tokens/palette.css    primitives — raw ramps, no meaning     (--neutral-200, --brand-600)
themes/default.css    semantics — meaning, no value          (--primary: var(--brand-600))
theming/*.css         computed wiring + component contracts  (--button-h-md: var(--control-h))
```

Rules:
- A component module contains **no literal** — only `var()`.
- Nothing outside `themes/` references a primitive directly.
- Cross-cutting files (`colors`, `sizing`, `typography`, `focus`, `motion`, `elevation`,
  `layers`, `breakpoints`, `animation`) hold everything shared; per-component files hold
  only that component's contract.
- The alpha ladder and the sizing scale are **generated** from real usage, so they cannot
  drift from the components.
- Layer order `tokens, theming, base, components, utilities` means a consumer's unlayered
  CSS always wins. That replaces `tailwind-merge`.

Open improvement: component contracts are hand-written per component. They should be
generated from a manifest so every component exposes the same shape.

---

## 4. One overlay primitive

The source kit ships four overlays. They are not four things:

- `ui/dialog` and `ui/sheet` **both import `@base-ui/react/dialog`** — the same primitive,
  differing only in placement CSS.
- All four expose identical anatomy: Root, Trigger, Portal, Close, Overlay, Content,
  Header, Footer, Title, Description.
- `alert-dialog` adds exactly Action, Cancel, Media, and "no light dismiss".
- `drawer` adds exactly a drag gesture and a grab handle.

On the native `<dialog>` element they collapse completely, because placement, modality, and
dismissal are attributes and CSS on one element.

```
base/overlay/
  placement   center | inline-start | inline-end | block-start | block-end
  modality    modal | trap-focus | non-modal
  dismissal   backdrop and escape policy
  parts       Root · Trigger · Content · Header · Body · Footer
              Title · Description · Close

base/dialog/        overlay placement="center"
base/alert-dialog/  overlay placement="center" dismissal="none" role="alertdialog"
                    + Action · Cancel · Media
base/sheet/         overlay placement="inline-end"  (drag optional on block-end)
```

`features/overlays` (`ActionDialog`, `ActionDrawer`, `ConfirmDialog`) sits on top, and its
`modal: boolean | 'trap-focus'` maps straight onto `modality` instead of being re-derived
per component.

The native element supplies the top layer (no z-index, cannot be clipped by a transformed
ancestor), `::backdrop`, focus trap, Esc, `inert`, and focus restore.

---

## 5. Structure

```
components/<scope>/<name>/
  <name>.tsx           shell + re-exports
  <name>.module.css    every part's rules, one module
  <name>.types.ts      when the API warrants it
  <name>.defaults.ts   when the component registers provider defaults
  index.ts
  partials/
    <name>-header.tsx
    <name>-body.tsx
    index.ts
```

One module per component family, not per partial: a part usually reacts to the shell's
state (`.root[data-size="sm"] .header`), and splitting the CSS would force a `:global`
selector for what is otherwise an ordinary descendant rule.

**BEM hooks.** Every public `base` / `composed` / `features` component carries
`{kebab-name}--component` on its root and `{kebab-name}--{region}` on named regions. This
is the public DOM contract for consumer CSS, tests, and analytics — deliberately separate
from `data-*` attributes, which are internal.

**Vocabulary** (from the source kit, kept):

| prop | meaning |
|---|---|
| `tone` | semantic colour intent — `neutral`, `primary`, `secondary`, `info`, `success`, `warning`, `destructive` |
| `variant` | structural presentation |
| `surface` | outer chrome |
| `layout` | content arrangement |
| `buttonStyle` | fill treatment — `solid`, `outline`, `ghost` |

Never `default`, `muted`, or `error` in presentation props. Sizes are
`ComponentScale = 'sm' | 'md' | 'lg'`, resolving `props.size ?? defaults.scale ?? 'md'`.

**Carried over, minus the hook.** Every family with owned copy exports a `*Strings`
interface and its defaults, and takes `strings?: StringsProp<T>` — 61 of them. What was
not carried over is `useStrings()`: a hook between a component and a plain object makes
the copy a context dependency, so the resolver is a merge at the call site instead. See
`src/lib/strings.ts`.
