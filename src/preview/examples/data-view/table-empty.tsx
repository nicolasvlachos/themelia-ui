import { Button } from "themelia-ui/base/buttons"
import { DataTable } from "themelia-ui/features/table"

import { tableColumns } from "./_shared"
import type { Booking } from "./data"

export default function TableEmpty() {
	return (
		<DataTable<Booking>
			surface="glass"
			columns={tableColumns.slice(0, 3)}
			data={[]}
			emptyStateMessage="No bookings match these filters."
			emptyStateAction={<Button type="button" tone="neutral" appearance="outline">Clear filters</Button>}
		/>
	)
}
