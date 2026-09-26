import { DownloadIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "themelia-ui/base/table"
import { Input } from "themelia-ui/base/text-inputs"
import { Text } from "themelia-ui/base/typography"
import { ResourceActionBar, ResourceIndexShell } from "themelia-ui/features/resource"

type ShellState = "ready" | "loading" | "empty" | "error"

const INVOICES = [
	{ ref: "INV-4417", customer: "Northwind Traders", amount: "$48,200.00", status: "Overdue" },
	{ ref: "INV-4418", customer: "Contoso Ltd", amount: "$12,400.00", status: "Paid" },
	{ ref: "INV-4419", customer: "Fabrikam Inc", amount: "$1,950.00", status: "Draft" },
]

function InvoiceTable() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Reference</TableHead>
					<TableHead>Customer</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{INVOICES.map((invoice) => (
					<TableRow key={invoice.ref}>
						<TableCell>{invoice.ref}</TableCell>
						<TableCell>{invoice.customer}</TableCell>
						<TableCell>{invoice.amount}</TableCell>
						<TableCell>
							<Badge tone={invoice.status === "Paid" ? "success" : invoice.status === "Overdue" ? "destructive" : "neutral"}>
								{invoice.status}
							</Badge>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

export default function ResourceIndex() {
	const [state, setState] = useState<ShellState>("ready")

	return (
		<>
			<Stack direction="horizontal" gap="sm" wrap>
				{(["ready", "loading", "empty", "error"] as const).map((option) => (
					<Button
						key={option}
						tone={state === option ? "primary" : "neutral"}
						buttonStyle={state === option ? "solid" : "outline"}
						onClick={() => setState(option)}
					>
						{option}
					</Button>
				))}
			</Stack>

			<ResourceIndexShell
				title="Invoices"
				description="Everything billed on this account."
				actions={
					<>
						<Button tone="neutral" buttonStyle="outline">
							<DownloadIcon />
							Export
						</Button>
						<Button>
							<PlusIcon />
							New invoice
						</Button>
					</>
				}
				toolbar={
					<ResourceActionBar
						leading={<Input placeholder="Search invoices…" />}
						trailing={<Text size="sm" type="secondary">3 of 3</Text>}
					/>
				}
				loading={state === "loading"}
				empty={state === "empty"}
				error={state === "error" ? new Error("The billing service returned 502.") : undefined}
				onRetry={() => setState("ready")}
				strings={{
					emptyTitle: "No invoices yet",
					emptyDescription: "Invoices appear here once a customer is billed.",
					errorTitle: "Invoices unavailable",
				}}
			>
				<InvoiceTable />
			</ResourceIndexShell>
		</>
	)
}
