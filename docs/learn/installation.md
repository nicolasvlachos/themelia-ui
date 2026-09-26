# Installation

```bash
npm install themelia-ui
```

React 19 and `react-dom` are required peers. Everything else is optional and only pulled in
by the family that needs it — see [Optional peers](#optional-peers).

## Browser support

Chrome and Edge 125, Firefox 121 and Safari 16.4 or newer. The stylesheets rely on
`round()`, `:has()`, `:dir()` and `color-mix()` with no fallback below those versions.
Entrance transitions use `@starting-style` and simply don't animate where it is missing.
If your bundler lowers CSS for older targets, keep `:dir()` out of it: lowered, it becomes a
list of right-to-left languages and ignores `dir="rtl"`.

## Import exactly what you use

The package publishes one subpath per family and no broad barrels: there is no
`themelia-ui/base`, and there will not be. A barrel would pull every family into the bundle
and make an optional peer reachable from an import that did not ask for it.

```tsx compile
import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Money } from "themelia-ui/primitives"
```

The root `themelia-ui` export exists and is optional-peer-free, but it is for
prototyping. Shipping code should name subpaths, which keeps the JS and CSS to what you
use.

The exact import for every family is in
[`docs/generated/imports.md`](../generated/imports.md), generated from the package manifest.

## CSS

Import each family's stylesheet beside its components. The ESM build also imports its own
CSS, but the CJS build, SSR without a CSS loader and most test runners do not; the explicit
import behaves the same everywhere and keeps the selected CSS visible in application source.
Each family stylesheet imports the shared tokens, themes and cascade layer order from
`core.css` for you.

```tsx fragment — shape only, not a program
import "themelia-ui/base/buttons.css"
```

Import `themelia-ui/core.css` on its own only when application CSS needs the token
contract before any family stylesheet is loaded. Do not add it merely because you imported
a family stylesheet; that sheet already imports it.

A family whose components draw nothing has no sheet. `imports.md` records which.

If you would rather not track sheets per family, `themelia-ui/style.css` is the
deduplicated union of all of them, larger than any one app needs.

Import application overrides after the kit. Component rules live in cascade layers, so
ordinary unlayered consumer CSS wins without specificity tricks. Select with stable
`data-slot` and BEM hooks, and select a state with the attributes the primitives set
(`data-open`, `data-checked`, `data-disabled`, `data-highlighted`, `data-popup-open`).

## Optional peers

Every peer other than React is optional, and each is reachable only from the families that
use it: a consumer who never imports `features/map` never resolves Leaflet.

The peer-to-family table is in [`docs/generated/imports.md`](../generated/imports.md),
generated from and checked against the package graph.

The `react-hook-form` adapter, for example, lives behind its own subpath so
`themelia-ui/forms` stays dependency-free; a consumer on plain React state never resolves
react-hook-form. See [Forms](./forms.md).

## Profiles

The package ships two profiles from one install:

- **General** — typography, formatted primitives, controls, generic patterns, layout shells
  and domain-neutral interaction features.
- **Admin** — B2B and admin presentation, built only from the general profile.

Which families belong to which is in
[`docs/generated/profiles.md`](../generated/profiles.md). An admin family may build on a
general one, never the reverse.
