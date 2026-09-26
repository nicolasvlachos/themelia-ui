# Composition model

The kit is designed to build product-specific UI without copying library internals. Start
at the highest layer that already owns the interaction, then compose downward only when the
ready-made surface does not express the job.

## The layers

| layer | owns | consumer use |
| --- | --- | --- |
| typography | text roles | keep type, colour, truncation, and semantics consistent |
| primitives | one formatted value | render money, dates, people, files, and other values |
| base | one generic UI concept | controls, overlays, rows, cards, feedback, and structure |
| layout | page and application shells | arrange routes without owning routing or data |
| features | an interaction lifecycle | use controlled state, callbacks, accessors, parts, or hooks |
| patterns | a subject-shaped arrangement | assemble base, layout, and feature families |
| admin | terminal admin presentation | build on general families without leaking admin vocabulary down |

`layout` and `features` are siblings. A pattern may compose both; neither may import a
pattern. The complete generated graph is in Profiles (`node_modules/themelia-ui/docs/generated/profiles.md`).

## The composition ladder

Use the lowest rung that solves the real requirement:

1. Ready-made component with ordinary props.
2. Controlled state and callbacks, when the component owns state.
3. Accessors that adapt application records without reshaping them.
4. Named slots for replacing one visual region.
5. Render props when a region needs the component's live state.
6. Exported parts for assembling a different surface.
7. A headless hook when the package presentation cannot express the design.
8. A documented recipe that wires several families into a screen-level result.

Not every family needs every rung. A passive Badge does not need controlled state; a feature
with an interaction lifecycle normally offers several. The generated
[composition ladder](composition-ladder.md) lists which seams each feature
family exposes.

## Build a business component

### Keep presentation with its owner

| Content | Owner | Composition rule |
| --- | --- | --- |
| Primary copy and resource names | `Text` | Omit `size` so the typography default reaches the content. |
| Read-only label or group name | `DisplayLabel` | Pass plain content; do not nest a differently styled `Text` or override its font/color in CSS. |
| Label/value facts | `MetadataList` | Pass plain labels and values or semantic value descriptors. Use `render` for content the value kinds cannot express. |
| Identity, description, and actions | `Item` parts | Let `ItemTitle` and `ItemDescription` own their typography. Put distinct metadata in a separate region. |
| Editable field and its support text | `FormField` | Keep the label, control, hint, and error associated. |
| Surface title and description | `Card`, `ContentBlock`, overlay header | Use their title/description props or parts; avoid local font and gap overrides. |
| Supporting timestamps, counters, and hints | `Text size="xs"` or a value primitive | An explicit support role is appropriate; do not demote primary content to fit a dense layout. |
| Passive arrangement | `Stack`, `Grid` | Reuse shared gaps and insets. Specialized grids, rails, and drag geometry may retain their own CSS. |

Density changes spacing, not the meaning of text roles. Large metric values, monospace
identifiers, code, and compact support text are deliberate roles; a local `size="sm"`
on ordinary feature copy prevents the provider default from working.

Keep presentation defaults in the shared components and CSS tokens. Inline styles are
appropriate for runtime data and mechanics (a chart value, drag transform, or consumer
surface style), not a second set of font, padding, or gap defaults.

### Example

Keep business vocabulary and policy in the application. This example composes a page shell,
generic metadata, and an action without teaching the package what an invoice is:

```tsx compile
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"
import { MetadataList } from "themelia-ui/base/display"
import "themelia-ui/base/display.css"
import { Page } from "themelia-ui/layout/page"
import "themelia-ui/layout/page.css"

type Invoice = { id: string; number: string; customerName: string; status: string; dueLabel: string }
export function InvoiceDetail({ invoice, onCollectPayment }: {
  invoice: Invoice
  onCollectPayment: (id: string) => void
}) {
  return (
    <Page
      header={{
        title: `Invoice ${invoice.number}`,
        description: invoice.customerName,
        actions: <Button onClick={() => onCollectPayment(invoice.id)}>Collect payment</Button>,
      }}
    >
      <MetadataList
        columns={2}
        items={[
          { id: "status", label: "Status", value: invoice.status },
          { id: "due", label: "Due", value: invoice.dueLabel },
        ]}
      />
    </Page>
  )
}
```

The application still owns the `Invoice` model, permissions, mutation, analytics, route,
and copy specific to the product. The package owns spacing, semantics, focus behaviour,
responsive geometry, tokens, and reusable interaction contracts.

## Common application compositions

These are boundaries, not new package abstractions. Adapt the application-owned data and
callbacks, then open each linked family reference for the complete prop contract.

### Dashboard

```tsx fragment — dashboard data and chart series come from the consuming application
import { MetricGrid } from "themelia-ui/patterns/analytics"
import "themelia-ui/patterns/analytics.css"
import { Page } from "themelia-ui/layout/page"
import "themelia-ui/layout/page.css"

<Page header={{ title: "Overview", description: periodLabel }}>
  <MetricGrid metrics={metrics} variant="card" />
</Page>
```

The pattern owns metric presentation and responsive columns. The app owns the query, time
window, permission-filtered figures, and what clicking a metric means.

### Resource index

```tsx fragment — columns, filters, records, paging, and mutations are consumer-owned
import { DataView, DataViewPagination } from "themelia-ui/features/data-view"
import "themelia-ui/features/data-view.css"

<DataView
  data={records}
  columns={columns}
  filtering={{ filters, activeFilters, onFilterChange, tabs: savedViews }}
  table={{ enableSorting: true, enableColumnVisibility: true }}
  slots={{ footer: <DataViewPagination page={page} pageCount={pageCount} onPageChange={setPage} /> }}
/>
```

Use the ready-made `DataView` first. Drop to `DataViewShell`, its exported parts, or
`useDataView` only when the product presentation cannot be expressed by props and slots.

### Record detail

The invoice example above is the canonical shape: `Page` for route geometry,
`MetadataList` and primitives for facts, then domain callbacks on package actions. Keep the
record type out of the package.

### Form

```tsx fragment — validation, field values, submit mutation, and product copy remain in the app
import { FormActionsBar, FormField, FormSection, SubmitStateButton } from "themelia-ui/base/forms"
import "themelia-ui/base/forms.css"
import { Input } from "themelia-ui/base/text-inputs"
import "themelia-ui/base/text-inputs.css"

<FormSection title="Billing" description="Where invoices go.">
  <FormField label="Company" error={errors.company}>
    <Input value={company} onChange={(event) => setCompany(event.target.value)} />
  </FormField>
  <FormActionsBar><SubmitStateButton state={submitState} /></FormActionsBar>
</FormSection>
```

Use the dependency-free form contract for reusable bindings, or the optional `forms-rhf`
adapter when React Hook Form already owns the state.

### Settings or account area

```tsx fragment — route matching and the router link renderer belong to the application
import { AsideNavShell } from "themelia-ui/layout/settings"
import "themelia-ui/layout/settings.css"

<AsideNavShell
  title="Settings"
  groups={settingsNavigation}
  currentPath={location.pathname}
  renderLink={renderAppLink}
>
  {routeContent}
</AsideNavShell>
```

`AsideNavShell` is domain-neutral: the same component serves an account area or a
documentation tree whose vocabulary is not settings.

## Choose by responsibility

| Need | Start with | Switch when |
| --- | --- | --- |
| Label/value facts | MetadataList | Use Item for an actionable identity row; FormField for editing. |
| Bounded header/body/footer surface | Card and its parts | Use ContentBlock for a section within an existing surface. |
| Temporary focused task | Overlay and its parts | Use a page or persistent section when dismissal is not meaningful. |
| Resource browser with filters and saved views | DataView | Use DataTable alone when only tabular behavior is needed. |
| Discussion with replies | Comments | Use ActivityFeed for events; ActivityLog for mixed history. |
| One region differs | Named slot or render prop | Use exported parts only when the overall arrangement must differ. |
| Live application theme controls | ThemeTweaker at the app shell | Bind to the existing theme scope; do not introduce a second theme owner. |

Look up a specific task with the offline finder. Exact symbols take priority; `--explain`
shows matched components, selection reasons and direct API anchors. `--json` exposes the
same records for tools. Guidance marked `family` is a fallback, not a component-specific
recommendation. An empty result means refine the query or inspect the catalogue, not invent
an export.

```bash
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "read only metadata" --explain
node node_modules/themelia-ui/scripts/consumer/find-component.mjs "mobile filters for a table" --explain --json
```

### Surface and field ownership

This complete example uses a card for its surface and a field for its label/control
association. The app supplies the mutation and validates its own domain rules. Errors retain
the entered value; pending state prevents a second submission.

```tsx compile
import { useState } from "react"
import { Card, CardHeader, CardContent } from "themelia-ui/base/cards"
import "themelia-ui/base/cards.css"
import { FormField } from "themelia-ui/base/forms"
import "themelia-ui/base/forms.css"
import { Input } from "themelia-ui/base/text-inputs"
import "themelia-ui/base/text-inputs.css"
import { Button } from "themelia-ui/base/buttons"
import "themelia-ui/base/buttons.css"
import { Stack } from "themelia-ui/base/structure"
import "themelia-ui/base/structure.css"

export function RenameRecord({ initialName, save }: {
  initialName: string
  save: (name: string) => Promise<void>
}) {
  const [name, setName] = useState(initialName)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  return <Card>
    <CardHeader title="Record details" description="Update the name shown to your team." />
    <CardContent>
      <form onSubmit={async (event) => {
        event.preventDefault()
        if (pending) return
        if (!name.trim()) { setError("Enter a name."); return }
        setPending(true)
        setError(undefined)
        try { await save(name.trim()) }
        catch { setError("Could not save. Your changes are still here; try again.") }
        finally { setPending(false) }
      }}>
        <Stack gap="md">
          <FormField label="Name" error={error}>
            <Input value={name} disabled={pending} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
        </Stack>
      </form>
    </CardContent>
  </Card>
}
```

### Responsive resource filters

Install the optional peers listed in the DataView family reference. The ready surface shares
one filter state across the desktop bar and mobile sheet; the application supplies records
and owns fetching. This example filters local rows. For server filtering, wire the public
filtering contract to your query layer instead of filtering an already paged subset twice.

```tsx compile
import { useState } from "react"
import { DataView, type DataViewProps } from "themelia-ui/features/data-view"
import "themelia-ui/features/data-view.css"
import { FilterType, FilterOperator, type ActiveFilter, type FilterConfig } from "themelia-ui/features/filters"

type RecordRow = { id: string; name: string; status: string }
const columns: DataViewProps<RecordRow>["columns"] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
]
const filters: FilterConfig[] = [{
  key: "status", label: "Status", type: FilterType.SELECT,
  operator: FilterOperator.EQUALS,
  options: [{ label: "Open", value: "open" }, { label: "Closed", value: "closed" }],
}]
export function RecordBrowser({ records }: { records: RecordRow[] }) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  return <DataView data={records} columns={columns} filtering={{
    filters, activeFilters, onFilterChange: setActiveFilters, mobilePresentation: "sheet",
  }} />
}
```

### Overflowing navigation

Tabs own keyboard selection, ScrollArea integration and overflow controls. Opt into the
edge fade through the public prop instead of adding a local mask or a second scroller.

```tsx compile
import { Tabs, TabList, Tab, TabPanel } from "themelia-ui/base/navigation"
import "themelia-ui/base/navigation.css"

export function SettingsTabs() {
  return <Tabs defaultValue="general">
    <TabList label="Settings sections" edgeFade>
      <Tab value="general">General</Tab>
      <Tab value="notifications">Notifications</Tab>
      <Tab value="integrations">Integrations</Tab>
    </TabList>
    <TabPanel value="general">General settings</TabPanel>
    <TabPanel value="notifications">Notification settings</TabPanel>
    <TabPanel value="integrations">Integration settings</TabPanel>
  </Tabs>
}
```

## State and responsive responsibilities

| Situation | Composition rule |
| --- | --- |
| Initial loading | Use the family's loading contract where available; do not show a false empty result. |
| Refresh | Keep existing data and drafts visible where supported; distinguish refresh from first load. |
| Empty or no matches | Distinguish an empty collection from filters excluding every result; offer the relevant next action. |
| Error | Preserve user input, show recoverable feedback, and wire retry to the app's data operation. |
| Pending mutation | Prevent duplicate actions; keep progress and errors associated with the initiating control. |
| Narrow viewport | Use the family's mobile presentation (such as the filter sheet); keep state shared with desktop. |
| Typography/theme override | Let semantic owners inherit provider defaults; verify density changes spacing without demoting body copy. |

Only use states the selected family exposes; the API reference is authoritative. The
complete examples above type-check against the built package, but their application
callbacks are illustrative: verify persistence and browser behaviour in your app.

## When to wrap, compose, or contribute

- **Wrap** when the product needs a stable local name or defaults around one family.
- **Compose** when several public families form a product concept.
- **Use parts or a hook** when a ready-made feature has the right lifecycle but the wrong
  presentation.
- **Contribute to the package** only when the missing concept is domain-neutral, repeats in
  more than one product context, and can keep policy at the consumer boundary.
- **Do not copy internal source.** Internal aliases, CSS Module names, and component tokens
  are not compatibility surfaces. Public props, exported parts, hooks, `data-slot`, BEM
  hooks, and global theme tokens are.

Open [the family API index](components/INDEX.md) after choosing a family. It
contains every public declaration and the live recipes attributed to that family.
