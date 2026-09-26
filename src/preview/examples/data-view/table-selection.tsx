import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Text } from "themelia-ui/base/typography"
import { DataTable } from "themelia-ui/features/table"

import { tableColumns } from "./_shared"
import { BOOKINGS, type Booking } from "./data"

export default function TableSelection() {
	const [note, setNote] = useState<string | null>(null)

	return (
		<>
			{/*
			 * `transform` makes this box the containing block for the docked bar, so it docks
			 * to the example rather than the viewport. The same applies in an app: inside a
			 * transformed ancestor, the bar docks to that box.
			 */}
			<div style={{ transform: "translate(0)", position: "relative", width: "100%" }}>
				<DataTable<Booking>
					columns={tableColumns}
					data={BOOKINGS.slice(0, 4)}
					enableRowSelection
					getRowId={(row) => row.id}
					initialState={{ rowSelection: { b2: true, b4: true } }}
					bulkActions={({ selectedRowCount }) => (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="outline"
							onClick={() => setNote(`archive ${selectedRowCount}`)}
						>
							Archive selected
						</Button>
					)}
				/>
			</div>
			{!!note && <Text size="sm" type="secondary">{note}</Text>}
		</>
	)
}
