import { Stack } from "themelia-ui/base/structure"
import {
	Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow,
} from "themelia-ui/base/table"
import { Money } from "themelia-ui/primitives"

import { INVOICES } from "./data"
import styles from "./table-empty.module.css"

export default function TableEmptyExample() {
	return (
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

			<Table stickyHeader containerClassName={styles.bounded}>
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
	)
}
