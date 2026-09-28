import { MetadataList } from "themelia-ui/base/display"
import { DataTable } from "themelia-ui/features/table"
import { Money } from "themelia-ui/primitives"

import { tableColumns } from "./_shared"
import { BOOKINGS } from "./data"

/* Everything the panel shows is already on the row, so `render` is the whole configuration. */
export default function TableExpandable() {
	return (
		<DataTable
			columns={tableColumns}
			data={BOOKINGS.slice(0, 4)}
			getRowId={(row) => row.id}
			expandedRow={{
				defaultExpanded: { b1: true },
				render: (booking) => (
					<MetadataList
						layout="grid"
						columns={4}
						items={[
							{ label: "Reference", value: booking.reference },
							{ label: "Guests", value: String(booking.guests) },
							{ label: "Total", value: <Money amount={booking.total} currency="EUR" /> },
							{ label: "Contact", value: booking.customerEmail },
						]}
					/>
				),
			}}
		/>
	)
}
