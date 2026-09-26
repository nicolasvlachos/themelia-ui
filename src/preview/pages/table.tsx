import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TablePage() {
	return (
		<ComponentPage
			title="Table"
			summary="Rows and columns, as plain table elements. The scroll container is the only wrapper — everything else is the semantics the browser already gives you."
			importPath="@/components/base/table"
			exports={["Table", "TableHeader", "TableBody", "TableFooter", "TableRow", "TableHead", "TableCell", "TableCaption", "TableEmpty"
			]}
		>
			<Example
				example="table/table"
				title="Table"
				description="The parts map one-to-one onto the HTML elements, so the semantics are the browser's. A plain string cell is wrapped in Text; a node is left exactly as passed."
			/>

			<Example
				example="table/table-selection"
				title="Selection"
				description="A row marks itself with `data-state=&quot;selected&quot;`. The checkbox column drops its trailing inset so the control lines up with the header above it."
			/>

			<Example
				id="table-scroll"
				title="Overflow"
				description="The scroll container is focusable, so a wide table can be scrolled from the keyboard. That is also why it takes a visible focus ring — a tab stop with no ring is a trap."
			>
				<Callout label="Rule">
					Cells are <code>white-space: nowrap</code> by default and the container scrolls.
					A column that genuinely holds prose opts out with <code>wrap</code> on the cell,
					rather than the whole table losing its column alignment.
				</Callout>
			</Example>

			<Example
				example="table/table-scale"
				title="Density"
				description="Density is scoped, not a prop. A region can be denser than the page around it."
			/>

			<Example
				example="table/table-sorting"
				title="Sortable columns"
				description="The whole label is the target, not a small chevron beside it, and the neutral state still shows an icon — a sortable column that looks identical to a fixed one until hovered is undiscoverable by touch and by keyboard alike. aria-sort lives on the th, so the order is announced rather than only drawn."
			/>

			<Example
				example="table/table-empty"
				title="Empty and sticky"
				description="A table that renders an empty tbody looks broken rather than empty — the header hangs over nothing. A sticky header needs a bounded container to stick inside, and a background of its own, or the rows scroll underneath and both are drawn."
			/>

			<Example id="table-api" title="API">
				<PropTable
					rows={[
						{ name: "containerClassName", api: "Table.containerClassName", type: "string", description: "Class for the scroll container rather than the table element." },
						{ name: "stickyHeader", api: "Table.stickyHeader", type: "boolean", default: "false", description: "Pins the header while the body scrolls. Only meaningful when the container is bounded." },
						{ name: "TableHead sortable", type: "boolean", description: "Renders the label as a sort control and puts aria-sort on the th." },
						{ name: "TableHead sortDirection", type: '"ascending" | "descending" | null', description: "This column's order, or null when another column is the sort." },
						{ name: "TableHead onSort", type: "() => void", description: "Fires on activation. The table does not sort — the caller owns the data." },
						{ name: "TableEmpty colSpan", type: "number", description: "The no-rows row, spanning every column." },
						{ name: "TableCell align", type: '"start" | "center" | "end"', description: "Column alignment. Numeric columns belong at the end." },
						{ name: "TableCell wrap", type: "boolean", default: "false", description: "Lets the cell wrap. Cells are nowrap by default so columns stay aligned." },
						{ name: "TableRow data-state", api: "TableRow", type: '"selected"', description: "Marks a selected row. A data attribute, not a prop — rows are plain elements." },
						{ name: "TableCaption", type: "component", description: "Names the table for assistive technology. Rendered below the table, as the element specifies." },
						{ name: "--density-scale", api: ["css:--density-scale"], type: "number", default: "var(--scale)", description: "Global density factor. Scope it to make one region denser than the page." },
						{ name: "TableEmpty", type: "component", description: "A row that spans every column and states that there are none. A table with a header and no body reads as broken; this is what says it is empty on purpose." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
