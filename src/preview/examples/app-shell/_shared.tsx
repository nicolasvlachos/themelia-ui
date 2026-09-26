import { ChartNoAxesColumnIcon } from "lucide-react"
import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { IconBadge } from "themelia-ui/base/display"
import { FormField } from "themelia-ui/base/forms"
import { Grid, Stack } from "themelia-ui/base/structure"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from "themelia-ui/base/table"
import { Input } from "themelia-ui/base/text-inputs"
import { Heading, Text } from "themelia-ui/base/typography"

import { INVOICES } from "./data"

export function InvoiceContent({ query = "" }: { query?: string }) {
	const [unpaid, setUnpaid] = useState(false)
	const rows = INVOICES.filter(row => (!unpaid || !row.paid) && `${row.id} ${row.customer}`.toLowerCase().includes(query.toLowerCase()))
	return <Card title="Recent invoices" description="Track payments across your workspace."
		contentTop={<Stack direction="horizontal" justify="end"><Button buttonStyle="outline" tone="neutral" aria-pressed={unpaid} onClick={() => setUnpaid(!unpaid)}>{unpaid ? "Show all" : "Unpaid only"}</Button></Stack>}
		footerText={`${rows.length} ${rows.length === 1 ? "invoice" : "invoices"}`}>
		<Table aria-label="Recent invoices">
			<TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead align="end">Amount</TableHead></TableRow></TableHeader>
			<TableBody>{rows.map(row => <TableRow key={row.id}><TableCell>{row.id}</TableCell><TableCell>{row.customer}</TableCell><TableCell><Badge tone={row.paid ? "success" : "warning"}>{row.paid ? "Paid" : "Due"}</Badge></TableCell><TableCell align="end">{row.amount}</TableCell></TableRow>)}
				{!rows.length && <TableEmpty colSpan={4}>No invoices match this search.</TableEmpty>}
			</TableBody>
		</Table>
	</Card>
}

export function SettingsContent() {
	const [name, setName] = useState("Northwind Traders")
	const [saved, setSaved] = useState(false)
	return <Card title="Workspace details" description="Shared with everyone in your workspace.">
		<form onSubmit={event => { event.preventDefault(); setSaved(true) }}>
			<Stack gap="lg">
				<FormField label="Workspace name" required><Input value={name} required onChange={event => { setName(event.target.value); setSaved(false) }} /></FormField>
				<Stack direction="horizontal" gap="md" align="center" wrap>
					<Button type="submit">Save changes</Button>
					<Text size="sm" role="status">{saved ? "Workspace updated." : ""}</Text>
				</Stack>
			</Stack>
		</form>
	</Card>
}

export function AdminContent({ currentUrl, query }: { currentUrl: string; query?: string }) {
	const title = currentUrl.includes("settings") ? "Settings"
		: currentUrl.includes("invoices") ? "Invoices"
		: currentUrl.includes("customers") ? "Customers"
		: currentUrl.includes("billing") ? "Billing" : "Overview"

	return (
		<Stack gap="xl">
			<Stack gap="xs">
				<Heading level={3} size="xl">{title}</Heading>
				<Text type="secondary">Northwind workspace</Text>
			</Stack>
			{title === "Settings" ? (
				currentUrl.endsWith("/members") ? (
					<Card title="Workspace members" description="People with access to this workspace.">
						<Table aria-label="Workspace members">
							<TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
							<TableBody>
								<TableRow><TableCell>Jane McDonald</TableCell><TableCell><Badge tone="neutral">Owner</Badge></TableCell></TableRow>
								<TableRow><TableCell>Alex Morgan</TableCell><TableCell><Badge tone="neutral">Member</Badge></TableCell></TableRow>
							</TableBody>
						</Table>
					</Card>
				) : <SettingsContent />
			) : title === "Customers" ? (
				<Card title="Customer directory" description="Customers linked to recent invoices.">
					<Table aria-label="Customers">
						<TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Latest invoice</TableHead></TableRow></TableHeader>
						<TableBody>{INVOICES.map(row => <TableRow key={row.id}><TableCell>{row.customer}</TableCell><TableCell>{row.id}</TableCell></TableRow>)}</TableBody>
					</Table>
				</Card>
			) : (
				<>
					{title === "Overview" && (
						<Grid columns={{ base: 1, md: 3 }} gap="md">
							{[["Collected", "$1,299.50"], ["Outstanding", "$2,990.00"], ["Customers", "3"]].map(([label, value]) => (
								<Card key={label} title={label}><Text size="xl" weight="semibold">{value}</Text></Card>
							))}
						</Grid>
					)}
					<InvoiceContent query={query} />
				</>
			)}
		</Stack>
	)
}

/** The product mark. A real one is an SVG; this is the shape of the slot. */
export function Brand() {
	return (
		<Stack direction="horizontal" gap="sm" align="center">
			<BrandMark />
			<Text weight="semibold">Northwind</Text>
		</Stack>
	)
}

/** The compact mark, for the collapsed rail and the header on a phone. */
export function BrandMark() {
	return <IconBadge icon={<ChartNoAxesColumnIcon />} tone="primary" shape="rounded" />
}
