# Themelia UI

**Foundations for every theme.**

Themelia UI is a React component library for building applications: accessible controls,
page layouts, interaction features and ready-made blocks, styled with precompiled CSS and
themed through one set of CSS variables.

- **One theme for the whole interface.** Colour, radius, spacing, density, type and motion
  are CSS variables that every component reads, so one change reaches every component, in
  light and dark.
- **Plain CSS, nothing to configure.** Components are CSS Modules over
  [Base UI](https://base-ui.com), shipped as precompiled stylesheets. No Tailwind, PostCSS or
  plugin is needed; applications that use Tailwind CSS v4 get a bridge to the theme.
- **Overrides without `!important`.** Component rules live in cascade layers, so a utility
  in `className` or ordinary application CSS wins.
- **Import only what you use.** Every module has its own JavaScript and CSS subpath.
  Optional peers such as charts, maps and rich text are needed only by the modules that use
  them.
- **Your application keeps its policy.** Routing, data fetching, persistence, permissions and
  translations stay in your code. Components take data, callbacks and render props.

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [Load the CSS](#load-the-css)
- [Imports and tiers](#imports-and-tiers)
- [Theming](#theming)
- [Tailwind CSS v4](#tailwind-css-v4)
- [Overrides](#overrides)
- [Composition](#composition)
- [Find a component](#find-a-component)
- [Documentation](#documentation)
- [License](#license)

## Install

```bash
npm install themelia-ui
```

React 19 and `react-dom` are required peers. Every other peer is optional and needed only by
the modules that use it; the [import table](https://unpkg.com/themelia-ui/docs/generated/imports.md) lists which.

Themelia supports Chrome and Edge 125, Firefox 121 and Safari 17.5 or newer. Builds and
server rendering need Node 20.19 or newer.

## Quick start

Put `UIProvider` at the root of the application, import the stylesheet once, and import
each component from its module's subpath:

```tsx
import { Button } from "themelia-ui/base/buttons"
import { UIProvider } from "themelia-ui/ui-provider"
import "themelia-ui/style.css"

export function App() {
  return (
    <UIProvider config={{ colorScheme: "system" }}>
      <Button tone="primary">Save changes</Button>
    </UIProvider>
  )
}
```

`style.css` holds the CSS of the whole library. To load only what the application uses, see
[Load the CSS](#load-the-css).

## Load the CSS

The styles are precompiled CSS in cascade layers, declared in this order:

```css
@layer tokens, theming, base, components, utilities;
```

Three kinds of stylesheet are published:

| Import | Contains |
| --- | --- |
| `themelia-ui/style.css` | Everything: `core.css` and the rules of every module. |
| `themelia-ui/<module>.css`, such as `themelia-ui/base/buttons.css` | One module's rules and the stylesheets they build on. It imports `core.css` itself. |
| `themelia-ui/core.css` | The theme variables, the layer order, the Geist typefaces and the base element styles. No component rules. |

A module whose components draw nothing has no stylesheet. The
[import table](https://unpkg.com/themelia-ui/docs/generated/imports.md) lists the JavaScript and CSS path of every module.

### Import the stylesheets

The JavaScript imports no CSS. Import `style.css` once, or each module's stylesheet beside its
import; a bundler that handles CSS imports, such as Vite, webpack or Rspack, includes each file
once however many modules import it:

```tsx
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"
import { Page } from "themelia-ui/layout/page"
import "themelia-ui/layout/page.css"
```

A component whose stylesheet is not imported renders unstyled. Import `core.css` on its own
only when your own CSS needs the theme variables before any module stylesheet loads.

### On the server and in tests

The package is ES modules, and because its JavaScript imports no CSS, Node loads it as it is.
Server rendering and Vitest need no configuration for it, and CommonJS code on Node 20.19 or
later can `require()` it. Jest transforms nothing in `node_modules` by default: exempt the
package in `transformIgnorePatterns`.

## Imports and tiers

Every module is published on its own subpath. Modules are grouped in tiers, from the theme
up to complete blocks:

| Tier | Holds | Import from |
| --- | --- | --- |
| Foundations | The provider and scopes, theme helpers, form bindings and the theme stylesheet | `themelia-ui/ui-provider`, `themelia-ui/theming`, `themelia-ui/forms`, `themelia-ui/forms-rhf`, `themelia-ui/core.css` |
| Primitives | One formatted value: money, dates, names, file sizes | `themelia-ui/primitives` |
| Base | One control or concept, including `Text` and `Heading` | `themelia-ui/base/<module>` |
| Layout | Page and application shells | `themelia-ui/layout/<module>` |
| Features | An interaction lifecycle with controlled state | `themelia-ui/features/<module>` |
| Blocks | Subject-shaped compositions of the tiers above | `themelia-ui/blocks/<module>`, `themelia-ui/blocks/admin/<module>` |

```ts
import { UIProvider } from "themelia-ui/ui-provider"
import { Money } from "themelia-ui/primitives"
import { Button } from "themelia-ui/base/buttons"
import { Page } from "themelia-ui/layout/page"
import { DataTable } from "themelia-ui/features/table"
import { MetricGrid } from "themelia-ui/blocks/analytics"
```

There are no tier barrels: `themelia-ui/base` does not exist, so one import never pulls in a
whole tier or an optional peer it did not ask for. The root, `themelia-ui`, exports the
provider and the primitives, with no optional peers.

## Theming

Every component reads one set of CSS variables. Set them from React or from CSS.

From React, `UIProvider` applies its configuration to everything inside it:

```tsx
<UIProvider
  config={{
    colorScheme: "system",   // "light", "dark" or "system"
    density: "default",      // "compact", "default" or "comfortable"
    theme: {
      radius: "1rem",        // containers: cards, dialogs, popovers, menus
      radiusSm: "0.5rem",    // items: controls, rows, chips, badges
      colors: { primary: "oklch(0.55 0.19 250)" },
    },
  }}
>
  <App />
</UIProvider>
```

A nested `UIProvider` themes one region, and inherits whatever it does not set. For finer
control, `UIRoot`, `UIScope`, `Scope` and `UIPortalHost` each do one of its jobs; see
[Provider and scoping](docs/learn/provider-and-scoping.md).

From CSS, set any theme variable on `:root`. A colour holds both modes as
`light-dark(light, dark)`, and each element's `color-scheme` picks the half, so one
declaration reaches every region, a dark region inside a light page included:

```css
:root {
  --radius: 1rem;
  --radius-sm: 0.5rem;
  --primary: light-dark(oklch(0.55 0.19 250), oklch(0.72 0.14 250));
  --primary-foreground: light-dark(oklch(0.985 0 0), oklch(0.2 0.03 250));
}
```

A colour given one value is used in both modes. Dark mode follows `class="dark"`,
`data-theme="dark"` or, with `colorScheme: "system"`, the operating system's preference: each
sets `color-scheme`, and nothing is declared twice.

Beyond a few variables:

- `deriveThemePalette` from `themelia-ui/theming` derives a coherent palette from one
  primary colour.
- `ThemeTweaker` from `themelia-ui/features/theme-tweaker` lets people edit, preview and
  export a theme while the application runs.
- `themelia-ui/tokens.json` publishes the theme in the W3C design tokens format for design
  tools.

[Theming](docs/learn/theming.md) covers each of these, and
[`src/styles/TOKENS.md`](src/styles/TOKENS.md) names the variable for every role.

## Tailwind CSS v4

Themelia does not use Tailwind and does not need it. In an application that does, import
the bridge in the CSS entry that loads Tailwind:

```css
@import "tailwindcss";
@import "themelia-ui/style.css";
@import "themelia-ui/tailwind.css";
```

If the application loads module stylesheets instead of `style.css`, import
`themelia-ui/core.css` in its place.

The bridge is a Tailwind theme declaration generated from Themelia's variables. It does two
things:

1. Utilities read the live theme. `bg-primary`, `text-muted-foreground`, `rounded` (the
   container radius), `rounded-sm` (the item radius), `p-padding`, `gap-gap-sm` and
   `shadow-lg` resolve through Themelia's variables at the element, so they follow dark mode,
   nested providers and density.
2. It keeps Tailwind's defaults from replacing the variables both define, such as
   `--radius-sm`, `--text-sm` and `--font-sans`. Import it even if you never write one of
   its utilities.

Tailwind compiles utilities into the `utilities` layer, after Themelia's `components` layer,
so a utility in `className` overrides a component's own rule. There is no need for
`!important` or `tailwind-merge`.

```tsx
<Button className="rounded-pill px-padding shadow-lg">Approve</Button>
```

## Overrides

Use the narrowest override that expresses the decision:

1. **Across the product:** set a theme variable, as in [Theming](#theming).
2. **One instance:** pass `className`.
3. **A part of a component:** select its stable hooks. Each public component carries a
   `{name}--component` class on its root and `{name}--{region}` classes on named regions;
   parts carry `data-slot`; states carry the attributes Base UI sets, such as `data-open`,
   `data-checked`, `data-disabled`, `data-highlighted` and `data-popup-open`.

```css
.billing-actions .button--component {
  min-inline-size: 10rem;
}

.billing-actions [data-popup-open] {
  box-shadow: var(--shadow-lg);
}
```

Ordinary unlayered CSS wins over every Themelia layer, whatever the import order. Select the
documented hooks, not hashed CSS Module class names, which change between releases.

## Composition

Start from the highest tier that already owns the job, and move down only when you need more
control: use a block, configure it through props, compose your own from features and base
modules, and use exported parts and hooks when the behaviour is right but the presentation is
not.

The application owns what is specific to it. Here it owns the invoice, the permission to
collect payment and the mutation; Themelia owns the page geometry, the metadata layout, the
action semantics, focus and the theme:

```tsx
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

[Composition](docs/learn/composition.md) covers dashboards, resource indexes, forms and
settings areas, and when to wrap, compose or contribute a component.

## Find a component

Search the catalogue that ships with the package, offline, by what the interface must do:

```bash
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "mobile filters for a table" --explain
```

Each match comes with its exact JavaScript and CSS imports and guidance on when to choose it
and when to avoid it. `--json` prints complete records, and `--help` lists the filters.

The package also ships a skill for coding assistants, built from the same catalogue:

```bash
node node_modules/themelia-ui/scripts/consumer/install-skill.mjs --project=.
```

It installs into `.agents/skills/` and `.claude/skills/`, and never overwrites a skill it did
not install.

## Documentation

The [documentation index](docs/README.md) groups every document by audience.

Guides:

- [Installation and CSS loading](docs/learn/installation.md)
- [Theming and Tailwind CSS v4](docs/learn/theming.md)
- [Provider and scoping](docs/learn/provider-and-scoping.md)
- [Composition](docs/learn/composition.md)
- [Framework wiring](docs/learn/framework-wiring.md)
- [Forms](docs/learn/forms.md)
- [Localization](docs/learn/i18n.md)
- [Troubleshooting](docs/learn/troubleshooting.md)
- [Verifying a consuming application](docs/learn/verification.md)

Reference, generated from the source when the package is built. It ships in the package
under `node_modules/themelia-ui/docs`, and the links open the latest published copy:

- [Component catalogue](https://unpkg.com/themelia-ui/docs/generated/components/INDEX.md)
- [Public API index](https://unpkg.com/themelia-ui/docs/generated/public-api.md)
- [JavaScript, CSS and optional-peer imports](https://unpkg.com/themelia-ui/docs/generated/imports.md)
- [Theme variables](src/styles/TOKENS.md)
- [Recipes](https://unpkg.com/themelia-ui/docs/build/recipes.md)

Upgrading and support:

- [Changelog](CHANGELOG.md)
- [Compatibility and migration](docs/learn/migration.md)
- [API compatibility policy](docs/learn/api-compatibility.md)
- [Security policy](SECURITY.md)

To work on the library itself, see
[CONTRIBUTING.md](https://github.com/nicolasvlachos/themelia-ui/blob/master/CONTRIBUTING.md).

## License

Themelia UI is released under the [MIT License](LICENSE).
