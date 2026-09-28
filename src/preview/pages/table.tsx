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
				description="The whole head cell is the target, not a small chevron beside it. An unsorted column shows its arrow when a pointer hovers it or the keyboard focuses it; on a touch screen, where nothing can hover to find it, the arrow stays faintly in view. The sorted column's label is the one in the body colour. aria-sort lives on the th, so the order is announced rather than only drawn."
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
						{ name: "data-density", api: ["css:--padding-sm"], type: '"compact" | "default" | "comfortable"', description: "On any ancestor, or through a provider's `density`: one region denser than the page." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
