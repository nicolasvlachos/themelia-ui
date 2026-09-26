import { useState } from "react"
import { ArchiveIcon, ExternalLinkIcon, RotateCwIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { Card } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { DisplayLabel, Text } from "themelia-ui/base/typography"
import {
	Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanItem,
	KanbanItemActions, KanbanItemHandle, KanbanOverlay,
	type KanbanValue,
} from "themelia-ui/features/kanban"

import styles from "./kanban.module.css"

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

export default function KanbanExample() {
	const [board, setBoard] = useState(INITIAL)
	const [log, setLog] = useState<string[]>([])

	const note = (line: string) => setLog((lines) => [line, ...lines].slice(0, 4))

	return (
		<>
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
				<KanbanBoard className={styles.board}>
					{COLUMNS.map((column) => (
						<KanbanColumn key={column.id} value={column.id} className={styles.column}>
							<Stack direction="horizontal" align="center" justify="between" gap="sm">
								<DisplayLabel>{column.title}</DisplayLabel>
								<Badge tone="neutral">{board[column.id]?.length ?? 0}</Badge>
							</Stack>
							<KanbanColumnContent value={column.id}>
								{(board[column.id] ?? []).map((card) => (
									<KanbanItem key={card.id} value={card.id}>
										<Card className={styles.card}>
											<Stack direction="horizontal" align="start" gap="xs">
												<KanbanItemHandle />
												<Text size="sm" weight="medium" className={styles.cardTitle}>
													{card.title}
												</Text>
												<KanbanItemActions<Card_> />
											</Stack>
											<Stack direction="horizontal" align="baseline" justify="between" gap="sm" className={styles.cardMeta}>
												<Text size="xs" type="secondary">{card.owner}</Text>
												<Text size="xs" type="secondary" numeric>{card.value}</Text>
											</Stack>
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
		</>
	)
}
