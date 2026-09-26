/**
 * FileUpload — a `Dropzone` plus the list of chosen files. It transfers nothing: the value
 * is local `File` objects, and sending them is the caller's business.
 */
import { FileIcon, XIcon } from "lucide-react"
import { PreviewImage } from "./preview-image"
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"

import { Alert } from "@/components/base/feedback"
import { Button } from "@/components/base/buttons"
import { FileSize } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { Dropzone } from "./dropzone"
import { defaultFileUploadStrings, type FileUploadStrings } from "./file-upload.strings"
import styles from "./upload.module.css"
import type { FileConstraints, FileRejection } from "./upload.types"
import { validateFileSelection } from "./validate-files"
import { useObjectUrls } from "@/hooks/use-object-urls"

export interface FileUploadProps extends FileConstraints {
	/** Applied to the file input itself, so a `FormField` label can address it. */
	id?: string
	/** Controlled selection. */
	value?: File[]
	defaultValue?: File[]
	onValueChange?: (files: File[]) => void
	/** Receives what was refused. Rejected files never reach `onValueChange`. */
	onRejectedFiles?: (rejections: FileRejection[]) => void

	multiple?: boolean
	/** Cap on the selection. Defaults to 1 for single, unlimited for multiple. */
	maxFiles?: number
	/** Whether a new selection adds to the list or replaces it. */
	selectionMode?: "append" | "replace"

	disabled?: boolean
	invalid?: boolean
	/** A compact single row, for a zone that sits inside a form rather than owning a page. */
	compact?: boolean

	/** Shorthand for `strings.instruction`. */
	label?: ReactNode
	/** Overrides this control's own copy, the rejection sentences included. */
	strings?: Partial<FileUploadStrings>
	hint?: ReactNode
	/** Hides the built-in list, for a caller rendering their own. */
	showList?: boolean
	/** Shows the refusals under the zone. */
	showRejections?: boolean
	/** Per-file transfer progress, 0–100, keyed by file name. */
	progress?: Record<string, number>

	name?: string
	className?: string
	/** `FormField`'s wiring, applied to the input. */
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false"
	"aria-required"?: boolean | "true" | "false"
}

// A stable empty array, so memoised callbacks do not rebuild every render.
const NONE: never[] = []

export function FileUpload({
	id,
	value,
	defaultValue,
	onValueChange,
	onRejectedFiles,
	multiple = false,
	maxFiles,
	selectionMode,
	disabled = false,
	invalid = false,
	compact = false,
	label,
	strings,
	hint,
	showList = true,
	showRejections = true,
	progress,
	name,
	className,
	"aria-labelledby": labelledBy,
	"aria-describedby": describedBy,
	"aria-invalid": ariaInvalid,
	"aria-required": ariaRequired,
	...constraints
}: FileUploadProps) {
	const copy = { ...defaultFileUploadStrings, ...strings }
	// A caller's (or FormField's) id wins; it must reach the input, the labelable element.
	const generatedId = useId()
	const inputId = id ?? generatedId
	const inputRef = useRef<HTMLInputElement>(null)
	const isControlled = value !== undefined
	const [internal, setInternal] = useState<File[]>(defaultValue ?? [])
	const files = isControlled ? (value ?? NONE) : internal
	const [rejections, setRejections] = useState<FileRejection[]>([])

	const resolvedMax = maxFiles ?? (multiple ? Number.POSITIVE_INFINITY : 1)
	// Single-file mode replaces by default; a second pick means "instead of", not "as well as".
	const append = (selectionMode ?? (multiple ? "append" : "replace")) === "append"

	const accept = useCallback(
		(incoming: File[]) => {
			const result = validateFileSelection({
				incoming,
				current: files,
				maxFiles: resolvedMax,
				append,
				...constraints,
			})

			setRejections(result.rejections)
			if (result.rejections.length > 0) onRejectedFiles?.(result.rejections)

			if (result.accepted.length > 0 || !append) {
				if (!isControlled) setInternal(result.nextFiles)
				onValueChange?.(result.nextFiles)
			}

			// Cleared so re-picking the same file still fires a change event.
			if (inputRef.current) inputRef.current.value = ""
		},
		[append, constraints, files, isControlled, onRejectedFiles, onValueChange, resolvedMax],
	)


	// After a remove, focus moves to the row now in its place, else the one before, else the input.
	const listRef = useRef<HTMLUListElement>(null)
	const pendingFocus = useRef<number | null>(null)
	const remove = useCallback(
		(index: number) => {
			const next = files.filter((_, position) => position !== index)
			pendingFocus.current = index
			if (!isControlled) setInternal(next)
			onValueChange?.(next)
		},
		[files, isControlled, onValueChange],
	)
	useEffect(() => {
		if (pendingFocus.current === null) return
		const index = pendingFocus.current
		pendingFocus.current = null
		const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[data-remove]") ?? []
		const target = buttons[Math.min(index, buttons.length - 1)]
		if (target) target.focus()
		else inputRef.current?.focus()
	}, [files])
	const invalidState = ariaInvalid ?? (invalid || undefined)

	const hintText =
		hint !== undefined
			? hint
			: copy.constraintHint?.({ accept: constraints.accept, maxSizeBytes: constraints.maxSizeBytes }) || null

	return (
		<div className={cx("file-upload--component", styles.root, className)}>
			{/* The zone is `Dropzone`; this adds the field wiring and a hint built from the constraints. */}
			<Dropzone
				onDrop={accept}
				accept={constraints.accept}
				multiple={multiple}
				disabled={disabled}
				invalid={invalidState === true || invalidState === "true"}
				compact={compact}
				label={label}
				hint={hintText}
				strings={{
					instruction: copy.instruction,
					instructionMultiple: copy.instructionMultiple,
					...(copy.dragOver ? { dragOver: copy.dragOver } : null),
				}}
				inputProps={{
					ref: inputRef,
					id: inputId,
					name,
					"aria-labelledby": labelledBy,
					"aria-describedby": describedBy,
					"aria-invalid": invalidState,
					"aria-required": ariaRequired,
				}}
			/>

			{showRejections && rejections.length > 0 && (
				<div className={styles.rejections}>
					{rejections.map((rejection) => (
						<Alert key={`${rejection.file.name}-${rejection.code}`} tone="destructive">
							{copy.rejection(rejection)}
						</Alert>
					))}
				</div>
			)}

			{showList && files.length > 0 && (
				<ul ref={listRef} className={styles.list}>
					{files.map((file, index) => (
						<li key={`${file.name}-${file.lastModified}`} className={styles.row}>
							<FilePreview file={file} />
							<div className={styles.rowBody}>
								<span className={styles.rowName}>{file.name}</span>
								<span className={styles.rowMeta}>
									<FileSize value={file.size} />
								</span>
								{progress?.[file.name] !== undefined && (
									<div
										className={styles.progress}
										role="progressbar"
										aria-valuenow={progress[file.name]}
										aria-valuemin={0}
										aria-valuemax={100}
										aria-label={copy.uploading(file.name)}
									>
										<div className={styles.progressFill} style={{ width: `${progress[file.name]}%` }} />
									</div>
								)}
							</div>
							<Button
								tone="neutral"
								buttonStyle="ghost"
								iconOnly
								aria-label={copy.remove(file.name)}
								data-remove=""
								disabled={disabled}
								onClick={() => remove(index)}
							>
								<XIcon />
							</Button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

/** A thumbnail for an image, a glyph for anything else. */
function FilePreview({ file }: { file: File }) {
	const isImage = file.type.startsWith("image/")
	// `useObjectUrls` owns creation and revocation; nothing is created for a non-image.
	const [url] = useObjectUrls(isImage ? [file] : [])

	return (
		<span className={styles.thumb}>
			{isImage && url ? <PreviewImage src={url} fallback={<FileIcon aria-hidden />} /> : <FileIcon aria-hidden />}
		</span>
	)
}
