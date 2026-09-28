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

			<Example
				example="data-view/table-expandable"
				title="Expandable rows"
				description="`expandedRow` turns on a toggle at each row's start and the panel it opens under the row. `render` draws the panel; here everything it shows is already on the row. The panel lines up with the first column, and on a table scrolled sideways it stays in view."
			/>

			<Example
				example="data-view/table-expandable-async"
				title="Details on demand"
				description="`onLoad` fetches what the panel shows when its row opens: a skeleton meanwhile, the request aborted if the row closes, Retry when it fails (The Old Granary fails once) and the result kept for the next open. `canExpand` leaves cancelled bookings without a toggle, and `multiple: false` keeps one row open at a time."
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
				<PropTable owners={["DataView", "DataViewFilteringConfig"]} />
				<PropTable
					symbols={[
						"useDataView",
						"DataViewShell",
						"DataViewToolbar",
						"DataViewTableFrame",
						"DataViewPagination",
						"SavedViewTabs",
					]}
				/>
			</Example>

			<Example id="table-api" title="DataTable API">
				<PropTable owner="DataTable" />
				<PropTable
					symbols={[
						"DataTableHeader",
						"DataTableBody",
						"DataTableToolbar",
						"ColumnVisibilityToggle",
						"FullscreenToggle",
						"DataTableActions",
						"CellValue",
						"AvatarCell",
						"CurrencyCell",
						"DateCell",
						"DateMetaCell",
						"StatusClusterCell",
						"useDataTableSize",
						"useDataTableScrollState",
						"useFullscreenTableModality",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
