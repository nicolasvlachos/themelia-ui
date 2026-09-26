# 0004 — Root and scoped provider are separate components

**Status:** accepted

## Decision

`UIRoot` owns application defaults and may touch the document. `UIScope` owns a subtree and
may not. `UIProvider` composes both: a root and a scope at the top, a scope when nested.

## Why

One component doing both jobs has two blast radii, and the difference shows only in cases
that are rarely tested locally.

A provider that renders a wrapper element puts a layout node at the top of every
application, and it breaks flex and grid parents that expect their real child. `UIRoot`
renders nothing.

Writing theme and density onto the document is right for an application that owns the page
and wrong for everything else. Done unconditionally, it fails three ways:

1. **Removing instead of restoring.** Unmounting inside an application that set its own
   `data-theme` would take that theme with it. `UIRoot` captures the previous value and puts
   it back.
2. **Two roots fighting.** A host application and an embedded widget both believe they are
   the top. Document ownership is claimed on mount and released on unmount; a root without it
   leaves the document alone.
3. **Nested scopes resetting the theme.** Attributes built from a scope's own props, rather
   than the resolved config, revert every nested boundary to the default. A scope writes
   attributes from the resolved config.

`documentTarget` defaults to `false` and must be named. Reaching outside the React tree is
the one thing here that re-rendering cannot undo, so it is opt-in.

## Consequences

- `UIProvider` keeps working for existing code; new code reaches for the narrower piece.
- A token-only override uses `Scope`, which renders `data-ui-scope`. That matters because
  derived tokens resolve where they are declared: a plain `div` setting `--density-scale`
  sets a variable nothing reads.
- SSR, hydration and multiple roots stay isolated, because nothing is created outside render.

## What would justify revisiting

- A React version where document effects are safely shareable across roots.
- Evidence that consumers routinely need `UIRoot` to render an element after all.
