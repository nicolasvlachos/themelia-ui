import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { Checkbox } from "themelia-ui/base/choice-inputs"
import {
	Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "themelia-ui/base/table"
import { DatePrimitive, Money } from "themelia-ui/primitives"

import { INVOICES } from "./data"

const TOTAL = INVOICES.reduce((sum, invoice) => sum + invoice.amount, 0)

export function InvoiceTable({ selectable = false }: { selectable?: boolean }) {
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
