import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function KanbanPage() {
	return (
		<ComponentPage>
			<Example
				example="kanban/kanban"
				title="The board"
				description="Drag a card by its handle, or move one with the keyboard — tab to a handle, press space, and use the arrow keys. Every move is announced, which is the whole reason the keyboard path is usable at all. The value is a plain Record<columnId, item[]>, because that is what a board is and it serialises without a thought."
			/>

			<Example id="kanban-rule" title="Where the handle goes">
				<Callout label="Rule">
					A card with no <code>KanbanItemHandle</code> is dragged by its whole surface,
					which is right for a board of plain cards. A card <strong>with</strong> one must
					not be, or selecting text inside it starts a drag. The handle registers itself on
					mount and the card reads the count, so neither has to be told about the other —
					and adding a handle later needs no other change.
				</Callout>
				<Text size="sm" type="secondary">
					<code>useKanban</code> exposes the move without the drag, for a keyboard-only
					board, a “move to column” menu, or a test that should not simulate a pointer.
				</Text>
			</Example>

			<Example
				example="kanban/sync-range-form"
				title="SyncRangeForm"
				description="The body of a “reconcile the last N hours” dialog. It renders no buttons: the overlay owns the footer, and formId is the join — the form carries the id, the footer's submit carries form={id}, and native validation runs before this sees a submit."
			/>

			<Example id="kanban-api" title="API">
				<PropTable owners={["Kanban", "KanbanOverlay", "SyncRangeForm"]} />
				<PropTable
					symbols={[
						"useKanban",
						"KanbanColumnContent",
						"KanbanItem",
						"KanbanItemHandle",
						"KanbanItemActions",
						"useKanbanContext",
						"useKanbanItemContext",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
