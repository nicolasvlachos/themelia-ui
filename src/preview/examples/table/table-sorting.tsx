import { useState } from "react"

import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type TableSortDirection,
} from "themelia-ui/base/table"
import { Money } from "themelia-ui/primitives"

import { INVOICES } from "./data"

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

export default function TableSorting() {
	return (
		<SortableInvoiceTable />
	)
}
