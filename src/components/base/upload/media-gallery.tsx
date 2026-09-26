/**
 * MediaGallery — a sortable grid of images; the first is the cover, so order is part of the
 * value. Reordering uses native drag plus arrow keys, as Repeater does.
 */
import { ImageIcon, ImagePlusIcon, XIcon } from "lucide-react"
import { PreviewImage } from "./preview-image"
import {
	useCallback, useMemo, useState, type DragEvent, type KeyboardEvent,
} from "react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { useObjectUrls } from "@/hooks"
import { cx } from "@/lib/cx"

import { defaultMediaGalleryStrings, type MediaGalleryStrings } from "./upload.strings"
import styles from "./upload.module.css"
import type { FileConstraints, FileRejection } from "./upload.types"
import { useFileDropTarget } from "./use-file-drop-target"
import { validateFileSelection } from "./validate-files"

export interface MediaGalleryProps extends FileConstraints {
	/** Controlled. The order is part of the value: the first entry is the cover. */
	value?: File[]
	defaultValue?: File[]
	onValueChange?: (files: File[]) => void
	onRejectedFiles?: (rejections: FileRejection[]) => void
	maxFiles?: number
	disabled?: boolean
	invalid?: boolean
	/** Badges the first tile as the cover. Defaults to true; turn off when order carries no meaning. */
	showCover?: boolean
	/** Overrides this gallery's own copy. */
	strings?: Partial<MediaGalleryStrings>
	className?: string
}

// A stable empty array, so memoised callbacks do not rebuild every render.
const NONE: never[] = []

export function MediaGallery({
	value,
	defaultValue,
	onValueChange,
	onRejectedFiles,
	maxFiles,
	disabled = false,
	invalid = false,
	showCover = true,
	strings,
	accept = "image/*",
	...constraints
}: MediaGalleryProps & { className?: string }) {
	const copy = { ...defaultMediaGalleryStrings, ...strings }
	const isControlled = value !== undefined
	const [internal, setInternal] = useState<File[]>(defaultValue ?? [])
	const files = isControlled ? (value ?? NONE) : internal
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
	const [overIndex, setOverIndex] = useState<number | null>(null)

	const commit = useCallback(
		(next: File[]) => {
			if (!isControlled) setInternal(next)
			onValueChange?.(next)
		},
		[isControlled, onValueChange],
	)

	const add = useCallback(
		(incoming: File[]) => {
			const result = validateFileSelection({
				incoming,
				current: files,
				maxFiles: maxFiles ?? Number.POSITIVE_INFINITY,
				append: true,
				accept,
				...constraints,
			})
			if (result.rejections.length > 0) onRejectedFiles?.(result.rejections)
			if (result.accepted.length > 0) commit(result.nextFiles)
		},
		[accept, commit, constraints, files, maxFiles, onRejectedFiles],
	)

	const { isDragging, dropTargetProps } = useFileDropTarget({ disabled, onFiles: add })

	const move = useCallback(
		(from: number, to: number) => {
			if (from === to || to < 0 || to >= files.length) return
			const next = [...files]
			const [moved] = next.splice(from, 1)
			if (moved === undefined) return
			next.splice(to, 0, moved)
			commit(next)
		},
		[commit, files],
	)

	const urls = useObjectUrls(files)

	const onTileKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const delta = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
		if (delta === 0) return
		event.preventDefault()

		const target = index + delta
		move(index, target)

		// Focus follows the tile, or the second press lands on the wrong one.
		const tiles = event.currentTarget.closest("[data-gallery]")?.querySelectorAll<HTMLButtonElement>("[data-gallery-tile]")
		requestAnimationFrame(() => tiles?.[target]?.focus())
	}

	const onTileDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
		event.preventDefault()
		if (draggingIndex !== null) move(draggingIndex, index)
		setDraggingIndex(null)
		setOverIndex(null)
	}

	const atLimit = maxFiles !== undefined && files.length >= maxFiles
	const gallery = useMemo(() => files.map((file, index) => ({ file, url: urls[index] })), [files, urls])

	return (
		<div data-gallery="" className={cx("media-gallery--component", styles.gallery)}>
			{gallery.map(({ file, url }, index) => (
				<div
					key={`${file.name}-${file.lastModified}-${index}`}
					className={styles.tile}
					data-dragging={draggingIndex === index || undefined}
					data-drop={(overIndex === index && draggingIndex !== null && draggingIndex !== index) || undefined}
					onDragOver={(event) => {
						if (draggingIndex === null) return
						event.preventDefault()
						setOverIndex(index)
					}}
					onDrop={(event) => onTileDrop(event, index)}
					onDragEnd={() => {
						setDraggingIndex(null)
						setOverIndex(null)
					}}
				>
					{!!url && (
						<PreviewImage
							src={url}
							fallback={<ImageIcon aria-hidden className={styles.tileFallback} />}
							className={styles.tileImage}
						/>
					)}

					{/* The overlay button is the drag source; the tile is the drop target. */}
					<button
						type="button"
						data-gallery-tile=""
						className={styles.tileHandle}
						aria-label={copy.position(file.name, index + 1, files.length)}
						disabled={disabled}
						draggable={!disabled}
						onDragStart={(event) => {
							setDraggingIndex(index)
							event.dataTransfer.effectAllowed = "move"
							// Firefox refuses to start a drag with nothing on the transfer.
							event.dataTransfer.setData("text/plain", String(index))
							// Drag the tile's image, not the invisible overlay button.
							const tile = event.currentTarget.closest("[data-drop], div")
							if (tile) event.dataTransfer.setDragImage(tile, 20, 20)
						}}
						onDragEnd={() => {
							setDraggingIndex(null)
							setOverIndex(null)
						}}
						onKeyDown={(event) => onTileKeyDown(event, index)}
					/>

					{index === 0 && showCover && (
						<Badge tone="neutral" className={styles.tileCover}>
							{copy.cover}
						</Badge>
					)}

					<Button
						tone="neutral"
						buttonStyle="solid"
						iconOnly
						className={styles.tileRemove}
						aria-label={copy.remove(file.name)}
						disabled={disabled}
						onClick={() => commit(files.filter((_, position) => position !== index))}
					>
						<XIcon />
					</Button>
				</div>
			))}

			{!atLimit && (
				<label
					{...dropTargetProps}
					data-dragging={isDragging || undefined}
					data-disabled={disabled || undefined}
					aria-invalid={invalid || undefined}
					className={styles.galleryAdd}
				>
					<input
						type="file"
						accept={accept}
						multiple
						disabled={disabled}
						className={styles.dropzoneInput}
						onChange={(event) => {
							const picked = event.target.files
							if (picked?.length) add(Array.from(picked))
							// Re-picking the same file fires no change event unless this is cleared.
							event.target.value = ""
						}}
					/>
					<ImagePlusIcon aria-hidden />
					<span>{copy.add}</span>
				</label>
			)}
		</div>
	)
}
