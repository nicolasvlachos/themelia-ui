import { useState } from "react"
import type { SortingState } from "@tanstack/react-table"
import { getCoreRowModel, getSortedRowModel, useLegacyTable } from "@tanstack/react-table/legacy"

import { Button } from "themelia-ui/base/buttons"
import { DataView, DataViewPagination, useDataView } from "themelia-ui/features/data-view"
import { useFilters, type ActiveFilter } from "themelia-ui/features/filters"

import { FILTERS, indexColumns } from "./_shared"
import { BOOKINGS, TABS, type Booking } from "./data"

const PAGE_SIZE = 3
// Filtering has already run before sorting and paging. DataView still owns the controls.
const keepPage = ({ data }: { data: readonly Booking[] }) => data as Booking[]

function ResetViewButton({ disabled, onReset }: { disabled: boolean; onReset: () => void }) {
	const { clearFilters } = useFilters()
	return <Button tone="neutral" appearance="outline" disabled={disabled}
		onClick={() => { clearFilters(); onReset() }}>Reset view</Button>
}

export default function DataViewExample() {
	const [active, setActive] = useState<ActiveFilter[]>([])
	const [page, setPage] = useState(1)
	const [sorting, setSorting] = useState<SortingState>([])
	const updateFilters = (next: ActiveFilter[]) => {
		setActive(next)
		setPage(1)
	}
	const { rows } = useDataView({ data: BOOKINGS, filtering: {
		filters: FILTERS, activeFilters: active, onFilterChange: updateFilters,
	} })

	const sorted = useLegacyTable({
		data: rows as Booking[], columns: indexColumns, state: { sorting },
		getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
	})
	const pageCount = Math.ceil(rows.length / PAGE_SIZE)
	const currentPage = Math.min(page, Math.max(1, pageCount))
	const start = (currentPage - 1) * PAGE_SIZE
	const pageRows = sorted.getRowModel().rows.slice(start, start + PAGE_SIZE).map((row) => row.original)
	const summary = pageCount > 1
		? `${start + 1}–${start + pageRows.length} of ${rows.length} bookings`
		: `${rows.length} ${rows.length === 1 ? "booking" : "bookings"}`

	return (
		<DataView<Booking>
			data={pageRows}
			columns={indexColumns}
			filtering={{
				filters: FILTERS,
				activeFilters: active,
				onFilterChange: updateFilters,
				filterRows: keepPage,
				tabs: TABS,
			}}
			table={{
				enableSorting: true,
				manualSorting: true,
				sorting,
				onSortingChange: (next) => { setSorting(next); setPage(1) },
				enableColumnVisibility: true,
				getRowId: (row) => row.id,
				emptyStateMessage: "No bookings match your filters",
				emptyStateAction: <Button tone="neutral" appearance="outline" onClick={() => updateFilters([])}>Clear filters</Button>,
			}}
			slots={{
				topbarEnd: <ResetViewButton
					disabled={active.length === 0 && sorting.length === 0 && currentPage === 1}
					onReset={() => { setSorting([]); setPage(1) }} />,
				footer: (
					<DataViewPagination
						page={currentPage}
						pageCount={pageCount}
						total={summary}
						onPageChange={setPage}
					/>
				),
			}}
		/>
	)
}
