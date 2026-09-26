/**
 * Kanban: a drag-and-drop board over dnd-kit. `useKanban` translates "A dropped over B"
 * into a column/index move; the compound parts wire droppables and sortables. The kit
 * never persists: `onValueChange` is the truth, `onItemMove` the seam for saving it.
 *
 * Without a handle the whole card is the grip; a mounted `KanbanItemHandle` registers
 * itself and takes over, so text inside the card stays selectable.
 */
import {
	DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors,
	type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core"
import {
	SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"
import {
	useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type Ref,
} from "react"

import { ActionMenu, resolveContextActions } from "@/components/base/action-menu"
import { Button } from "@/components/base/buttons"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { useScrollEdges } from "@/lib/scroll-edges"

import {
	KanbanContextProvider, KanbanItemContextProvider, useKanbanContext, useKanbanItemContext,
} from "./kanban-context"
import { useKanban } from "./use-kanban"
import { defaultKanbanStrings } from "./kanban.strings"
import { resolveStrings } from "@/lib/strings"
import type {
	KanbanBoardProps, KanbanColumnContentProps, KanbanColumnProps, KanbanItemActionsProps,
	KanbanItemHandleProps, KanbanItemProps, KanbanOverlayProps, KanbanProps,
} from "./kanban.types"
import styles from "./kanban.module.css"

/** Pointer travel before a drag starts, so a click on a clickable card is not a zero-distance drag. */
const DRAG_THRESHOLD = 6

export function Kanban<T>({
	value,
	onValueChange,
	getItemValue,
	onItemMove,
	itemActions,
	onItemClick,
	strings,
	className,
	children,
}: KanbanProps<T>) {
	/* Memoised: the context memo below depends on it. */
	const copy = useMemo(() => resolveStrings(defaultKanbanStrings, strings), [strings])
	const { findItem, move } = useKanban({ value, onValueChange, getItemValue, onItemMove })
	const [activeId, setActiveId] = useState<string | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: DRAG_THRESHOLD } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	)

	const activeItem = useMemo(
		() => (activeId ? (findItem(activeId)?.item ?? null) : null),
		[activeId, findItem],
	)

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveId(null)
			const { active, over } = event
			// Dropped over nothing: the reader changed their mind.
			if (!over) return

			const overData = over.data.current as { columnId?: string; index?: number } | undefined
			const overId = String(over.id)

			/*
			 * Over a card, the sortable data carries column and index; over the column itself
			 * the id is the column and there is no index, which `move` reads as "append".
			 */
			const targetColumn =
				overData?.columnId ??
				(Object.prototype.hasOwnProperty.call(value, overId) ? overId : undefined)
			if (!targetColumn) return

			move({
				itemId: String(active.id),
				toColumnId: targetColumn,
				toIndex: overData?.columnId !== undefined ? overData.index : undefined,
			})
		},
		[move, value],
	)

	const context = useMemo(
		() => ({
			value: value as Record<string, unknown[]>,
			onValueChange: onValueChange as (next: Record<string, unknown[]>) => void,
			getItemValue: getItemValue as (item: unknown) => string,
			activeId,
			activeItem: activeItem as unknown,
			findItem: findItem as (id: string) => { columnId: string; index: number; item: unknown } | undefined,
			itemActions: itemActions as never,
			onItemClick: onItemClick as ((item: unknown) => void) | undefined,
			strings: copy,
		}),
		[activeId, activeItem, copy, findItem, getItemValue, itemActions, onItemClick, onValueChange, value],
	)

	return (
		<KanbanContextProvider value={context}>
			<DndContext
				sensors={sensors}
				onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
				onDragEnd={handleDragEnd}
				onDragCancel={() => setActiveId(null)}
				/* Announcements are the keyboard story: without them a screen reader hears nothing about moves. */
				accessibility={{
					announcements: {
						onDragStart: ({ active }) => copy.formatDragStart(String(active.id)),
						onDragOver: ({ active, over }) =>
							over ? copy.formatDragMove(String(active.id), String(over.id)) : undefined,
						onDragEnd: ({ active, over }) =>
							copy.formatDragEnd(String(active.id), over ? String(over.id) : ""),
						onDragCancel: ({ active }) => copy.formatDragCancel(String(active.id)),
					},
				}}
			>
				<div
					role="application"
					aria-label={copy.boardLabel}
					className={cx("kanban--component", styles.root, className)}
				>
					{children}
				</div>
			</DndContext>
		</KanbanContextProvider>
	)
}

export function KanbanBoard({ className, style, children }: KanbanBoardProps) {
	const boardRef = useRef<HTMLDivElement>(null)
	/*
	 * Which edges hide more columns, driving a fade on the overflowing side (overlay
	 * scrollbars otherwise give no hint that the board scrolls).
	 */
	const edges = useScrollEdges(boardRef, [children])
	return (
		<div
			ref={boardRef}
			data-slot="kanban-board"
			data-fade-start={edges.start ? "" : undefined}
			data-fade-end={edges.end ? "" : undefined}
			style={style}
			className={cx("kanban-board--component", styles.board, className)}
		>
			{children}
		</div>
	)
}

export function KanbanColumn({ value, className, children }: KanbanColumnProps) {
	const { setNodeRef, isOver } = useDroppable({ id: value })
	return (
		<div
			ref={setNodeRef}
			data-slot="kanban-column"
			data-column-id={value}
			// The whole column highlights as the drop target.
			data-over={isOver || undefined}
			className={cx("kanban-column--component", styles.column, className)}
		>
			{children}
		</div>
	)
}

export function KanbanColumnContent({ value, className, children }: KanbanColumnContentProps) {
	const context = useKanbanContext()
	const ids = (context.value[value] ?? []).map((item) => context.getItemValue(item))
	return (
		<SortableContext items={ids} strategy={verticalListSortingStrategy}>
			<div data-slot="kanban-column-content" className={cx("kanban-column-content--component", styles.columnContent, className)}>
				{children}
			</div>
		</SortableContext>
	)
}

export function KanbanItem({
	value,
	className,
	disabled = false,
	onClick,
	children,
}: KanbanItemProps) {
	const context = useKanbanContext()
	const found = context.findItem(value)

	const {
		attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging,
	} = useSortable({
		id: value,
		disabled,
		// Read by `handleDragEnd` to resolve the drop column and index.
		data: { columnId: found?.columnId, index: found?.index },
	})

	const [handleCount, setHandleCount] = useState(0)
	const hasHandle = handleCount > 0
	const registerHandle = useCallback(() => {
		setHandleCount((count) => count + 1)
		return () => setHandleCount((count) => Math.max(0, count - 1))
	}, [])

	const itemContext = useMemo(
		() => ({
			listeners,
			attributes,
			setActivatorNodeRef,
			registerHandle,
			itemId: value,
			item: found?.item ?? null,
		}),
		[attributes, found?.item, listeners, registerHandle, setActivatorNodeRef, value],
	)

	const rootClick = context.onItemClick
	const clickable = !!(onClick || rootClick)

	/*
	 * Named so the dependency list matches what the closure reads: `found` is a fresh object
	 * every render, and a mismatched `found?.item` dependency makes React Compiler bail.
	 */
	const item = found?.item

	const handleClick = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			/* The handle and actions menu carry `data-stop-item-click`; clicks inside them are not card clicks. */
			if ((event.target as HTMLElement | null)?.closest("[data-stop-item-click]")) return
			if (onClick) {
				onClick()
				return
			}
			if (rootClick && item !== undefined) rootClick(item)
		},
		[item, onClick, rootClick],
	)

	return (
		<KanbanItemContextProvider value={itemContext}>
			<div
				ref={setNodeRef}
				style={{
					transform: CSS.Transform.toString(transform),
					transition,
				}}
				data-slot="kanban-item"
				data-dragging={isDragging || undefined}
				data-clickable={clickable || undefined}
				className={cx("kanban-item--component", styles.item, className)}
				onClick={clickable ? handleClick : undefined}
				// No handle: the whole card is the grip (see the file header).
				{...(hasHandle ? {} : attributes)}
				{...(hasHandle ? {} : listeners)}
			>
				{children}
			</div>
		</KanbanItemContextProvider>
	)
}

export function KanbanItemHandle({
	className,
	children,
	ref,
}: KanbanItemHandleProps & { ref?: Ref<HTMLButtonElement> }) {
	const { setActivatorNodeRef, listeners, attributes, registerHandle } = useKanbanItemContext()
	const { strings } = useKanbanContext()

	useEffect(() => registerHandle(), [registerHandle])

	/** dnd-kit and the consumer both receive the node. */
	const setRef = useCallback(
		(node: HTMLButtonElement | null) => {
			setActivatorNodeRef(node)
			if (typeof ref === "function") ref(node)
			else if (ref) ref.current = node
		},
		[ref, setActivatorNodeRef],
	)

	return (
		<Button
			ref={setRef}
			type="button"
			tone="neutral"
			buttonStyle="ghost"
			iconOnly
			data-slot="kanban-item-handle"
			data-stop-item-click
			aria-label={strings.dragHandleLabel}
			onClick={(event) => event.stopPropagation()}
			className={cx("kanban-item-handle--component", styles.handle, className)}
			{...(attributes as Record<string, unknown>)}
			{...(listeners as Record<string, unknown>)}
		>
			{children ?? <GripVerticalIcon />}
		</Button>
	)
}

export function KanbanItemActions<T = unknown>({
	className,
	icon,
	label,
}: KanbanItemActionsProps) {
	const context = useKanbanContext<T>()
	const { item } = useKanbanItemContext<T>()

	/* Resolved per item, so the menu sees plain booleans. */
	const definitions = useMemo(
		() => (item === null || item === undefined ? [] : resolveContextActions<T>(context.itemActions, item)),
		[context.itemActions, item],
	)

	// No actions for this card: no menu at all.
	if (item === null || definitions.length === 0) return null

	return (
		// Both handlers: click for the card's handler, pointerdown for the sensor (else opening the menu starts a drag).
		<span
			data-stop-item-click
			onClick={(event) => event.stopPropagation()}
			onPointerDown={(event) => event.stopPropagation()}
			className={cx("kanban-item-actions--component", styles.actions)}
		>
			<ActionMenu
				actions={definitions}
				icon={icon ? () => <>{icon}</> : undefined}
				strings={{ trigger: label ?? context.strings.itemActionsLabel }}
				align="end"
				buttonProps={{
					iconOnly: true,
					tone: "neutral",
					buttonStyle: "ghost",
					className: cx(styles.actionsTrigger, className),
				}}
			/>
		</span>
	)
}

export function KanbanOverlay<T = unknown>({ className, render }: KanbanOverlayProps<T>) {
	const { activeItem, activeId, findItem } = useKanbanContext<T>()
	return (
		<DragOverlay>
			{activeId ? (
				render ? (
					render({ item: activeItem, columnId: findItem(activeId)?.columnId ?? null })
				) : (
					// A placeholder, not a copy of the card: its markup lives at the call site.
					<div className={cx(styles.overlay, className)}>
						<Text tag="span" size="xs" type="inherit" weight="medium">
							{activeId}
						</Text>
					</div>
				)
			) : null}
		</DragOverlay>
	)
}
