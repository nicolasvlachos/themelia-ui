# 0005 — `render` is the polymorphic contract

**Status:** closed, migration complete

## Decision

A component that can become a different element takes a `render` prop holding that element.
`asChild` was the compatibility spelling and has been removed.

```tsx
<Button render={<a href="/settings" />}>Settings</Button>
```

## Why

The kit had two spellings for one idea. `asChild` clones the single child and merges props
onto it; `render` takes the element as a prop. They do the same job, and having both means a
consumer has to remember which family chose which.

`render` is the better one to keep:

- **The element is a value, not a position.** It can be built conditionally, held in a
  variable, or defaulted, none of which reads naturally when the element is the child.
- **It does not overload `children`.** With `asChild`, `children` means "the element to
  become" in one mode and "the content" in another, so a component cannot take both.
- **It is Base UI's contract**, which the wrapped primitives already speak. Keeping a second
  spelling means translating at every wrapper.

`verify api-vocabulary` holds the vocabulary to one spelling across 695 files, so a new
component cannot introduce a third — and now fails on `asChild` as well as on `as`.

## Consequences

- The migration is done. Thirteen declarations carried `asChild` — three as `export
  interface *Props`, one as a `type` alias, and nine as inline type literals on the
  signature; all thirteen are gone, and every call site in the kit is on `render`. The gate
  rule reads the whole file rather than exported interfaces for exactly that reason: scoped
  to `export interface *Props` it would have policed three of thirteen.
- **The removal fixed a defect in the surviving spelling.** `PopoverTrigger` inferred Base
  UI's `nativeButton` from the element — but only on the `asChild` path. So the canonical
  spelling was the broken one: `<PopoverTrigger render={<a href="/x">Open</a>} />` shipped
  `<a href="/x" type="button">`, where `type` is not the button type at all but the
  MIME-type hint for the destination. Retiring a compatibility path is a good moment to
  check what only that path was doing.
- A codemod rewrote the mechanical cases (retired in 2.0) and refused the
  rest by design: it cannot tell whether a child is the element to become or the content.
  Two call sites in the kit were ternaries producing a complete element and were migrated
  by hand.
- `base/slot` stays, because merging props onto a caller-supplied element is still how
  `render` is implemented internally. It is not a consumer-facing API.

## What would justify revisiting

- Base UI changing its own contract.
- A measured case where `render` cannot express something `asChild` can — none has been found
  so far, and finding one would change the decision rather than the schedule.
