# Contributing

This guide covers working on Themelia UI itself: setup, where the code lives, the rules every
change follows, the checks, generated files, API compatibility and releases. To use the
library, start with the [README](README.md).

## Setup

You need Node 20.19 or newer.

```bash
npm install
npx playwright install chromium firefox webkit   # browsers for the Playwright suites
npm run dev                                      # the documentation site
```

`npm run dev` serves the documentation site on `http://localhost:5173` (set `PORT` to change
it). It renders every module from source, with pages grouped by tier. `npm run build:lib`
builds the package into `dist/`.

## Repository layout

| Tier | Source | Published as |
| --- | --- | --- |
| Foundations | `src/styles`, `src/lib/ui-provider`, `src/lib/theming`, `src/lib/forms`, `src/lib/forms-rhf` | `themelia-ui/ui-provider`, `themelia-ui/theming`, `themelia-ui/forms`, `themelia-ui/forms-rhf`, and the stylesheets `core.css`, `style.css` and `tailwind.css` |
| Primitives | `src/components/primitives` | `themelia-ui/primitives` |
| Base | `src/components/base/<module>` | `themelia-ui/base/<module>` |
| Layout | `src/components/layout/<module>` | `themelia-ui/layout/<module>` |
| Features | `src/components/features/<module>` | `themelia-ui/features/<module>` |
| Blocks | `src/components/patterns/<module>`, `src/components/admin/patterns/<module>` | `themelia-ui/patterns/<module>`, `themelia-ui/admin/patterns/<module>` |

| Path | Holds |
| --- | --- |
| `src/hooks` and the rest of `src/lib` | Shared hooks and helpers such as `useControllableState`, `cvm`, `cx` and the strings resolver. Not published on their own. |
| `src/preview` | The documentation site: `pages/`, one file per example under `examples/`, and the route table `routes.json`. |
| `tests` | Playwright suites over the documentation site. `tests/audit` holds the on-demand sweeps and `tests/fixtures/tailwind-v4` the Tailwind fixture. Unit tests sit beside the code they cover. |
| `scripts` | Checks (`verify-*.mjs`, run by `verify.mjs`) and generators (`gen-*.mjs`). `scripts/consumer` ships in the package: the component finder, the skill installer and the codemod. |
| `architecture` | The module manifest, the migration records, the API snapshot, the recorded theme surface, selection guidance and CSS budgets. |
| `docs` | `learn/` guides, `generated/` reference, `build/` recipes and `adr/` decisions. The first three ship in the package. |
| `examples` | `consumer-general` and `consumer-admin`, the reference applications the release gate installs from the packed package. |

### Dependency direction

`npm run verify architecture` checks every import between modules against
`architecture/manifest.json`. A module imports from its own tier and the tiers listed before
it in the tier table, with these limits:

- Layout and Features are siblings: neither imports the other.
- Nothing outside Blocks imports a block. Admin blocks build only on general modules, and
  nothing general imports an admin block.
- `base/typography`, which holds `Text` and `Heading`, sits below Primitives: primitives use
  it, and it uses only Foundations.
- No module imports a tier barrel.

The manifest is generated from the source, except for hand-edited fields such as `profile`
and `status`. Run `npm run gen:architecture` after adding, moving or removing a module, and
again after the next build, which is when it can record the module's stylesheet.

### A module

```text
src/components/<tier>/<module>/
  index.ts              the public surface: what it exports is published
  <name>.tsx            a component and its parts
  <name>.module.css     one stylesheet for a component and all its parts
  <name>.types.ts       shared types, and defaults registered on ComponentDefaults
  <name>.strings.ts     the default copy, overridable through the strings prop
  <name>.test.tsx       unit tests
  partials/             internal parts, when there are many
```

Each module is documented on a page of the documentation site. A page in
`src/preview/pages` renders its examples by key, and each example is one file in
`src/preview/examples/<page>/<id>.tsx` whose source is also the page's code tab. Examples
import the published subpaths, such as `themelia-ui/base/buttons`, which `vite.config.ts`
and `tsconfig.app.json` resolve to `src/`. Each page has a row in `src/preview/routes.json`:
its name (`label`, used for the sidebar, breadcrumb and heading), `summary`, the import lines
it shows (`imports`), and a `module` that places it in a tier. The page itself holds only its
examples. `npm run verify docs-coverage` fails when a public component is in no page's
`imports`.

## Making a change

1. Find the owner. `npm run find -- "what the UI must do" --explain` names the module and
   its exports; then read the module and its callers.
2. Fix the smallest shared owner that covers every affected caller.
3. Keep application policy out of the package: routing, data fetching, persistence,
   permissions and translation. Expose data, accessors, controlled state, callbacks, slots
   or parts at that boundary instead.
4. Show new behaviour in an example on the documentation site, and gather the evidence the
   change needs:

| Change | Evidence |
| --- | --- |
| API or behaviour | Focused unit tests for the real boundary and its failure cases; `npm run typecheck` |
| Layout, styling or interaction | The page in the browser at narrow and wide widths, in both themes, at the affected density, by keyboard; screenshots before and after |
| Exports, peers, CSS output or a shipped document | `npm run verify:consumer` |
| A theme variable or public path removed or renamed | A record in `architecture/migrations.json`, then `npm run gen:architecture` and `npm run verify migrations` |
| A check script | `npm run verify:gates` |
| Anything, before a commit | `npm run verify` and `npm test` |

A static pass is not evidence that spacing, colour or focus looks right.

## Rules

These hold for every change:

- **Two of each.** Every scale has a large step for containers and groups and a small step
  for items: two radii (`--radius` and `--radius-sm`), two paddings, two gaps. Do not add a
  third step to a scale; if one seems necessary, open an issue first.
- **Text goes through `Text` and `Heading`.** Size, weight, leading, tracking and text colour
  belong to those two components. A module renders its copy through them instead of setting
  type properties in its own stylesheet.
- **A check guards a failure a user would see:** a broken import, missing CSS, a type error,
  an accessibility violation or broken keyboard behaviour. Preferences belong in the docs.
- **A new rule retires an old one.**
- **Tests assert behaviour and the public contract:** roles, names, keyboard, callbacks and
  documented attributes. Never computed pixel arithmetic or CSS Module class names.
- **Never change a design value to make a check pass.** Fix the check.
- **Comments and documents describe the code as it is.** History belongs in git; the
  CHANGELOG lists what a user would notice.

## Conventions

Components:

- `tone` is semantic colour, from the shared `SemanticTone` union: `neutral`, `primary`,
  `secondary`, `info`, `success`, `warning` and `destructive`. `variant` is structure and
  `buttonStyle` is fill (`solid`, `outline`, `ghost`).
- Controlled and uncontrolled state goes through `useControllableState`.
- Element substitution uses `render`, never `asChild`.
- Every public component carries `{name}--component` on its root and `{name}--{region}` on
  named regions (`npm run verify bem`), and its parts carry `data-slot`. Style a state from
  the attribute Base UI or ARIA sets, so the state that shows is the state that is announced.
- Every word a component renders or announces comes from its `*.strings.ts` defaults and can
  be overridden through `strings` (`npm run verify strings`).
- `Item`, `MetadataList`, `FormField`, surface headers, `Stack` and `Grid` own their text
  roles and gaps. Compose them instead of restyling what they render.
- Wrappers of Base UI keep its focus, keyboard and accessible-name behaviour.

Stylesheets (`npm run verify css` runs every group; name one to run only that group, such as
`npm run verify composition`):

- Module rules compile into `@layer components`. No `!important`, and no inline style that
  restates padding or type (`composition`).
- Colours, radii and spacing come from theme variables, not literals (`composition`).
  `--radius` is for containers, `--radius-sm` for anything inside one or smaller, and
  `--radius-pill` is a shape.
- Derived variables are declared at every scope boundary and raw inputs at `:root` only
  (`scoping`); `src/styles/SCOPES.md` explains why.
- Inside a CSS Module, a theme class is written `:global(.dark)` (`dark-overrides`), and an
  animation goes through an `--animate-*` variable, never a bare keyframes name (`wiring`).
- Two components in one module never share a class name (`css-collisions`).

## Checks

Every check runs locally.

| Command | Runs | When |
| --- | --- | --- |
| `npm run verify` | The library build with its typecheck, unit tests, oxlint, the CSS checks, strings, docs coverage, the architecture manifest, migrations and the consumer scripts; then, on the build, the API snapshot, the CSS budget and docs freshness | Before every commit |
| `npm test` | Playwright in Chromium, and the Tailwind CSS v4 fixture | Before every commit |
| `npm run test:engines` | The keyboard, focus, popup and editing specs in Firefox and WebKit | After changing focus, keyboard, popups or editing |
| `npm run verify:consumer` | The packed package: `"use client"` boundaries, the design-token export, exports and CSS, every documented import, publint and arethetypeswrong, consumer fixtures (CommonJS, SSR, Vite, Tailwind), and the code blocks in the guides | After changing exports, peers, CSS output or a shipped document |
| `npm run verify:gates` | The checkers' self-tests: each proves its checker fails on the defect it names | After changing a check |
| `npm run verify:release` | All of the above, the reference applications, then every browser engine | Before publishing; see [Releasing](#releasing) |

- `npm run verify -- --list` names every check. `npm run verify css architecture` runs only
  those two. Add `--no-build` to reuse `dist/`.
- A check prints its output only when it fails.
- The Tailwind fixture reads `dist/style.css`: build before `npm test` on a fresh clone.
- `npm run test:unit` runs Vitest alone.
- `docs-freshness` runs the generators and compares their output with the files on disk, so a
  failure leaves the regenerated files in place: review and commit them.

### Screenshots and audit

Screenshots are a local tool. The `visual` project captures the documentation site in both
themes and compares each capture with a baseline recorded on the same machine:

```bash
npm run screenshots -- --update-snapshots   # record baselines
npm run screenshots                         # compare against them
```

Baselines are git-ignored and never committed. Record them before a visual change and compare
after it.

`npm run audit` runs sweeps over every page: radius geometry and concentric nesting,
near-circles, spacing faults no single element shows, and values that do not resolve to a
theme variable. Run it before accepting a broad visual change. Neither command is part of a
gate.

## Generated files

A generated file names its generator in its first lines. Regenerate it; never edit it by hand.

`npm run docs:sync-skill` rebuilds the documentation in dependency order. It builds the
package and checks the API snapshot, then regenerates the consumer reference, the API
tables of the documentation site, the composition ladder, the packaged skill,
`tests/README.md` and the status block at the end of this file. It stops when the API has changed: accept the change first, as described in
[API compatibility](#api-compatibility).

| Output | Generator | Source |
| --- | --- | --- |
| `docs/generated`: imports, public API, profiles, the component index and pages, recipes; and `docs/build/recipes.md` | `gen-consumer-docs.mjs` | The manifest, the built declarations and their JSDoc, `architecture/selection.json`, `architecture/component-guidance.json` and the preview examples |
| `src/preview/generated/api-tables.json`, the documentation site's API tables | `gen-api-tables.mjs` | The TypeScript source: props, members, doc comments and destructuring defaults, for the keys the pages' `PropTable`s name |
| `docs/generated/composition-ladder.md` | `gen-composition-ladder.mjs` | The declarations and the recipes |
| The migration pages in `docs/generated` | `gen-migration-map.mjs`, run by `npm run gen:architecture` | `architecture/migrations.json` and the module barrels |
| `.agents/skills/themelia-ui`, which ships in the package | `gen-agent-skill.mjs` | The component index and `docs/learn` |
| The suites table in `tests/README.md` | `gen-test-docs.mjs` | The opening comment of each spec |
| The status block below | `gen-status-docs.mjs` | `package.json`, the manifest and oxlint |
| `src/styles/tailwind.css` | `gen-tailwind-bridge.mjs`, run by `npm run tokens:tailwind` | The theme variables |
| `src/styles/themes/default.css` and `src/lib/ui-provider/tokens.generated.ts` | `gen-theme.mjs` and `gen-token-names.mjs`, run by `npm run tokens:theme` | `scripts/theme-manifest.mjs` |
| `package.json` exports, CSS Module types and barrels | `gen-exports.mjs`, `gen-css-types.mjs` and `gen-barrels.mjs`, run by `npm run build:lib` | The build and the module barrels |

Descriptions and defaults in the reference and in the site's API tables come from the
declarations: a doc comment on each prop, member and part, and the default from the
component's destructuring (or an `@default` tag where the default is applied elsewhere). A
page names what to document with `<PropTable owner>`, `owners` or `symbols` and never types a
row, except for a CSS custom property, which has no declaration. When writing documents by
hand:

- The guides in `docs/learn` ship in the package, so they link only to files the package
  ships.
- Mark each `ts` or `tsx` code block in a guide `compile`, or `fragment — <why not>`.
  `npm run verify:consumer` type-checks the `compile` blocks against the build.
- Do not restate a figure or list a generator owns, such as a module count; link to the
  generated file.

## API compatibility

`architecture/api-snapshot.json` records the public surface of every published subpath:
each exported name with its kind and a normalised signature. Object types are kept as a map
of members, so reordering an interface is not a change and removing a member is.

`verify api-snapshot` compares the build with the snapshot, and every difference fails,
additions included, until it is accepted:

| Change | Verdict |
| --- | --- |
| A subpath, name or member removed | Breaking |
| An optional member made required, or a new required member | Breaking |
| A member's type changed | Breaking |
| A new subpath, name or optional member, or a member made optional | Additive |
| A signature changed outside an object type | Review |

To accept a change, build and update the snapshot, then commit it with the change:

```bash
npm run build:lib
node scripts/verify-api-snapshot.mjs --update
```

`--update` refuses a breaking change until `architecture/migrations.json` names the symbol and
what replaces it. A removed or renamed theme variable needs an entry in that file's `tokens`
map as well, or `npm run verify migrations` fails. After editing the file, run
`npm run gen:architecture` to regenerate the migration pages.

The policy consumers rely on is [API compatibility](docs/learn/api-compatibility.md).

## Releasing

`npm run verify:release` is the release gate. It:

- refuses a working tree with uncommitted changes, so what passes is what ships;
- runs `node scripts/verify.mjs --all`: every check, the self-tests, the packed-package
  checks and the reference applications, on one build;
- runs Playwright in Chromium, Firefox and WebKit, and the Tailwind fixture, with
  `--forbid-only`, so a stray `.only` fails it;
- stops at the first failure, and gives each step an hour;
- fails if the run changed a tracked file, which means committed generated output was stale;
- prints the commit it passed. A pass says nothing about any other tree.

### Cut a version

1. Set `version` in `package.json`, and turn the CHANGELOG's `Unreleased` heading into the
   version and the date.
2. Run `npm run tokens:surface`. It records the theme variables this version declares in
   `architecture/token-surface.json`, and `verify migrations` holds the next version to that
   record. Run it only when cutting a version, never to make a removal pass.
3. Name the version in `docs/learn/migration.md`, in its opening line and in the heading of
   the version's upgrade section, and set `phase` on the version's entries in
   `architecture/migrations.json`.
4. Run `npm run docs:sync-skill`. The status block, the component index and the skill read
   the version from `package.json`.

### Publish

1. Commit everything.
2. Run `npm run verify:release`, and check that the commit it prints is the one to publish.
3. Run `npm publish`. `prepublishOnly` runs the gate again with `--publish`, which first
   refuses a version npm already has or one without a `## <version>` heading in the
   CHANGELOG. Answer npm's one-time password prompt at upload: a code passed up front
   expires while the gate runs.

To retry after an authentication, permission or registry failure,
`npm run publish:without-tests` runs `npm publish --ignore-scripts --access public`. It skips
every lifecycle script and publishes the existing `dist/` without rebuilding or testing it,
so use it only when that exact build is the one to publish.

## Status

The architecture manifest records a finer `layer` per module; `scripts/lib/tiers.mjs` maps it
to the six tiers the docs and the component index use (`typography` is part of Base, and
`patterns` and `admin` together are Blocks).

<!-- GENERATED:status by scripts/gen-status-docs.mjs — do not edit. -->

Version `2.0.2` contains 97 modules across 6 tiers — Foundations 4, Primitives 1, Base 54, Layout 9, Features 24, Blocks 5.

The package publishes 99 exact JavaScript entrypoints and 93 exact CSS entrypoints. There are no broad aggregate barrels: a consumer imports the module it uses.

Modules per profile: admin 2, general 95. A profile is a dependency ceiling, not a product taxonomy. Every module is stable.

Oxlint: 0 warnings.

These figures are generated from the repository and checked by `npm run verify`.

<!-- /GENERATED:status -->
