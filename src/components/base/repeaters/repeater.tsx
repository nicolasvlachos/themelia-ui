/**
 * Repeater — the chrome every list-style field shares: rows with an optional drag handle
 * and remove control, an empty state, and an add button. The row body is the caller's, and
 * so is the items array (`items`, `onAdd`, `onRemove`, `onMove`).
 */
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react"
import { useCallback, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { defaultRepeaterStrings, type RepeaterStrings } from "./repeaters.strings"
import styles from "./repeater.module.css"

export interface RepeaterRowContext {
	index: number
	/** True while this row is the one being dragged. */
	dragging: boolean
}

export interface RepeaterProps<T> {
	items: T[]
	/** Stable key for a row. An index is a poor key while rows reorder. */
	getKey: (item: T, index: number) => string
	children: (item: T, context: RepeaterRowContext) => ReactNode

	onAdd?: () => void
	onRemove?: (index: number) => void
	/** Enables reordering. Without it, no handle is rendered. */
	onMove?: (from: number, to: number) => void

	/** `card` wraps each row in a bordered surface, for multi-field rows. */
	rowVariant?: "inline" | "card"
	/** Overrides this list's own copy — the add control and each row's remove. */
	strings?: Partial<RepeaterStrings>
	emptyState?: ReactNode
	/** Hides the add button, for a list with a fixed set of rows. */
	showAdd?: boolean
	/** Caps the list. The add button disables at the limit. */
	maxItems?: number
	disabled?: boolean
	className?: string
}

export function Repeater<T>({
	items,
	getKey,
	children,
	onAdd,
	onRemove,
	onMove,
	rowVariant = "inline",
	strings,
	emptyState,
	showAdd = true,
	maxItems,
	disabled = false,
	className,
}: RepeaterProps<T>) {
	const copy = { ...defaultRepeaterStrings, ...strings }
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
	const [overIndex, setOverIndex] = useState<number | null>(null)
	const [announcement, setAnnouncement] = useState("")
	const rootRef = useRef<HTMLDivElement>(null)

	const sortable = !!onMove && !disabled

	const move = useCallback(
		(from: number, to: number) => {
			if (from === to || to < 0 || to >= items.length) return
			onMove?.(from, to)
		},
		[items.length, onMove],
	)

	/** Keyboard reordering on the handle (native drag has none); focus follows the row. */
	const onHandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const delta = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0
		if (delta === 0) return
		event.preventDefault()

		const target = index + delta
		if (target < 0 || target >= items.length) return
		move(index, target)
		setAnnouncement(copy.moved?.(target + 1, items.length) ?? "")

		// Queried after the re-render, so `target` holds the moved row's handle.
		const list = event.currentTarget.closest("ul")
		requestAnimationFrame(() =>
			list?.querySelectorAll<HTMLButtonElement>("[data-repeater-handle]")[target]?.focus(),
		)
	}

	// After a remove, focus goes to the row now in its place, else the one before, else the add control.
	const removeAt = (index: number) => {
		onRemove?.(index)
		requestAnimationFrame(() => {
			const root = rootRef.current
			if (!root) return
			const removes = root.querySelectorAll<HTMLButtonElement>("[data-repeater-remove]")
			const next = removes[Math.min(index, removes.length - 1)]
			;(next ?? root.querySelector<HTMLButtonElement>("[data-repeater-add]"))?.focus()
		})
	}

	const onDragStart = (event: DragEvent<HTMLElement>, index: number) => {
		setDraggingIndex(index)
		event.dataTransfer.effectAllowed = "move"
		// Firefox refuses to start a drag unless something is written to the transfer.
		event.dataTransfer.setData("text/plain", String(index))
		// The drag image is the whole row, not the grip.
		const row = event.currentTarget.closest("li")
		if (row) event.dataTransfer.setDragImage(row, 12, row.clientHeight / 2)
	}

	const onDragOver = (event: DragEvent<HTMLLIElement>, index: number) => {
		if (draggingIndex === null) return
		event.preventDefault()
		event.dataTransfer.dropEffect = "move"
		setOverIndex(index)
	}

	const onDrop = (event: DragEvent<HTMLLIElement>, index: number) => {
		event.preventDefault()
		if (draggingIndex !== null) move(draggingIndex, index)
		setDraggingIndex(null)
		setOverIndex(null)
	}

	const atLimit = maxItems !== undefined && items.length >= maxItems

	return (
		<div ref={rootRef} className={cx("repeater--component", styles.root, className)}>
			<VisuallyHidden role="status" aria-live="polite">
				{announcement}
			</VisuallyHidden>
			{items.length === 0 ? (
				<div className={styles.empty}>{emptyState ?? copy.emptyState}</div>
			) : (
				<ul className={styles.list}>
					{items.map((item, index) => {
						const dragging = draggingIndex === index
						return (
							<li
								key={getKey(item, index)}
								className={cx(styles.row, rowVariant === "card" && styles.rowCard)}
								data-dragging={dragging || undefined}
								data-drop-before={
									(overIndex === index && draggingIndex !== null && draggingIndex > index) || undefined
								}
								data-drop-after={
									(overIndex === index && draggingIndex !== null && draggingIndex < index) || undefined
								}
								onDragOver={(event) => onDragOver(event, index)}
								onDrop={(event) => onDrop(event, index)}
								onDragEnd={() => {
									setDraggingIndex(null)
									setOverIndex(null)
								}}
							>
								{sortable && (
									<button
										type="button"
										data-repeater-handle=""
										className={styles.handle}
										aria-label={copy.reorder(index + 1)}
										/*
										 * The handle is the drag source: a draggable row would turn text
										 * selection in its inputs into a drag. The row is the drop target.
										 */
										draggable
										onDragStart={(event) => onDragStart(event, index)}
										onDragEnd={() => {
											setDraggingIndex(null)
											setOverIndex(null)
										}}
										onKeyDown={(event) => onHandleKeyDown(event, index)}
									>
										<GripVerticalIcon aria-hidden />
									</button>
								)}

								<div className={styles.body}>{children(item, { index, dragging })}</div>

								{!!onRemove && (
									<Button
										tone="neutral"
										buttonStyle="ghost"
										iconOnly
										disabled={disabled}
										aria-label={copy.remove(index + 1)}
										data-repeater-remove=""
										className={styles.remove}
										onClick={() => removeAt(index)}
									>
										<XIcon />
									</Button>
								)}
							</li>
						)
					})}
				</ul>
			)}

			{showAdd && !!onAdd && (
				<div className={styles.footer}>
					<Button tone="neutral" buttonStyle="outline" onClick={onAdd} disabled={disabled || atLimit} data-repeater-add="">
						<PlusIcon />
						{copy.add}
					</Button>
				</div>
			)}
		</div>
	)
}
