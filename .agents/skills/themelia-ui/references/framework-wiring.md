# Framework and application wiring

The package owns presentation and reusable interaction state. The consuming application
owns routing, server data, mutations, permissions, analytics, persistence, and the i18n
runtime. Those concerns meet through explicit props rather than hidden framework imports.

## Routing

Pass the router's link through `render` or a family's documented `renderLink` adapter. Do
not put navigation in an `onClick` when the destination is a URL: a real link preserves
open-in-new-tab, the status-bar destination, and browser semantics.

```tsx fragment — replace AppLink with the link component from the consuming router
<Button render={<AppLink to="/invoices/new" />}>New invoice</Button>
```

Layout navigation adapters accept the same idea at the page or shell boundary. The kit does
not import React Router, Next.js, Remix, or another router.

## Queries and mutations

Fetch records outside the component, pass data and loading/error state in, and connect
mutations through callbacks. A callback may return a promise when the family documents an
async lifecycle; the application decides cache invalidation, retries, and error reporting.

```tsx fragment — query client and mutation implementation belong to the application
<ResourceIndexShell
  title="Invoices"
  actions={<Button onClick={() => mutations.createInvoice()}>New invoice</Button>}
  loading={query.isPending}
  error={query.error}
  empty={query.data?.length === 0}
  onRetry={() => query.refetch()}
>
  <InvoiceTable rows={query.data ?? []} />
</ResourceIndexShell>
```

## Permissions

Resolve authorization before constructing actions. Omit an action the user cannot perform;
disable it only when seeing the unavailable action is itself useful and provide the reason
through the family's tooltip or description seam.

## Translation

Supply user-facing package copy through each component's `strings` prop. Keep product copy
in application data or children. The default objects are exported so a locale can start
from the complete shape rather than guessing keys; see [Internationalization](i18n.md).

## Server rendering and client boundaries

Import server-pure formatting families freely. Interactive families carry their own
`"use client"` boundary in the published entrypoint. Do not wrap the whole package in one
client module: exact subpaths keep server-pure imports server-pure and optional peers
isolated.

For CSP, portals, nested theme regions, and defaults, use
[Provider and scoping](provider-and-scoping.md). Do not recreate provider context in an
application adapter unless the documented public hooks are insufficient.

## Vite, Next.js, and CSS entrypoints

Vite and similar bundlers can keep each exact `.css` import beside the component-family
import. In a framework that restricts where global CSS may be imported, collect those same
exact family stylesheets in its permitted application or route-layout entry. Do not replace
them with source paths, and do not import `style.css` merely to avoid learning which families
the route uses.

Server-rendered HTML and the client bundle must load the same theme tokens before hydration.
Apply the theme attribute and provider configuration from the same persisted value to avoid
a light/dark flash or hydration disagreement.

## Persistence

Controlled values belong in application state. Persist after the package calls the change
callback, then feed the resulting value back. Optimistic updates, rollback, offline queues,
and URL synchronization remain application policy.
