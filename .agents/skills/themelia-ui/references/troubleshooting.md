# Troubleshooting

## A component is unstyled

The JavaScript imports no CSS. Import the module's stylesheet beside the JavaScript subpath,
or `themelia-ui/style.css` once. `core.css` alone supplies tokens but no component rules. See
[Loading the CSS](installation.md#loading-the-css).

Overrides need no `!important` or selector escalation: the kit's rules are layered, and
unlayered application CSS beats them.

## Node throws on a `.css` import

`ERR_UNKNOWN_FILE_EXTENSION` for a `.css` file means Node is running one of your own modules
that imports a stylesheet, without a bundler. The kit's JavaScript imports none. Import the
stylesheets where your bundler or framework processes CSS, or map `\.css$` to a stub in a
test runner that runs your modules directly.

## Jest: `Cannot use import statement outside a module`

The package is ES modules, and Jest transforms nothing in `node_modules` by default. Exempt
the package in `transformIgnorePatterns`. See [In Node](installation.md#in-node).

## A subpath does not resolve

There are no tier barrels such as `themelia-ui/base`. Use the generated
[import table](imports.md) or run:

```bash
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "what the UI must do"
```

Import the returned exact module path and its returned CSS path.

## An optional peer is missing

Install only the peers listed for the imported module. The generated import table maps every
optional peer to the exact modules that reach it. If the error names a peer for a module not
listed there, report it as a package containment defect.

## A theme or density override does not apply

Every theme variable is declared once, at `:root`, and inherits from wherever you set it. When
an override does not show:

- **Is it the theme's name?** A 3.0 name such as `--space-md`, `--control-h` or
  `--primary-10` is gone; the codemod renames or reports each one, and
  `src/styles/TOKENS.md` (`node_modules/themelia-ui/src/styles/TOKENS.md`) names the variable for every role.
- **Is a density preset in effect?** A `data-density` region (or a provider's `density`) sets
  the lengths and control heights on its element, so a value set further out does not reach
  inside it. Set the value for the preset too: `[data-density="compact"] { --padding: … }`.
- **Is it a colour set to one value?** One value applies in both modes. For a separate dark
  value, write `light-dark(light, dark)`; a rule under `.dark` misses a dark region inside a
  light page.
- **Is it in a portalled popup?** A value set on a provider or a region reaches its subtree,
  and a popup portalled to `<body>` leaves it; see the next section.

See [Theming](theming.md#setting-a-theme) and
[Provider and scoping](provider-and-scoping.md).

## A portal has the wrong theme

Popups portal to `<body>` by default, outside any nested scope, so they miss its density,
colour scheme and token overrides. Wrap the region in `UIPortalHost` so its popups render
inside the scope, or pass the component a `container`. A root provider with a
`documentTarget` mirrors only `data-theme` and `data-density` to the document; a value that
`<body>` popups must see belongs on `:root`. See
[Provider and scoping](provider-and-scoping.md#portals-and-scopes).

## A controlled component appears frozen

A controlled value changes only when the consumer feeds the new value back. Connect the
documented change callback to state, cache, or URL ownership. If the application does not
need ownership, omit the controlled prop and use the module's documented default-value API
when one exists.

## A link behaves like a button

Use the `render` or `renderLink` seam with the framework's link element. Do not simulate
navigation in a click handler. The package's polymorphic contract preserves the rendered
element's semantics while applying the component's behaviour and geometry.

## CSP blocks runtime styles

Use `CSPProvider` with the request nonce. For a policy that forbids style elements entirely,
set `disableStyleElements` and serve the documented Base UI behaviour rules from an external
stylesheet. The module stylesheets themselves are ordinary static CSS. See
[Provider and scoping](provider-and-scoping.md#strict-content-security-policy).

## The design looks inconsistent after overrides

Override global semantic tokens first: colour roles, radius, spacing and density,
typography, and control geometry. Component-level variables are implementation detail
unless the module reference describes one as an extension point. Do not target hashed CSS
Module names; use the stable `data-slot` attributes and BEM hooks such as
`{name}--component`, and for a state the attributes the primitives set (`data-open`, `data-checked`, `data-disabled`,
`data-highlighted`, `data-popup-open`). Radix's `[data-state="open"]` matches nothing here.

## Rich text and untrusted HTML

`RichTextEditor` and its engines keep drafts unsanitised. Render stored HTML with `RichText`,
which always sanitises it through a fixed allow-list. Any `dangerouslySetInnerHTML` of your
own is your application's responsibility; see SECURITY.md (`node_modules/themelia-ui/SECURITY.md`).
