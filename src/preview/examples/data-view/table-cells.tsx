import { CellStack, DataTable } from "themelia-ui/features/table"

import { BOOKINGS, type Booking } from "./data"

export default function TableCells() {
	return (
		<DataTable<Booking>
			surface="glass"
			columns={[
				{
					id: "who",
					header: "Customer",
					accessorKey: "customer",
					cell: ({ row }) => (
						<CellStack
							values={[
								row.original.customer,
								[row.original.customerEmail, "email"],
							]}
						/>
					),
				},
				{
					id: "ref",
					header: "Reference",
					accessorKey: "reference",
					cell: ({ row }) => <CellStack values={[[row.original.reference, "mono"]]} />,
				},
				{
					id: "amount",
					header: "Total",
					accessorKey: "total",
					meta: { align: "end" },
					cell: ({ row }) => (
						<CellStack values={[[row.original.total, "money", { currency: "EUR" }]]} />
					),
				},
			]}
			data={BOOKINGS.slice(0, 3)}
		/>
	)
}
