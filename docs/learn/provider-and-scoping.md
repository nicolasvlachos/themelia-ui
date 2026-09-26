# Provider and scoping

Three components, and the difference between them is what they are allowed to touch.

| | Renders | Reaches | Use for |
|---|---|---|---|
| `UIRoot` | nothing | the document, if asked | the application's defaults, once per React root |
| `UIScope` | an element (`display: contents` by default) | its subtree | a region that differs from the app |
| `Scope` | an element | its subtree | a token override with no JavaScript config |

`UIProvider` composes them: at the top it is a `UIRoot` targeting `documentElement` plus a
`UIScope`; nested, it is a `UIScope`. New code should reach for the piece it needs.

## UIRoot — once, at the top

```tsx fragment — shape only, not a program
<UIRoot config={{ money: { defaultCurrency: "EUR" }, density: "compact" }} documentTarget="documentElement">
  <App />
</UIRoot>
```

It renders **no element**, so it never disturbs a flex or grid parent, and it writes no CSS
variables. Its JavaScript defaults (money, dates, formatting, component defaults) reach every
descendant; put token-bearing config (`theme`, `scale`, `typography`, `motion`) on a
`UIScope` or `UIProvider`, which render the element those variables are written on.

`documentTarget` (`"documentElement"`, `"body"` or `false`) defaults to `false`. Name it to
mirror `data-theme` and `data-density` onto `<html>` or `<body>`, which is how a root owns
the page canvas. It is the only thing here that touches state outside the React tree.

When an application embeds another:

- **It restores, it does not remove.** Each attribute's value before mount is put back on
  unmount, so an app's own theme survives.
- **One owner at a time, and it is handed on.** When two independent React roots (a host and
  an embedded widget) both ask for the document, the oldest root still mounted owns it. When
  the owner unmounts, the document goes to the next root in line. `body` and
  `documentElement` are tracked separately.

  A final unmount restores what the page looked like before the **first** root arrived.

## UIScope — a region

```tsx fragment — shape only, not a program
<UIScope config={{ density: "comfortable" }}>
  <SettingsPanel />
</UIScope>
```

Its `config` is its **own overrides only**; inherited values already cascade in.

`transparent` (default `true`) removes the element from layout with `display: contents`.
Custom properties still inherit through it, because inheritance does not depend on the box.

### What a nested config merges

A scope names what it is **changing**. Everything it does not name it inherits, one level
below a slice as well as at it:

```tsx fragment — shape only, not a program
<UIProvider config={{ theme: { colors: { primary: "blue", secondary: "green" } } }}>
  <UIScope config={{ theme: { colors: { primary: "red" } } }}>
    {/* primary is red, secondary is still green */}
  </UIScope>
</UIProvider>
```

This applies to every record-shaped field: `theme.colors`, `theme.palette`, `theme.vars`,
`typography.fonts`, `typography.sizes` and `motion.durations`. Below them a record is a flat
map of token to value, and a value is replaced, not merged.

## Scope — tokens only

Overriding a factor requires a **scope boundary**, not just any element:

```tsx fragment — shape only, not a program
<Scope vars={{ "--density-scale": 0.8 }}>
  <Toolbar />
</Scope>
```

Derived tokens are declared at `:root, [data-ui-scope], [data-density], [data-theme], .light,
.dark` (see [`src/styles/SCOPES.md`](../../src/styles/SCOPES.md)). A plain
`<div style={{ "--density-scale": 0.8 }}>` sets the variable and nothing reads it: the
measurements above it already resolved against the old value. `Scope` renders
`data-ui-scope`, which puts the element on that list and makes every derived token
re-compute.

## Portals and scopes

A scope works through CSS custom properties and the `[data-density]` / `[data-theme]`
attribute selectors, and both inherit down the DOM subtree. A portal renders elsewhere in the
document, so by default neither follows it:

```tsx fragment — a template with a hole in it
<UIScope config={{ density: "compact" }}>
  <DropdownMenu>…</DropdownMenu>   {/* the menu portals to the body, at the ROOT's density */}
</UIScope>
```

Wrap the region in `UIPortalHost` and the popups render inside it instead:

```tsx fragment — a template with a hole in it
<UIScope config={{ density: "compact", colorScheme: "dark" }}>
  <UIPortalHost>
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>…</DropdownMenuContent>
    </DropdownMenu>
  </UIPortalHost>
</UIScope>
```

The host renders one `display: contents` element inside the scope, and every portal in the
subtree targets it, so the popup inherits from the scope. DropdownMenu, ContextMenu, Select,
Tooltip, HoverCard, Popover, NavigationMenu and Toaster all resolve it.

Precedence, most specific first:

1. a `container` prop on the component;
2. the nearest `UIPortalHost`;
3. the primitive's own default.

Without a host nothing changes, so adding one is opt-in per region. `UIPortalHost` also
takes a `container` of its own, for an application that already has a layer it wants popups
in — a shadow root, or a positioned overlay element it manages itself.

> An outer `createPortal` around a component does **not** redirect the portal that component
> creates inside itself.

## Strict Content Security Policy

Some Base UI-backed controls emit a tiny inline style or pre-hydration script for behavior
the component stylesheet cannot express. Put `CSPProvider` at the same application boundary
as `UIRoot` and pass the request nonce through:

```tsx fragment — requestNonce, config, and App come from the consuming application
import { CSPProvider, UIRoot } from "themelia-ui/ui-provider"

<CSPProvider nonce={requestNonce}>
  <UIRoot config={config} documentTarget="documentElement">
    <App />
  </UIRoot>
</CSPProvider>
```

React 19 hoists styles that carry `precedence`. During streaming SSR, configure the React
renderer with the same style nonce as the provider; otherwise React omits the attribute and
warns about the mismatch.

When the policy permits no inline elements at all, suppress Base UI's style elements and
ship the scrollbar rule in the consuming application's stylesheet:

```tsx fragment — App comes from the consuming application
<CSPProvider disableStyleElements>
  <App />
</CSPProvider>
```

```css
.base-ui-disable-scrollbar { scrollbar-width: none; }
.base-ui-disable-scrollbar::-webkit-scrollbar { display: none; }
```

`disableStyleElements` does not disable kit behavior; it moves those small rules into the
consuming app. It does not replace the normal `core.css`, family CSS, or `style.css` import.

## Reading the config

Resolution, in every component:

```ts fragment — shape only, not a program
props.value ?? useFooConfig().value ?? componentFallback
```

A prop always wins. A wrapper that pins a prop internally takes the choice away from the
provider, so read `useDefaults` rather than hard-coding a size or variant.

`useUIConfig` returns everything and re-renders on any change; prefer the narrow hook —
`useMoneyConfig`, `useDatesConfig`, `useOverlayConfig`, `useDensity`, `useScale`,
`useFormatting`, `useTypographyConfig`. `useDefaults` takes the component's *own* defaults
and merges the scope's over them, which keeps the values beside the component, makes the
call order-independent, and lets an unused family tree-shake away.

The provider holds stable display policy: money, dates, size, density, scale. Per-feature
policy, query timing, domain accessors, data and callbacks stay props.

## Updating defaults at runtime

Changing the `config` passed to `UIRoot`, `UIScope`, or `UIProvider` updates mounted
descendants. No remount or changing React `key` is required. Explicit component props
still take precedence over provider defaults.

`ThemeTweaker` edits configuration; the application connects `onConfigChange` to state
and supplies that state to its provider. Its internal editor state alone does not change
an enclosing provider. Keep unfinished text edits separate from applied configuration:
for example, validate a locale with `Intl.getCanonicalLocales` before passing it to
formatting components. The [Theme Tweaker recipe](../generated/components/features--theme-tweaker.md)
shows this wiring and keeps the last valid preview while a locale is being typed.

## Optional iPhone input zoom prevention

Field typography is the same at every viewport width. To apply a **16px minimum** to
native inputs, textareas, and selects on iPhones, enable it explicitly:

```tsx fragment — shape only, not a program
<UIProvider config={{ forms: { preventIPhoneZoom: true } }}>
  <App />
</UIProvider>
```

The default is `false`. It detects iPhones, including their browsers; it does not resize
fields on iPads, Macs, Android, or narrow desktop panes. Button-based selects keep their
normal typography. Nested providers inherit the option and can disable it. The server
renders the normal typography; the device-specific minimum applies after hydration.

## Menu colour scheme

Dropdown, context, action and menubar menus render in the dark scheme on a light page too.
Turn it off to let menus follow the scheme they are portalled into, like every other popup:

```tsx fragment — shape only, not a program
<UIProvider config={{ overlay: { darkMenus: false } }}>
  <App />
</UIProvider>
```

The default is `true`. A nested `UIScope` can set it either way for its own subtree.
