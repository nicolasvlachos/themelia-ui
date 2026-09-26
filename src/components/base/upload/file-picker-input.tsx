/**
 * FilePickerInput — a file field shaped like an Input, showing the chosen file's name, for
 * a form row. `FileUpload` is the drop-zone alternative.
 */
import { PaperclipIcon, XIcon } from "lucide-react"
import { useCallback, useRef, useState, type ComponentProps } from "react"

import { Button } from "@/components/base/buttons"
import { FileSize } from "@/components/primitives"
import { cx } from "@/lib/cx"
import type { StringsProp } from "@/lib/strings"

import styles from "./upload.module.css"
import type { FileConstraints, FileRejection } from "./upload.types"
import { validateFileSelection } from "./validate-files"
import { defaultFilePickerStrings, type FilePickerStrings } from "./upload.strings"

export interface FilePickerInputProps
	extends Omit<ComponentProps<"div">, "onChange" | "defaultValue"> {
	/** Controlled. */
	value?: File | null
	onValueChange?: (file: File | undefined) => void
	onRejectedFiles?: (rejections: FileRejection[]) => void
	/** Type and size limits. Re-checked here, not left to the file dialog. */
	constraints?: FileConstraints
	disabled?: boolean
	invalid?: boolean
	name?: string
	strings?: StringsProp<FilePickerStrings>
}

export function FilePickerInput({
	value,
	onValueChange,
	onRejectedFiles,
	constraints = {},
	disabled = false,
	invalid = false,
	name,
	strings,
	className,
	...props
}: FilePickerInputProps) {
	const copy = { ...defaultFilePickerStrings, ...strings }
	const inputRef = useRef<HTMLInputElement>(null)
	const [internal, setInternal] = useState<File | undefined>(undefined)
	const file = value !== undefined ? (value ?? undefined) : internal

	const accept = useCallback(
		(incoming: File[]) => {
			const result = validateFileSelection({
				incoming,
				current: [],
				maxFiles: 1,
				append: false,
				...constraints,
			})
			if (result.rejections.length > 0) onRejectedFiles?.(result.rejections)
			const next = result.accepted[0]
			if (next) {
				if (value === undefined) setInternal(next)
				onValueChange?.(next)
			}
			// Re-picking the same file fires no change event unless the input is cleared.
			if (inputRef.current) inputRef.current.value = ""
		},
		[constraints, onRejectedFiles, onValueChange, value],
	)

	return (
		<div
			data-field-shell=""
			data-disabled={disabled || undefined}
			aria-invalid={invalid || undefined}
			className={cx("file-picker-input--component", styles.pickerShell, className)}
			{...props}
		>
			{/* The input covers the shell at zero opacity, so the whole control opens the dialog. */}
			<input
				ref={inputRef}
				type="file"
				name={name}
				accept={constraints.accept}
				disabled={disabled}
				aria-label={file ? file.name : copy.empty}
				className={styles.dropzoneInput}
				onChange={(event) => {
					const picked = event.target.files
					if (picked?.length) accept(Array.from(picked))
				}}
			/>
			<PaperclipIcon aria-hidden className={styles.pickerIcon} />
			<span className={cx(styles.pickerLabel, !file && styles.pickerEmpty)}>
				{file ? file.name : copy.empty}
			</span>
			{!!file && (
				<span className={styles.pickerMeta}>
					<FileSize value={file.size} />
				</span>
			)}
			{!!file && !disabled && (
				<Button
					tone="neutral"
					buttonStyle="ghost"
					iconOnly
					aria-label={copy.clear}
					className={styles.pickerClear}
					onClick={() => {
						if (value === undefined) setInternal(undefined)
						onValueChange?.(undefined)
					}}
				>
					<XIcon />
				</Button>
			)}
		</div>
	)
}
