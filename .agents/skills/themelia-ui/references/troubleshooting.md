# Troubleshooting

## A component is unstyled

Import its exact family stylesheet beside the JavaScript subpath, or import the complete
`themelia-ui/style.css` once. A family stylesheet already imports `core.css`; importing
core alone supplies tokens but no component rules.

Keep application overrides after package CSS. The package uses cascade layers, so ordinary
unlayered application CSS wins without `!important` or selector escalation.

## A subpath does not resolve

There are no layer barrels such as `themelia-ui/base`. Use the generated
[import table](imports.md) or run:

```bash
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "what the UI must do"
```

Import the returned exact family path and its returned CSS path.

## An optional peer is missing

Install only the peers listed for the imported family. The generated import table maps every
optional peer to the exact families that reach it. If the error names a peer for a family not
listed there, report it as a package containment defect.

## A scoped theme or density does not apply

Set tokens through `UIProvider` or `UIScope` config, on a `Scope` or other
`[data-ui-scope]` element, on a theme signal, or on another documented scope boundary.
Derived custom properties resolve where they are declared, so a source value set on an
arbitrary descendant leaves the already-resolved derived value unchanged. A semantic colour
or `--density-scale` set on `:root` alone is re-declared at the first boundary. See
[Theming](theming.md) and [Provider and scoping](provider-and-scoping.md).

## A portal has the wrong theme

Popups portal to `<body>` by default, outside any nested scope, so they miss its density,
colour scheme and token overrides. Wrap the region in `UIPortalHost` so its popups render
inside the scope, or pass the component a `container`. A root provider with a
`documentTarget` mirrors only `data-theme` and `data-density` to the document; token
overrides that `<body>` popups must see belong in CSS at the scope boundaries. See
[Provider and scoping](provider-and-scoping.md#portals-and-scopes).

## A controlled component appears frozen

A controlled value changes only when the consumer feeds the new value back. Connect the
documented change callback to state, cache, or URL ownership. If the application does not
need ownership, omit the controlled prop and use the family's documented default-value API
when one exists.

## A link behaves like a button

Use the `render` or `renderLink` seam with the framework's link element. Do not simulate
navigation in a click handler. The package's polymorphic contract preserves the rendered
element's semantics while applying the component's behaviour and geometry.

## CSP blocks runtime styles

Use `CSPProvider` with the request nonce. For a policy that forbids style elements entirely,
set `disableStyleElements` and serve the documented Base UI behaviour rules from an external
stylesheet. Family CSS itself is ordinary static CSS.

## The design looks inconsistent after overrides

Override global semantic tokens first: colour roles, radius, spacing/density, typography,
and control geometry. Component-level variables are implementation plumbing unless the
family reference describes one as an extension point. Do not target hashed CSS Module
names; use stable `data-slot` or BEM hooks, and for a state the attributes the primitives
set (`data-open`, `data-checked`, `data-disabled`, `data-highlighted`, `data-popup-open`).
Radix's `[data-state="open"]` matches nothing here.

## Rich text and untrusted HTML

`RichTextEditor` and editor engines keep drafts unsanitized. Render stored HTML with
`RichText`, which always sanitizes through an allow-list. Any application-owned
`dangerouslySetInnerHTML` remains the application's responsibility; see `SECURITY.md` in the
package root.
