import { useState } from "react"
import { ArchiveIcon, ExternalLinkIcon, RotateCwIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Card } from "@/components/base/cards"
import { Stack } from "@/components/base/structure"
import { DisplayLabel, Text } from "@/components/base/typography"
import {
	Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanItem,
	KanbanItemActions, KanbanItemHandle, KanbanOverlay,
	SyncRangeForm,
	type KanbanValue,
} from "@/components/features"

import styles from "../preview.module.css"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

interface Card_ {
	id: string
	title: string
	owner: string
	value: string
}

const COLUMNS = [
	{ id: "backlog", title: "Backlog" },
	{ id: "progress", title: "In progress" },
	{ id: "done", title: "Done" },
]

const INITIAL: KanbanValue<Card_> = {
	backlog: [
		{ id: "c1", title: "Reconcile August payouts", owner: "Maria", value: "€12,400" },
		{ id: "c2", title: "Chase the Marlow deposit", owner: "Marcus", value: "€300" },
	],
	progress: [{ id: "c3", title: "Migrate the invoice numbering", owner: "Alice", value: "—" }],
	done: [{ id: "c4", title: "Close the Q2 books", owner: "Maria", value: "€48,200" }],
}

const WINDOWS = [
	{ value: "6", label: "6 hours", description: "A quick catch-up." },
	{ value: "24", label: "24 hours", description: "The usual overnight run." },
	{ value: "168", label: "7 days", description: "A full week — slower." },
	{ value: "720", label: "30 days", description: "A full reconcile." },
]

const SYNC_OPTIONS = [
	{ value: "invoices", label: "Invoices", description: "Reconcile invoice records only." },
	{ value: "payouts", label: "Payouts", description: "Reconcile settlement records only." },
]

export function KanbanPage() {
	const [board, setBoard] = useState(INITIAL)
	const [log, setLog] = useState<string[]>([])
	const [submitted, setSubmitted] = useState<string | null>(null)

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

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
				id="kanban"
				title="The board"
				description="Drag a card by its handle, or move one with the keyboard — tab to a handle, press space, and use the arrow keys. Every move is announced, which is the whole reason the keyboard path is usable at all. The value is a plain Record<columnId, item[]>, because that is what a board is and it serialises without a thought."
				stacked
				code={`<Kanban
  value={board}
  onValueChange={setBoard}
  getItemValue={(card) => card.id}
  onItemMove={(event) => api.persist(event)}
  itemActions={(card) => card.done ? [reopen] : [archive]}
>
  <KanbanBoard>
    {columns.map((column) => (
      <KanbanColumn key={column.id} value={column.id}>
        <header>{column.title}</header>
        <KanbanColumnContent value={column.id}>
          {board[column.id].map((card) => (
            <KanbanItem key={card.id} value={card.id}>…</KanbanItem>
          ))}
        </KanbanColumnContent>
      </KanbanColumn>
    ))}
  </KanbanBoard>
  <KanbanOverlay />
</Kanban>`}
			>
				<Kanban<Card_>
					value={board}
					onValueChange={setBoard}
					getItemValue={(card) => card.id}
					onItemMove={(event) =>
						note(`${event.item.title}: ${event.from.columnId} → ${event.to.columnId} @ ${event.to.index}`)
					}
					onItemClick={(card) => note(`opened ${card.title}`)}
					itemActions={(card) => [
						{ id: "open", label: "Open", icon: <ExternalLinkIcon />, onClick: () => note(`open ${card.id}`) },
						{
							id: "reopen",
							label: "Reopen",
							icon: <RotateCwIcon />,
							// Only on a finished card — the whole reason the factory form exists.
							visible: () => (board.done ?? []).some((done) => done.id === card.id),
							onClick: () => note(`reopen ${card.id}`),
						},
						{
							id: "archive",
							label: "Archive",
							icon: <ArchiveIcon />,
							tone: "destructive",
							onClick: () => note(`archive ${card.id}`),
						},
					]}
				>
					<KanbanBoard className={styles.kanbanBoard}>
						{COLUMNS.map((column) => (
							<KanbanColumn key={column.id} value={column.id} className={styles.kanbanColumn}>
								<div className={styles.kanbanColumnHeader}>
									<DisplayLabel>{column.title}</DisplayLabel>
									<Badge tone="neutral">{board[column.id]?.length ?? 0}</Badge>
								</div>
								<KanbanColumnContent value={column.id}>
									{(board[column.id] ?? []).map((card) => (
										<KanbanItem key={card.id} value={card.id}>
											<Card className={styles.kanbanCard}>
												<div className={styles.kanbanCardTop}>
													<KanbanItemHandle />
													<Text size="sm" weight="medium" className={styles.kanbanCardTitle}>
														{card.title}
													</Text>
													<KanbanItemActions<Card_> />
												</div>
												<div className={styles.kanbanCardMeta}>
													<Text size="xs" type="secondary">{card.owner}</Text>
													<Text size="xs" type="secondary" numeric>{card.value}</Text>
												</div>
											</Card>
										</KanbanItem>
									))}
								</KanbanColumnContent>
							</KanbanColumn>
						))}
					</KanbanBoard>
					<KanbanOverlay<Card_> />
				</Kanban>

				{log.length > 0 && (
					<Stack gap="none">
						{log.map((line, index) => (
							<Text key={`${line}-${index}`} size="xs" type="secondary">{line}</Text>
						))}
					</Stack>
				)}
			</Example>

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
				id="sync-range-form"
				title="SyncRangeForm"
				description="The body of a “reconcile the last N hours” dialog. It renders no buttons: the overlay owns the footer, and formId is the join — the form carries the id, the footer's submit carries form={id}, and native validation runs before this sees a submit."
				stacked
				code={`<ActionDialog
  title="Run a sync"
  formId="sync-form"
  trigger={<Button>Sync</Button>}
>
  <SyncRangeForm
    formId="sync-form"
    options={windows}
    syncOptions={families}
    onSubmit={({ hours, options }) => api.sync(hours, options)}
  />
</ActionDialog>`}
			>
				<SyncRangeForm
					formId="sync-demo"
					options={WINDOWS}
					syncOptions={SYNC_OPTIONS}
					onSubmit={(data) => setSubmitted(`${data.hours}h · ${data.options.join(", ") || "everything"}`)}
				/>
				<Stack direction="horizontal" gap="md" align="center">
					<button type="submit" form="sync-demo" className={styles.demoSubmit}>
						Run sync
					</button>
					{!!submitted && <Text size="sm" type="secondary">submitted: {submitted}</Text>}
				</Stack>
			</Example>

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
