import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function DataViewPage() {
	return (
		<ComponentPage>
			<Example
				example="data-view/data-view"
				title="An index"
				description="Search bookings or choose a saved view, then sort and page through the matches. On phones, Filters opens a sheet and saved views become a select. Filtering and sorting run before pagination; changing either returns to the first page."
			/>

			<Example example="data-view/data-view-states" title="Pending results and recovery"
				description="Keep the last rows visible while a filter change is in flight. If matching fails, the view labels its fallback data and keeps the filters available for recovery." />

			<Example id="data-view-rules" title="What the data view decides">
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
				example="data-view/table"
				title="The table underneath: DataTable"
				description="What DataView renders, used on its own — for tabular behaviour without a resource browser: a table in a detail panel, a report, a list with nothing to search. Sort by pressing a header, select with the checkboxes, hide a column from the toolbar, and open the row menu. The first column is ResourceCell — the one cell every admin list has, built once so its parts line up down the column."
			/>

			<Example
				example="data-view/table-cells"
				title="Cells"
				description="CellValue formats one column's value; CellStack puts two on one line each. Both accept a tuple — [row.total, “money”, { currency }] says the same thing as a four-key object in a quarter of the space, which matters in a file read far more often than it is written."
			/>

			<Example
				example="data-view/table-selection"
				title="Acting on a selection"
				description="The shared batch bar, docked rather than a strip inside the table chrome — a table is the case a dock exists for, because the selection has to stay reachable after the reader has scrolled hundreds of rows past the one that started it. `selectionToolbar` still replaces it wholesale; `bulkActions` fills the actions and leaves the count and the way out alone."
			/>

			<Example example="data-view/table-empty" title="Nothing to show" />

			<Example id="table-rules" title="What the table decides">
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
