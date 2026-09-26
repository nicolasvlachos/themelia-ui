# Documentation

Documents are grouped by audience. The first three directories ship in the npm package.

| Directory | Audience | What belongs there |
|---|---|---|
| `learn/` | **Learn** | Installation, composition, framework wiring, provider and scoping, theming, forms, i18n, troubleshooting, verification, and migration policy. |
| `generated/` | **Components** | The exact public API — imports, props, types, CSS paths, recipes, and choose/avoid guidance. Written by generators, never edited by hand. |
| `build/` | **Build** | Adaptable live-preview recipes, with surrounding app-owned responsibilities called out. |
| `adr/` | Decisions | Why an expensive or irreversible choice was made, and what evidence would justify revisiting it. Repository only. |

## The generated surface

Generated from the source by the package build and shipped in the package, not committed to
the repository: in a clone, `npm run build:lib` writes it.

```text
docs/generated/imports.md               every module's exact JS and CSS import
docs/generated/public-api.md            every public symbol, its subpath, its page
docs/generated/profiles.md              which modules each profile ships
docs/generated/component-index.json     the machine-readable catalogue the component finder and the skill read
docs/generated/components/              one complete API reference per module
docs/generated/recipes.json             live-preview recipes, keyed by task
```

## Where to start

Start with [Installation](./learn/installation.md), then read
[Composition](./learn/composition.md). Choose a module from the generated
[component API](./generated/components/INDEX.md), use [Framework wiring](./learn/framework-wiring.md)
to connect application policy, and finish with the [consumer verification](./learn/verification.md)
matrix. [Troubleshooting](./learn/troubleshooting.md) covers the common integration failures.

To find a component by task, run the offline finder; `--explain` adds the matched
components, selection reasons and API anchors:

```bash
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "mobile filters for a table" --explain
```

## Working on the library

Setup, the repository layout, the checks, how these documents are generated and how a release
is cut are in [CONTRIBUTING.md](https://github.com/nicolasvlachos/themelia-ui/blob/master/CONTRIBUTING.md)
at the repository root.
