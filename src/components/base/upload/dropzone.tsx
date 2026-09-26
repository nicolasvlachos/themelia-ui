/**
 * Dropzone — the drop target on its own: it reports dropped or picked `File`s and owns no
 * state (`FileUpload` adds validation and a list). The box is a `<label>` for a real file
 * input, so it is keyboard-reachable and submits in a plain form.
 */
import { useId, type ComponentProps, type ReactNode } from "react"
import { UploadCloudIcon } from "lucide-react"

import { cx } from "@/lib/cx"

import { defaultDropzoneStrings, type DropzoneStrings } from "./upload.strings"
import { useFileDropTarget } from "./use-file-drop-target"
import styles from "./upload.module.css"

export interface DropzoneProps extends Omit<ComponentProps<"div">, "onDrop" | "children"> {
	/** Called with what was dropped or picked. Nothing is validated first. */
	onDrop: (files: File[]) => void
	/** MIME types or extensions, as the native input takes them. */
	accept?: string
	multiple?: boolean
	disabled?: boolean
	invalid?: boolean
	/** A shorter box, for a zone beside other fields rather than filling a panel. */
	compact?: boolean
	/** Replaces the cloud glyph. */
	icon?: ReactNode
	/** Native attributes for the input itself — `name`, `form`, `required`. */
	inputProps?: Omit<ComponentProps<"input">, "type" | "accept" | "multiple" | "disabled" | "onChange">
	strings?: Partial<DropzoneStrings>
	/** Replaces the prompt — "Attach your receipts". Shorthand for `strings.instruction`. */
	label?: ReactNode
	/** Replaces the second line — the accepted types, the size cap — with any node. */
	hint?: ReactNode
	/** Controls rendered below the label, not inside it, where clicks would open the file dialog. */
	footer?: ReactNode
}

export function Dropzone({
	onDrop,
	accept,
	multiple = false,
	disabled = false,
	invalid = false,
	compact = false,
	icon,
	inputProps,
	strings,
	label,
	hint,
	footer,
	className,
	...props
}: DropzoneProps) {
	const copy = { ...defaultDropzoneStrings, ...strings }
	const generatedId = useId()
	// A field's label addresses the input by ITS id, so a caller's id has to win.
	const inputId = inputProps?.id ?? generatedId
	const promptId = `${generatedId}-prompt`
	const { isDragging, dropTargetProps } = useFileDropTarget({ disabled, onFiles: onDrop })
	const prompt = isDragging ? copy.dragOver : (label ?? (multiple ? copy.instructionMultiple : copy.instruction))
	const helper = hint !== undefined ? hint : copy.helper
	// Named by the field, then the prompt: a caller's labelledby alone would drop the prompt.
	const labelledBy = inputProps?.["aria-labelledby"]

	return (
		<div className={cx("dropzone--component", className)} {...props}>
			<label
				htmlFor={inputId}
				{...dropTargetProps}
				data-slot="dropzone"
				data-dragging={isDragging || undefined}
				data-disabled={disabled || undefined}
				data-invalid={invalid || undefined}
				className={cx(styles.dropzone, compact && styles.dropzoneCompact)}
			>
				{/* Invalid is the input's state, not the label's. */}
				<input
					aria-invalid={invalid || undefined}
					{...inputProps}
					aria-labelledby={labelledBy ? `${labelledBy} ${promptId}` : undefined}
					id={inputId}
					type="file"
					accept={accept}
					multiple={multiple}
					disabled={disabled}
					className={cx(styles.dropzoneInput, inputProps?.className)}
					onChange={(event) => {
						const picked = event.target.files
						if (picked?.length) onDrop(Array.from(picked))
						// Reset, so choosing the same file again still fires a change event.
						event.target.value = ""
					}}
				/>
				{icon ?? <UploadCloudIcon aria-hidden className={styles.dropzoneIcon} />}
				{/* The prompt and its hint sit close together: one statement. */}
				<span className={styles.dropzoneCopy}>
					<span id={promptId} className={styles.dropzoneText}>
						{prompt}
					</span>
					{helper !== null && helper !== undefined && helper !== "" && (
						<span className={styles.dropzoneHint}>{helper}</span>
					)}
				</span>
			</label>
			{!!footer && <div className={styles.dropzoneFooter}>{footer}</div>}
		</div>
	)
}
