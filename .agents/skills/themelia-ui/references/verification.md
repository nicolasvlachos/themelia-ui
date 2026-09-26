# Verifying a consuming application

The package is verified before it ships. Routing, data, permissions, copy and theme
overrides belong to the application, so it still needs a small matrix of its own.

## Minimum release checks

1. Type-check against the installed package, not a source alias.
2. Build the production bundle and confirm no optional peer is requested by unused families.
3. Render every adopted family in light and dark themes.
4. Exercise compact and comfortable density, plus any custom scale used by the product.
5. Test keyboard traversal, focus return, dismissal, disabled state, loading state, and
   destructive confirmations for interactive families.
6. Run automated accessibility checks, then manually verify names, descriptions, focus
   order, landmarks, and screen-reader announcements for the product composition.
7. Check narrow mobile, ordinary desktop, and one wide viewport; include long translated
   copy, empty data, errors, and the largest plausible record.
8. Verify CSP and server-rendering paths when the application uses them.

## A focused smoke test

```tsx fragment — adapt selectors and navigation to the consuming application's test runner
test("global search returns focus after dismissal", async ({ page }) => {
  await page.goto("/app")
  await page.getByRole("button", { name: "Search" }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Search" })).toBeFocused()
})
```

Prefer role- and name-based assertions over CSS Module selectors. When a visual or state
assertion needs a DOM hook, use `data-slot`, documented BEM hooks, or the state attributes
the primitives set (`data-open`, `data-checked`, `data-disabled`, `data-highlighted`,
`data-popup-open`). These are Base UI's attributes, not Radix's: `[data-state="open"]`
matches nothing.

## Theme contract check

Create one application fixture that changes primary colour, surface/background roles,
radius, density, and typography scale at a scope boundary. If a component ignores it, report
the family and token before adding a local patch: the package may be missing a derivation.

## Upgrade check

Read `CHANGELOG.md`, run the package's codemod when a release names one
(`node node_modules/themelia-ui/scripts/consumer/codemod.mjs --dry-run src/`), and let the
application's own type-check compare the installed declarations. Within a major, a removal
keeps a deprecated alias until the next major unless keeping it would be unsafe or
incorrect; a major may remove names outright, and its migration guide lists each one. See
[API compatibility](api-compatibility.md).
