import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "themelia-ui/base/table"
import { AsyncPreview, PreviewTriggerCell } from "themelia-ui/features/async-preview"

import { CustomerCard } from "./_shared"
import { CUSTOMERS, wait, type Customer } from "./data"

const ROWS = [
	{ id: "c-1", reference: "INV-4417", note: "" },
	{ id: "c-2", reference: "INV-4418", note: "" },
	{ id: "c-3", reference: "INV-4419", note: "" },
	{ id: null, reference: "INV-4420", note: "Imported without a customer record" },
]

const fetchCustomer = async (id: string, signal: AbortSignal, delay = 700) => {
	await wait(delay, signal)
	return CUSTOMERS[id] ?? null
}

export default function PreviewTriggerCellExample() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Customer</TableHead>
					<TableHead>Reference</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{ROWS.map((row) => {
					const customer = row.id ? CUSTOMERS[row.id] : undefined
					return (
						<TableRow key={row.reference}>
							<TableCell>
								{customer ? (
									<AsyncPreview.Root<Customer, { id: string }, "customer">
										type="customer"
										context={{ id: customer.id }}
										cacheKey={`cell:${customer.id}`}
										onShow={({ context, signal }) => fetchCustomer(context.id, signal, 450)}
									>
										<AsyncPreview.Trigger>
											{() => (
												<PreviewTriggerCell
													value={customer.name}
													secondary={customer.email}
													badge={{ label: customer.plan }}
												/>
											)}
										</AsyncPreview.Trigger>
										<AsyncPreview.Content>
											<AsyncPreview.Loading />
											<AsyncPreview.Error />
											<AsyncPreview.Empty />
											<AsyncPreview.Body>
												{(data) => <CustomerCard customer={data as Customer} />}
											</AsyncPreview.Body>
										</AsyncPreview.Content>
									</AsyncPreview.Root>
								) : (
									<PreviewTriggerCell
										value={null}
										hasPreview={false}
										disabledReason={row.note}
									/>
								)}
							</TableCell>
							<TableCell>{row.reference}</TableCell>
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)
}
