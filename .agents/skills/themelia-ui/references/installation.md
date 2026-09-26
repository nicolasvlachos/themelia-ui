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

### With an ESM bundler

Vite, webpack, Rspack, Next.js and other bundlers that handle CSS imports resolve the
package's ESM build, and its entries import their own CSS: every entry imports `core.css`,
and every chunk imports the stylesheets of the components it holds. Importing a component is
enough to style it.

The examples in these docs also import the module stylesheet beside the component. It names
the same files, which the bundler includes once, and it keeps the page styled where the
JavaScript carries no CSS.

### Where the JavaScript carries no CSS

- **CommonJS.** The `require` build imports no stylesheets, because Node cannot load one.
  Import the module stylesheets, or `style.css`, from your application's CSS entry.
- **Server rendering.** Node cannot run the ESM build unbundled: its first `.css` import
  throws `ERR_UNKNOWN_FILE_EXTENSION`. Let the framework bundle the package for the server
  (in Vite, `ssr: { noExternal: ["themelia-ui"] }`), or resolve it with `require`. The
  stylesheets still have to reach the document, so import them where your framework collects
  global CSS, such as its root layout.
- **Test runners.** Vitest leaves dependencies in `node_modules` to Node, which throws on the
  same import. Inline the package so Vite transforms it; Vitest then replaces its CSS with
  empty modules:

  ```ts fragment — vitest.config.ts, merged into your existing config
  import { defineConfig } from "vitest/config"

  export default defineConfig({
    test: { server: { deps: { inline: ["themelia-ui"] } } },
  })
  ```

  Jest resolves the CommonJS build, which imports no CSS; map `\.css$` to a stub, as usual,
  for the stylesheets your own modules import.

### `core.css` on its own

Every module stylesheet begins by importing `core.css`, so a component never needs a
separate core import to render correctly. Import `core.css` on its own when application CSS
uses the tokens on a page without kit components, or to place the kit's layers next to
another layered stylesheet, as in the [Tailwind setup](theming.md#tailwind-css-v4).
`import "themelia-ui/styles"` loads the same stylesheet from JavaScript.

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
