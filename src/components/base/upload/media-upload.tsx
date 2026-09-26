/**
 * AvatarUpload and ImageUpload — a single image; the picker is the preview, in the shape it
 * will have in the product (round avatar, cover banner).
 */
import { ImageIcon, PencilIcon, TrashIcon, UserIcon } from "lucide-react"
import { useCallback, useId, useRef, useState, type ReactNode } from "react"

import { Button } from "@/components/base/buttons"
import { cx } from "@/lib/cx"

import { PreviewImage } from "./preview-image"

import {
	defaultAvatarUploadStrings, defaultImageUploadStrings, type MediaUploadStrings,
} from "./upload.strings"
import styles from "./upload.module.css"
import type { FileConstraints, FileRejection } from "./upload.types"
import { useFileDropTarget } from "./use-file-drop-target"
import { validateFileSelection } from "./validate-files"
import { useObjectUrls } from "@/hooks/use-object-urls"

interface MediaUploadProps extends FileConstraints {
	/** Applied to the file input itself, so a `FormField` label can address it. */
	id?: string
	/** Overrides this control's own copy — the empty frame, the overlay, and remove. */
	strings?: Partial<MediaUploadStrings>
	/** Controlled file. */
	value?: File | null
	onValueChange?: (file: File | undefined) => void
	onRejectedFiles?: (rejections: FileRejection[]) => void
	/** An already-stored image. In controlled mode, clear this alongside value to remove it. */
	previewUrl?: string
	disabled?: boolean
	invalid?: boolean
	className?: string
	name?: string
	"aria-label"?: string
	/** The field's label, from `FormField`; the input is named by it and its action ("Logo Upload image"). */
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
	"aria-required"?: boolean | "true" | "false"
}

function useSingleImage({
	value,
	onValueChange,
	onRejectedFiles,
	previewUrl,
	accept = "image/*",
	...constraints
}: MediaUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [internal, setInternal] = useState<File | undefined>(undefined)
	const [dismissedPreview, setDismissedPreview] = useState<string | undefined>(undefined)
	const [lastPreview, setLastPreview] = useState(previewUrl)
	if (lastPreview !== previewUrl) {
		setLastPreview(previewUrl)
		setDismissedPreview(undefined)
	}
	const file = value !== undefined ? (value ?? undefined) : internal
	/* `useObjectUrls` creates the new URL before revoking the previous one. */
	const [objectUrl] = useObjectUrls(file ? [file] : [])

	const accepted = useCallback(
		(incoming: File[]) => {
			const result = validateFileSelection({
				incoming,
				current: [],
				maxFiles: 1,
				append: false,
				accept,
				...constraints,
			})

			const next = result.accepted[0]
			if (next) {
				if (value === undefined) setInternal(next)
				onValueChange?.(next)
			}
			// Rejections last, so a consumer clearing its error on value change still sees this drop's.
			if (result.rejections.length > 0) onRejectedFiles?.(result.rejections)
			// Re-picking the same file fires no change event unless the input is cleared.
			if (inputRef.current) inputRef.current.value = ""
		},
		[accept, constraints, onRejectedFiles, onValueChange, value],
	)

	const clear = useCallback(() => {
		if (value === undefined) {
			setInternal(undefined)
			setDismissedPreview(previewUrl)
		}
		onValueChange?.(undefined)
	}, [onValueChange, previewUrl, value])

	// A freshly picked file wins over whatever was already stored.
	const storedPreview = value === undefined && dismissedPreview === previewUrl ? null : previewUrl
	const shown = objectUrl ?? storedPreview ?? null

	return { inputRef, accepted, clear, shown, accept }
}

function MediaPicker({
	shape,
	emptyIcon,
	emptyLabel,
	overlayLabel,
	removeLabel,
	props,
}: {
	shape: "avatar" | "image"
	emptyIcon: ReactNode
	emptyLabel: string
	overlayLabel: string
	removeLabel: string
	props: MediaUploadProps
}) {
	const { id, disabled, invalid, className, name, "aria-label": ariaLabel,
		"aria-labelledby": labelledBy, "aria-describedby": describedBy, "aria-invalid": ariaInvalid, "aria-required": ariaRequired } = props
	const { inputRef, accepted, clear, shown, accept } = useSingleImage(props)
	const { isDragging, dropTargetProps } = useFileDropTarget({ disabled, onFiles: accepted })
	const invalidState = ariaInvalid ?? (invalid || undefined)
	const generatedId = useId()
	// A self-reference needs an id even when no field supplied one.
	const inputDomId = id ?? generatedId

	return (
		<div className={cx(shape === "avatar" ? "avatar-upload--component" : "image-upload--component", styles.mediaRoot, className)}>
			<div
				{...dropTargetProps}
				data-dragging={isDragging || undefined}
				data-disabled={disabled || undefined}
				data-filled={shown ? "" : undefined}
				data-invalid={(invalidState && invalidState !== "false") || undefined}
				className={cx(styles.mediaPicker, shape === "avatar" ? styles.avatarPicker : styles.imagePicker)}
			>
				<input
					ref={inputRef}
					id={inputDomId}
					type="file"
					name={name}
					accept={accept}
					disabled={disabled}
					aria-label={ariaLabel ?? (shown ? overlayLabel : emptyLabel)}
					/* The field's label, then this input's own `aria-label` (it lists itself). */
					aria-labelledby={labelledBy ? `${labelledBy} ${inputDomId}` : undefined}
					aria-describedby={describedBy}
					aria-invalid={invalidState}
					aria-required={ariaRequired}
					className={styles.dropzoneInput}
					onChange={(event) => {
						const picked = event.target.files
						if (picked?.length) accepted(Array.from(picked))
						// Reset, so the same image can be chosen again after it was removed.
						event.target.value = ""
					}}
				/>

				{shown ? (
					<PreviewImage
						src={shown}
						fallback={<span className={styles.mediaEmpty}>{emptyIcon}</span>}
						className={styles.mediaPreview}
					/>
				) : (
					<span className={styles.mediaEmpty}>
						{emptyIcon}
						{shape === "image" && <span>{emptyLabel}</span>}
					</span>
				)}

				<span className={styles.mediaOverlay} aria-hidden>
					<PencilIcon aria-hidden />
					{shape === "image" && <span>{overlayLabel}</span>}
				</span>
			</div>

			{/* Outside the picker, or every click on it would open the file dialog. */}
			{shown && !disabled && (
				<Button tone="neutral" buttonStyle="ghost" onClick={() => {
					clear()
					inputRef.current?.focus()
				}}>
					<TrashIcon />
					{/* The translated label, so the visible text matches the accessible name. */}
					{removeLabel}
				</Button>
			)}
		</div>
	)
}

export type AvatarUploadProps = MediaUploadProps
export type ImageUploadProps = MediaUploadProps

export function AvatarUpload({ strings, ...props }: AvatarUploadProps) {
	const copy = { ...defaultAvatarUploadStrings, ...strings }
	return (
		<MediaPicker
			shape="avatar"
			emptyIcon={<UserIcon aria-hidden />}
			emptyLabel={copy.empty}
			overlayLabel={copy.overlay}
			removeLabel={copy.remove}
			props={props}
		/>
	)
}

export function ImageUpload({ strings, ...props }: ImageUploadProps) {
	const copy = { ...defaultImageUploadStrings, ...strings }
	return (
		<MediaPicker
			shape="image"
			emptyIcon={<ImageIcon aria-hidden />}
			emptyLabel={copy.empty}
			overlayLabel={copy.overlay}
			removeLabel={copy.remove}
			props={props}
		/>
	)
}
