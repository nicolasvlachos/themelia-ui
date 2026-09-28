# 0003 — Exact JavaScript and CSS entrypoints

**Status:** accepted

## Decision

One subpath per module, no tier barrels, and CSS split per module beside it. `core.css`
carries tokens, themes and the cascade layer order; every module stylesheet imports it,
which makes the module stylesheet a self-contained entrypoint.

## Why

A barrel makes every consumer's bundle the union of every module. Worse, it makes an optional
peer reachable from an import that never asked for it: `themelia-ui/base` would put
Recharts in the resolution graph of an application that only wanted a button.

Splitting CSS the same way follows from the same argument. Writing each module's transitive
closure into its own sheet would repeat every shared chunk once per module that reaches it;
measured, that is a 4.1 MB `style.css` and a 7.4 MB package. Instead each chunk's CSS is
emitted once under `css/`, and a module sheet is an `@import` index over the chunks it needs.

The layer order lives in `core.css` rather than being copied into each sheet. Every module
sheet imports `core.css` first, which preserves that order without asking a consumer to
remember a second import.

## Consequences

- `package.json`'s `exports` publishes each tier as a pair of subpath patterns,
  `"./base/*"` for the JavaScript and `"./base/*.css"` for the stylesheet, so a new module is
  published by being built; `package.json` does not change. There are still no tier barrels:
  `themelia-ui/base` matches neither pattern.
- A consumer imports each module's stylesheet beside its JavaScript, or `style.css` once; the
  JavaScript imports no CSS. Node therefore loads the package as it is, and a bundler that
  drops an unused re-export module cannot drop a stylesheet with it.
- `style.css` is the deduplicated union, for consumers who would rather not track sheets.

## What would justify revisiting

- A bundler ecosystem where per-module CSS imports stop being resolvable.
- Measured evidence that the many-entry build costs more than the bytes it saves consumers.
