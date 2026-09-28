import { useState } from "react"
import { ArchiveIcon, ExternalLinkIcon, Trash2Icon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Text } from "themelia-ui/base/typography"
import { DataTable } from "themelia-ui/features/table"

import { tableColumns } from "./_shared"
import { BOOKINGS, type Booking } from "./data"

export default function Table() {
	const [note, setNote] = useState<string | null>(null)
	const [page, setPage] = useState(1)

	return (
		<>
			<DataTable<Booking>
				columns={tableColumns}
				data={BOOKINGS.slice(0, 5)}
				enableSorting
				enableRowSelection
				enableColumnVisibility
				enableFiltering
				filterColumn="booking"
				filterPlaceholder="Filter venues…"
				showFullscreenToggle
				/*
				 * Pinned, because this table scrolls sideways.
				 *
				 * Without it, scrolling right takes the venue name and reference off the
				 * left edge and every row becomes an anonymous set of numbers — you can
				 * see a total but not what it is the total OF. The one column that says
				 * which row this is has to survive the scroll.
				 */
				stickyFirstColumn
				getRowId={(row) => row.id}
				defaultSorting={[{ id: "date", desc: false }]}
				onRowClick={(row) => setNote(`opened ${row.reference}`)}
				rowActions={(row) => [
					{ id: "open", label: "Open", icon: <ExternalLinkIcon />, onClick: () => setNote(`open ${row.reference}`) },
					{ id: "archive", label: "Archive", icon: <ArchiveIcon />, onClick: () => setNote(`archive ${row.reference}`) },
					{
						id: "delete",
						label: "Delete",
						icon: <Trash2Icon />,
						tone: "destructive",
						// Only on a cancelled booking — the whole reason the factory form exists.
						visible: (candidate) => candidate.status === "cancelled",
						onClick: () => setNote(`delete ${row.reference}`),
					},
				]}
				bulkActions={({ selectedRowCount }) => (
					<Button type="button" tone="neutral" appearance="outline" onClick={() => setNote(`archive ${selectedRowCount}`)}>
						Archive selected
					</Button>
				)}
				pageCount={3}
				page={page}
				onPageChange={setPage}
				totalRowCount={13}
				pageSize={5}
				/*
				 * Its own name, apart from the index's pager on the same page: two landmarks
				 * sharing a name are two a reader cannot tell apart.
				 */
				strings={{ pagination: { label: "Booking table pages" } }}
			/>
			{!!note && <Text size="sm" type="secondary">{note}</Text>}
		</>
	)
}
