import { OrderTransactions, type Transaction } from "themelia-ui/blocks/admin/commerce"

const TRANSACTIONS: Transaction[] = [
	{
		id: "1",
		kind: "authorization",
		status: "success",
		amount: "€239.95",
		processedAt: "21 Dec 2025, 22:10",
		method: "Visa ending 4417",
		reference: "ch_3Qa8Kd2eZvKYlo2C",
		gateway: "Stripe",
	},
	{
		id: "2",
		kind: "capture",
		status: "failure",
		amount: "€239.95",
		processedAt: "22 Dec 2025, 04:02",
		method: "Visa ending 4417",
		reference: "ch_3Qa8Kd2eZvKYlo2C",
		gateway: "Stripe",
	},
	{
		id: "3",
		kind: "refund",
		status: "success",
		amount: "€239.95",
		processedAt: "23 Dec 2025, 09:41",
		method: "Visa ending 4417",
		reference: "re_3QaB9x2eZvKYlo2C",
		gateway: "Stripe",
	},
]

export default function OrderTransactionsExample() {
	return (
		<OrderTransactions transactions={TRANSACTIONS} />
	)
}
