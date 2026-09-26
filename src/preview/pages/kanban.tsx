import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function KanbanPage() {
	return (
		<ComponentPage
			title="Kanban & sync"
			summary="A drag-and-drop board over dnd-kit, and the dialog body for a “reconcile the last N hours” run. The board translates dnd-kit's “id A was dropped over id B” into “this item moved from column X position 2 to column Y position 0” — which is the part every board has to write."
			importPath="@/components/features/kanban"
			exports={["Kanban", "KanbanBoard", "KanbanColumn", "useKanban", "SyncRangeForm",
				"KanbanColumnContent", "KanbanItem", "KanbanItemHandle", "KanbanItemActions", "KanbanOverlay", "useKanbanContext", "useKanbanItemContext",
			]}
		>
			<Example
				example="kanban/kanban"
				title="The board"
				description="Drag a card by its handle, or move one with the keyboard — tab to a handle, press space, and use the arrow keys. Every move is announced, which is the whole reason the keyboard path is usable at all. The value is a plain Record<columnId, item[]>, because that is what a board is and it serialises without a thought."
				stacked
			/>

			<Example id="kanban-rule" title="Where the handle goes" stacked>
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
				stacked
			/>

			<Example id="kanban-api" title="API">
				<PropTable owner="Kanban"
					rows={[
						{ name: "value / onValueChange", type: "Record<columnId, T[]>", required: true, description: "The board is a plain object because that is what a board is, and it serialises without a thought. Column titles and limits are the consumer's — only the ORDER lives here." },
						{ name: "getItemValue", type: "(item: T) => string", required: true, description: "A stable id per item. Everything else is keyed off it." },
						{ name: "onItemMove", type: "(event) => void", description: "Both ends of the move — from column and index, to column and index. The seam for persistence. Idempotent: a move that changes nothing fires nothing." },
						{ name: "itemActions", type: "action[] | (item) => action[]", description: "The factory form is what a real board needs: “Reopen” belongs on a card in Done and nowhere else, and a fixed list would render it everywhere and disable it." },
						{ name: "onItemClick", type: "(item: T) => void", description: "Fires on a card click that was not the handle or the menu — both mark themselves, so a click on an icon inside either is caught too." },
						{ name: "KanbanItemHandle", type: "component", description: "Optional. Present, it becomes the only grip; absent, the whole card is. See the rule above." },
						{ name: "KanbanOverlay render", type: "({ item, columnId }) => ReactNode", description: "Replaces the default outline. The default is a placeholder rather than a copy of the card, because the card's markup lives at the call site." },
						{ name: "useKanban", type: "({ value, onValueChange, getItemValue }) => { findItem, move }", description: "The move without the drag." },
						{ name: "SyncRangeForm formId", type: "string", required: true, description: "Set on the form so a dialog footer outside it can submit it. That is why this takes an id rather than rendering its own buttons." },
						{ name: "SyncRangeForm transformSubmit", type: "(values) => TSubmit", description: "Replaces the numeric default, which THROWS rather than coercing — Number(\"since-last-run\") is NaN, and an API asked to reconcile NaN hours does something unpredictable." },
						{ name: "KanbanColumnContent / KanbanItem", type: "component", description: "A column\u2019s droppable region and one draggable card, for a board that wants its own column chrome but the same drag behaviour." },
						{ name: "KanbanItemHandle / KanbanItemActions", type: "component", description: "The grip and the card\u2019s verbs. A handle rather than a draggable card body, because a card carrying a menu and a link has no way to tell a drag from a press otherwise." },
						{ name: "KanbanOverlay", type: "component", description: "What follows the pointer during a drag \u2014 rendered outside the column so it is not clipped by the scroll container it started in." },
						{ name: "useKanbanContext / useKanbanItemContext", type: "hook", description: "The board\u2019s state and one card\u2019s drag state, for a custom card that still needs to know it is being dragged." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
