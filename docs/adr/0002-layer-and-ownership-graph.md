# 0002 — The tier and ownership graph

**Status:** accepted

## Decision

Every module belongs to a tier, and edges may only run downward:

```text
Foundations → base/typography → Primitives → Base ─┬─ Layout ────┐
                                                   ├─ Features ──┼→ Blocks (general → admin)
                                                   └─────────────┘
```

Layout and Features are siblings: neither may import the other, and neither may import a
block. Blocks may compose either one, and the lower Base and Primitives tiers too.

The graph is recorded in `architecture/manifest.json` and checked by `verify architecture`,
which fails an undeclared edge, a declared edge that no longer exists, a cycle, a tier or
profile violation, a tier barrel import, an unaccounted subpath, and an orphan.

## Why

A tier model that lives only in prose drifts: nothing notices when the prose and the
imports disagree.

Making the graph a data file with a checker turns an intention to depend downward into a fact
the build can contradict. The manifest's mechanical fields are derived from the source by
`gen-architecture-manifest.mjs`, so the recorded edges are what the imports actually do, not
what someone believed they did.

## Consequences

- Nothing outside Blocks may import a block. The rule is one-directional and often misread:
  it does **not** forbid a block importing another block.
- Modules in the same tier may import each other, except where the graph orders them:
  `base/typography` sits below the rest of Base, and admin blocks above general ones. Every
  other ordered edge runs between tiers. `base/sidebar` draws its mobile navigation with
  `base/sheet`, because `base/` cannot reach the overlays in `features/`.
- `base/typography` sits below Primitives, because a primitive formats a value and renders it
  as text.
- Adding a module means regenerating the manifest, not editing it by hand.

## What would justify revisiting

- A tier whose members consistently need a sibling's internals, suggesting the boundary is
  in the wrong place.
- Modules that repeatedly need something from a tier above them, which would mean the
  tiers are drawn in the wrong order.
