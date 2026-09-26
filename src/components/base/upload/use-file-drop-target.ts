import { useCallback, useRef, useState, type DragEventHandler } from "react"

export interface FileDropTargetProps {
	onDragEnter: DragEventHandler<HTMLElement>
	onDragOver: DragEventHandler<HTMLElement>
	onDragLeave: DragEventHandler<HTMLElement>
	onDrop: DragEventHandler<HTMLElement>
}

/**
 * Drag state that survives descendants: `dragleave` fires on entering a child, so enters
 * and leaves are counted and dragging clears only at zero.
 */
export function useFileDropTarget({
	disabled = false,
	onFiles,
}: {
	disabled?: boolean
	onFiles: (files: File[]) => void
}) {
	const depth = useRef(0)
	const [dragging, setDragging] = useState(false)

	// Derived, so a zone disabled mid-drag never stays highlighted.
	const isDragging = dragging && !disabled

	const swallow: DragEventHandler<HTMLElement> = useCallback((event) => {
		// Without both of these the browser navigates to the dropped file.
		event.preventDefault()
		event.stopPropagation()
	}, [])

	const onDragEnter: DragEventHandler<HTMLElement> = useCallback(
		(event) => {
			swallow(event)
			// A drag over a disabled zone counts for nothing, so the depth cannot go stale.
			if (disabled) {
				depth.current = 0
				return
			}
			depth.current += 1
			setDragging(true)
		},
		[disabled, swallow],
	)

	const onDragOver: DragEventHandler<HTMLElement> = useCallback(
		(event) => {
			swallow(event)
			if (disabled) return
			// Without this the cursor reads "move" and the drop is refused.
			if (event.dataTransfer) event.dataTransfer.dropEffect = "copy"
			setDragging(true)
		},
		[disabled, swallow],
	)

	const onDragLeave: DragEventHandler<HTMLElement> = useCallback(
		(event) => {
			swallow(event)
			depth.current = Math.max(0, depth.current - 1)
			if (depth.current === 0) setDragging(false)
		},
		[swallow],
	)

	const onDrop: DragEventHandler<HTMLElement> = useCallback(
		(event) => {
			swallow(event)
			depth.current = 0
			setDragging(false)
			if (disabled) return
			const files = event.dataTransfer?.files
			if (files?.length) onFiles(Array.from(files))
		},
		[disabled, onFiles, swallow],
	)

	return {
		isDragging,
		dropTargetProps: { onDragEnter, onDragOver, onDragLeave, onDrop } satisfies FileDropTargetProps,
	}
}
