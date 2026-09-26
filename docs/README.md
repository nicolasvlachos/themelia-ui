# Documentation

Documents are grouped by audience. The first three directories ship in the npm package.

| Directory | Audience | What belongs there |
|---|---|---|
| `learn/` | **Learn** | Installation, composition, framework wiring, provider and scoping, theming, forms, i18n, troubleshooting, verification, and migration policy. |
| `generated/` | **Components** | The exact public API — imports, props, types, CSS paths, recipes, and choose/avoid guidance. Machine-written, never hand-edited. |
| `build/` | **Build** | Adaptable live-preview recipes, with surrounding app-owned responsibilities called out. |
| `maintainers/` | **Maintainer diagnostics** | Architecture reasoning, guidelines, API compatibility, releasing, and package workflow. Repository only; not instructions to consumers. |
| `adr/` | Decisions | Why an expensive or irreversible choice was made, and what evidence would justify revisiting it. |

## The generated surface

```text
docs/generated/imports.md               every family's exact JS and CSS import
docs/generated/public-api.md            every public symbol, its subpath, its page
docs/generated/profiles.md              which families each profile ships
docs/generated/component-index.json     the machine surface — agent skills read this
docs/generated/components/              one complete API reference per family
docs/generated/recipes.json             live-preview recipes, keyed by task
```

## Where to start

Start with [Installation](./learn/installation.md), then read
[Composition](./learn/composition.md). Choose a family from the generated
[component API](./generated/components/INDEX.md), use [Framework wiring](./learn/framework-wiring.md)
to connect application policy, and finish with the [consumer verification](./learn/verification.md)
matrix. [Troubleshooting](./learn/troubleshooting.md) covers the common integration failures.

To find a component by task, run the offline finder; `--explain` adds the matched
components, selection reasons and API anchors:

```bash
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "mobile filters for a table" --explain
```

## Maintaining these documents

In a repository checkout, start with `docs/maintainers/component-workflow.md`. Regenerate the
generated surface with `npm run docs:sync-skill`, which builds and checks the API first.
`verify docs-freshness` fails when a generated file differs from its generator's output,
when prose names a retired directory, or when a document cites an `npm run` script that does
not exist.

Prose must not restate a fact the generator owns, such as a family or layer count; link to
the generated file instead. A document that is finished history declares `**Historical.**` in
its opening lines, which exempts it from the dead-script rule.
