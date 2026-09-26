# 0005 — `render` is the polymorphic contract

**Status:** accepted; `asChild` is removed

## Decision

A component that can become a different element takes a `render` prop holding that element.
`asChild`, the compatibility spelling, is removed.

```tsx fragment — shape only, not a program
<Button render={<a href="/settings" />}>Settings</Button>
```

## Why

Two spellings for one idea mean a consumer has to remember which module chose which.
`asChild` clones the single child and merges props onto it; `render` takes the element as a
prop. They do the same job.

`render` is the better one to keep:

- **The element is a value, not a position.** It can be built conditionally, held in a
  variable, or defaulted, none of which reads naturally when the element is the child.
- **It does not overload `children`.** With `asChild`, `children` means "the element to
  become" in one mode and "the content" in another, so a component cannot take both.
- **It is Base UI's contract**, which the wrapped primitives already speak. A second spelling
  would need translating at every wrapper.

New components take `render`.

## Consequences

- No component accepts `asChild`. The move is made by hand, as the migration reference
  shows: `<Button asChild><a href="/x">Go</a></Button>` becomes
  `<Button render={<a href="/x" />}>Go</Button>`. A codemod cannot do it, because from
  `children` alone it cannot tell the element to become from the content.
- `PopoverTrigger` infers Base UI's `nativeButton` from the element passed to `render`, so
  `render={<a href="/x" />}` renders a link, not an anchor with `type="button"`.
- `Scope` is the one exception: it still takes `as`. It moves to `render` in the next major
  version, since removing `as` breaks callers.
- `Slot` stays, because merging props onto a caller-supplied element is how `render` is
  implemented. It is published at `themelia-ui/base/slot`, but it is not the polymorphic
  contract: a component takes `render`.

## What would justify revisiting

- Base UI changing its own contract.
- A measured case where `render` cannot express something `asChild` can. None has been found,
  and finding one would change the decision rather than the schedule.
