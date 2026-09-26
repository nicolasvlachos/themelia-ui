# The scale chain

Three factors for the whole kit. There is no per-component factor.

```
--scale              everything
  ├── --density-scale  spacing, controls, rows   (defaults to --scale)
  └── --text-scale     typography                (defaults to --scale)
```

`--scale` moves geometry, spacing, icons and type together. `--density-scale` moves spacing and
control/row geometry and leaves type alone; the `data-density` presets set it per scope.
`--text-scale` moves every type role, control labels included; `UIProvider`'s
`typography.scale` sets it at one scope.

```css
/* everything denser */
:root { --scale: 0.875; }

/* tighter spacing and controls, same type */
:root { --density-scale: 0.875; }

/* larger type, geometry untouched */
:root { --text-scale: 1.125; }
```

```html
<div data-density="compact">…</div>
```

Every length scaled by `--density-scale` is wrapped in `round(…, 1px)`, so a preset never
lands a control or a gap between two pixels: the ladder is 34, 30 and 24px at the default and
32, 28 and 23px under `compact`.

Per-family factors (`--button-scale` and 44 more) were removed: each needed a named token for
every measurement it scaled. Scale one region with a scope instead.

`verify factors` (`scripts/verify-css.mjs`) fails when a per-family factor reappears, when a
length multiplies two factors (the effect squares), when a type token reaches the density
factor, or when a density-scaled length is not rounded.
