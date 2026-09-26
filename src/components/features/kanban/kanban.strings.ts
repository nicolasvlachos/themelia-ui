export interface KanbanStrings {
	/** The drag announcements, as functions so languages can inflect or reorder the sentence. */
	formatDragStart: (name: string) => string
	formatDragMove: (name: string, to: string) => string
	formatDragEnd: (name: string, to: string) => string
	formatDragCancel: (name: string) => string
	dragHandleLabel: string
	boardLabel: string
	itemActionsLabel: string
}

export const defaultKanbanStrings: KanbanStrings = {
	formatDragStart: (name) => `Picked up ${name}.`,
	formatDragMove: (name, to) => `Moving ${name} to ${to}.`,
	formatDragEnd: (name, to) => `Dropped ${name} into ${to}.`,
	formatDragCancel: (name) => `Cancelled the drag of ${name}.`,
	dragHandleLabel: "Drag handle",
	boardLabel: "Board",
	itemActionsLabel: "Item actions",
}
