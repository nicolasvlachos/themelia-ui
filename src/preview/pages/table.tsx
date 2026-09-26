import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TablePage() {
	return (
		<ComponentPage>
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
				<PropTable owners={["Table", "TableHead", "TableRow", "TableCell", "TableEmpty", "TableCaption"]} />
				<PropTable
					rows={[
						{ name: "--density-scale", api: ["css:--density-scale"], type: "number", default: "var(--scale)", description: "Global density factor. Scope it to make one region denser than the page." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
