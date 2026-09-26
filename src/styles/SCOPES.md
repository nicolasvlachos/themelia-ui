# Why derived tokens are not declared on `:root`

A custom property's `var()` references are substituted **where the property is declared**.
So a derived token declared once at `:root`:

```css
:root {
  --control-h: calc(var(--height-control) * var(--density-scale));
  --button-default-bg: var(--primary);
}
```

…resolves `--density-scale` and `--primary` at `:root`, and the RESULT is what inherits.
Setting `--density-scale: 0.875` or `--primary: red` on a nested element then changes
nothing: `--control-h` is already `calc(2.125rem * 1)` and `--button-default-bg` is already
the root colour.

So derived tokens are declared at every **scope boundary**, and each boundary re-derives from
its own inputs:

```css
:root,
[data-ui-scope],
[data-density],
[data-theme],
.light,
.dark {
  --control-h: calc(var(--height-control) * var(--density-scale));
}
```

`<UIProvider>`, `<UIScope>` and `<Scope>` render `[data-ui-scope]`, so any provider, nested
or not, re-derives the system from whatever it overrides. `[data-density]` and `[data-theme]`
do the same without a provider. Only these elements recompute, not every element.

**Raw inputs are the opposite.** Literals a theme sets (the radii, border widths, font
stacks, palette steps, the three factors `--scale`, `--density-scale` and `--text-scale`,
`--height-control`, `--surface-x/y`, `--row-x/y`) are declared at `:root` only, so a value
you set on `:root` inherits through every boundary. Semantic colours are derived: a value set
on `:root` alone is re-declared at the first boundary. Set those through the provider or at
the boundary list; see [Theming](../../docs/learn/theming.md#setting-a-theme).

## Theme mode at a bare boundary

A bare boundary (`[data-ui-scope]` or `[data-density]` with no theme of its own) re-derives
in the mode it inherits. The explicit dark block therefore also matches bare boundaries
nested under a dark ancestor, or the light value would win one level down:

```css
.dark,
[data-theme="dark"],
:is(.dark, [data-theme="dark"]) :is([data-ui-scope], [data-density]):not(.light, [data-theme="light"]) {
  --background: var(--neutral-900);
}
```

The `prefers-color-scheme: dark` block (`colorScheme: "system"`) does the same, and honours an
explicit light choice however it is spelled: the `.light` class (next-themes' class strategy)
or `data-theme="light"`, on the boundary itself or on any ancestor:

```css
@media (prefers-color-scheme: dark) {
  :root:not(.light, [data-theme="light"]),
  [data-ui-scope]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *),
  [data-density]:not(.light, [data-theme="light"], :where(.light, [data-theme="light"]) *) {
    --background: var(--neutral-900);
  }
}
```

`scripts/gen-theme.mjs` emits both blocks, and `verify dark-overrides` holds a hand-written
dark override to the same selectors, so write them exactly.

**The one nesting a descendant selector cannot see.** An explicit light island inside a
`.dark` tree keeps its own boundary light, but a bare boundary nested inside that island
matches `.dark …` again and re-derives dark. CSS has no "nearest theme ancestor". Give each
boundary inside the island its own `data-theme`, or use `UIScope`, which writes the resolved
scheme on every boundary it renders. (Under the OS preference alone the island holds: the
media block skips every descendant of a light scope.)

**A surface's ground is reset at a colour island.** `--surface-ground` carries the colour a
surface painted, resolved where that surface set it. A `[data-theme]`, `.light` or `.dark`
element resets it to `initial`, so a reader inside the island falls back to its own
`--background` instead of a ground from the other mode.

**In a CSS Module the theme classes are hashed.** `.light` and `.dark` in a boundary list
become local classes and match nothing. Write `:global(.light)` and `:global(.dark)`.
