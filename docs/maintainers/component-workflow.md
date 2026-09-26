# Component maintenance

This is the repository-owned maintenance workflow for **themelia-ui**. It takes precedence
for this checkout over personal skills describing the older source kit. Consumer guidance
is separate: [Composition](../learn/composition.md) and the packaged `themelia-ui` skill.

## Find the owner before editing

1. Run `npm run find -- "the user task" --explain`. Read only the matching family reference.
2. Check the implementation and its callers. `architecture/manifest.json` owns exact
   entrypoints and layer boundaries; `package.json` owns published exports.
3. Choose the smallest shared owner that fixes the affected callers. Follow
   [composition ownership](../learn/composition.md#keep-presentation-with-its-owner).
4. Keep routing, data fetching, persistence, permissions and translation policy in the app.
   Expose data, accessors, controlled state, callbacks, slots or parts at that boundary.

Typography and primitives describe text and single formatted values. Base owns generic
controls and passive structures. Layout and features are siblings; patterns can compose
both. Admin is terminal and builds on general families. The generated
[profiles](../generated/profiles.md) and architecture verifier own the precise dependency graph.
There is no vendored UI layer and no broad layer import barrel.

## Composition and styling

- Use Text for primary copy without pinning its body size. Surface headers, Item parts,
  FormField and MetadataList own their internal text roles and gaps.
- Use DisplayLabel for read-only labels; FormField for editable controls. Do not style one
  by nesting a differently sized Text inside it.
- Use Stack/Grid for passive arrangement. Reuse existing shared spacing, density and shape
  tokens. A component-specific token needs a real independent tuning purpose.
- Inline styles may express runtime geometry/data, not a second padding or typography system.
- Base UI wrappers retain focus, keyboard and accessible-name contracts. Native controls
  still need labels. Keep controlled/uncontrolled behavior and async recovery explicit.
- Consumer-visible strings use the family strings contract and provider defaults; do not
  hard-code a second set of defaults in the preview.
- Preview pages demonstrate public APIs. Keep application policy and demo fixtures out of
  package internals. Reuse the package components rather than rebuilding them in the preview.

## Verify the changed contract

| Change | Evidence |
| --- | --- |
| API or behavior | Focused unit/type tests for the real boundary and failure cases; `npm run typecheck` |
| Layout, styling or interaction | Browser inspection at narrow and wide sizes, both themes, relevant density and keyboard/focus states |
| Exports, peers or published examples | `npm run verify:consumer` |
| Composition or tokens | `npm run verify composition`, `npm run verify architecture`, applicable token checks |
| A token or public path removed or renamed | A mapping in `architecture/migrations.json`, then `npm run gen:architecture` and `npm run verify migrations` |
| Guidance, finder or generators | `npm run verify:gates`, `npm run verify consumer-scripts` and `npm run verify docs-freshness` |
| A verifier script itself | `npm run verify:gates` — each gate's self-test proves it fails on its defect |
| Whole change, before a commit | `npm run verify` (under a minute: checks in parallel beside one build; docs-freshness rewrites stale generated files for you to commit) and `npm test` (Chromium, functional and screenshots) |
| Before a release | `npm run verify:release` on a clean tree: `verify --all` (the above plus the self-tests, the packed-package checks and the reference apps, on one build), then `npm run test:all` (Firefox and WebKit too) |

`npm run verify -- --list` names every check; `npm run verify composition bem` runs just those.
`verify:gates` mutates real source files and restores them, so never run it beside a live
preview or browser suite. A static pass is not evidence that spacing or focus looks right.

## Keep documentation fresh

`npm run docs:sync-skill` builds the package, checks API compatibility, then generates the
catalogue, composition ladder and packaged assistant skill in dependency order. It does **not** accept
API changes automatically. If compatibility fails, review the diff and follow
[API compatibility](api-compatibility.md), then rerun synchronization.

`npm run verify docs-freshness` also builds first and checks the API (`api-snapshot`) before comparing generated
output. It cannot pass by comparing an old snapshot with docs produced from the same old build.
The compatibility snapshot remains a review baseline; declaration JSDoc supplies descriptions
and explicitly documented defaults, without inventing undocumented defaults.

| Authored source | Generated consumers |
| --- | --- |
| `architecture/selection.json` | Family selection guidance |
| `architecture/component-guidance.json` | Component task guidance, capabilities and alternatives |
| Public declarations and JSDoc | API tables, descriptions and documented defaults |
| Preview Example snippets | Recipes attributed by the public symbols actually used |
| `docs/learn` | Human guides and packaged consumer references |

Never hand-edit generated references. Component guidance must name existing public components;
imports and declaration types are derived. `guidanceSource` distinguishes a curated component
decision from the family fallback. Add focused guidance when a real selection question needs it.
