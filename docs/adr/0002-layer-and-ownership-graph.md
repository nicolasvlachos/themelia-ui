# 0002 — The layer and ownership graph

**Status:** accepted

## Decision

Every family declares a layer, and edges may only run downward:

```text
foundation → typography → primitives → base ─┬─ layout ────┐
                                             ├─ features ──┼→ patterns → admin
                                             └─────────────┘
```

`layout` and `features` are siblings. Patterns may compose either one; neither may import a
pattern. A pattern may also compose the lower base, primitive, and typography layers.

The graph is recorded in `architecture/manifest.json` and checked by `verify architecture`,
which fails an undeclared edge, a declared edge that no longer exists, a cycle, a layer
violation, a profile violation, an unaccounted subpath, and an orphan.

## Why

A layer model that lives in prose is a layer model that drifts. This repository has the
evidence: `docs/maintainers/architecture.md` described three component layers when there were
five, and cited an enforcing script that did not exist.

Making the graph a data file with a checker turns an intention to depend downward into a fact
the build can contradict. The manifest's mechanical fields are derived from the source by
`gen-architecture-manifest.mjs`, so the recorded edges are what the imports actually do — not
what someone believed they did.

## Consequences

- Nothing below `patterns` may import a pattern. This is one-directional and often
  misunderstood: it does **not** forbid a pattern importing another pattern.
- `typography` sits below `primitives`, because a primitive formats a value and renders it as
  text.
- One recorded exception exists across 554 files: `base/sidebar` uses `base/sheet` directly
  for its mobile navigation, because `base/` cannot import `features/`.
- Adding a family means regenerating the manifest, not editing it by hand.

## What would justify revisiting

- A layer whose members consistently need a sibling's internals, suggesting the boundary is
  in the wrong place.
- The exception list growing past a handful — one exception is a special case, ten is a wrong
  model.
