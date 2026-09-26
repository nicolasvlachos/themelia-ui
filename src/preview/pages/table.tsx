import { useState } from "react"

import { Badge } from "@/components/base/badge"
import { Checkbox } from "@/components/base/choice-inputs"
import {
	Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
	TableEmpty, type TableSortDirection,
} from "@/components/base/table"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { DatePrimitive, Money } from "@/components/primitives"
import { Scope } from "@/lib/ui-provider"

import styles from "../preview.module.css"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const INVOICES = [
	{ id: "INV-4417", client: "Northwind Traders", due: "2026-09-01", amount: 1299.5, status: "Paid" },
	{ id: "INV-4418", client: "Acme Corporation", due: "2026-09-04", amount: 84, status: "Paid" },
	{ id: "INV-4419", client: "Globex", due: "2026-09-11", amount: 24_500, status: "Open" },
	{ id: "INV-4420", client: "Initech", due: "2026-09-18", amount: 640.25, status: "Overdue" },
]

const TOTAL = INVOICES.reduce((sum, invoice) => sum + invoice.amount, 0)

function InvoiceTable({ selectable = false }: { selectable?: boolean }) {
	const [selected, setSelected] = useState<string[]>([])

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{selectable && (
						<TableHead style={{ width: "1%" }}>
							<Checkbox
								aria-label="Select all invoices"
								checked={selected.length === INVOICES.length}
								indeterminate={selected.length > 0 && selected.length < INVOICES.length}
								onChange={(event) =>
									setSelected(event.target.checked ? INVOICES.map((invoice) => invoice.id) : [])
								}
							/>
						</TableHead>
					)}
					<TableHead>Invoice</TableHead>
					<TableHead>Client</TableHead>
					<TableHead>Due</TableHead>
					<TableHead align="end">Amount</TableHead>
					<TableHead align="end">Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{INVOICES.map((invoice) => (
					<TableRow
						key={invoice.id}
						data-state={selected.includes(invoice.id) ? "selected" : undefined}
					>
						{selectable && (
							<TableCell>
								<Checkbox
									aria-label={`Select ${invoice.id}`}
									checked={selected.includes(invoice.id)}
									onChange={(event) =>
										setSelected((previous) =>
											event.target.checked
												? [...previous, invoice.id]
												: previous.filter((id) => id !== invoice.id),
										)
									}
								/>
							</TableCell>
						)}
						<TableCell>{invoice.id}</TableCell>
						<TableCell>{invoice.client}</TableCell>
						<TableCell>
							<DatePrimitive value={invoice.due} />
						</TableCell>
						<TableCell align="end">
							<Money amount={invoice.amount} />
						</TableCell>
						<TableCell align="end">
							<Badge
								dot
								pending={invoice.status === "Open"}
								tone={
									invoice.status === "Overdue"
										? "destructive"
										: invoice.status === "Open"
											? "warning"
											: "success"
								}
							>
								{invoice.status}
							</Badge>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colSpan={selectable ? 4 : 3}>Total</TableCell>
					<TableCell align="end">
						<Money amount={TOTAL} />
					</TableCell>
					<TableCell />
				</TableRow>
			</TableFooter>
			<TableCaption>Invoices issued in the current billing period.</TableCaption>
		</Table>
	)
}


/**
 * Sorting is the CALLER's job — the table renders the order it is given.
 *
 * A table that sorted its own rows would have to own them, and then it cannot be driven by
 * a server that paginates, or by a filter that lives above it.
 */
function SortableInvoiceTable() {
	const [sort, setSort] = useState<{ key: "id" | "client" | "amount"; direction: Exclude<TableSortDirection, null> }>({
		key: "amount",
		direction: "descending",
	})

	const toggleSort = (key: "id" | "client" | "amount") =>
		setSort((current) =>
			current.key === key
				? { key, direction: current.direction === "ascending" ? "descending" : "ascending" }
				: { key, direction: "ascending" },
		)

	const rows = [...INVOICES].sort((a, b) => {
		const left = a[sort.key]
		const right = b[sort.key]
		const order = typeof left === "number" && typeof right === "number"
			? left - right
			: String(left).localeCompare(String(right))
		return sort.direction === "ascending" ? order : -order
	})

	const head = (key: "id" | "client" | "amount", label: string, align?: "end") => (
		<TableHead
			sortable
			align={align}
			sortDirection={sort.key === key ? sort.direction : null}
			onSort={() => toggleSort(key)}
		>
			{label}
		</TableHead>
	)

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{head("id", "Invoice")}
					{head("client", "Client")}
					{head("amount", "Amount", "end")}
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map((invoice) => (
					<TableRow key={invoice.id}>
						<TableCell>{invoice.id}</TableCell>
						<TableCell>{invoice.client}</TableCell>
						<TableCell align="end"><Money amount={invoice.amount} /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

export function TablePage() {
	return (
		<ComponentPage
			title="Table"
			summary="Rows and columns, as plain table elements. The scroll container is the only wrapper — everything else is the semantics the browser already gives you."
			importPath="@/components/base/table"
			exports={["Table", "TableHeader", "TableBody", "TableFooter", "TableRow", "TableHead", "TableCell", "TableCaption", "TableEmpty"
			]}
		>
			<Example
				id="table"
				title="Table"
				description="The parts map one-to-one onto the HTML elements, so the semantics are the browser's. A plain string cell is wrapped in Text; a node is left exactly as passed."
				stacked
				code={`<Table>
  <TableHeader>
    <TableRow><TableHead>Invoice</TableHead>…</TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV-4417</TableCell>
      <TableCell align="end"><Money amount={1299.5} /></TableCell>
    </TableRow>
  </TableBody>
</Table>`}
			>
				<InvoiceTable />
			</Example>

			<Example
				id="table-selection"
				title="Selection"
				description="A row marks itself with `data-state=&quot;selected&quot;`. The checkbox column drops its trailing inset so the control lines up with the header above it."
				stacked
				code={`<TableRow data-state={isSelected ? "selected" : undefined}>
  <TableCell><Checkbox … /></TableCell>
  …
</TableRow>`}
			>
				<InvoiceTable selectable />
			</Example>

			<Example
				id="table-scroll"
				title="Overflow"
				description="The scroll container is focusable, so a wide table can be scrolled from the keyboard. That is also why it takes a visible focus ring — a tab stop with no ring is a trap."
				stacked
			>
				<Callout label="Rule">
					Cells are <code>white-space: nowrap</code> by default and the container scrolls.
					A column that genuinely holds prose opts out with <code>wrap</code> on the cell,
					rather than the whole table losing its column alignment.
				</Callout>
			</Example>

			<Example
				id="table-scale"
				title="Density"
				description="Density is scoped, not a prop. A region can be denser than the page around it."
				stacked
				code={`<Scope vars={{ "--density-scale": 0.85 }}>
  <Table>…</Table>
</Scope>`}
			>
				{/*
				  * Both, captioned. On its own the scoped table just looked like a table —
				  * the section asserted a difference the page gave the reader no way to see.
				  */}
				<Stack gap="lg" style={{ width: "100%" }}>
					<Stack gap="xs" style={{ width: "100%" }}>
						<Text size="xs" type="secondary">--density-scale: 1</Text>
						<InvoiceTable />
					</Stack>
					<Stack gap="xs" style={{ width: "100%" }}>
						<Text size="xs" type="secondary">--density-scale: 0.85</Text>
						<Scope vars={{ "--density-scale": 0.85 }} style={{ width: "100%" }}>
							<InvoiceTable />
						</Scope>
					</Stack>
				</Stack>
			</Example>

			<Example
				id="table-sorting"
				title="Sortable columns"
				description="The whole label is the target, not a small chevron beside it, and the neutral state still shows an icon — a sortable column that looks identical to a fixed one until hovered is undiscoverable by touch and by keyboard alike. aria-sort lives on the th, so the order is announced rather than only drawn."
				stacked
				code={`<TableHead
  sortable
  sortDirection={sort.key === "amount" ? sort.direction : null}
  onSort={() => toggleSort("amount")}
  align="end"
>
  Amount
</TableHead>`}
			>
				<SortableInvoiceTable />
			</Example>

			<Example
				id="table-empty"
				title="Empty and sticky"
				description="A table that renders an empty tbody looks broken rather than empty — the header hangs over nothing. A sticky header needs a bounded container to stick inside, and a background of its own, or the rows scroll underneath and both are drawn."
				stacked
				code={`<TableBody>
  {rows.length === 0 ? <TableEmpty colSpan={4} /> : rows.map(…)}
</TableBody>

<Table stickyHeader containerClassName="…max-height…">`}
			>
				<Stack gap="xl" style={{ width: "100%" }}>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead>Client</TableHead>
								<TableHead align="end">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableEmpty colSpan={3}>No invoices match this filter.</TableEmpty>
						</TableBody>
					</Table>

					<Table stickyHeader containerClassName={styles.stickyDemo}>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead>Client</TableHead>
								<TableHead align="end">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{[...INVOICES, ...INVOICES, ...INVOICES].map((invoice, index) => (
								<TableRow key={index}>
									<TableCell>{invoice.id}</TableCell>
									<TableCell>{invoice.client}</TableCell>
									<TableCell align="end"><Money amount={invoice.amount} /></TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Stack>
			</Example>

			<Example id="table-api" title="API">
				<PropTable
					rows={[
						{ name: "containerClassName", api: "Table.containerClassName", type: "string", description: "Class for the scroll container rather than the table element." },
						{ name: "stickyHeader", api: "Table.stickyHeader", type: "boolean", default: "false", description: "Pins the header while the body scrolls. Only meaningful when the container is bounded." },
						{ name: "TableHead sortable", type: "boolean", description: "Renders the label as a sort control and puts aria-sort on the th." },
						{ name: "TableHead sortDirection", type: '"ascending" | "descending" | null', description: "This column's order, or null when another column is the sort." },
						{ name: "TableHead onSort", type: "() => void", description: "Fires on activation. The table does not sort — the caller owns the data." },
						{ name: "TableEmpty colSpan", type: "number", description: "The no-rows row, spanning every column." },
						{ name: "TableCell align", type: '"start" | "center" | "end"', description: "Column alignment. Numeric columns belong at the end." },
						{ name: "TableCell wrap", type: "boolean", default: "false", description: "Lets the cell wrap. Cells are nowrap by default so columns stay aligned." },
						{ name: "TableRow data-state", api: "TableRow", type: '"selected"', description: "Marks a selected row. A data attribute, not a prop — rows are plain elements." },
						{ name: "TableCaption", type: "component", description: "Names the table for assistive technology. Rendered below the table, as the element specifies." },
						{ name: "--density-scale", api: ["css:--density-scale"], type: "number", default: "var(--scale)", description: "Global density factor. Scope it to make one region denser than the page." },
						{ name: "TableEmpty", type: "component", description: "A row that spans every column and states that there are none. A table with a header and no body reads as broken; this is what says it is empty on purpose." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
