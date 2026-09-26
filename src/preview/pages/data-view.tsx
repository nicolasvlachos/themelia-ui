import { useMemo, useState } from "react"
import {
	ArchiveIcon, BuildingIcon, CircleCheckIcon, CircleDashedIcon, CircleXIcon, ExternalLinkIcon,
	Trash2Icon,
} from "lucide-react"
import type { SortingState } from "@tanstack/react-table"
import { getCoreRowModel, getSortedRowModel, useLegacyTable, type LegacyColumnDef } from "@tanstack/react-table/legacy"

import { Button } from "@/components/base/buttons"
import { Select } from "@/components/base/choice-inputs"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	AvatarCell, CellStack, CurrencyCell, DataTable, DataView, DataViewPagination, DateMetaCell,
	FilterType, ResourceCell, StatusCell, useDataView, useFilters,
	type ActiveFilter, type FilterConfig, type FilterTab,
} from "@/components/features"

import { Callout } from "../partials/callout"
import styles from "../preview.module.css"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

interface Booking {
	id: string
	reference: string
	venue: string
	customer: string
	customerEmail: string
	status: "confirmed" | "pending" | "cancelled"
	guests: number
	total: number
	date: string
}

/* One set of bookings for the whole page: the index and the engine under it show the same records. */
const BOOKINGS: Booking[] = [
	{ id: "b1", reference: "BK-4417", venue: "Marlow Hall", customer: "Marla Okonkwo", customerEmail: "marla@example.com", status: "confirmed", guests: 120, total: 12400, date: "2026-10-14" },
	{ id: "b2", reference: "BK-4418", venue: "The Old Granary", customer: "Tom Adeyemi", customerEmail: "tom@example.com", status: "pending", guests: 45, total: 3200, date: "2026-10-18" },
	{ id: "b3", reference: "BK-4419", venue: "Riverside Rooms", customer: "Priya Raman", customerEmail: "priya@example.com", status: "confirmed", guests: 180, total: 22800, date: "2026-11-02" },
	{ id: "b4", reference: "BK-4420", venue: "Marlow Hall", customer: "Jonas Berg", customerEmail: "jonas@example.com", status: "cancelled", guests: 60, total: 0, date: "2026-11-09" },
	{ id: "b5", reference: "BK-4421", venue: "The Old Granary", customer: "Aiko Tanaka", customerEmail: "aiko@example.com", status: "confirmed", guests: 30, total: 2100, date: "2026-11-21" },
	{ id: "b6", reference: "BK-4422", venue: "Riverside Rooms", customer: "Leo Martins", customerEmail: "leo@example.com", status: "pending", guests: 210, total: 28900, date: "2026-12-05" },
]

const STATUS = {
	confirmed: { label: "Confirmed", tone: "success" as const },
	pending: { label: "Pending", tone: "warning" as const },
	cancelled: { label: "Cancelled", tone: "destructive" as const },
}

const FILTERS: FilterConfig[] = [
	{ key: "q", label: "Search", type: FilterType.SEARCH, placeholder: "Search bookings…", delay: 200 },
	{
		key: "status",
		label: "Status",
		pluralLabel: "statuses",
		type: FilterType.MULTI_SELECT,
		icon: <CircleCheckIcon />,
		displayConfig: { display: "always", priority: 0 },
		options: [
			{ value: "confirmed", label: "Confirmed", icon: <CircleCheckIcon /> },
			{ value: "pending", label: "Pending", icon: <CircleDashedIcon /> },
			{ value: "cancelled", label: "Cancelled", icon: <CircleXIcon /> },
		],
	},
	{
		key: "venue",
		label: "Venue",
		pluralLabel: "venues",
		type: FilterType.MULTI_SELECT,
		icon: <BuildingIcon />,
		displayConfig: { priority: 1 },
		options: [
			{ value: "Marlow Hall", label: "Marlow Hall" },
			{ value: "The Old Granary", label: "The Old Granary" },
			{ value: "Riverside Rooms", label: "Riverside Rooms" },
		],
	},
	{
		key: "guests",
		label: "Guests",
		type: FilterType.RANGE,
		operator: "gt",
		displayConfig: { priority: 2 },
	},
]

const TABS: FilterTab[] = [
	{ id: "all", label: "All", presets: [] },
	{ id: "confirmed", label: "Confirmed", presets: [{ key: "status", value: ["confirmed"] }] },
	{ id: "attention", label: "Needs attention", presets: [{ key: "status", value: ["pending", "cancelled"] }] },
]

const PAGE_SIZE = 3
// Filtering has already run before sorting and paging. DataView still owns the controls.
const keepPage = ({ data }: { data: readonly Booking[] }) => data as Booking[]

function ResetViewButton({ disabled, onReset }: { disabled: boolean; onReset: () => void }) {
	const { clearFilters } = useFilters()
	return <Button tone="neutral" buttonStyle="outline" disabled={disabled}
		onClick={() => { clearFilters(); onReset() }}>Reset view</Button>
}

export function DataViewPage() {
	const [active, setActive] = useState<ActiveFilter[]>([])
	const [requestState, setRequestState] = useState("ready")
	const [recoveryFilters, setRecoveryFilters] = useState<ActiveFilter[]>([])
	const [page, setPage] = useState(1)
	const [sorting, setSorting] = useState<SortingState>([])
	const [note, setNote] = useState<string | null>(null)
	const [tablePage, setTablePage] = useState(1)
	const updateFilters = (next: ActiveFilter[]) => {
		setActive(next)
		setPage(1)
	}
	const { rows } = useDataView({ data: BOOKINGS, filtering: {
		filters: FILTERS, activeFilters: active, onFilterChange: updateFilters,
	} })

	/* The index's columns: what a reader scans to find a booking. */
	const indexColumns = useMemo<LegacyColumnDef<Booking, unknown>[]>(
		() => [
			{
				id: "booking",
				header: "Booking",
				accessorKey: "venue",
				cell: ({ row }) => (
					<ResourceCell
						title={row.original.venue}
						subtitle={row.original.reference}
						fallback={row.original.venue.slice(0, 2).toUpperCase()}
					/>
				),
			},
			{
				id: "status",
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => <StatusCell value={row.original.status} map={STATUS} />,
			},
			{
				id: "guests",
				header: "Guests",
				accessorKey: "guests",
				meta: { align: "end" },
			},
			{
				id: "total",
				header: "Total",
				accessorKey: "total",
				meta: { align: "end" },
				cell: ({ row }) => <CurrencyCell value={row.original.total} currency="EUR" />,
			},
		],
		[],
	)

	/* The engine's columns: wider, so the sticky first column and the ready-made cells have work to do. */
	const tableColumns = useMemo<LegacyColumnDef<Booking, unknown>[]>(
		() => [
			{
				id: "booking",
				header: "Booking",
				accessorKey: "venue",
				cell: ({ row }) => (
					<ResourceCell
						title={row.original.venue}
						subtitle={row.original.reference}
						href={`#/bookings/${row.original.id}`}
						fallback={row.original.venue.slice(0, 2).toUpperCase()}
						badges={row.original.guests > 100 ? [{ label: "Large", tone: "info" }] : undefined}
					/>
				),
			},
			{
				id: "customer",
				header: "Customer",
				accessorKey: "customer",
				cell: ({ row }) => (
					<AvatarCell name={row.original.customer} subtitle={row.original.customerEmail} />
				),
			},
			{
				id: "status",
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => <StatusCell value={row.original.status} map={STATUS} />,
			},
			{
				id: "date",
				header: "Date",
				accessorKey: "date",
				cell: ({ row }) => (
					<DateMetaCell
						value={row.original.date}
						secondary={(date) => date.toLocaleDateString(undefined, { weekday: "long" })}
					/>
				),
			},
			{
				id: "total",
				header: "Total",
				accessorKey: "total",
				meta: { align: "end" },
				cell: ({ row }) => <CurrencyCell value={row.original.total} currency="EUR" />,
			},
		],
		[],
	)

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
		<ComponentPage
			title="Data view & data table"
			summary="One table at two levels. DataView is the complete resource index — search, saved views, filters, table controls and result navigation in one surface — and it is what most index screens want. DataTable is the engine it renders: a TanStack table where TanStack owns the row model and this owns the toolbar, sticky panes, full screen, selection bar, pager and empty state. Reach for DataTable directly when there is nothing to search or filter."
			importPath="@/components/features/data-view"
			exports={["DataView", "useDataView", "DataViewShell", "DataViewPagination",
				"DataViewToolbar", "DataViewTableFrame", "SavedViewTabs",
			]}
			alsoImports={[
				{ importPath: "@/components/features/table", title: "Data table", exports: ["DataTable", "ResourceCell", "StatusCell", "CellStack", "DataTableHeader", "DataTableBody", "DataTableToolbar", "DataTableActions", "ColumnVisibilityToggle", "FullscreenToggle", "CellValue", "AvatarCell", "CurrencyCell", "DateCell", "DateMetaCell", "StatusClusterCell", "useDataTableSize", "useDataTableScrollState", "useFullscreenTableModality"] },
			]}
		>
			<Example
				id="data-view"
				title="An index"
				description="Search bookings or choose a saved view, then sort and page through the matches. On phones, Filters opens a sheet and saved views become a select. Filtering and sorting run before pagination; changing either returns to the first page."
				stacked
				code={`// Filter and sort the complete collection before slicing a page.
// A server-backed view can pass the returned page and total instead.
const { rows } = useDataView({ data: bookings, filtering })
const sorted = useLegacyTable({
  data: rows, columns, state: { sorting },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
})
const sortedRows = sorted.getRowModel().rows.map((row) => row.original)
const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize)

<DataView
  data={pageRows}
  columns={columns}
  filtering={{
    ...filtering,
    filterRows: ({ data }) => data, // Already filtered before paging.
    tabs: savedViews,
  }}
  table={{ enableSorting: true, manualSorting: true, sorting, onSortingChange }}
  slots={{ footer: <DataViewPagination
    page={page}
    pageCount={Math.ceil(rows.length / pageSize)}
    total={resultSummary}
    onPageChange={setPage}
  /> }}
/>`}
			>
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
						emptyStateAction: <Button tone="neutral" buttonStyle="outline" onClick={() => updateFilters([])}>Clear filters</Button>,
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
			</Example>

			<Example id="data-view-states" title="Pending results and recovery" stacked
				description="Keep the last rows visible while a filter change is in flight. If matching fails, the view labels its fallback data and keeps the filters available for recovery."
				code={`<DataView data={bookings} columns={columns} filtering={{
  filters, activeFilters, onFilterChange,
  isFiltering: pending,
  filterRows: matchRows,
  onError: reportError,
}} />`}>
				<Stack direction="horizontal" align="center" gap="sm" wrap>
					<Text size="sm" type="secondary">Result state</Text>
					<Select aria-label="Result state" value={requestState} className={styles.featureStateSelect}
						options={[{ value: "ready", label: "Ready" }, { value: "pending", label: "Updating" }, { value: "error", label: "Failed" }]}
						onValueChange={(value) => value && setRequestState(value)} />
					{requestState === "error" && <Button tone="neutral" buttonStyle="outline" onClick={() => setRequestState("ready")}>Restore results</Button>}
				</Stack>
				<DataView<Booking> data={BOOKINGS.slice(0, 3)} columns={indexColumns}
					filtering={{ filters: FILTERS, activeFilters: recoveryFilters, onFilterChange: setRecoveryFilters,
						tabs: TABS, isFiltering: requestState === "pending",
						filterRows: requestState === "error" ? () => { throw new Error("Preview matcher failure") } : undefined,
					}}
					table={{ getRowId: (row) => row.id, emptyStateMessage: "No bookings match your filters",
						emptyStateAction: <Button tone="neutral" buttonStyle="outline" onClick={() => setRecoveryFilters([])}>Clear filters</Button> }} />
			</Example>

			<Example id="data-view-rules" title="What the data view decides" stacked>
				<Callout label="Rule">
					The frame draws the card and the table inside it draws <strong>none</strong>. Two card
					surfaces around one table is a box in a box, which is what happens the moment a
					consumer's <code>table</code> options try to set their own <code>surface</code> — so
					that prop, and the three others the view owns, are removed from the type rather than
					merged.
				</Callout>
				<Text size="sm" type="secondary">
					A thrown matcher shows the <strong>unfiltered</strong> data with a warning, not an empty list.
					Showing nothing reads as “no results match”, which is a different and wrong
					statement; showing everything is visibly not what was asked for, and{" "}
					<code>failed</code> plus <code>onError</code> say so.
				</Text>
				<Text size="sm" type="secondary">
					A search filter reads the <strong>whole row</strong>, not a field named after its key
					— nobody types into a search box meaning “the column called q”. It is bounded at two
					levels deep, so a row holding its own parent does not walk forever.
				</Text>
				<Text size="sm" type="secondary">
					Comparison operators convert both sides to numbers first, because{" "}
					<code>"9" &lt; "10"</code> is false as strings and true as numbers — and a value that
					will not convert simply does not match rather than silently comparing as text.
				</Text>
			</Example>

			<Example
				id="table"
				title="The table underneath: DataTable"
				description="What DataView renders, used on its own — for tabular behaviour without a resource browser: a table in a detail panel, a report, a list with nothing to search. Sort by pressing a header, select with the checkboxes, hide a column from the toolbar, and open the row menu. The first column is ResourceCell — the one cell every admin list has, built once so its parts line up down the column."
				stacked
				code={`<DataTable
  columns={columns}
  data={bookings}
  enableSorting
  enableRowSelection
  enableColumnVisibility
  stickyFirstColumn
  getRowId={(row) => row.id}
  rowActions={(row) => [
    { id: "open", label: "Open", onClick: () => navigate(row.id) },
    { id: "archive", label: "Archive", tone: "destructive", onClick: () => archive(row) },
  ]}
/>`}
			>
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
						<Button type="button" tone="neutral" buttonStyle="outline" onClick={() => setNote(`archive ${selectedRowCount}`)}>
							Archive selected
						</Button>
					)}
					pageCount={3}
					page={tablePage}
					onPageChange={setTablePage}
					totalRowCount={13}
					pageSize={5}
					/*
					 * Its own name: the index above already owns this page's "Pagination", and two
					 * landmarks sharing a name are two a reader cannot tell apart.
					 */
					strings={{ pagination: { label: "Booking table pages" } }}
				/>
				{!!note && <Text size="sm" type="secondary">{note}</Text>}
			</Example>

			<Example
				id="table-cells"
				title="Cells"
				description="CellValue formats one column's value; CellStack puts two on one line each. Both accept a tuple — [row.total, “money”, { currency }] says the same thing as a four-key object in a quarter of the space, which matters in a file read far more often than it is written."
				stacked
				code={`cell: ({ row }) => (
  <CellStack values={[
    row.customer,
    [row.customerEmail, "email"],
    row.vip && { value: "VIP", kind: "mono" },
  ]} />
)`}
			>
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
			</Example>

			<Example
				id="table-selection"
				title="Acting on a selection"
				description="The shared batch bar, docked rather than a strip inside the table chrome — a table is the case a dock exists for, because the selection has to stay reachable after the reader has scrolled hundreds of rows past the one that started it. `selectionToolbar` still replaces it wholesale; `bulkActions` fills the actions and leaves the count and the way out alone."
				stacked
				code={`<DataTable
  enableRowSelection
  initialState={{ rowSelection: { b2: true, b4: true } }}
  bulkActions={({ selectedRowCount, clearSelection }) => (
    <Button onClick={() => archive(selectedRowCount)}>Archive selected</Button>
  )}
/>`}
			>
				{/*
				 * `transform` contains the dock to this example. Without it the bar attaches to
				 * the viewport and reads as belonging to whichever table is scrolled into view,
				 * and this page has several.
				 */}
				<div style={{ transform: "translate(0)", position: "relative", width: "100%" }}>
					{/*
					 * b2 and b4 rather than the first two rows: b1 and b3 carry the "Large" info
					 * badge, and a translucent badge over a --primary-10 selected row composites to
					 * 3.72:1 in dark. That is a real latent bug in badges-on-selected-rows, unrelated
					 * to this bar — see the note in the commit. Selecting rows without one keeps this
					 * example about the bar.
					 */}
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
			</Example>

			<Example id="table-empty" title="Nothing to show" stacked>
				<DataTable<Booking>
					surface="glass"
					columns={tableColumns.slice(0, 3)}
					data={[]}
					emptyStateMessage="No bookings match these filters."
					emptyStateAction={<Button type="button" tone="neutral" buttonStyle="outline">Clear filters</Button>}
				/>
			</Example>

			<Example id="table-rules" title="What the table decides" stacked>
				<Callout label="Rule">
					Paging is the <strong>consumer's</strong>. The table renders the page it is handed and
					never slices <code>data</code> itself — real admin tables page on the server, and a
					component that quietly paged a full array would be right exactly once, for the demo.
					The index above pages the same way: it slices after filtering and sorting, then hands
					over one page.
				</Callout>
				<Text size="sm" type="secondary">
					<code>getRowId</code> matters more than it looks. Without it selection is keyed by
					array INDEX, so sorting a table silently reassigns every selection to whichever record
					landed in that position. Supply it whenever the data can reorder or page.
				</Text>
				<Text size="sm" type="secondary">
					Full screen paints over the whole viewport, navigation included, so it is modal whether
					or not it was designed as one. The component claims <code>role="dialog"</code> and{" "}
					<code>aria-modal</code> — and supplies the behaviour that claim obliges: Escape leaves,
					Tab stays inside, and focus returns to the toggle rather than the top of the document.
				</Text>
				<Text size="sm" type="secondary">
					Density changes <strong>spacing</strong>, not typography. A compact table is a table
					with less air, not one with smaller words — shrinking the text is how a dense admin
					view becomes an unreadable one.
				</Text>
			</Example>

			<Example id="data-view-api" title="DataView API">
				<PropTable owner="DataView"
					rows={[
						{ name: "data / columns", type: "TData[] / ColumnDef[]", required: true, description: "Passed straight through to DataTable, after the filters have run." },
						{ name: "filtering", type: "DataViewFilteringConfig", description: "filters, activeFilters, and onFilterChange are meaningless apart — two of the three describe a state nobody can read — so they travel as one object the whole feature can be optional on." },
						{ name: "filtering.filterRows", type: "(args) => TData[]", description: "Replaces the built-in matching entirely. What a server-filtered index passes: the rows are already right, so nothing local runs." },
						{ name: "filtering.getFilterValue", type: "(row, filter) => unknown", description: "Reads the value a filter compares against, for a nested or computed field. Without it the filter's key is read as a path." },
						{ name: "filtering.mobilePresentation", type: '"sheet" | "inline"', default: '"sheet"', description: "Below 768px, keep search inline and open filter editors in an inset sheet. Choose inline for a caller-owned mobile layout." },
						{ name: "filtering.tabsDisplay", type: "tabs | select", description: "The same saved views at two widths. A tab row is better when it fits and useless when it does not, and a bar carrying five pills often does not." },
						{ name: "table", type: "DataViewTableOptions", description: "Everything DataTable takes (its API is below) except columns, data, surface, headerTransparent, and the two topbar slots — the view owns those." },
						{ name: "slots", type: "DataViewSlots", description: "topbarContent above the bar, toolbarStart / toolbarAfterFilters around the saved-view select, topbarEnd beside the table's controls, footer below the table." },
						{ name: "useDataView", type: "hook", description: "The rows after filtering, plus `failed` and the error for a custom surface. DataView shows a warning for this fallback; strings.filterError customizes it." },
						{ name: "strings", type: "Partial<DataViewStrings>", description: "Customizes the filter failure warning. Filter-control copy belongs to filtering.strings; pager copy belongs to DataViewPagination.strings." },
						{ name: "DataViewShell", type: "component", description: "The plain shell, for composing the same rhythm around something that is not a DataTable." },
						{ name: "DataViewToolbar / DataViewTableFrame", type: "component", description: "The filter bar and the table frame it sits in. The bar lives inside the table’s topbar rather than above it, so filtering and the data it filters are one surface and scroll as one. Both work bare too, around something that is not a DataTable." },
						{ name: "DataViewPagination", type: "component", description: "Keeps the result summary visible, including zero results. Page controls appear only above one page; disabled makes every control unavailable to pointer and keyboard users." },
						{ name: "SavedViewTabs", type: "component", description: "A compact select for caller-owned views. The caller controls the selected view and applies its state through onValueChange. For filter-driven tabs or a select with exact preset matching, use DataView filtering.tabs or FilterTabs." },
					]}
				/>
			</Example>

			<Example id="table-api" title="DataTable API">
				<PropTable owner="DataTable"
					rows={[
						{ name: "columns", type: "ColumnDef[] | [ColumnDef[], deps]", required: true, description: "Ordinary TanStack column definitions. The tuple form memoises them here, because an array rebuilt every render resets column state on every keystroke elsewhere on the page." },
						{ name: "data", type: "TData[]", required: true, description: "The page to render. The table never slices it." },
						{ name: "getRowId", type: "(row, index) => string", description: "The selection key. Without it selection follows a POSITION rather than a record." },
						{ name: "enableSorting / RowSelection / ColumnVisibility / Filtering", api: ["DataTable.enableSorting", "DataTable.enableRowSelection", "DataTable.enableColumnVisibility", "DataTable.enableFiltering"], type: "boolean", description: "Each turns on its own control AND the state behind it, so a checkbox column cannot exist with selection switched off." },
						{ name: "surface", type: "card | glass | flat", description: "card is the ordinary treatment; glass is a hairline outline for a table inside another card, where two card surfaces are a box in a box; flat draws nothing." },
						{ name: "stickyHeader / stickyFirstColumn / maxBodyHeight", type: "boolean / length", description: "A pinned pane needs a bounded container to be pinned inside — sticky with no height cap sticks to the page, which is nothing." },
						{ name: "storageKey", type: "string", description: "Persists column visibility under dt.{key}.columns. An explicit defaultColumnVisibility still wins: a developer who hides a column in code means it." },
						{ name: "rowActions", type: "action[] | (row) => action[]", description: "The factory form is what a real table needs: “Delete” belongs on a cancelled booking and nowhere else. `href` is carried as data — the table never navigates." },
						{ name: "rowActionsDisplayMode", type: "menu | inline | auto", description: "`auto` measures the TABLE, not the window: whether three buttons fit is a question about the table, and the same one is as often in a drawer as at page width." },
						{ name: "selectionToolbar / bulkActions", type: "node | (context) => node", description: "undefined renders the default bar, null suppresses it, a function replaces it. The context carries the selected rows and a clearSelection." },
						{ name: "pageCount / page / onPageChange", type: "number / number / (page) => void", description: "Supplying pageCount renders the pager. Add totalRowCount and pageSize for the “1–5 of 13” line beside it." },
						{ name: "DataTableHeader / DataTableBody", api: ["@/components/features/table#DataTableHeader", "@/components/features/table#DataTableBody"], type: "component", description: "The header rows — an optional band of column groups, then the columns — and the body with the row that stands in for all of them when there are none. Sorting is base TableHead doing the work; this only translates the column’s state into it." },
						{ name: "DataTableToolbar / ColumnVisibilityToggle / FullscreenToggle", api: ["@/components/features/table#DataTableToolbar", "@/components/features/table#ColumnVisibilityToggle", "@/components/features/table#FullscreenToggle"], type: "component", description: "The table’s own controls in one bordered group, and it renders NOTHING when it has nothing to offer — a table that fits, cannot hide a column and has no full-screen toggle would otherwise show an empty frame." },
						{ name: "DataTableActions", api: "@/components/features/table#DataTableActions", type: "component", description: "Row actions as a menu, as buttons, or whichever fits. `auto` measures the CONTAINER, not the window: whether three buttons fit in an actions column is a question about that column." },
						{ name: "CellValue", api: "@/components/features/table#CellValue", type: "component", description: "One column’s value, formatted. Beside MetadataValue on purpose: that renders a labelled fact on a detail panel, this renders a value in a grid, where alignment and truncation are the column’s decisions rather than the value’s." },
						{ name: "AvatarCell / CurrencyCell / DateCell / DateMetaCell / StatusClusterCell", api: ["@/components/features/table#AvatarCell", "@/components/features/table#CurrencyCell", "@/components/features/table#DateCell", "@/components/features/table#DateMetaCell", "@/components/features/table#StatusClusterCell"], type: "component", description: "The cells every admin table has, so a page does not rewrite them per column. Each is a thin arrangement over the kit’s primitives — a status is a Badge, a currency is Money — and what they add is the cell’s part: the alignment, the truncation, the empty case." },
						{ name: "useDataTableSize / useDataTableScrollState / useFullscreenTableModality", api: ["@/components/features/table#useDataTableSize", "@/components/features/table#useDataTableScrollState", "@/components/features/table#useFullscreenTableModality"], type: "hook", description: "The measurements the toolbar reacts to: the container’s size, whether it is scrolled away from either edge, and the modality full screen has to take so the page behind it stops being reachable. For a consumer building their own toolbar — reimplementing the overflow booleans and the nudges means two answers to “can this scroll right”." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
