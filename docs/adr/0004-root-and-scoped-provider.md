# 0004 — Root and scoped provider are separate components

**Status:** accepted

## Decision

`UIRoot` owns application defaults and may touch the document. `UIScope` owns a subtree and
may not. `UIProvider` composes both and keeps its old behaviour.

## Why

One component was doing two jobs with different blast radii, and the difference only showed
up in the cases nobody tests locally.

`UIProvider` rendered a wrapper element. A box at the top of every application that used one
is a layout node nobody asked for, and it broke flex and grid parents expecting their real
child. `UIRoot` renders nothing.

It also wrote theme and density onto the document unconditionally, which is right for an
application that owns the page and wrong for everything else. Three failures followed from
that single behaviour:

1. **It removed rather than restored.** Unmounting inside an application that had set its own
   `data-theme` took that theme with it. It now captures the previous value and puts it back.
2. **Two roots fought.** A host application and an embedded widget both believe they are the
   top. Document ownership is now claimed on mount and released on unmount; a root without it
   leaves the document alone.
3. **Nested scopes reset the theme.** The attributes were rebuilt from the raw prop rather
   than the resolved config, so every nested boundary silently reverted to the default.

`documentTarget` now defaults to `false` and must be named. Reaching outside the React tree
is the one thing here that is not undoable by re-rendering, so it is opt-in.

## Consequences

- `UIProvider` still works. New code reaches for the narrower piece.
- A token-only override uses `Scope`, which renders `data-ui-scope` — necessary because
  derived tokens resolve where they are declared, and a plain `div` setting `--density-scale`
  sets a variable nothing reads.
- SSR, hydration and multiple roots stay isolated, because nothing is created outside render.

## What would justify revisiting

- A React version where document effects are safely shareable across roots.
- Evidence that consumers routinely need `UIRoot` to render an element after all.
