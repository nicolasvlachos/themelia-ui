/*
 * A consumer under the admin dependency ceiling.
 *
 * The point of this example beside the general one is the branch: this consumer installs
 * `@tanstack/react-table` and `react-hook-form` because the families it uses require them,
 * and binds its form through `themelia-ui/forms-rhf`. The general example installs
 * neither and binds through the dependency-free contract. Two consumers taking opposite
 * branches is what proves the seam is real rather than described.
 *
 * Every state a reviewer needs to see is reachable without a server: loading, empty,
 * populated, a validation error, and a destructive confirmation.
 */
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { Heading, Text } from "themelia-ui/base/typography"
import { DataView } from "themelia-ui/features/data-view"
import { ActionDialog, ConfirmDialog, useOverlayVisibilityGroup } from "themelia-ui/features/overlays"
import { useFormFieldBinding } from "themelia-ui/forms"
import { rhfFormControl } from "themelia-ui/forms-rhf"
import { Page, PageHeader } from "themelia-ui/layout/page"
import { UIRoot } from "themelia-ui/ui-provider"

import "./app.css"

interface Order {
  id: string
  reference: string
  customer: string
  status: "paid" | "pending" | "refunded"
  total: number
}

const ORDERS: Order[] = [
  { id: "1", reference: "INV-1041", customer: "Ada Lovelace", status: "paid", total: 129.5 },
  { id: "2", reference: "INV-1042", customer: "Grace Hopper", status: "pending", total: 42 },
  { id: "3", reference: "INV-1043", customer: "Alan Turing", status: "refunded", total: 88.25 },
]

const TONE = { paid: "success", pending: "warning", refunded: "neutral" } as const

/** Bound through the react-hook-form adapter — the branch the general example does not take. */
function ReferenceForm({ onSubmit }: { onSubmit: (reference: string) => void }) {
  const form = useForm<{ reference: string }>({ defaultValues: { reference: "" } })
  const control = rhfFormControl(form.control)
  const reference = useFormFieldBinding<string>({ name: "reference", control })

  return (
    <form
      id="reference-form"
      onSubmit={form.handleSubmit((values) => onSubmit(values.reference))}
    >
      <FormField label="Reference" error={reference.error}>
        <Input
          value={reference.value ?? ""}
          onChange={(event) => reference.onValueChange(event.target.value)}
          onBlur={reference.onBlur}
        />
      </FormField>
      {/* Registered for its rule only; the binding above owns the value. */}
      <input
        type="hidden"
        {...form.register("reference", { required: "A reference is required." })}
      />
    </form>
  )
}

export function App() {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>(ORDERS)
  const [selected, setSelected] = useState<string[]>([])
  const overlays = useOverlayVisibilityGroup(["create", "destroy"])

  const columns = useMemo(
    () => [
      { accessorKey: "reference", header: "Reference" },
      { accessorKey: "customer", header: "Customer" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: { original: Order } }) => (
          <Badge tone={TONE[row.original.status]}>{row.original.status}</Badge>
        ),
      },
    ],
    [],
  )

  return (
    <UIRoot config={{ formatting: { locale: "en-GB" }, money: { defaultCurrency: "GBP" } }}>
      <Page>
        <PageHeader
          title="Orders"
          actions={
            <Stack direction="horizontal" gap="sm">
              <Button buttonStyle="outline" onClick={() => setLoading((on) => !on)}>
                {loading ? "Stop loading" : "Show loading"}
              </Button>
              <Button buttonStyle="outline" onClick={() => setOrders([])}>
                Show empty
              </Button>
              <Button onClick={overlays.create.show}>New order</Button>
            </Stack>
          }
        />

        <Stack gap="lg" className="consumer-override">
          {selected.length > 0 && (
            <Stack direction="horizontal" gap="sm">
              <Text>{selected.length} selected</Text>
              <Button tone="destructive" onClick={overlays.destroy.show}>
                Delete selected
              </Button>
            </Stack>
          )}

          <section>
            <Heading level={2}>All orders</Heading>
            {loading ? (
              <Text type="secondary">Loading…</Text>
            ) : orders.length === 0 ? (
              <Stack gap="sm">
                <Text type="secondary">No orders yet.</Text>
                <Button buttonStyle="outline" onClick={() => setOrders(ORDERS)}>
                  Restore
                </Button>
              </Stack>
            ) : (
              <DataView data={orders} columns={columns} />
            )}
          </section>

          <Stack direction="horizontal" gap="sm">
            <Button
              buttonStyle="ghost"
              onClick={() => setSelected(selected.length > 0 ? [] : orders.map((o) => o.id))}
            >
              {selected.length > 0 ? "Clear selection" : "Select all"}
            </Button>
          </Stack>
        </Stack>
      </Page>

      <ActionDialog
        {...overlays.create.overlayProps}
        title="New order"
        description="References must be unique."
        formId="reference-form"
      >
        <ReferenceForm
          onSubmit={(reference) => {
            setOrders((prev) => [
              ...prev,
              { id: String(prev.length + 1), reference, customer: "New customer", status: "pending", total: 0 },
            ])
            overlays.create.hide()
          }}
        />
      </ActionDialog>

      <ConfirmDialog
        {...overlays.destroy.overlayProps}
        title="Delete these orders?"
        description="This cannot be undone."
        tone="destructive"
        onConfirm={() => {
          setOrders((prev) => prev.filter((order) => !selected.includes(order.id)))
          setSelected([])
        }}
      />
    </UIRoot>
  )
}
