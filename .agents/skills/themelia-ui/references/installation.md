# Installation

```bash
npm install themelia-ui
```

React 19 and `react-dom` are required peers. Everything else is optional and only pulled in
by the module that needs it; see [Optional peers](#optional-peers).

## Browser support

Chrome and Edge 125, Firefox 121 and Safari 16.4 or newer. The stylesheets rely on
`round()`, `:has()`, `:dir()` and `color-mix()` with no fallback below those versions.
Entrance transitions use `@starting-style` and simply don't animate where it is missing.
If your bundler lowers CSS for older targets, keep `:dir()` out of it: lowered, it becomes a
list of right-to-left languages and ignores `dir="rtl"`.

## Import exactly what you use

The package publishes one subpath per module and no broad barrels: there is no
`themelia-ui/base`, and there will not be. A barrel would pull every module into the bundle
and make an optional peer reachable from an import that did not ask for it.

```tsx compile
import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Money } from "themelia-ui/primitives"
```

The root `themelia-ui` export exists and is free of optional peers, but it is for
prototyping. Shipping code should name subpaths, which keeps the JS and CSS to what you
use.

The exact import for every module is in
[`docs/generated/imports.md`](imports.md), generated from the package manifest.

## Loading the CSS

The package ships three kinds of stylesheet:

| Import | Contains |
| --- | --- |
| `themelia-ui/<module>.css` | `core.css`, then the rules of the module and of the modules it draws with |
| `themelia-ui/style.css` | `core.css` and every module, in one file |
| `themelia-ui/core.css` | Tokens, themes, typefaces, the base reset and the cascade layer order; no component rules |

[`imports.md`](imports.md) gives each module's stylesheet path. A module whose
components draw nothing has no stylesheet.

### Import the stylesheets

The JavaScript imports no CSS. Import each module's stylesheet beside its JavaScript, as the
examples in these docs do, or `style.css` once. Vite, webpack, Rspack, Next.js and other
bundlers that handle CSS imports include each file once, however many modules import it. A
component whose stylesheet is not imported renders unstyled.

### In Node

The package is ES modules, and its JavaScript imports no CSS, so Node loads it as it is:
server rendering and test runners need no configuration for it, and CommonJS code on Node
20.19 or later can `require()` it. Jest is the exception, because it transforms nothing in
`node_modules` by default: exempt the package in `transformIgnorePatterns`.

### `core.css` on its own

Every module stylesheet begins by importing `core.css`, so a component never needs a
separate core import to render correctly. Import `core.css` on its own when application CSS
uses the tokens on a page without kit components, or to place the kit's layers next to
another layered stylesheet, as in the [Tailwind setup](theming.md#tailwind-css-v4).

### Overriding the kit

Component rules live in the cascade layers `tokens, theming, base, components, utilities`,
so unlayered application CSS wins over them whatever its order or specificity. Select with
the stable `data-slot` attributes and BEM hooks such as `{name}--component`, and select a
state with the attributes the primitives set (`data-open`, `data-checked`, `data-disabled`,
`data-highlighted`, `data-popup-open`). Hashed CSS Module class names change between
releases.

## Optional peers

Every peer other than React is optional, and each is reachable only from the modules that
use it: a consumer who never imports `features/map` never resolves Leaflet.

The peer-to-module table is in [`docs/generated/imports.md`](imports.md).

The `react-hook-form` adapter, for example, lives behind its own subpath so
`themelia-ui/forms` stays dependency-free; a consumer on plain React state never resolves
react-hook-form. See [Forms](forms.md).

## Profiles

The package ships two profiles from one install:

- **General**: typography, formatted primitives, controls, generic blocks, layout shells
  and domain-neutral interaction features.
- **Admin**: B2B and admin presentation, built only from the general profile.

Which modules belong to which is in
`docs/generated/profiles.md` (`node_modules/themelia-ui/docs/generated/profiles.md`). An admin module may build on a
general one, never the reverse.
