# API compatibility

`architecture/api-snapshot.json` records the public surface of every exact entrypoint, and
`verify api-snapshot` compares the committed file against one generated from the current
build. It is the only thing standing between a refactor and a consumer's compile error.

## What is recorded

Per subpath, per exported name: a **kind** and a **normalised signature**.

```json
"./base/toaster": {
  "dismissToast": { "kind": "callable", "signature": "(id?: string) => void" },
  "ToasterProps": { "kind": "interface", "members": { "position": { "optional": true, "type": "ToastPosition" } } }
}
```

Normalised means comments removed, whitespace collapsed, and object types kept as a member
map rather than as text — so reordering an interface is not a diff, and removing a member
is. A `function` declaration and a `const` of the same function type are both `callable`
with the same signature, because a caller cannot tell them apart.

## How a change is classified

| change | verdict |
|---|---|
| a subpath is no longer published | **breaking** |
| a name is gone | **breaking** |
| a member is gone | **breaking** |
| an optional member became required | **breaking** |
| a member's type changed | **breaking** |
| a new required member | **breaking** |
| a member became optional | additive |
| a new optional member | additive |
| a new name, or a new subpath | additive |
| a signature changed outside an object type | needs review — the gate stops, without calling it breaking |

The last row is deliberate. Widening a parameter or returning a supertype is compatible and
common, and no rule this side of a type checker tells it apart from a narrowing — so the
gate asks a person rather than guessing.

## Why it records signatures now

It used to record a name and a KIND only, reasoning that a signature snapshot rots on every
internal refactor and trains people to accept the diff. The reasoning is sound. The result
was wrong in both directions:

- **False positive.** `export function dismiss()` became
  `export const dismiss: (id?: string) => void`. The gate said BREAKING. Nothing a consumer
  wrote stopped compiling.
- **False negative.** Removing a prop from an exported `Props` interface, or narrowing a
  union, changes neither the name nor the kind. The one change that actually breaks people
  was the one shape it could not see.

`scripts/verify-api-snapshot.test.mjs` mutates a copy of the snapshot and asserts each
verdict, including that the function-to-const change is *not* reported.

## Accepting a change

```bash
node scripts/verify-api-snapshot.mjs --update
```

A breaking line needs a migration entry naming the symbol before it is accepted. The gate
says so and names the symbols that lack one.

## Implementation-oriented exports

Six names on `themelia-ui/ui-provider` are the provider's own machinery rather than the
API a consumer is meant to reach for:

| export | what it is | why it is public |
|---|---|---|
| `UIConfigContext` | the context the hooks read | building a provider of your own |
| `UINestedContext` | whether a scope is already above | the same |
| `mergeUIConfig` | how a config merges over its parent | reproducing resolution outside the tree |
| `configToCssVars` | the token half of a config, as custom properties | rendering tokens somewhere the kit does not |
| `configToAttributes` | the `data-theme` / `data-density` half | the same |
| `DEFAULT_UI_CONFIG` | the library's own defaults | reading a fallback without mounting anything |

**They are supported, and they are not the way in.** Every one of them has a hook or a
component that does the job properly — `useUIConfig`, `UIScope`, `UIRoot` — and reaching past
those means owning the resolution order yourself, including the parts that are not obvious:
that a scope's config is its own overrides only, that record fields merge one level, and that
derived tokens resolve where they are declared.

They stay because removing them would break the one consumer they exist for — someone
wrapping the kit in their own provider — and because each is already documented with that
purpose on the UIRoot & UIScope page. After 1.0 they follow the same deprecation policy as
everything else: a named replacement, a documented phase, and removal in the next major.

## Package resolution

`verify package-quality` runs `publint --strict` and `@arethetypeswrong/cli` against the
packed tarball. They check the exports map against the resolution algorithms real consumers
use, which is a body of rules nobody should reimplement.

They found a live defect on their first run: the package publishes `.js` and `.cjs` for
every subpath and pointed both at one `.d.ts`. Since the package is `"type": "module"`, that
declaration is ESM — so `require("themelia-ui/base/buttons")` resolved to ESM types for
CommonJS JavaScript. Each condition now carries its own declaration, and
`gen-cjs-declarations.mjs` writes a `.d.cts` beside every `.d.ts` with relative specifiers
rewritten from `.js` to `.cjs`, because TypeScript maps a specifier's extension to the
declaration it looks for and copying alone moves the masquerade one level down.

Ninety-two stylesheet subpaths are excluded from the `arethetypeswrong` run by name,
computed from the exports map: a stylesheet resolves to no types, which is the tool meeting
a package shape it does not model rather than a finding.
