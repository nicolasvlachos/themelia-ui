# Themelia UI

**Foundations for every theme.**

Themelia UI is a production-ready React component system built for applications that need
more than a collection of isolated controls. It combines accessible components, composable
features and layouts, and a compact CSS-variable contract that lets one theme control the
whole interface.

Internally, components are styled with CSS Modules over [Base UI](https://base-ui.com), and
their styles ship as precompiled CSS, so the library works with any styling stack. Tailwind
is not a dependency, but applications that use it get token-aware utilities through a
first-class Tailwind CSS v4 bridge, and predictable `className` overrides.

- **Theme globally:** change colors, radius, spacing, density, type, motion, and elevation
  through shared custom properties.
- **Compose product UI:** build from formatted primitives, generic controls, interaction
  features, layouts, and domain-neutral patterns without copying library source.
- **Override locally:** use Tailwind utilities, ordinary CSS, stable BEM hooks, and documented
  `data-*` states.
- **Import narrowly:** every family has an exact JavaScript and CSS subpath; optional peers
  stay outside applications that do not use them.
- **Verified before release:** accessibility, interaction, visual, token, package, SSR, CSP,
  and consumer-fixture checks are part of the release gate.

## Contents

- [Quick start](#quick-start)
- [Choose how much CSS to load](#choose-how-much-css-to-load)
- [Imports and optional peers](#imports-and-optional-peers)
- [Tailwind CSS v4](#tailwind-css-v4)
- [Override without fighting the library](#override-without-fighting-the-library)
- [Theming](#theming)
- [Composition](#composition)
- [Find the right component](#find-the-right-component)
- [Why CSS instead of Tailwind internally?](#why-css-instead-of-tailwind-internally)
- [Architecture](#architecture)
- [Status](#status)
- [Documentation](#documentation)
- [Development](#development)
- [Verification](#verification)
- [License](#license)

## Quick start

Install the package:

```bash
npm install themelia-ui
```

React 19 and `react-dom` are required peer dependencies. Import the complete stylesheet for
the simplest setup, put `UIProvider` at the application boundary, and use exact component
subpaths:

```tsx compile
import { Button } from "themelia-ui/base/buttons"
import { UIProvider } from "themelia-ui/ui-provider"
import "themelia-ui/style.css"

export function App() {
  return (
    <UIProvider config={{ colorScheme: "system", density: "default" }}>
      <Button tone="primary" buttonStyle="solid">
        Save changes
      </Button>
    </UIProvider>
  )
}
```

The package owns presentation, accessible behavior, responsive geometry, and display
defaults. Your application keeps routing, fetching, persistence, permissions, translations,
and business state.

## Choose how much CSS to load

Themelia never injects component styles from JavaScript. Choose one loading strategy and use
it throughout the application:

| Strategy | Import | Use when |
| --- | --- | --- |
| Complete catalogue | `themelia-ui/style.css` | The application uses much of the library and values one root import. |
| Family styles | `themelia-ui/<family>.css` | The application uses a smaller set and wants CSS to follow exact JS imports. |
| Tokens only | `themelia-ui/core.css` | Application CSS needs the token contract before any component family is loaded. |

For narrow loading, keep each family stylesheet beside its JavaScript import:

```tsx compile
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"
import { Page } from "themelia-ui/layout/page"
import "themelia-ui/layout/page.css"

export function SavePage() {
  return (
    <Page header={{ title: "Workspace" }}>
      <Button>Save</Button>
    </Page>
  )
}
```

Every family stylesheet already imports `core.css`, so import it separately only when
application CSS needs the tokens before a family stylesheet loads. The generated
[import table](./docs/generated/imports.md) is the definitive list of every JavaScript path,
CSS path, and optional peer.

## Imports and optional peers

Every component family is published on an exact subpath. Import from those subpaths in
production code so optional features never leak into unrelated bundles:

```ts compile
import { Money } from "themelia-ui/primitives"
import { Button } from "themelia-ui/base/buttons"
import { DataTable } from "themelia-ui/features/table"
import { Page } from "themelia-ui/layout/page"
import { MetricGrid } from "themelia-ui/patterns/analytics"
import { UIProvider } from "themelia-ui/ui-provider"

void [Money, Button, DataTable, Page, MetricGrid, UIProvider]
```

The root `themelia-ui` export is optional-peer-free and convenient for prototypes; exact
subpaths are the production default. Heavier capabilities such as tables, charts, maps,
drag-and-drop, rich text, and React Hook Form declare optional peers only on the families
that use them.

## Tailwind CSS v4

Themelia is **Tailwind-friendly, not Tailwind-dependent**. Tailwind remains excellent for
application layout and one-off composition. Themelia keeps its component implementation in
precompiled CSS so the package works in Vite, Next.js, Remix, an existing Tailwind app, or a
project with no utility framework at all.

### Install the bridge

In the CSS entry that loads Tailwind and the complete catalogue, use this order:

```css
@import "tailwindcss";
@import "themelia-ui/style.css";
@import "themelia-ui/tailwind.css";
```

If component styles are imported by family from TypeScript, use `core.css` in the CSS entry
instead:

```css
@import "tailwindcss";
@import "themelia-ui/core.css";
@import "themelia-ui/tailwind.css";
```

Then import each family stylesheet beside its components, as in
[Choose how much CSS to load](#choose-how-much-css-to-load).

The bridge is a generated Tailwind v4 theme declaration. It does two jobs:

1. It exposes Themelia tokens as utilities: `bg-primary`, `text-muted-foreground`,
   `rounded-sm` (the inner radius), `rounded-(--radius)` (the container radius), `p-md`,
   and the rest resolve to the active Themelia theme, at the element.
2. It prevents Tailwind defaults from silently replacing shared shadcn-shaped names such as
   the radius, type, shadow, font, leading, easing, and animation variables.

### Tailwind overrides work without `!important`

Themelia establishes an explicit cascade order:

```css
@layer tokens, theming, base, components, utilities;
```

Themelia's CSS Module rules compile into `components`; Tailwind classes compile into
`utilities`. A declaration in a later layer wins regardless of selector specificity, so a
utility passed through `className` overrides the component naturally. You do not need
`!important`, a specificity hack, or `tailwind-merge`. Ordinary unlayered application CSS
sits above every named layer when an app-level stylesheet needs the final say.

Because every bridged utility reads `var(...)` at the element, it follows dark mode, nested
providers, density scopes, and live theme changes:

```tsx compile
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"

export function TailwindActions() {
  return (
    <div className="grid gap-lg sm:grid-cols-2">
      <Button className="rounded-pill px-lg shadow-lg">Approve</Button>
      <Button tone="neutral" className="justify-self-start">
        Review later
      </Button>
    </div>
  )
}
```

`rounded-pill`, `px-lg`, and `shadow-lg` use Themelia's live radius, spacing, and elevation
values. Responsive layout utilities such as `sm:grid-cols-2` remain ordinary Tailwind.

## Override without fighting the library

Use the narrowest override that matches the decision you are making.

### 1. Change a product-wide decision with a variable

Load application CSS after Themelia, then override the public contract. Raw inputs go on
`:root`; semantic colours re-derive at every scope boundary, so declare them there:

```css
:root {
  --radius: 1rem;
  --radius-sm: 0.5rem;
  --scale: 0.95;      /* denser spacing and controls… */
  --text-scale: 1;    /* …with type unchanged */
}

:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
  --primary: oklch(0.52 0.16 255);
  --primary-foreground: oklch(0.985 0 0);
}
```

Buttons, fields, menus, cards, overlays, layouts, and Tailwind bridge utilities all follow
the same values. Prefer this over repeating equivalent utility classes across the app.
[Theming](./docs/learn/theming.md#setting-a-theme) explains which selector each kind of
token needs.

### 2. Change one instance with `className`

Public components pass `className` to their root element. Tailwind utilities live in the
utilities layer, after Themelia's component layer, so they can override one instance without
`!important`, selector escalation, `tailwind-merge`, or runtime class rewriting:

```tsx compile
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"

export function CheckoutButton() {
  return (
    <Button fullWidth className="rounded-pill shadow-xl sm:w-auto">
      Continue to payment
    </Button>
  )
}
```

Keep local utilities for genuine one-off exceptions. When the same override keeps appearing,
move the decision into a theme variable or an application-owned wrapper.

### 3. Customize a region with stable CSS hooks

Every public component exposes a `{component-name}--component` root class. Named regions use
`--header`, `--body`, `--footer`, and similar BEM hooks. `data-slot` attributes expose
anatomy, and the state attributes Base UI sets (`data-open`, `data-checked`,
`data-disabled`, `data-highlighted`, `data-popup-open`) expose state:

```css
.billing-actions .button--component {
  min-inline-size: 10rem;
}

.billing-actions [data-popup-open] {
  box-shadow: var(--shadow-lg);
}
```

Unlayered application CSS wins over Themelia's named cascade layers. Target these public
hooks rather than hashed CSS Module names or package internals, which can change between
releases. Radix's `[data-state="open"]` matches nothing here; use the state attributes above.

## Theming

The theme is a contract, not a parallel stylesheet for every component. Most rebrands change
the shadcn-shaped color, radius, shadow, chart, and sidebar seeds. Shared type, spacing,
density, controls, focus, motion, media, and shell variables handle broader system choices.
Component-owned variables remain implementation details unless a reference explicitly calls
one an extension seam.

The exhaustive public contract is documented in [`src/styles/TOKENS.md`](src/styles/TOKENS.md).
[`FACTORS.md`](src/styles/FACTORS.md) explains the three global scale factors, and
[`SCOPES.md`](src/styles/SCOPES.md) explains how derived variables stay live inside nested
themes.

### Theme from React

Use `UIProvider` when theme choices and display defaults come from application state:

```tsx fragment — App and Toolbar are supplied by the consuming application
import { UIProvider } from "themelia-ui/ui-provider"

<UIProvider
  config={{
    colorScheme: "dark",
    density: "compact",
    scale: 1,
    theme: {
      colors: {
        primary: "oklch(0.7 0.14 165)",
      },
    },
  }}
>
  <App />
  <UIProvider config={{ density: "comfortable" }}>
    <Toolbar />
  </UIProvider>
</UIProvider>
```

A nested provider creates a nested theme and configuration scope; values it does not name
inherit from the parent. Each of the more specific boundaries has one job:

- `UIRoot` applies application-wide React defaults without rendering a layout element.
- `UIScope` changes theme and configuration for one subtree.
- `Scope` applies CSS variables only and creates the boundary derived tokens need.
- `UIPortalHost` keeps menus, tooltips, selects, and other portals inside a nested scope.

See [Provider and scoping](./docs/learn/provider-and-scoping.md) for portal behavior, multiple
React roots, SSR, and strict CSP configuration.

### Light and dark themes

The default theme responds to all supported signals:

```html
<html class="dark">
<html data-theme="dark">
<!-- With colorScheme="system", prefers-color-scheme is honored automatically. -->
```

When authoring theme overrides, define both the light and dark values your brand changes.
Setting `colorScheme` on `UIProvider`, `UIRoot`, or `UIScope` manages the corresponding scope
for you.

### CSS, generated palettes, and interactive themes

- Write a small application override file for the common case.
- Use `deriveThemePalette` from `themelia-ui/theming` to derive coherent CSS variables from
  a brand seed.
- Use `features/theme-tweaker` when users need to edit, preview, and serialize a complete
  theme at runtime; persistence stays in consumer-owned state.
- Use the published `tokens.json` DTCG artifact to share the token contract with design tools.

[Theming](./docs/learn/theming.md) covers all four paths in full.

## Composition

Themelia is designed for building application-specific components without absorbing
application policy. Start with the highest-level family that already owns the interaction,
then move down only when you need more control.

| Layer | Owns | Typical consumer use |
| --- | --- | --- |
| `typography/` | Text roles | Consistent hierarchy, semantics, truncation, and color. |
| `primitives/` | One formatted value | Money, dates, names, dimensions, contact values. |
| `base/` | One generic UI concept | Buttons, fields, menus, cards, tables, feedback, structure. |
| `layout/` | Page and application geometry | Route shells without owning routing or data. |
| `features/` | An interaction lifecycle | Controlled state, callbacks, accessors, slots, parts, hooks. |
| `patterns/` | A subject-shaped arrangement | Analytics, timelines, onboarding, and similar compositions. |
| `admin/patterns/` | Terminal admin presentation | Admin-specific arrangements built only from general families. |

The composition ladder is:

1. Ordinary props.
2. Controlled state and callbacks.
3. Accessors that adapt application records.
4. Named slots and render props.
5. Exported parts.
6. Headless hooks.
7. Documented multi-family recipes.

Not every family needs every rung. A passive badge needs props; a data view or editor needs
several controlled seams.

### Build a business-specific component

This component understands invoices. The package does not. The application owns the record,
permissions, mutation, route, analytics, and product copy; Themelia owns the page geometry,
metadata structure, action semantics, focus behavior, and theme:

```tsx fragment — Invoice and application policy belong to the consumer
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"
import { MetadataList } from "themelia-ui/base/display"
import "themelia-ui/base/display.css"
import { Page } from "themelia-ui/layout/page"
import "themelia-ui/layout/page.css"

function InvoiceDetail({ invoice, onCollectPayment }) {
  return (
    <Page
      header={{
        title: `Invoice ${invoice.number}`,
        description: invoice.customerName,
        actions: (
          <Button onClick={() => onCollectPayment(invoice.id)}>
            Collect payment
          </Button>
        ),
      }}
    >
      <MetadataList
        columns={2}
        items={[
          { id: "status", label: "Status", value: invoice.status },
          { id: "due", label: "Due", value: invoice.dueLabel },
        ]}
      />
    </Page>
  )
}
```

Wrap a family when your product needs a stable local name or defaults. Compose several public
families when they form a product concept. Use exported parts or a headless hook when the
lifecycle is correct but the presentation is not. Contribute a new package abstraction only
when the concept is domain-neutral, repeats across products, and keeps application policy at
the boundary.

Read the complete [composition guide](./docs/learn/composition.md) for dashboards, resource
indexes, forms, settings areas, and the wrap/compose/contribute decision.

## Find the right component

Search by the task at hand instead of guessing a component name:

```bash
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "key value facts"
```

The command searches public symbols, family identifiers, selection guidance, preview routes,
and recipes, then prints the exact JavaScript and CSS imports with “choose when” and
“avoid when” guidance. Narrow a query with `--layer=base`, `--family=`, `--profile=`,
`--peer=`, `--route=`, or `--symbol=`. Add `--json` for complete machine-readable records, or
`--explain` for the matched components, reasons, and API anchors, as in
`node node_modules/themelia-ui/scripts/consumer/find-component.mjs "mobile filters for a table" --explain`.
[Composition](docs/learn/composition.md) covers ownership decisions and checked examples.

The package also ships an offline skill for AI coding assistants, built from the same
generated component catalogue:

```bash
node node_modules/themelia-ui/scripts/consumer/install-skill.mjs --project=.
```

It installs into `.agents/skills/` and `.claude/skills/` without overwriting a skill the
package did not create.

## Why CSS instead of Tailwind internally?

Tailwind is optimized for styling code an application owns. A distributed component library
has a different job: it needs stable implementation styles, live runtime themes, scoped
inheritance, and predictable overrides in applications that may use any build stack.

| Library concern | Themelia's CSS-first answer |
| --- | --- |
| Work without consumer tooling | Precompiled family CSS; no Tailwind plugin, content scan, preset, or PostCSS setup is required. |
| Change a whole product consistently | Shared custom properties let one decision reach every component. |
| Theme a subtree at runtime | CSS inheritance and scope boundaries update descendants without rebuilding classes or remounting components. |
| Avoid class conflicts | CSS Modules isolate implementation classes; public BEM and state hooks remain deliberate. |
| Make consumer overrides predictable | Named cascade layers establish precedence instead of runtime class-string surgery. |
| Keep variants typed | `cvm()` provides `cva`-shaped typed variants that resolve to CSS Module class maps. |
| Load only what is used | Each exact component family publishes its own stylesheet and optional peer boundary. |

This is not a rejection of Tailwind. It is a separation of responsibilities:

- **Themelia CSS** owns reusable component presentation and the global design contract.
- **Tailwind in your app** owns route layout, responsive composition, and genuine local
  exceptions.
- **The bridge** makes both systems read the same live tokens.

The cascade replaces `tailwind-merge`: there is no runtime parsing or merging of class
strings.

## Architecture

Layers compose downward, never in reverse. Layout and features are siblings; a pattern may
compose both. The package never imports routing, fetching, persistence, translation, or
application-domain state.

Components that own visible or accessible copy expose typed default strings and partial
overrides. Public components expose stable root and region hooks. Modal surfaces use the
native `<dialog>` top layer; anchored surfaces use Base UI's collision-aware positioning.

## Status

<!-- GENERATED:status by scripts/gen-status-docs.mjs — do not edit. -->

Version `2.0.2` contains 97 component families across 8 layers — admin 2, base 53, features 24, foundation 4, layout 9, patterns 3, primitives 1, typography 1.

The package publishes 99 exact JavaScript entrypoints and 93 exact CSS entrypoints. There are no broad aggregate barrels: a consumer imports the family it uses.

Families per profile: admin 2, general 95. A profile is a dependency ceiling, not a product taxonomy. Every family is stable.

Oxlint: 0 warnings.

These figures are generated from the repository and checked by `npm run verify`.

<!-- /GENERATED:status -->

## Documentation

The [documentation home](docs/README.md) groups documents by audience: Learn, Components,
Build, maintainer diagnostics, and decisions.

### Guides

- [Installation and CSS loading](docs/learn/installation.md)
- [Theming and Tailwind v4](docs/learn/theming.md)
- [Provider and scoping](docs/learn/provider-and-scoping.md)
- [Composition model](docs/learn/composition.md)
- [Framework wiring](docs/learn/framework-wiring.md)
- [Forms](docs/learn/forms.md)
- [Localization](docs/learn/i18n.md)
- [Troubleshooting](docs/learn/troubleshooting.md)
- [Verifying a consuming application](docs/learn/verification.md)

### Reference

- [Component catalogue](docs/generated/components/INDEX.md)
- [Public API index](docs/generated/public-api.md)
- [Exact JavaScript, CSS, and peer imports](docs/generated/imports.md)
- [Complete token contract](src/styles/TOKENS.md)
- [Live-preview recipes](docs/build/recipes.md)

### Upgrading and support

- [Changelog](CHANGELOG.md)
- [Compatibility and migration](docs/learn/migration.md), including
  [upgrading to 2.0](docs/learn/migration.md#upgrading-to-20)
- [API compatibility policy](docs/learn/api-compatibility.md)
- [Security policy](SECURITY.md)

## Development

Common commands in a repository checkout:

```bash
npm run dev
npm run build:lib
npm run find <term>
npm run docs:sync-skill
npm run verify
```

`npm run dev` serves the local component and documentation preview, `npm run build:lib`
builds the package into `dist/`, and `npm run find` searches the component catalogue.
`npm run docs:sync-skill` rebuilds the package and regenerates the documentation and skills
derived from it.

Generated files name their generator in a header. Regenerate barrels, exports, CSS types,
themes, indexes, references, and status sections through their scripts rather than editing
them by hand.

For package work, start with `docs/maintainers/component-workflow.md`;
`docs/maintainers/releasing.md` describes how a version is cut and published.

## Verification

`npm run verify` runs the static checks in parallel beside the unit tests and one library
build, then the checks that read `dist/`. `npm run verify -- --list` names every check, and
`npm run verify composition bem` runs only the ones named. `npm test` runs the Playwright
suites in Chromium over every preview route.

```bash
npm run verify          # architecture, tokens, CSS, docs, types, lint, unit tests, dist
npm test                # Playwright interactions, accessibility, visuals, themes, geometry
npm run verify:release  # on a clean tree: every check, consumer fixture and browser suite
npm run dev             # local component and documentation preview
```

Run `npm run verify` and `npm test` before each commit.

`npm run verify:release` is the release gate. It requires a clean tree and macOS, where the
reviewed Chromium screenshot baselines apply. It runs every check, including the
packed-package checks and consumer fixtures, then the browser suites in Chromium, Firefox,
and WebKit. It stops at the first failure, fails if the run rewrites a tracked file, and
prints the commit it passed. A stray `.only` in a unit or browser test fails the gate.
Together, these steps cover CSS composition and scoping, tokens, the Tailwind bridge,
package exports, optional-peer boundaries, accessibility, visuals, SSR, CSP, and disposable
consumer applications.

`npm publish` runs the gate through `prepublishOnly`. In that mode it first refuses a version
that is already on npm or has no `## <version>` heading in `CHANGELOG.md`.

## License

Themelia UI is released under the [MIT License](LICENSE).
